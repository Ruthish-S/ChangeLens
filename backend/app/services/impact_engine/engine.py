import json
from typing import Dict, List, Set, Tuple, Any
import networkx as nx
from backend.app.core.config import settings
from backend.app.models.models import (
    ConfigurationBaseline,
    ConfigurationItem,
    Dependency,
    ChangeRequest,
    ChangeItem,
    ImpactResult
)

class ImpactAnalysisEngine:
    """
    Explainable Dependency & Impact Analysis Engine using NetworkX.
    Implements rule-directed propagation, explicit path tracing, and
    deterministic classification of affected items across components,
    specifications, manufacturing processes, inspections, and verification tests.
    """

    def __init__(self, algorithm_version: str = settings.ALGORITHM_VERSION):
        self.algorithm_version = algorithm_version

    def build_network_graph(self, baseline: ConfigurationBaseline) -> nx.DiGraph:
        G = nx.DiGraph()
        for item in baseline.items:
            G.add_node(
                item.id,
                name=item.name,
                part_number=item.part_number,
                item_type=item.item_type,
                revision=item.revision,
                criticality=item.criticality,
                lifecycle_status=item.lifecycle_status,
                metadata=json.loads(item.metadata_json or "{}")
            )

        for dep in baseline.dependencies:
            if dep.active:
                G.add_edge(
                    dep.source_id,
                    dep.target_id,
                    relationship_type=dep.relationship_type,
                    validity_interval=dep.validity_interval
                )
        return G

    def analyze_change(
        self,
        baseline: ConfigurationBaseline,
        change_request: ChangeRequest,
        change_items: List[ChangeItem]
    ) -> List[Dict[str, Any]]:
        G = self.build_network_graph(baseline)
        impact_results = []
        visited_nodes: Set[str] = set()

        directly_changed_ids = {ci.affected_object_id for ci in change_items}

        for item_id in directly_changed_ids:
            if item_id not in G:
                continue

            item_data = G.nodes[item_id]
            visited_nodes.add(item_id)
            
            # 1. Directly Changed Node
            impact_results.append({
                "impacted_object_id": item_id,
                "impacted_object_name": item_data.get("name", item_id),
                "impacted_object_type": item_data.get("item_type", "COMPONENT"),
                "classification": "DIRECTLY_CHANGED",
                "path_json": json.dumps([{
                    "node_id": item_id,
                    "name": item_data.get("name", item_id),
                    "relationship": "ROOT_CHANGE",
                    "step": 0
                }]),
                "propagation_rule": "RULE-01-DIRECT-MODIFICATION",
                "rationale": f"Directly modified by change request {change_request.id} ({change_request.change_type}).",
                "verification_action": f"Re-assess configuration item {item_id} specification compliance and baseline alignment.",
                "unresolved_uncertainty": "",
                "baseline_revision_snapshot": baseline.version,
                "algorithm_version": self.algorithm_version
            })

            # Queue: (node_id, path_history, how_reached_relation)
            queue: List[Tuple[str, List[Dict[str, Any]], str]] = []

            # Determine forward propagation for directly changed item
            for succ in G.successors(item_id):
                edge_data = G.get_edge_data(item_id, succ)
                rel = edge_data.get("relationship_type", "DEPENDS_ON")
                step_path = [
                    {"node_id": item_id, "name": item_data.get("name"), "relationship": "ROOT_CHANGE", "step": 0},
                    {"node_id": succ, "name": G.nodes[succ].get("name"), "relationship": rel, "step": 1}
                ]
                queue.append((succ, step_path, rel))

            # Process traversal queue
            while queue:
                curr_node, current_path, reached_rel = queue.pop(0)
                if curr_node in visited_nodes:
                    continue
                visited_nodes.add(curr_node)

                curr_data = G.nodes[curr_node]
                curr_type = curr_data.get("item_type", "COMPONENT")

                classification, prop_rule, rationale, verif_action = self._classify_impact(
                    curr_node, curr_data, reached_rel, current_path
                )

                impact_results.append({
                    "impacted_object_id": curr_node,
                    "impacted_object_name": curr_data.get("name", curr_node),
                    "impacted_object_type": curr_type,
                    "classification": classification,
                    "path_json": json.dumps(current_path),
                    "propagation_rule": prop_rule,
                    "rationale": rationale,
                    "verification_action": verif_action,
                    "unresolved_uncertainty": (
                        "Residual vibration effect on seal seating requires empirical proof data."
                        if curr_type == "TEST" and "Proof" in curr_data.get("name", "") else ""
                    ),
                    "baseline_revision_snapshot": baseline.version,
                    "algorithm_version": self.algorithm_version
                })

                # Selective propagation rules:
                # - If reached an assembly (e.g. C-101 via ASSEMBLED_INTO), only propagate to its VERIFIED_BY tests
                #   Do NOT propagate down into sibling components (C-102, C-103)
                # - If reached a PROCESS (e.g. P-301), propagate to INSPECTED_BY inspections and DEPENDS_ON processes
                # - If reached a SPECIFICATION, propagate to VERIFIED_BY tests
                # - If reached a COMPONENT via SECURED_BY, propagate to its MANUFACTURED_BY processes and VERIFIED_BY tests
                if len(current_path) < 5:
                    for next_succ in G.successors(curr_node):
                        if next_succ in visited_nodes:
                            continue
                        edge_data = G.get_edge_data(curr_node, next_succ)
                        rel_type = edge_data.get("relationship_type", "DEPENDS_ON")

                        # Propagation filtering
                        should_propagate = False
                        if reached_rel == "ASSEMBLED_INTO":
                            # From parent assembly, only propagate to verification tests
                            if rel_type == "VERIFIED_BY":
                                should_propagate = True
                        elif curr_type == "PROCESS":
                            if rel_type in ["INSPECTED_BY", "DEPENDS_ON", "VERIFIED_BY"]:
                                should_propagate = True
                        elif curr_type == "SPECIFICATION":
                            if rel_type in ["VERIFIED_BY"]:
                                should_propagate = True
                        elif curr_type == "COMPONENT":
                            if rel_type in ["MANUFACTURED_BY", "VERIFIED_BY", "INSPECTED_BY", "DEPENDS_ON"]:
                                should_propagate = True

                        if should_propagate:
                            next_path = list(current_path) + [{
                                "node_id": next_succ,
                                "name": G.nodes[next_succ].get("name"),
                                "relationship": rel_type,
                                "step": len(current_path)
                            }]
                            queue.append((next_succ, next_path, rel_type))

        return impact_results

    def _classify_impact(
        self,
        node_id: str,
        node_data: Dict[str, Any],
        last_rel: str,
        path: List[Dict[str, Any]]
    ) -> Tuple[str, str, str, str]:
        item_type = node_data.get("item_type", "COMPONENT")
        name = node_data.get("name", node_id)
        criticality = node_data.get("criticality", "STANDARD")
        path_str = " -> ".join([p["name"] or p["node_id"] for p in path])

        if item_type == "TEST":
            classification = "VERIFICATION_REQUIRED"
            rule = "RULE-04-VERIFICATION-TEST-TRIGGER"
            rationale = (
                f"Verification test '{name}' ({node_id}) validates configuration items along dependency chain: "
                f"[{path_str}]. Test protocol must be executed or requalified."
            )
            action = f"Execute and verify test {node_id} against updated acceptance thresholds."
        elif item_type == "INSPECTION":
            classification = "VERIFICATION_REQUIRED"
            rule = "RULE-03-INSPECTION-REQUIREMENT-TRIGGER"
            rationale = (
                f"Quality inspection plan '{name}' ({node_id}) governs manufacturing process/assembly "
                f"affected by this change: [{path_str}]. Mandatory buy-off inspection required."
            )
            action = f"Mandatory 100% buy-off inspection {node_id} with calibrated tooling."
        elif item_type == "PROCESS":
            classification = "POTENTIALLY_IMPACTED"
            rule = "RULE-02-MANUFACTURING-PROCESS-IMPACT"
            rationale = (
                f"Manufacturing procedure '{name}' ({node_id}) executes assembly/securing operations "
                f"linked via [{path_str}]. Standard operating procedure and work traveler must be revised."
            )
            action = f"Issue revised work traveler and operator briefing for process {node_id}."
        elif item_type == "SPECIFICATION":
            classification = "POTENTIALLY_IMPACTED"
            rule = "RULE-05-SPECIFICATION-GOVERNANCE"
            rationale = (
                f"Engineering specification '{name}' ({node_id}) establishes dimensional or material limits "
                f"for changed items: [{path_str}]."
            )
            action = f"Perform engineering review of specification {node_id} to ensure compatibility."
        else: # COMPONENT
            classification = "POTENTIALLY_IMPACTED"
            rule = "RULE-06-STRUCTURAL-COMPONENT-INTERFACE"
            rationale = (
                f"Component '{name}' ({node_id}) has direct physical, mechanical or structural interface "
                f"along [{path_str}]."
            )
            action = f"Assess clearance, tolerance stack-up and structural load margin for {node_id}."

        return classification, rule, rationale, action

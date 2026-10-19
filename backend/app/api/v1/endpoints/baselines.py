from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from backend.app.core.database import get_db
from backend.app.models.models import ConfigurationBaseline, ConfigurationItem, Dependency
from backend.app.schemas.schemas import ConfigurationBaselineResponse, ConfigurationItemResponse, DependencyResponse

router = APIRouter()

@router.get("", response_model=List[ConfigurationBaselineResponse])
def get_baselines(db: Session = Depends(get_db)):
    return db.query(ConfigurationBaseline).all()

@router.get("/{baseline_id}", response_model=ConfigurationBaselineResponse)
def get_baseline(baseline_id: str, db: Session = Depends(get_db)):
    baseline = db.query(ConfigurationBaseline).filter(ConfigurationBaseline.id == baseline_id).first()
    if not baseline:
        raise HTTPException(status_code=404, detail="Baseline not found")
    return baseline

@router.get("/{baseline_id}/graph")
def get_baseline_graph(baseline_id: str, db: Session = Depends(get_db)):
    baseline = db.query(ConfigurationBaseline).filter(ConfigurationBaseline.id == baseline_id).first()
    if not baseline:
        raise HTTPException(status_code=404, detail="Baseline not found")

    nodes = []
    for item in baseline.items:
        nodes.append({
            "id": item.id,
            "data": {
                "label": f"{item.name} ({item.id})",
                "partNumber": item.part_number,
                "itemType": item.item_type,
                "revision": item.revision,
                "criticality": item.criticality,
                "lifecycleStatus": item.lifecycle_status,
                "description": item.description
            },
            "type": "customNode",
            "position": {"x": 0, "y": 0}
        })

    edges = []
    for dep in baseline.dependencies:
        if dep.active:
            edges.append({
                "id": f"e-{dep.id}",
                "source": dep.source_id,
                "target": dep.target_id,
                "label": dep.relationship_type,
                "data": {"relationshipType": dep.relationship_type}
            })

    return {"nodes": nodes, "edges": edges}

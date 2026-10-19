import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "ChangeLens API"

def test_get_baselines():
    response = client.get("/api/v1/baselines")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert data[0]["id"] == "BASE-737-9-DOORPLUG-A"

def test_get_baseline_graph():
    response = client.get("/api/v1/baselines/BASE-737-9-DOORPLUG-A/graph")
    assert response.status_code == 200
    data = response.json()
    assert "nodes" in data
    assert "edges" in data
    assert len(data["nodes"]) >= 20
    assert len(data["edges"]) >= 20

def test_list_change_requests():
    response = client.get("/api/v1/changes")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert any(c["id"] == "CCR-2026-0001" for c in data)

def test_get_change_request_detail():
    response = client.get("/api/v1/changes/CCR-2026-0001")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == "CCR-2026-0001"
    assert "change_items" in data
    assert "impact_results" in data

def test_get_impact_results():
    response = client.get("/api/v1/changes/CCR-2026-0001/impact")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 10
    assert any(r["impacted_object_id"] == "C-104" and r["classification"] == "DIRECTLY_CHANGED" for r in data)
    assert any(r["impacted_object_type"] == "TEST" and r["classification"] == "VERIFICATION_REQUIRED" for r in data)

def test_get_risk_assessments():
    response = client.get("/api/v1/changes/CCR-2026-0001/risk-assessment")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 2
    assert any(r["high_severity_flag"] is True for r in data)

def test_get_evidence_and_gate_evaluation():
    response = client.get("/api/v1/evidence/CCR-2026-0001/gate-evaluation")
    assert response.status_code == 200
    data = response.json()
    assert data["overall_result"] == "BLOCKED"
    assert "blocking_reasons_json" in data

def test_analytics_endpoints():
    response = client.get("/api/v1/analytics/overview")
    assert response.status_code == 200
    data = response.json()
    assert "total_changes" in data
    assert "blocked_changes" in data
    assert "evidence_completeness_rate_pct" in data

    response = client.get("/api/v1/analytics/risk-landscape")
    assert response.status_code == 200
    assert len(response.json()) >= 1

    response = client.get("/api/v1/analytics/gate-bottlenecks")
    assert response.status_code == 200
    assert len(response.json()) >= 4

def test_generate_and_download_report():
    response = client.post("/api/v1/reports/change-assessment/CCR-2026-0001?actor_id=usr-lead-eng")
    assert response.status_code == 200
    data = response.json()
    report_id = data["id"]
    assert report_id.startswith("RPT-CCR-2026-0001")

    # Download PDF
    dl_response = client.get(f"/api/v1/reports/{report_id}/download/pdf")
    assert dl_response.status_code == 200
    assert dl_response.headers["content-type"] == "application/pdf"
    assert len(dl_response.content) > 1000

    # Download XLSX
    dl_xlsx = client.get(f"/api/v1/reports/{report_id}/download/xlsx")
    assert dl_xlsx.status_code == 200
    assert len(dl_xlsx.content) > 1000

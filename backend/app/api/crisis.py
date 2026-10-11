from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Dict, Any

router = APIRouter()

class CrisisAction(BaseModel):
    session_id: str
    action_key: str
    explanation: str

MOCK_SCENARIOS = [
    {
        "id": "crisis-001",
        "title": "Production E-Commerce API Returning HTTP 500",
        "severity": "P0 Critical",
        "category": "Backend System Failure",
        "description": "During peak sale hours, checkout API endpoints are failing with 500 Internal Server Errors. Customer latency spiked by 300%.",
        "metrics": {
            "error_rate": "28.4%",
            "latency_p99": "4800ms",
            "db_connections": "98/100 (Saturated)",
            "cpu_utilization": "94%"
        },
        "logs": "[CRITICAL] psycopg2.OperationalError: FATAL: remaining connection slots are reserved for non-replication superuser connections",
        "available_actions": [
            {"key": "inspect_db", "label": "Inspect Active DB Connection Pools"},
            {"key": "restart_app", "label": "Restart API Server Instances"},
            {"key": "scale_db_pool", "label": "Increase Connection Limits & Cache Key Queries"},
            {"key": "rollback", "label": "Rollback Recent Release"}
        ]
    }
]

@router.get("/scenarios")
def list_crisis_scenarios():
    return MOCK_SCENARIOS

@router.post("/action")
def execute_crisis_action(action: CrisisAction):
    if action.action_key == "scale_db_pool":
        return {
            "status": "resolved",
            "new_state": "System Stabilized",
            "metrics": {
                "error_rate": "0.01%",
                "latency_p99": "120ms",
                "db_connections": "32/200",
                "cpu_utilization": "38%"
            },
            "ai_evaluation": "Excellent incident triage! You accurately identified database connection exhaustion as the root cause rather than wasting time restarting application nodes."
        }
    else:
        return {
            "status": "degraded",
            "new_state": "Incident Escalating",
            "metrics": {
                "error_rate": "34.2%",
                "latency_p99": "5900ms",
                "db_connections": "100/100 (Exhausted)",
                "cpu_utilization": "99%"
            },
            "ai_evaluation": "Action failed to mitigate root cause. The DB pool remains saturated. Focus on DB connection lifecycle and query pool limits."
        }

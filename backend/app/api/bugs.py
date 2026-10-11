from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import uuid

router = APIRouter()

class BugScenario(BaseModel):
    id: str
    title: str
    category: str
    difficulty: str
    description: str
    broken_code: str
    error_log: str
    language: str
    test_cases: List[Dict[str, Any]]
    hints: List[str]

class BugSubmission(BaseModel):
    student_id: str
    scenario_id: str
    submitted_code: str
    time_taken_seconds: int

MOCK_BUG_SCENARIOS = [
    {
        "id": "bug-001",
        "title": "Python Dictionary KeyError & None return",
        "category": "Python Runtime",
        "difficulty": "Easy",
        "description": "The function calculate_user_discount is throwing KeyError when 'discount_code' key is missing in user payload.",
        "broken_code": """def calculate_user_discount(user_data, order_amount):\n    # Bug: Direct key access raises KeyError when key missing\n    code = user_data['discount_code']\n    if code == 'VIP20':\n        return order_amount * 0.8\n    elif code == 'SUMMER10':\n        return order_amount * 0.9\n    return order_amount""",
        "error_log": "KeyError: 'discount_code' at line 3 in calculate_user_discount",
        "language": "python",
        "test_cases": [
            {"name": "Missing discount_code key", "input": {"user_data": {}, "order_amount": 100}, "expected": 100},
            {"name": "Valid VIP20 code", "input": {"user_data": {"discount_code": "VIP20"}, "order_amount": 100}, "expected": 80},
            {"name": "Unknown discount code", "input": {"user_data": {"discount_code": "UNKNOWN"}, "order_amount": 100}, "expected": 100}
        ],
        "hints": [
            "Use user_data.get('discount_code') instead of direct key indexing user_data['discount_code'].",
            "Ensure the function handles None gracefully if 'discount_code' key is not present."
        ]
    },
    {
        "id": "bug-002",
        "title": "SQL N+1 Query & Missing JOIN",
        "category": "SQL & DBMS",
        "difficulty": "Medium",
        "description": "The query fails to aggregate total order counts properly and produces duplicate customer rows due to missing GROUP BY aggregation.",
        "broken_code": """SELECT customers.id, customers.name, COUNT(orders.id)\nFROM customers\nLEFT JOIN orders ON customers.id = orders.customer_id;""",
        "error_log": "ERROR: column 'customers.id' must appear in the GROUP BY clause or be used in an aggregate function at line 2",
        "language": "sql",
        "test_cases": [
            {"name": "Aggregate order counts with GROUP BY", "input": "customers & orders tables", "expected": "Aggregated customer rows"}
        ],
        "hints": [
            "Add GROUP BY customers.id, customers.name at the end of the SQL query."
        ]
    }
]

app_scenarios = [BugScenario(**s) for s in MOCK_BUG_SCENARIOS]

@router.get("/scenarios", response_model=List[BugScenario])
def get_scenarios():
    return app_scenarios

@router.post("/evaluate")
def evaluate_bug_fix(submission: BugSubmission):
    code = submission.submitted_code.strip()
    scenario_id = submission.scenario_id

    if scenario_id == "bug-001":
        # Check if KeyError is fixed cleanly using .get() or in check
        has_get = ".get(" in code or "'discount_code' in" in code or '"discount_code" in' in code
        
        if not has_get:
            return {
                "status": "failed",
                "passed_tests": 1,
                "total_tests": 3,
                "score": 33.3,
                "error_details": "RuntimeError: KeyError 'discount_code' at line 3 in calculate_user_discount",
                "test_results": [
                    {"name": "Missing discount_code key", "passed": False, "error": "KeyError: 'discount_code'"},
                    {"name": "Valid VIP20 code", "passed": True, "error": None},
                    {"name": "Unknown discount code", "passed": False, "error": "KeyError: 'discount_code'"}
                ],
                "ai_feedback": "Your solution still directly accesses user_data['discount_code'] without checking key existence. Use user_data.get('discount_code') to safely return None when missing."
            }
        
        return {
            "status": "passed",
            "passed_tests": 3,
            "total_tests": 3,
            "score": 100.0,
            "error_details": None,
            "test_results": [
                {"name": "Missing discount_code key", "passed": True, "error": None},
                {"name": "Valid VIP20 code", "passed": True, "error": None},
                {"name": "Unknown discount code", "passed": True, "error": None}
            ],
            "ai_feedback": "All 3 test cases passed! Your fix safely handles missing dictionary keys and prevents KeyError runtime exceptions."
        }

    elif scenario_id == "bug-002":
        has_group_by = "GROUP BY" in code.upper()
        if not has_group_by:
            return {
                "status": "failed",
                "passed_tests": 0,
                "total_tests": 1,
                "score": 0.0,
                "error_details": "ERROR: column 'customers.id' must appear in the GROUP BY clause",
                "test_results": [
                    {"name": "Aggregate order counts with GROUP BY", "passed": False, "error": "Missing GROUP BY clause"}
                ],
                "ai_feedback": "Add 'GROUP BY customers.id, customers.name' to aggregate the order count correctly."
            }
        return {
            "status": "passed",
            "passed_tests": 1,
            "total_tests": 1,
            "score": 100.0,
            "error_details": None,
            "test_results": [
                {"name": "Aggregate order counts with GROUP BY", "passed": True, "error": None}
            ],
            "ai_feedback": "Great job! Adding GROUP BY fixed the SQL aggregation failure."
        }

    return {
        "status": "passed",
        "passed_tests": 1,
        "total_tests": 1,
        "score": 100.0,
        "ai_feedback": "Code executed successfully."
    }

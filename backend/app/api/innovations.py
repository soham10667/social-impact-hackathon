from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Dict, Any

router = APIRouter()

@router.get("/patterns/{student_id}")
def get_mistake_patterns(student_id: str):
    return {
        "total_mistakes": 14,
        "recurring_patterns": [
            {
                "id": "pat-01",
                "category": "Data Structures & Algorithms",
                "skill_slug": "dsa-hashmap",
                "pattern_name": "Off-by-one errors & Outer Loop Boundary Inefficiencies",
                "frequency": 4,
                "severity": "High",
                "status": "active"
            },
            {
                "id": "pat-02",
                "category": "SQL & Databases",
                "skill_slug": "sql-joins",
                "pattern_name": "Missing Aggregation Groupings in Complex JOINs",
                "frequency": 3,
                "severity": "Medium",
                "status": "improving"
            }
        ],
        "category_distribution": [
            {"category": "Logic & Algorithms", "count": 6},
            {"category": "DBMS & SQL", "count": 4},
            {"category": "Python Runtime", "count": 4}
        ]
    }

@router.get("/graph/{student_id}")
def get_skill_knowledge_graph(student_id: str):
    nodes = [
        {"id": "python-basics", "data": {"label": "Python Basics", "status": "mastered", "score": 92}},
        {"id": "dsa-basics", "data": {"label": "Data Structures", "status": "in_progress", "score": 75}},
        {"id": "sql-basics", "data": {"label": "SQL & Databases", "status": "needs_improvement", "score": 45}},
        {"id": "sys-design", "data": {"label": "System Design", "status": "not_started", "score": 0}}
    ]
    edges = [
        {"id": "e1", "source": "python-basics", "target": "dsa-basics"},
        {"id": "e2", "source": "python-basics", "target": "sql-basics"},
        {"id": "e3", "source": "dsa-basics", "target": "sys-design"},
        {"id": "e4", "source": "sql-basics", "target": "sys-design"}
    ]
    return {"nodes": nodes, "edges": edges}

@router.get("/time-machine/{student_id}")
def get_interview_history_comparison(student_id: str):
    return [
        {
            "id": "retry-001",
            "question": "Explain the difference between process and thread in Operating Systems.",
            "original_attempt": {
                "date": "2026-09-15",
                "answer": "A process is a program running and thread is smaller.",
                "score": 40.0
            },
            "retry_attempt": {
                "date": "2026-10-02",
                "answer": "A process is an independent execution environment with full memory space, while threads are lightweight execution units within a process sharing heap memory and file descriptors.",
                "score": 95.0
            },
            "improvement_analysis": "Significant enhancement in technical granularity. Clear distinction between isolated memory address spaces and shared process context."
        }
    ]

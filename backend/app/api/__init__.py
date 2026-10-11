from fastapi import APIRouter
from app.api import bugs, crisis, innovations, interviews, compiler

router = APIRouter()

router.include_router(compiler.router, prefix="/compiler", tags=["Code Compiler (OneCompiler)"])
router.include_router(bugs.router, prefix="/bugs", tags=["Bug Arena"])
router.include_router(crisis.router, prefix="/crisis", tags=["Crisis Simulator"])
router.include_router(innovations.router, prefix="/innovations", tags=["Core Innovations"])
router.include_router(interviews.router, prefix="/interviews", tags=["AI Mock Interview"])

@router.get("/dashboard/{student_id}")
def get_student_dashboard(student_id: str):
    return {
        "welcome_message": "Welcome back to PrepPilot AI",
        "interviews_completed": 8,
        "coding_problems_solved": 24,
        "assessments_completed": 5,
        "average_interview_score": 84.5,
        "practice_streak": 7,
        "readiness_index": 82,
        "recent_activity": [
            {"title": "Bug Arena - Python KeyError", "score": "100%", "date": "Today"},
            {"title": "Mock Interview - Full Stack Role", "score": "88%", "date": "Yesterday"}
        ]
    }

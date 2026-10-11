from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import os
import httpx
from app.core.config import settings

router = APIRouter()

class InterviewMessage(BaseModel):
    message: str
    job_role: Optional[str] = "Full-Stack Developer"
    history: Optional[List[Dict[str, str]]] = []

@router.post("/chat")
async def interview_chat(payload: InterviewMessage):
    user_text = payload.message.strip()
    user_lower = user_text.lower()

    # Dynamic technical interviewer logic
    if user_lower in ["hi", "hello", "hey", "good morning", "good evening"]:
        return {
            "reply": f"Hello! Welcome to your technical interview for the {payload.job_role} position. I'm your Lead Technical Interviewer today. Let's start with a foundational question: Can you walk me through the lifecycle of an HTTP request from the moment a user types a URL into their browser until the page renders?",
            "score": None
        }

    if "react" in user_lower or "state" in user_lower or "component" in user_lower:
        return {
            "reply": "Good point regarding component state flow. As a follow-up: How do you prevent unnecessary re-renders in a large React application when passing deep object props through multiple layout components?",
            "score": 85.0
        }

    if "database" in user_lower or "sql" in user_lower or "index" in user_lower or "n+1" in user_lower:
        return {
            "reply": "Excellent mention of database query optimization. Now, suppose your API endpoint latency spikes under 10,000 concurrent requests due to database connection pool exhaustion. What architectural steps would you take to resolve this?",
            "score": 90.0
        }

    # Conversational Interviewer Response for generic inputs
    return {
        "reply": f"Thanks for your response. To evaluate your technical depth further: Could you elaborate on how you handle error logging, edge cases, and automated test coverage for the solution you just described?",
        "score": 75.0
    }

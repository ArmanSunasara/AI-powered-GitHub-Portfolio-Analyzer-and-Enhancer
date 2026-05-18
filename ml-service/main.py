import os
import logging
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional
from analyzer import generate_feedback

logger = logging.getLogger("ml-service")
logging.basicConfig(level=logging.INFO)

app = FastAPI(
    title="GitHub Portfolio Analyzer - ML Service",
    description="AI-powered feedback generation for GitHub portfolios",
    version="1.0.0",
)

origins = [
    o.strip()
    for o in os.getenv(
        "CORS_ORIGINS", "http://localhost:5000,http://localhost:5173"
    ).split(",")
    if o.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class RepoAnalysis(BaseModel):
    name: str
    stars: int = 0
    hasReadme: bool = False
    commitCount: int = 0
    languages: List[str] = Field(default_factory=list)


class AnalyzeRequest(BaseModel):
    score: int = Field(..., ge=0, le=100, description="Portfolio score")
    repoAnalysis: List[RepoAnalysis] = Field(
        ..., description="Repository analysis data"
    )
    username: Optional[str] = Field(None, description="GitHub username")


@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "ml-service"}


@app.post("/analyze")
async def analyze(request: AnalyzeRequest):
    try:
        data = {
            "score": request.score,
            "repoAnalysis": [repo.model_dump() for repo in request.repoAnalysis],
            "username": request.username,
        }
        result = generate_feedback(data)
        return {"success": True, "data": result}
    except Exception as e:
        logger.exception("Failed to generate feedback")
        raise HTTPException(
            status_code=502,
            detail="Failed to generate feedback. Please try again later.",
        ) from e

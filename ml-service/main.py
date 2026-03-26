from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional
from analyzer import generate_feedback
import os

app = FastAPI(
    title="GitHub Portfolio Analyzer - ML Service",
    description="AI-powered feedback generation for GitHub portfolios",
    version="1.0.0",
)

origins = os.getenv("CORS_ORIGINS").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class RepoAnalysis(BaseModel):
    name: str
    stars: int
    hasReadme: bool
    commitCount: int
    languages: List[str]


class AnalyzeRequest(BaseModel):
    score: int = Field(..., ge=0, le=100, description="Portfolio score")
    repoAnalysis: List[RepoAnalysis] = Field(..., description="Repository analysis data")
    username: Optional[str] = Field(None, description="GitHub username")


@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "ml-service"}


@app.post("/analyze")
async def analyze(request: AnalyzeRequest):
    try:
        data = {
            "score": request.score,
            "repoAnalysis": [
                repo.model_dump() if hasattr(repo, "model_dump") else repo.dict()
                for repo in request.repoAnalysis
            ],
            "username": request.username,
        }
        
        result = generate_feedback(data)
        
        return {
            "success": True,
            "data": result,
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate feedback: {str(e)}"
        )

import os
import logging
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional
from analyzer import generate_feedback
from github_compare import analyze_github_compare
from github_compare.schema import GithubCompareRequest
from resume_match import analyze_resume_github_match
from resume_match.schema import ResumeGithubMatchRequest
from shortlist import shortlist_candidates
from shortlist.schema import CandidateShortlistRequest
from specialization import analyze_specialization_fit, list_roles
from specialization.schema import SpecializationFitRequest

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


@app.get("/specialization/roles")
async def specialization_roles():
    return {"success": True, "data": list_roles()}


@app.post("/specialization/analyze")
async def specialization_analyze(request: SpecializationFitRequest):
    try:
        report = analyze_specialization_fit(request)
        return {"success": True, "data": report.model_dump()}
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve)) from ve
    except Exception as e:
        logger.exception("Specialization fit analysis failed")
        raise HTTPException(
            status_code=502,
            detail="Failed to analyze specialization fit. Please try again later.",
        ) from e


@app.post("/resume-match/analyze")
async def resume_match_analyze(request: ResumeGithubMatchRequest):
    try:
        report = analyze_resume_github_match(request)
        return {"success": True, "data": report.model_dump()}
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve)) from ve
    except Exception as e:
        logger.exception("Resume vs GitHub match failed")
        raise HTTPException(
            status_code=502,
            detail="Failed to analyze resume vs GitHub. Please try again later.",
        ) from e


@app.post("/github-compare/analyze")
async def github_compare_analyze(request: GithubCompareRequest):
    try:
        report = analyze_github_compare(request)
        return {"success": True, "data": report.model_dump()}
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve)) from ve
    except Exception as e:
        logger.exception("GitHub compare failed")
        raise HTTPException(
            status_code=502,
            detail="Failed to compare GitHub profiles. Please try again later.",
        ) from e


@app.post("/shortlist/analyze")
async def shortlist_analyze(request: CandidateShortlistRequest):
    try:
        result = shortlist_candidates(request)
        return {"success": True, "data": result.model_dump()}
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve)) from ve
    except Exception as e:
        logger.exception("Candidate shortlist failed")
        raise HTTPException(
            status_code=502,
            detail="Failed to shortlist candidates. Please try again later.",
        ) from e

from fastapi import FastAPI
from analyzer import generate_feedback

app = FastAPI()

@app.post("/analyze")
async def analyze(data: dict):
    result = generate_feedback(data)
    return result

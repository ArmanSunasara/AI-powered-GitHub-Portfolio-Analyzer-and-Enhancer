import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def generate_feedback(data):

    prompt = f"""
    You are a technical recruiter.

    Analyze this GitHub portfolio data:

    {data}

    Give output in JSON:

    strengths: []
    red_flags: []
    suggestions: []
    """

    response = client.chat.completions.create(
        model="gpt-4.1-mini",
        messages=[{"role": "user", "content": prompt}]
    )

    return response.choices[0].message.content

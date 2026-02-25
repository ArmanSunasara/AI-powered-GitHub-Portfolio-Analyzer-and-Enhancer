import os
import re
import json
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

_client = None


def _get_client():
    global _client
    if _client is None:
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise RuntimeError(
                "OPENAI_API_KEY environment variable is not set. "
                "Please set it in your .env file."
            )
        _client = OpenAI(api_key=api_key)
    return _client


def _strip_markdown_fences(text):
    text = text.strip()
    text = re.sub(r"^```(?:json)?\s*\n?", "", text)
    text = re.sub(r"\n?```\s*$", "", text)
    return text.strip()


def generate_feedback(data):
    """
    Generate AI-powered feedback for a GitHub portfolio.

    Args:
        data: Dictionary containing score, repoAnalysis, and username

    Returns:
        Dictionary with strengths, red_flags, and suggestions
    """
    try:
        client = _get_client()

        score = data.get("score", 0)
        repo_analysis = data.get("repoAnalysis", [])
        username = data.get("username", "user")

        prompt = f"""You are a technical recruiter analyzing a GitHub portfolio.

Portfolio Score: {score}/100
Username: {username}
Number of analyzed repositories: {len(repo_analysis)}

Repository Details:
{json.dumps(repo_analysis, indent=2)}

Provide constructive feedback in JSON format with the following structure:
{{
    "strengths": ["strength1", "strength2", ...],
    "red_flags": ["flag1", "flag2", ...],
    "suggestions": ["suggestion1", "suggestion2", ...]
}}

Be specific, actionable, and professional. Focus on what recruiters care about."""

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": "You are an experienced technical recruiter providing constructive feedback on GitHub portfolios. Always respond with valid JSON only.",
                },
                {"role": "user", "content": prompt},
            ],
            temperature=0.7,
            max_tokens=1000,
        )

        content = response.choices[0].message.content.strip()
        content = _strip_markdown_fences(content)

        try:
            parsed = json.loads(content)
            return {
                "strengths": parsed.get("strengths", []),
                "red_flags": parsed.get("red_flags", []),
                "suggestions": parsed.get("suggestions", []),
            }
        except json.JSONDecodeError:
            return {
                "strengths": [],
                "red_flags": [],
                "suggestions": [
                    "Unable to parse AI response. Please try again.",
                ],
            }

    except Exception as e:
        raise Exception(f"Failed to generate feedback: {str(e)}")

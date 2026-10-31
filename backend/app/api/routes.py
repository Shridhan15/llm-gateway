# app/api/routes.py
from fastapi import APIRouter, Depends
from pydantic import BaseModel
import asyncio

from app.api.dependencies import verify_and_rate_limit
from app.services.cache_layer import check_exact_cache, save_to_cache

router = APIRouter()

class ChatRequest(BaseModel):
    prompt: str

@router.post("/v1/chat", dependencies=[Depends(verify_and_rate_limit)])
async def chat_completion(request: ChatRequest):
    # 1. Intercept with Layer 1 Cache
    cached_response = await check_exact_cache(request.prompt)
    if cached_response:
        # Returned in ~5 milliseconds at $0.00 cost
        return {
            "status": "success",
            "source": "redis_exact_cache",
            "data": cached_response
        }

    # 2. Simulate external LLM generation (e.g., waiting for Groq)
    # In production, blocking operations here will destroy your concurrency. 
    # Because we use 'await', FastAPI can handle other users during these 2 seconds.
    await asyncio.sleep(2)
    
    generated_text = f"Simulated AI response for: {request.prompt}"
    
    # 3. Save the expensive result to the cache for the next time
    await save_to_cache(request.prompt, generated_text)

    return {
        "status": "success",
        "source": "llm_generation",
        "data": generated_text
    }
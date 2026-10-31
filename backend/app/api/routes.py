# app/api/routes.py
from fastapi import APIRouter, Depends, BackgroundTasks
from pydantic import BaseModel
import time

from app.api.dependencies import verify_and_rate_limit
from app.services.cache_layer import check_exact_cache, save_to_cache
from app.services.semantic_cache import check_semantic_cache, save_to_semantic_cache
from app.services.llm_router import generate_completion
from app.services.telemetry import log_transaction

router = APIRouter()

class ChatRequest(BaseModel):
    prompt: str

@router.post("/v1/chat")
async def chat_completion(
    request: ChatRequest,
    background_tasks: BackgroundTasks,
    api_key: str = Depends(verify_and_rate_limit)
):
    start_time = time.perf_counter()

    # --- LAYER 1: Exact Match Cache (Redis) ---
    cached_response = await check_exact_cache(request.prompt)
    if cached_response:
        latency = (time.perf_counter() - start_time) * 1000
        background_tasks.add_task(
            log_transaction, api_key, request.prompt, cached_response, "layer1_exact_cache", latency
        )
        return {"status": "success", "source": "layer1_exact_cache", "data": cached_response}

    # --- LAYER 2: Semantic Cache (Upstash Vector) ---
    semantic_response = await check_semantic_cache(request.prompt)
    if semantic_response:
        latency = (time.perf_counter() - start_time) * 1000
        background_tasks.add_task(
            log_transaction, api_key, request.prompt, semantic_response, "layer2_semantic_cache", latency
        )
        # Self-healing: Save this variation to Layer 1 so the next exact hit is instantaneous
        background_tasks.add_task(save_to_cache, request.prompt, semantic_response)
        
        return {"status": "success", "source": "layer2_semantic_cache", "data": semantic_response}

    # --- LAYER 3: LLM Generation (Groq / LangChain) ---
    generated_text = await generate_completion(request.prompt)
    
    # Save the new generation to both caches in the background
    background_tasks.add_task(save_to_cache, request.prompt, generated_text)
    background_tasks.add_task(save_to_semantic_cache, request.prompt, generated_text)

    latency = (time.perf_counter() - start_time) * 1000
    background_tasks.add_task(
        log_transaction, api_key, request.prompt, generated_text, "llm_generation", latency
    )

    return {"status": "success", "source": "llm_generation", "data": generated_text}
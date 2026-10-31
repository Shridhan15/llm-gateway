# app/services/cache_layer.py
import hashlib
import json
from app.core.redis import redis_client

CACHE_TTL = 3600 # Keep exact matches in memory for 1 hour

def generate_cache_key(prompt: str) -> str:
    """Creates a deterministic SHA-256 hash of the prompt."""
    prompt_hash = hashlib.sha256(prompt.strip().encode('utf-8')).hexdigest()
    return f"cache:exact:{prompt_hash}"

async def check_exact_cache(prompt: str):
    """Returns the cached response if it exists, otherwise None."""
    cache_key = generate_cache_key(prompt)
    cached_data = await redis_client.get(cache_key)
    
    if cached_data:
        return json.loads(cached_data)
    return None

async def save_to_cache(prompt: str, response_data: dict):
    """Saves the LLM response to Redis with an expiration timer."""
    cache_key = generate_cache_key(prompt)
    await redis_client.set(
        cache_key, 
        json.dumps(response_data), 
        ex=CACHE_TTL
    )
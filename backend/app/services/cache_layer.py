# app/services/cache_layer.py
import hashlib
import redis.asyncio as redis
from app.core.config import settings
import json

# Reuse our existing Redis connection
redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)

# Keep exact matches in memory for 1 hour (3600 seconds)
CACHE_TTL = 3600 

def generate_cache_key(prompt: str) -> str:
    """
    Creates a deterministic SHA-256 hash of the prompt.
    'Hello world' will always generate the exact same string.
    """
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
    # Store as a JSON string so we preserve the structure
    await redis_client.set(
        cache_key, 
        json.dumps(response_data), 
        ex=CACHE_TTL
    )
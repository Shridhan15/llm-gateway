# app/api/dependencies.py
from fastapi import Header, HTTPException, status, Request
import redis.asyncio as redis
from app.core.config import settings
import time

# Initialize a dedicated Redis client for our dependencies
redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)

# Gateway Limits
MAX_REQUESTS_PER_MINUTE = 10
MAX_TOKENS_PER_MINUTE = 50000

async def verify_and_rate_limit(
    request: Request,
    x_api_key: str = Header(None, description="Client API Key for the Gateway")
):
    """
    Middleware dependency to validate API keys and enforce rate limits atomically.
    """
    if not x_api_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing X-API-Key header"
        )

    # 1. Validate the API Key exists (In Phase 5, keys will be generated and stored here)
    # For now, we will assume any key starting with "gw_" is valid for testing
    if not x_api_key.startswith("gw_"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid API Key format."
        )

    # 2. Setup Redis keys for atomic tracking
    current_minute = int(time.time() / 60)
    rpm_key = f"rate_limit:rpm:{x_api_key}:{current_minute}"
    
    # 3. Execute atomic Redis transaction (Pipeline)
    # This prevents race conditions if a user sends 100 concurrent requests
    pipeline = redis_client.pipeline()
    pipeline.incr(rpm_key)
    pipeline.expire(rpm_key, 60) # Auto-delete after 60 seconds
    results = await pipeline.execute()
    
    current_requests = results[0]

    # 4. Enforce Limits
    if current_requests > MAX_REQUESTS_PER_MINUTE:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Rate limit exceeded. Please try again in the next minute."
        )

    # Pass the validated key down to the route
    return x_api_key
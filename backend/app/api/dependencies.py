# app/api/dependencies.py
from fastapi import HTTPException, status, Security
from fastapi.security.api_key import APIKeyHeader
import time

from app.services.auth import is_valid_key
from app.core.redis import redis_client

# Gateway Limits
MAX_REQUESTS_PER_MINUTE = 10
MAX_TOKENS_PER_MINUTE = 50000

api_key_header = APIKeyHeader(name="X-API-Key", auto_error=True)

async def verify_and_rate_limit(api_key: str = Security(api_key_header)):
    """
    Middleware dependency to validate API keys and enforce rate limits atomically.
    """
    # 1. Reject fake keys immediately
    if not is_valid_key(api_key):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Invalid API Key"
        )

    # 2. Rate Limiting Logic
    current_minute = int(time.time() / 60)
    
    # FIXED: Using the correct 'api_key' variable passed into the function
    rpm_key = f"rate_limit:rpm:{api_key}:{current_minute}"
    
    # Execute atomic Redis transaction
    pipeline = redis_client.pipeline()
    pipeline.incr(rpm_key)
    pipeline.expire(rpm_key, 60) 
    
    results = await pipeline.exec() 
    current_requests = results[0]

    if current_requests > MAX_REQUESTS_PER_MINUTE:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Rate limit exceeded. Please try again in the next minute."
        )

    return api_key
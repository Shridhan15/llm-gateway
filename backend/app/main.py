# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.routes import router as api_router
from app.core.redis import redis_client

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Production-grade LLM API Gateway"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], # Your Vite port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register the API routes
app.include_router(api_router, prefix="/api")

@app.get("/health", tags=["System"])
async def health_check():
    """
    Checks if the API and the Redis database are both online.
    """
    try:
        await redis_client.ping()
        redis_status = "connected"
    except Exception as e:
        redis_status = f"disconnected: {str(e)}"

    return {
        "api_status": "healthy",
        "redis_status": redis_status,
        "service": settings.PROJECT_NAME
    }
# app/main.py
from fastapi import FastAPI
from app.core.config import settings
from app.api.routes import router as api_router


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Production-grade LLM API Gateway"
)

@app.get('/')
async def root():
    return {"message": "Welcome to the Enterprise LLM Gateway"}

@app.get("/health", tags=["System"])
async def health_check():
    """
    Used by load balancers to verify the instance is healthy.
    """
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION
    }


# Add this near your imports in app/main.py


# Add this below your app initialization
app.include_router(api_router, prefix="/api")
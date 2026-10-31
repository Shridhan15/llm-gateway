# app/services/llm_router.py
from langchain_groq import ChatGroq
from langchain_core.messages import SystemMessage, HumanMessage
from fastapi import HTTPException, status
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

# Initialize the model once at the module level.
# This prevents reconnecting and re-authenticating on every single request.
chat_model = ChatGroq(
    api_key=settings.GROQ_API_KEY,
    model_name="openai/gpt-oss-20b",
    temperature=0.7,
    max_retries=2, # Production: Auto-retry on timeouts before failing
)

async def generate_completion(prompt: str) -> str:
    """
    Sends the prompt to Groq using LangChain's asynchronous invocation.
    """
    messages = [
        SystemMessage(content="You are a helpful AI assistant."),
        HumanMessage(content=prompt)
    ]

    try:
        # CRITICAL: We use await and .ainvoke(). 
        # If you use .invoke(), FastAPI cannot process other users simultaneously.
        response = await chat_model.ainvoke(messages)
        
        return response.content
        
    except Exception as e:
        # Catch LangChain/Groq errors and return a clean HTTP 502 to the client
        logger.error(f"LangChain Groq Error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Upstream LLM provider returned an error."
        )
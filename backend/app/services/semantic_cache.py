# app/services/semantic_cache.py
import logging
import uuid
from upstash_vector import AsyncIndex
from app.core.config import settings

logger = logging.getLogger(__name__)

# Initialize the stateless HTTP client for the Vector DB
vector_index = AsyncIndex(
    url=settings.UPSTASH_VECTOR_REST_URL, 
    token=settings.UPSTASH_VECTOR_REST_TOKEN
)

# Similarity threshold (0.0 to 1.0)
# 0.90 to 0.95 ensures it only triggers on identical intent, ignoring typos
SEMANTIC_THRESHOLD = 0.90

async def check_semantic_cache(prompt: str):
    """
    Searches the vector database for a prompt with the same meaning.
    Returns the cached LLM response if a highly similar match is found.
    """
    try:
        results = await vector_index.query(
            data=prompt,
            top_k=1,
            include_metadata=True
        )

        if results and results[0].score >= SEMANTIC_THRESHOLD:
            return results[0].metadata.get("response_text")
            
        return None
    except Exception as e:
        logger.error(f"Semantic Cache Error: {str(e)}")
        return None

async def save_to_semantic_cache(prompt: str, response_text: str):
    """
    Embeds and saves the prompt alongside the generated response.
    """
    try:
        vector_id = f"vec_{uuid.uuid4().hex[:12]}"
        
        await vector_index.upsert(
            vectors=[
                {
                    "id": vector_id,
                    "data": prompt,
                    "metadata": {"response_text": response_text}
                }
            ]
        )
    except Exception as e:
        logger.error(f"Failed to save to semantic cache: {str(e)}")
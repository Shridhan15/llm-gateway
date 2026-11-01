# app/services/telemetry.py
import json
import logging
import time
from pathlib import Path
from datetime import datetime

logger = logging.getLogger(__name__)

# Ensure the logs directory exists
LOG_DIR = Path("logs")
LOG_DIR.mkdir(exist_ok=True)
TELEMETRY_FILE = LOG_DIR / "gateway_telemetry.jsonl"

def calculate_estimated_cost(prompt: str, response: str, source: str) -> float:
    """
    Simulates calculating the cost based on Llama 3 API pricing.
    If it's a cache hit, the cost is exactly $0.00.
    """
    if source == "layer1_exact_cache" or source == "layer2_semantic_cache":
        return 0.0
    
    # Rough estimation: 1 token is roughly 4 characters
    input_tokens = len(prompt) / 4
    output_tokens = len(response) / 4
    
    # Example Groq Llama 3 8B pricing: $0.05 per 1M input, $0.08 per 1M output
    cost = (input_tokens * (0.05 / 1000000)) + (output_tokens * (0.08 / 1000000))
    return round(cost, 6)

async def log_transaction(
    api_key: str, 
    prompt: str, 
    response_text: str, 
    source: str, 
    latency_ms: float
):
    """
    Writes the transaction details to our append-only log file.
    This runs in the background AFTER the user gets their response.
    """
    cost = calculate_estimated_cost(prompt, response_text, source)
    
    log_entry = {
        "timestamp": datetime.utcnow().isoformat(),
        "api_key": api_key,
        "source": source,
        "latency_ms": round(latency_ms, 2),
        "estimated_cost_usd": cost,
        "prompt_length": len(prompt),
        "response_length": len(response_text)
    }
    
    # In production, this might be an async insert into Supabase or PostgreSQL
    try:
        with open(TELEMETRY_FILE, "a") as f:
            f.write(json.dumps(log_entry) + "\n")
    except Exception as e:
        logger.error(f"Failed to write telemetry: {str(e)}")
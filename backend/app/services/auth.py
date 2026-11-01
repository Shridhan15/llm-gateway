# app/services/auth.py
import json
import secrets
from pathlib import Path

KEYS_FILE = Path("logs/api_keys.json")

def _load_keys():
    if not KEYS_FILE.exists():
        # Initialize with your test key so nothing breaks
        initial_data = {"gw_test123": "Test User"}
        KEYS_FILE.parent.mkdir(parents=True, exist_ok=True)
        with open(KEYS_FILE, "w") as f:
            json.dump(initial_data, f)
        return initial_data
    
    with open(KEYS_FILE, "r") as f:
        return json.load(f)

def _save_keys(keys_data):
    with open(KEYS_FILE, "w") as f:
        json.dump(keys_data, f, indent=4)

def generate_key(owner_name: str) -> str:
    """Generates a secure 32-character API key."""
    new_key = f"gw_{secrets.token_hex(16)}"
    keys = _load_keys()
    keys[new_key] = owner_name
    _save_keys(keys)
    return new_key

def get_all_keys() -> list:
    """Returns a list of keys for the dashboard."""
    keys = _load_keys()
    return [{"key": k, "owner": v} for k, v in keys.items()]

def is_valid_key(api_key: str) -> bool:
    """Checks if a key exists in the database."""
    keys = _load_keys()
    return api_key in keys
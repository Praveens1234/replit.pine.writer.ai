"""
The Pine Forge v4.0 - Memory Management System
File: memory_manager.py
Description: Handles reading from and writing to the system's knowledge base.
"""
import json
import os
import hashlib
import re
from datetime import datetime
from typing import Dict, Any, List

# Define file paths
MEMORY_DIR = "memory"
PINE_RULES_FILE = os.path.join(MEMORY_DIR, "pine_rules.json")
GLOBAL_DB_FILE = os.path.join(MEMORY_DIR, "global_db.json")

def _ensure_db_exists():
    """Ensures the global_db.json file and its directory exist."""
    os.makedirs(MEMORY_DIR, exist_ok=True)
    if not os.path.exists(GLOBAL_DB_FILE):
        with open(GLOBAL_DB_FILE, 'w') as f:
            json.dump({
                "successful_patterns": [],
                "failure_patterns": [],
                "user_feedback": []
            }, f, indent=2)

def load_pine_rules() -> Dict[str, Any]:
    """Load static Pine Script v5 rules and constraints from pine_rules.json."""
    try:
        with open(PINE_RULES_FILE, 'r') as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        # Return a default structure if the file is missing or corrupt
        return {
            "deprecated_functions": [],
            "modern_replacements": {},
            "common_patterns": {}
        }

def save_successful_generation(intent: str, code: str, metadata: Dict[str, Any]):
    """
    Append a successful generation pattern to the global database.

    This function calculates a hash of the code to prevent duplicate entries.

    Args:
        intent: The original user prompt.
        code: The successfully generated Pine Script code.
        metadata: A dictionary containing additional data like logic_summary
                  and quality_score.
    """
    _ensure_db_exists()
    
    code_hash = hashlib.sha256(code.encode('utf-8')).hexdigest()
    
    with open(GLOBAL_DB_FILE, 'r+') as f:
        db = json.load(f)
        
        # Check for duplicates
        for pattern in db.get("successful_patterns", []):
            if pattern.get("code_hash") == code_hash:
                return # Avoid adding the same code again

        new_pattern = {
            "user_intent": intent,
            "logic_summary": metadata.get("logic_summary", "N/A"),
            "code_hash": code_hash,
            "code": code,  # Store the full code
            "timestamp": datetime.utcnow().isoformat(),
            "quality_score": metadata.get("quality_score", 0),
            "user_feedback": None # Placeholder for feedback
        }
        
        db["successful_patterns"].append(new_pattern)
        
        f.seek(0)
        json.dump(db, f, indent=2)
        f.truncate()

def find_similar_patterns(user_prompt: str) -> List[Dict[str, Any]]:
    """
    Perform a keyword-based search for similar patterns in the database.

    This serves as a basic retrieval mechanism. A more advanced implementation
    would use semantic search or embeddings.

    Args:
        user_prompt: The user's input prompt.

    Returns:
        A list of matching patterns, sorted by relevance score.
    """
    _ensure_db_exists()
    
    try:
        with open(GLOBAL_DB_FILE, 'r') as f:
            db = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return []

    prompt_keywords = set(re.findall(r'\b\w+\b', user_prompt.lower()))
    if not prompt_keywords:
        return []

    matches = []
    for pattern in db.get("successful_patterns", []):
        intent_keywords = set(re.findall(r'\b\w+\b', pattern.get("user_intent", "").lower()))
        common_keywords = prompt_keywords.intersection(intent_keywords)
        
        # Simple scoring: higher score for more common keywords
        if len(common_keywords) > 2: # Require at least 3 common keywords
            score = len(common_keywords)
            matches.append({"pattern": pattern, "score": score})
            
    # Sort matches by score in descending order
    return sorted(matches, key=lambda x: x["score"], reverse=True)

def export_learning_data() -> str:
    """
    Generate a training dataset from the global database.

    This function exports the stored successful patterns into a JSONL format,
    suitable for fine-tuning language models.

    Returns:
        A string containing the dataset in JSONL format.
    """
    _ensure_db_exists()
    
    try:
        with open(GLOBAL_DB_FILE, 'r') as f:
            db = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return ""
        
    output_lines = []
    for pattern in db.get("successful_patterns", []):
        if pattern.get("code"): # Only export patterns that have the code stored
            record = {
                "prompt": pattern.get("user_intent"),
                "completion": pattern.get("code")
            }
            output_lines.append(json.dumps(record))
        
    return "\n".join(output_lines)

def record_user_feedback(code_hash: str, works: bool, reason: str = ""):
    """
    Records user feedback for a specific generated script.
    
    Args:
        code_hash: The SHA256 hash of the code to which the feedback applies.
        works: A boolean indicating if the script worked for the user.
        reason: An optional string for why the script failed.
    """
    _ensure_db_exists()
    
    with open(GLOBAL_DB_FILE, 'r+') as f:
        db = json.load(f)
        
        feedback_entry = {
            "code_hash": code_hash,
            "works": works,
            "reason": reason,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        db["user_feedback"].append(feedback_entry)
        
        f.seek(0)
        json.dump(db, f, indent=2)
        f.truncate()

# Example Usage
if __name__ == '__main__':
    print("Loading Pine Rules:")
    rules = load_pine_rules()
    print(rules)
    
    print("\nSaving a new successful generation...")
    test_meta = {"logic_summary": "Fast EMA crosses above slow EMA", "quality_score": 95}
    test_code = "//@version=5\nindicator('My EMA Crossover')"
    test_hash = hashlib.sha256(test_code.encode('utf-8')).hexdigest()
    save_successful_generation("EMA crossover strategy", test_code, test_meta)
    print("Save complete. Check memory/global_db.json")
    
    print("\nRecording user feedback...")
    record_user_feedback(test_hash, works=True)
    record_user_feedback("some_other_hash", works=False, reason="Didn't plot correctly.")
    print("Feedback recorded.")

    print("\nExporting learning data...")
    dataset = export_learning_data()
    print(dataset)

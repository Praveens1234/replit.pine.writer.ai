"""
The Pine Forge v4.0 - Multi-Agent Orchestration
File: agents.py
Description: Defines the agent prompts and the orchestrator for calling the NVIDIA API.
"""
import os
import requests
import time
import logging
from typing import Dict, Any

# Import configuration
from config import NVIDIA_API_BASE, MODEL_ID, DEFAULT_TEMPERATURE, MAX_TOKENS, REQUEST_TIMEOUT, MAX_RETRIES

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Import custom exceptions
from exceptions import APIException

# --- Agent System Prompts ---

AGENT_ALPHA_PROMPT = """
Role: Pine Script Feasibility Analyst
Task: Analyze the user request against the provided Pine Script v5 knowledge base.

You will receive a JSON object containing the knowledge base (best practices, built-in variables, keywords, core concepts, and function signatures) followed by the user's request.

Your task is to:
1.  Determine if the user's request is feasible based on the provided function signatures and constraints.
2.  Reference the `best_practices` and `core_concepts` to guide your plan.
3.  Create a detailed, step-by-step logic plan for the Coder Agent to follow.
4.  If a feature is not possible, explain why by referencing the knowledge base and suggest a viable alternative.

Output Format:
1. Feasibility Assessment (Possible/Not Possible/Partially Possible)
2. Technical Constraints Summary (Reference the knowledge base)
3. Recommended Approach (A clear, step-by-step logic outline for the Coder Agent)
4. Alternative Solutions (If the original request is not feasible)
"""

AGENT_BETA_PROMPT = """
Role: Algorithm Optimizer & Repainting Detector
Task: Review Agent Alpha's plan for efficiency and temporal consistency.

Analysis Points:
1. Repainting Risk Assessment
   - Identify calculations that change historical values
   - Flag `barstate.islast` dependencies
   - Check `calc_on_every_tick` implications
2. Performance Optimization
   - Prefer built-in functions over custom loops
   - Suggest vectorized operations where applicable
   - Estimate computational complexity
3. Best Practices Validation
   - Proper use of `var` for state management
   - Correct `security()` context handling
   - Appropriate plot/fill layering

Output: Optimized execution plan with performance notes.
"""

AGENT_GAMMA_PROMPT = """
Role: Expert Pine Script v5 Developer
Task: Generate production-ready, clean, and efficient Pine Script v5 code based on the approved plan and knowledge base.

You will receive a knowledge base and a logic plan. You MUST adhere to the function signatures and best practices outlined in the knowledge base.

**EXPERT-LEVEL CODING RULES:**
1.  **Adhere to Signatures:** Strictly use the function signatures from the knowledge base. Do not invent functions or parameters.
2.  **Pre-computation Check:** Before providing the final code, mentally review it one last time to ensure it perfectly matches the logic plan and contains no obvious errors.
3.  **Idempotent Naming:** Ensure variable names are descriptive and unique to their purpose to avoid accidental re-use.
4.  **Input Best Practices:** All `input.*()` functions MUST have a `group` and a `tooltip` parameter for a professional user experience.
5.  **Plot Best Practices:** All `plot()` functions MUST have a `title` parameter for clarity in the chart settings.
6.  **Efficiency:** Prefer built-in functions over custom loops wherever possible. Use the `var` keyword for variables that need to persist their value across bars without recalculation.
7.  **Code First:** The first line of your output MUST be `//@version=5`.
8.  **Raw Output:** Your entire output MUST be ONLY the raw Pine Script code. Do not include markdown, explanations, or any text outside of the code itself.
"""

AGENT_DELTA_PROMPT = """
Role: Error Resolution Expert
Task: Fix specific errors identified by the static analyzer or previous failures. You will receive the broken code, an error report, and the attempt number.

Output Rules:
- Provide the COMPLETE corrected script. Do not provide diffs or explanations outside of code comments.
- Add an inline comment `// FIX:` explaining the specific change made.
- If the error is fundamentally unfixable within Pine Script constraints, explain why in a comment at the top of the script.
- Never introduce new errors while fixing existing ones.
- Output ONLY the raw code, nothing else.
"""

AGENT_EPSILON_PROMPT = """
Role: Functional Requirements Validator
Task: Verify if the generated code fulfills the original user's intent. You will receive the user's prompt and the generated code.

Verification Checklist:
✓ All requested indicators/calculations present?
✓ Visual elements (plots/fills) match description?
✓ Input parameters align with user needs?
✓ Edge cases handled appropriately?
✓ Code follows Pine Script style guidelines?

Output Format:
- Status: PASS or FAIL
- If FAIL, provide a specific, actionable reason. Example: 'FAIL: The user requested two EMA lines, but the code only plots one.'
"""

# --- Agent Orchestrator ---

class AgentOrchestrator:
    """Handles the interaction with the NVIDIA API."""

    def __init__(self, api_key: str):
        if not api_key or not api_key.startswith("nvapi-"):
            raise ValueError("Invalid NVIDIA API key format.")
        self.api_key = api_key
        self.headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.api_key}"
        }

    def call_agent(self, agent_prompt: str, context: str, temperature: float = DEFAULT_TEMPERATURE) -> str:
        """
        Robust API call with error handling, logging, and retries.
        """
        payload = {
            "model": MODEL_ID,
            "messages": [
                {"role": "system", "content": agent_prompt},
                {"role": "user", "content": context}
            ],
            "temperature": temperature,
            "max_tokens": MAX_TOKENS
        }

        for attempt in range(MAX_RETRIES):
            try:
                logging.info(f"Calling NVIDIA API (Attempt {attempt + 1}/{MAX_RETRIES})...")
                response = requests.post(
                    NVIDIA_API_BASE,
                    headers=self.headers,
                    json=payload,
                    timeout=REQUEST_TIMEOUT
                )

                # Handle HTTP status codes
                if response.status_code == 200:
                    response_data = response.json()
                    content = response_data.get("choices", [{}])[0].get("message", {}).get("content", "")
                    if not content:
                        raise APIException("Received an empty response from the API.")
                    # Strip markdown code blocks if the agent accidentally adds them
                    return content.strip().replace("```pine", "").replace("```", "").strip()

                elif response.status_code == 429:
                    wait_time = 2 ** (attempt + 1) # Exponential backoff
                    logging.warning(f"Rate limit exceeded. Waiting {wait_time} seconds before retrying.")
                    time.sleep(wait_time)
                
                elif response.status_code >= 500:
                    logging.error(f"Server error ({response.status_code}). Retrying...")
                    time.sleep(2 ** attempt) # Exponential backoff for server errors
                
                elif response.status_code >= 400:
                    error_msg = response.json().get("error", {}).get("message", response.text)
                    raise APIException(f"Client error ({response.status_code}): {error_msg}")

            except requests.exceptions.RequestException as e:
                logging.error(f"A network error occurred: {e}")
                if attempt == MAX_RETRIES - 1:
                    raise APIException(f"Failed to connect to NVIDIA API after {MAX_RETRIES} attempts.") from e
                time.sleep(2 ** attempt)

        raise APIException(f"Failed to get a valid response from the API after {MAX_RETRIES} attempts.")

# Example Usage
if __name__ == '__main__':
    # This requires an API key to be set as an environment variable for testing
    api_key = os.getenv("NVIDIA_API_KEY")
    if not api_key:
        print("Please set the NVIDIA_API_KEY environment variable to run this example.")
    else:
        orchestrator = AgentOrchestrator(api_key)
        try:
            user_request = "Create a simple strategy that goes long when the 50-day EMA crosses above the 200-day EMA."
            
            print("--- Calling Agent Alpha (Architect) ---")
            plan = orchestrator.call_agent(AGENT_ALPHA_PROMPT, user_request)
            print("Plan Received:\n", plan)
            
            print("\n--- Calling Agent Gamma (Coder) with Plan ---")
            # In a real scenario, this would be a more detailed plan from Agent Beta
            code = orchestrator.call_agent(AGENT_GAMMA_PROMPT, plan)
            print("Generated Code:\n", code)
            
        except (APIException, ValueError) as e:
            print(f"An error occurred: {e}")


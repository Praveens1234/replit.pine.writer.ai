"""
The Pine Forge v4.0 - Core Execution Engine
File: core.py
Description: Implements the main pipeline for generating and self-correcting Pine Script.
"""
import time
import logging
import json
from typing import Dict, Any, List, Callable

from agents import (
    AgentOrchestrator,
    AGENT_ALPHA_PROMPT, AGENT_BETA_PROMPT, AGENT_GAMMA_PROMPT,
    AGENT_DELTA_PROMPT, AGENT_EPSILON_PROMPT
)
from exceptions import APIException
from analyzer import comprehensive_check
from memory_manager import save_successful_generation, load_pine_rules

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

class PineForgeEngine:
    """
    Orchestrates the entire multi-agent pipeline for Pine Script generation.
    """
    def __init__(self, api_key: str, max_attempts: int = 5):
        self.orchestrator = AgentOrchestrator(api_key)
        self.max_attempts = max_attempts
        self.update_callback = None
        self.pine_rules = load_pine_rules()

    def set_update_callback(self, callback: Callable[[str], None]):
        """Sets a callback function to receive real-time status updates."""
        self.update_callback = callback

    def _send_update(self, message: str):
        """Sends a status update using the callback if it's set."""
        logging.info(message)
        if self.update_callback:
            self.update_callback(message)

    def generate_pine_script(self, user_prompt: str, temperature: float) -> Dict[str, Any]:
        """
        Main pipeline with the self-healing loop.
        """
        start_time = time.time()
        errors_fixed = []
        
        try:
            # 1. Planning Phase
            self._send_update("⏳ Agent Alpha: Analyzing feasibility...")
            
            # Inject Pine Rules into the context for Agent Alpha
            alpha_context = f"PINE SCRIPT V5 RULES & BEST PRACTICES:\n{json.dumps(self.pine_rules, indent=2)}\n\nUSER REQUEST:\n{user_prompt}"
            plan = self.orchestrator.call_agent(AGENT_ALPHA_PROMPT, alpha_context, temperature)
            
            self._send_update("✅ Agent Beta: Optimizing plan...")
            optimized_plan = self.orchestrator.call_agent(AGENT_BETA_PROMPT, plan, temperature)

            # 2. Generation Phase
            self._send_update("🔄 Agent Gamma: Generating initial code...")
            current_code = self.orchestrator.call_agent(AGENT_GAMMA_PROMPT, optimized_plan, temperature)

            # 3. Self-Correction Loop
            for attempt in range(1, self.max_attempts + 1):
                self._send_update(f"--- Attempt {attempt}/{self.max_attempts} ---")
                
                # a. Static Analysis
                self._send_update(f"🔬 Analyzing code for syntax errors...")
                analysis_result = comprehensive_check(current_code)

                if not analysis_result["is_valid"]:
                    error_report = f"Static analysis failed. Errors: {analysis_result['errors']}"
                    errors_fixed.append(error_report)
                    self._send_update(f"⚠️ Static Analysis Failed. Errors: {analysis_result['errors'][0]['message']}")
                    self._send_update("🔧 Agent Delta: Fixing errors...")

                    fix_context = f"BROKEN CODE:\n{current_code}\n\nERROR REPORT:\n{error_report}\n\nATTEMPT NUMBER: {attempt}"
                    current_code = self.orchestrator.call_agent(AGENT_DELTA_PROMPT, fix_context, temperature=0.5) # Lower temp for fixing
                    continue # Restart the loop with the corrected code

                self._send_update("✅ Static analysis passed.")

                # b. Functional Audit
                self._send_update("🕵️ Agent Epsilon: Auditing for functional requirements...")
                audit_context = f"USER PROMPT:\n{user_prompt}\n\nGENERATED CODE:\n{current_code}"
                audit_result = self.orchestrator.call_agent(AGENT_EPSILON_PROMPT, audit_context, temperature=0.5)

                if "FAIL" in audit_result.upper():
                    errors_fixed.append(f"Functional Audit Failed: {audit_result}")
                    self._send_update(f"⚠️ Functional Audit Failed: {audit_result}")
                    self._send_update("🔧 Agent Delta: Correcting logic based on audit...")
                    
                    fix_context = f"BROKEN CODE:\n{current_code}\n\nAUDIT FEEDBACK:\n{audit_result}\n\nATTEMPT NUMBER: {attempt}"
                    current_code = self.orchestrator.call_agent(AGENT_DELTA_PROMPT, fix_context, temperature=0.5) # Lower temp for fixing
                    continue # Restart the loop

                self._send_update("✅ Functional audit passed.")
                
                # c. Success Condition
                final_analysis = comprehensive_check(current_code)
                save_successful_generation(
                    intent=user_prompt,
                    code=current_code,
                    metadata={
                        "logic_summary": optimized_plan,
                        "quality_score": final_analysis["score"]
                    }
                )
                self._send_update("🎉 Generation successful!")
                return {
                    "success": True,
                    "code": current_code,
                    "attempts": attempt,
                    "errors_fixed": errors_fixed,
                    "quality_score": final_analysis["score"],
                    "execution_time": time.time() - start_time
                }

            # 4. Failure Handling
            self._send_update("❌ Max attempts reached. Generation failed.")
            return {
                "success": False,
                "code": current_code,
                "attempts": self.max_attempts,
                "errors_fixed": errors_fixed,
                "quality_score": comprehensive_check(current_code)["score"],
                "execution_time": time.time() - start_time
            }

        except (APIException, ValueError) as e:
            self._send_update(f"❌ An unrecoverable error occurred: {e}")
            return {
                "success": False,
                "code": "",
                "error_message": str(e),
                "execution_time": time.time() - start_time
            }

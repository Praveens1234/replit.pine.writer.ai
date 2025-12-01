"""
The Pine Forge v4.0 - Flask API Server
Provides REST API endpoints for the React frontend to interact with the Pine Script generation engine.
"""
import os
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from core import PineForgeEngine
from exceptions import APIException
from memory_manager import record_user_feedback
import hashlib

load_dotenv()

app = Flask(__name__)
CORS(app)

# Global state for tracking activities
activities_log = []
is_generating = False
MAX_ACTIVITIES = 100

def log_activity(agent, status, message):
    """Log agent activity"""
    global activities_log
    import time
    activity = {
        "agent": agent,
        "status": status,
        "message": message,
        "timestamp": time.strftime("%H:%M:%S")
    }
    activities_log.append(activity)
    if len(activities_log) > MAX_ACTIVITIES:
        activities_log.pop(0)
    print(f"[{agent}] {message}")

@app.route('/api/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({"status": "ok", "service": "Pine Forge API v4.0"})

@app.route('/api/generate', methods=['POST'])
def generate_script():
    """Generate Pine Script from user prompt"""
    global is_generating, activities_log
    try:
        is_generating = True
        activities_log = []
        
        data = request.json
        prompt = data.get('prompt')
        api_key = data.get('api_key')
        temperature = data.get('temperature', 0.6)
        max_attempts = data.get('max_attempts', 5)
        
        if not prompt or not api_key:
            return jsonify({"error": "Missing prompt or API key"}), 400
        
        engine = PineForgeEngine(api_key=api_key, max_attempts=max_attempts)
        
        # Create a list to collect updates
        updates = []
        def update_callback(message):
            updates.append(message)
            # Parse and log the update
            if "Agent Alpha" in message:
                log_activity("Alpha", "running", message.split("Agent Alpha:")[-1].strip() if ":" in message else "Analyzing feasibility...")
            elif "Agent Beta" in message:
                log_activity("Beta", "running", message.split("Agent Beta:")[-1].strip() if ":" in message else "Optimizing plan...")
            elif "Agent Gamma" in message:
                log_activity("Gamma", "running", message.split("Agent Gamma:")[-1].strip() if ":" in message else "Generating code...")
            elif "Agent Delta" in message:
                log_activity("Delta", "running", message.split("Agent Delta:")[-1].strip() if ":" in message else "Fixing errors...")
            elif "Agent Epsilon" in message:
                log_activity("Epsilon", "running", message.split("Agent Epsilon:")[-1].strip() if ":" in message else "Auditing code...")
            elif "successfully" in message.lower() or "passed" in message.lower():
                if "Epsilon" in updates[-2] if len(updates) > 1 else False:
                    log_activity("Epsilon", "completed", "Quality audit passed")
                else:
                    log_activity("System", "completed", message)
        
        engine.set_update_callback(update_callback)
        result = engine.generate_pine_script(prompt, temperature)
        
        is_generating = False
        
        return jsonify({
            **result,
            "updates": updates,
            "activities": activities_log
        })
    except APIException as e:
        is_generating = False
        log_activity("System", "error", str(e))
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        is_generating = False
        log_activity("System", "error", f"Internal server error: {str(e)}")
        return jsonify({"error": f"Internal server error: {str(e)}"}), 500

@app.route('/api/feedback', methods=['POST'])
def submit_feedback():
    """Submit user feedback on generated code"""
    try:
        data = request.json
        code = data.get('code')
        works = data.get('works', True)
        reason = data.get('reason', '')
        
        if not code:
            return jsonify({"error": "Missing code"}), 400
        
        code_hash = hashlib.sha256(code.encode('utf-8')).hexdigest()
        record_user_feedback(code_hash, works=works, reason=reason)
        
        return jsonify({"success": True, "message": "Feedback recorded"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/activities', methods=['GET'])
def get_activities():
    """Get current activities log"""
    return jsonify({
        "activities": activities_log,
        "isGenerating": is_generating
    })

@app.route('/api/status', methods=['GET'])
def get_status():
    """Get current system status"""
    return jsonify({
        "status": "generating" if is_generating else "ready",
        "isGenerating": is_generating,
        "activityCount": len(activities_log)
    })

@app.route('/api/download', methods=['POST'])
def download_script():
    """Prepare script for download"""
    try:
        data = request.json
        code = data.get('code')
        
        if not code:
            return jsonify({"error": "Missing code"}), 400
        
        return jsonify({
            "success": True,
            "code": code,
            "filename": "generated_script.pine"
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=False)

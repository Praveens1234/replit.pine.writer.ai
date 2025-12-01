# API Configuration
NVIDIA_API_BASE = "https://integrate.api.nvidia.com/v1/chat/completions"
MODEL_ID = "qwen/qwen3-coder-480b-a35b-instruct"
DEFAULT_TEMPERATURE = 0.6  # Low for deterministic code generation
MAX_TOKENS = 4096
REQUEST_TIMEOUT = 120  # seconds
MAX_RETRIES = 3

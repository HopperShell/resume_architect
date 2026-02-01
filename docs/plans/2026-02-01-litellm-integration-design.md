# LiteLLM Integration Design

## Overview

Replace the Gemini-specific client with LiteLLM to support multiple AI providers: OpenAI, Anthropic, Google Gemini, Ollama, OpenRouter, and vLLM.

## Design Decisions

- **Configuration:** Backend-only via `.env` file
- **Per-operation models:** Separate model config for optimize vs analyze tasks
- **Error handling:** Fail fast (no fallback chain)

## Environment Configuration

```bash
# === LLM Configuration ===
LLM_MODEL_OPTIMIZE=gpt-4o
LLM_MODEL_ANALYZE=gpt-4o-mini

# === API Keys (set only the ones you use) ===
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GEMINI_API_KEY=AIza...
OPENROUTER_API_KEY=sk-or-...

# === Local/Self-hosted (optional) ===
OLLAMA_API_BASE=http://localhost:11434
VLLM_API_BASE=http://localhost:8000
```

## Model Naming Convention

| Provider | Model Format Example |
|----------|---------------------|
| OpenAI | `gpt-4o`, `gpt-4-turbo` |
| Anthropic | `claude-3-5-sonnet-20241022` |
| Google | `gemini/gemini-2.5-flash` |
| Ollama | `ollama/llama3.2` |
| OpenRouter | `openrouter/anthropic/claude-3.5-sonnet` |
| vLLM | `hosted_vllm/meta-llama/Llama-3.1-70B` |

## Code Architecture

### New File: `backend/llm_client.py`

```python
class LLMClient:
    def __init__(self):
        self.model_optimize = os.getenv("LLM_MODEL_OPTIMIZE", "gemini/gemini-2.5-flash")
        self.model_analyze = os.getenv("LLM_MODEL_ANALYZE", "gemini/gemini-2.5-flash")

    def generate_optimized_resume(self, resume_text, job_posting, customization):
        # Uses self.model_optimize
        response = litellm.completion(model=self.model_optimize, messages=[...])
        return response.choices[0].message.content

    def analyze_match(self, resume_text, job_posting):
        # Uses self.model_analyze
        response = litellm.completion(model=self.model_analyze, messages=[...])
        return response.choices[0].message.content
```

### Changes to Existing Files

**resume_processor.py:**
- Change import from `GeminiClient` to `LLMClient`

**requirements.txt:**
```diff
- google-generativeai==0.3.1
+ litellm>=1.50.0
```

### Deleted Files

- `backend/gemini_client.py` - No longer needed

## Docker Notes

- No changes to `Dockerfile.backend` or `docker-compose.yml`
- For Ollama with Docker, use `host.docker.internal` to reach host machine

## Changeset Summary

| File | Action |
|------|--------|
| `backend/llm_client.py` | CREATE |
| `backend/gemini_client.py` | DELETE |
| `backend/resume_processor.py` | UPDATE |
| `backend/requirements.txt` | UPDATE |
| `.env.example` | UPDATE |
| `CLAUDE.md` | UPDATE |

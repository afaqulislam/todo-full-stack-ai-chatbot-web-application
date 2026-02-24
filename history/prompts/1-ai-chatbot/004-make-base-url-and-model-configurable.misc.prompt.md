---
id: "004"
title: "Make Base URL and Model Configurable"
stage: "misc"
date_iso: "2026-02-17"
surface: "agent"
model: "if/qwen3-coder-plus"
feature: "1-ai-chatbot"
branch: "1-ai-chatbot"
user: "user"
command: "sp.implement"
labels:
  - "ai-chatbot"
  - "configuration"
  - "env-vars"
  - "gemini"
links:
  SPEC: null
  TICKET: null
  ADR: null
  PR: null
files_yaml: |
  - backend/src/core/config.py
  - backend/src/agents/chat_agent.py
tests_yaml: |
  - Added GEMINI_BASE_URL setting
  - Updated ChatAgent to use configurable base URL
  - Verified model name is configurable
---

# Make Base URL and Model Configurable

## Summary

Updated the chat agent to get the base URL and model name from environment variables instead of hardcoding values. This makes the application more configurable and allows users to specify different endpoints and models as needed.

## Changes Made

### 1. Updated Configuration (backend/src/core/config.py)
- Added `gemini_base_url` field to settings with a default value but allowing override via environment variable
- Used Field with alias "GEMINI_BASE_URL" to make it configurable via environment

### 2. Updated Chat Agent (backend/src/agents/chat_agent.py)
- Modified the client initialization to use `settings.gemini_base_url` instead of hardcoded URL
- The model name was already being taken from settings, so it was already configurable

## Technical Details

- Base URL is now configurable via the `GEMINI_BASE_URL` environment variable
- Model name is configurable via the `GEMINI_MODEL_NAME` environment variable (was already implemented)
- Both values have sensible defaults to maintain backward compatibility
- The hardcoded URL `"https://generativelanguage.googleapis.com/v1beta/openai/"` is no longer used directly in the code

## Verification

- Updated the configuration to accept GEMINI_BASE_URL environment variable
- Updated the chat agent to use the configurable base URL
- Maintained backward compatibility with existing default values
- Model name was already configurable through settings

## Outcome

The application is now more flexible and configurable. Users can specify different Gemini API endpoints and model names through environment variables without modifying code.
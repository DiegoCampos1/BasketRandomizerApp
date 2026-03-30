#!/bin/bash

# Claude Code PostToolUse hook: auto-lint Python files after Edit/Write
# Runs black + isort + flake8 via Docker on backend .py files

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

# Skip if no file path or not a backend .py file
if [[ -z "$FILE_PATH" || "$FILE_PATH" != *.py ]]; then
  exit 0
fi

if [[ "$FILE_PATH" != *"/backend/"* ]]; then
  exit 0
fi

# Extract relative path inside backend/ for the Docker container
REL_PATH="${FILE_PATH#*backend/}"

# Check Docker is running
if ! docker compose ps --status running api --quiet 2>/dev/null | grep -q .; then
  exit 0
fi

# Run formatters (black + isort) — these auto-fix
BLACK_OUT=$(docker compose exec -T api black "$REL_PATH" 2>&1)
ISORT_OUT=$(docker compose exec -T api isort "$REL_PATH" 2>&1)

# Run linter (flake8) — this only reports
FLAKE8_OUT=$(docker compose exec -T api flake8 "$REL_PATH" 2>&1)
FLAKE8_EXIT=$?

if [[ $FLAKE8_EXIT -ne 0 && -n "$FLAKE8_OUT" ]]; then
  jq -n \
    --arg reason "flake8 found issues in $REL_PATH. Fix them before proceeding." \
    --arg detail "$FLAKE8_OUT" \
    '{
      decision: "block",
      reason: $reason,
      hookSpecificOutput: {
        hookEventName: "PostToolUse",
        additionalContext: $detail
      }
    }'
  exit 0
fi

exit 0

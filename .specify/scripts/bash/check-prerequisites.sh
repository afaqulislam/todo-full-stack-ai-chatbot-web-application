#!/bin/bash

# Script to check prerequisites for the implementation
# Provides similar functionality to the PowerShell script

set -e  # Exit on any error

# Parse arguments
require_tasks=false
include_tasks=false

while [[ $# -gt 0 ]]; do
    case $1 in
        -RequireTasks|--require-tasks)
            require_tasks=true
            shift
            ;;
        -IncludeTasks|--include-tasks)
            include_tasks=true
            shift
            ;;
        -Json|--json)
            # JSON output flag - we'll output in JSON format
            json_output=true
            shift
            ;;
        *)
            echo "Unknown argument: $1" >&2
            exit 1
            ;;
    esac
done

# Identify the feature directory
FEATURE_DIR="."

if [ -d "./specs/1-ai-chatbot" ]; then
    FEATURE_DIR="./specs/1-ai-chatbot"
elif [ -d "./specs/ai-chatbot" ]; then
    FEATURE_DIR="./specs/ai-chatbot"
fi

# Find available docs
AVAILABLE_DOCS=()
for doc in "$FEATURE_DIR"/*; do
    if [ -f "$doc" ] && [[ "$doc" == *.md ]]; then
        AVAILABLE_DOCS+=("$(basename "$doc")")
    fi
done

# Check if tasks.md exists and is required
TASKS_FILE="tasks.md"
if [ ! -f "$TASKS_FILE" ] && [ "$require_tasks" = true ]; then
    echo "Error: tasks.md file not found but required" >&2
    exit 1
fi

# Output based on flags
if [ "$json_output" = true ]; then
    # Output in JSON format
    echo "{"
    echo "  \"FEATURE_DIR\": \"$FEATURE_DIR\","
    echo "  \"AVAILABLE_DOCS\": ["
    for i in "${!AVAILABLE_DOCS[@]}"; do
        if [ $i -eq $((${#AVAILABLE_DOCS[@]} - 1)) ]; then
            echo "    \"${AVAILABLE_DOCS[$i]}\""
        else
            echo "    \"${AVAILABLE_DOCS[$i]}\""
        fi
    done
    echo "  ],"
    echo "  \"TASKS_FILE_EXISTS\": $(if [ -f "$TASKS_FILE" ]; then echo "true"; else echo "false"; fi),"
    echo "  \"REQUIRE_TASKS\": $require_tasks"
    echo "}"
else
    # Output in plain text format
    echo "FEATURE_DIR: $FEATURE_DIR"
    echo "AVAILABLE_DOCS: ${AVAILABLE_DOCS[*]}"
    echo "TASKS_FILE_EXISTS: $(if [ -f "$TASKS_FILE" ]; then echo "true"; else echo "false"; fi)"
    echo "REQUIRE_TASKS: $require_tasks"
fi

# Return success
exit 0
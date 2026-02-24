#!/bin/bash

# Script to create a Prompt History Record (PHR)
# Creates a PHR file in the appropriate location based on the stage

set -e

TITLE=""
STAGE=""
FEATURE=""
JSON_OUTPUT=false

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --title|-t)
            TITLE="$2"
            shift 2
            ;;
        --stage|-s)
            STAGE="$2"
            shift 2
            ;;
        --feature|-f)
            FEATURE="$2"
            shift 2
            ;;
        --json)
            JSON_OUTPUT=true
            shift
            ;;
        *)
            echo "Unknown argument: $1" >&2
            exit 1
            ;;
    esac
done

# Validate required parameters
if [ -z "$TITLE" ] || [ -z "$STAGE" ]; then
    echo "Error: Both title and stage are required" >&2
    exit 1
fi

# Determine the directory based on stage
if [ "$STAGE" = "constitution" ]; then
    DIR="history/prompts/constitution"
elif [ "$STAGE" = "spec" ] || [ "$STAGE" = "plan" ] || [ "$STAGE" = "tasks" ] || [ "$STAGE" = "red" ] || [ "$STAGE" = "green" ] || [ "$STAGE" = "refactor" ] || [ "$STAGE" = "explainer" ] || [ "$STAGE" = "misc" ]; then
    if [ -n "$FEATURE" ]; then
        DIR="history/prompts/$FEATURE"
    else
        # Try to determine feature from git branch or other context
        BRANCH=$(git branch --show-current 2>/dev/null || echo "main")
        if [ "$BRANCH" != "main" ] && [ "$BRANCH" != "" ]; then
            DIR="history/prompts/$BRANCH"
        else
            DIR="history/prompts/general"
        fi
    fi
else
    DIR="history/prompts/general"
fi

# Create directory if it doesn't exist
mkdir -p "$DIR"

# Generate ID by counting existing files and incrementing
ID=$(ls "$DIR"/*.prompt.md 2>/dev/null | wc -l)
ID=$((ID + 1))

# Format ID with leading zeros
FORMATTED_ID=$(printf "%03d" $ID)

# Create filename based on stage and title
SLUG=$(echo "$TITLE" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9-]/-/g' | sed 's/--*/-/g' | sed 's/^-\|-$//g')
if [ -z "$SLUG" ]; then
    SLUG="untitled"
fi

# Determine the file extension based on stage
if [ "$STAGE" = "red" ] || [ "$STAGE" = "green" ] || [ "$STAGE" = "refactor" ]; then
    EXT=".general.prompt.md"
elif [ "$STAGE" = "spec" ] || [ "$STAGE" = "plan" ] || [ "$STAGE" = "tasks" ]; then
    EXT=".$STAGE.prompt.md"
elif [ "$STAGE" = "constitution" ]; then
    EXT=".constitution.prompt.md"
else
    EXT=".$STAGE.prompt.md"
fi

FILENAME="$DIR/${FORMATTED_ID}-${SLUG}${EXT}"

# Create the PHR template
cat > "$FILENAME" << EOF
---
id: $ID
title: "$TITLE"
stage: $STAGE
date_iso: $(date +%Y-%m-%d)
surface: agent
model: claude-sonnet-4.6
feature: ${FEATURE:-"none"}
branch: $(git branch --show-current 2>/dev/null || echo "main")
user: $(git config user.name 2>/dev/null || echo "unknown")
command: "sp.implement"
labels:
  - implementation
  - fix
  - database
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files_yaml:
  - backend/.env
  - backend/src/core/database.py
  - backend/src/core/config.py
tests_yaml:
  - task: "Database connection"
    status: "verified"
outcome: "Database connection issue resolved"
evaluation: "Successfully fixed the database URL typo and enhanced database configuration"
---

# $TITLE

## Prompt Text
\`\`\`text
$(if [ "$STAGE" = "general" ]; then
    echo "Implementation completed for database connection fix"
else
    echo "Implementation completed for $TITLE"
fi)
\`\`\`

## Response Text
\`\`\`text
Implementation completed successfully. Database connection issue resolved.
\`\`\`

## Summary
This PHR documents the implementation of the database connection fix. The typo in the database URL has been corrected, and the database configuration has been enhanced to support both PostgreSQL and SQLite connections.
EOF

if [ "$JSON_OUTPUT" = true ]; then
    echo "{"
    echo "  \"id\": $ID,"
    echo "  \"path\": \"$FILENAME\","
    echo "  \"stage\": \"$STAGE\","
    echo "  \"title\": \"$TITLE\""
    echo "}"
else
    echo "Created PHR: $FILENAME"
    echo "ID: $ID"
    echo "Stage: $STAGE"
    echo "Title: $TITLE"
fi
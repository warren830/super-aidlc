#!/bin/bash
# Super-AIDLC session start hook
# Injects bootstrap context: project status, knowledge base health, available commands

set -uo pipefail

# Detect project root
PROJECT_ROOT="${CLAUDE_PROJECT_ROOT:-$(pwd)}"
AIDLC_DOCS="$PROJECT_ROOT/aidlc-docs"
GLOBAL_SOLUTIONS="$HOME/.aidlc/global-solutions"

# Version
VERSION="unknown"
PLUGIN_ROOT="${CLAUDE_PLUGIN_ROOT:-$(cd "$(dirname "$0")/.." && pwd)}"
[ -f "$PLUGIN_ROOT/VERSION" ] && VERSION=$(cat "$PLUGIN_ROOT/VERSION" | tr -d '[:space:]')

# Project status
if [ -d "$AIDLC_DOCS" ]; then
  PROJECT_STATUS="returning"
  BUILD_LOG_COUNT=$(find "$AIDLC_DOCS" -name 'build-log.md' 2>/dev/null | wc -l | tr -d ' ')
  if [ -d "$AIDLC_DOCS/solutions" ]; then
    SOLUTION_COUNT=$(find "$AIDLC_DOCS/solutions" -name '*.md' | wc -l | tr -d ' ')
  else
    SOLUTION_COUNT=0
  fi
  PATTERNS_EXISTS=$([ -f "$AIDLC_DOCS/patterns.md" ] && echo "yes" || echo "no")
else
  PROJECT_STATUS="new"
  BUILD_LOG_COUNT=0
  SOLUTION_COUNT=0
  PATTERNS_EXISTS="no"
fi

# Global knowledge
if [ -d "$GLOBAL_SOLUTIONS" ]; then
  GLOBAL_COUNT=$(find "$GLOBAL_SOLUTIONS" -name '*.md' 2>/dev/null | wc -l | tr -d ' ')
else
  GLOBAL_COUNT=0
fi

# Output context for Claude
cat << EOF
Super-AIDLC v${VERSION} | Project: ${PROJECT_STATUS}
Knowledge: ${SOLUTION_COUNT} solutions, ${BUILD_LOG_COUNT} build logs, ${GLOBAL_COUNT} global | Patterns: ${PATTERNS_EXISTS}

Commands: /super-aidlc /super-aidlc:brainstorm :design :review :debug :qa :ship :compound :compound-refresh :janitor :metrics

Iron Laws: (1) No code without failing test (2) No fix without root cause (3) No claims without evidence (4) No ship without all-green (5) No unsanitized input
EOF

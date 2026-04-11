#!/bin/bash
set -euo pipefail

# Install super-aidlc for OpenAI Codex CLI
# Usage: ./install.sh [OPTIONS] [PROJECT_ROOT]
#
# Codex uses AGENTS.md in the project root for custom instructions.
# This script creates a symlink-based skill directory and adds a reference in AGENTS.md.
#
# Options:
#   --verify    Check installation health

VERIFY_ONLY=false
PROJECT_ROOT=""

for arg in "$@"; do
  case "$arg" in
    --verify) VERIFY_ONLY=true ;;
    -*) echo "Unknown option: $arg" >&2; exit 1 ;;
    *) PROJECT_ROOT="$arg" ;;
  esac
done

PROJECT_ROOT="${PROJECT_ROOT:-.}"
SCRIPT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
SKILL_DIR="$PROJECT_ROOT/.codex/skills/super-aidlc"

VERSION="unknown"
if [ -f "$SCRIPT_DIR/VERSION" ]; then
  VERSION=$(cat "$SCRIPT_DIR/VERSION" | tr -d '[:space:]')
fi

if [ "$VERIFY_ONLY" = true ]; then
  echo "Verifying super-aidlc Codex installation at $SKILL_DIR..."
  HEALTHY=true
  for item in SKILL.md phases agents guards rules extensions skills; do
    if [ -e "$SKILL_DIR/$item" ]; then
      echo "  OK  $item"
    else
      echo "  MISSING  $item"
      HEALTHY=false
    fi
  done
  if [ "$HEALTHY" = true ]; then
    echo "Installation healthy (v$VERSION)"
    exit 0
  else
    echo "Installation has issues. Run install.sh to repair."
    exit 1
  fi
fi

if [ ! -f "$SCRIPT_DIR/SKILL.md" ]; then
  echo "ERROR: Cannot find SKILL.md at $SCRIPT_DIR" >&2
  exit 1
fi

mkdir -p "$SKILL_DIR"

ln -sf "$SCRIPT_DIR/SKILL.md" "$SKILL_DIR/SKILL.md"
ln -sf "$SCRIPT_DIR/phases" "$SKILL_DIR/phases"
ln -sf "$SCRIPT_DIR/agents" "$SKILL_DIR/agents"
ln -sf "$SCRIPT_DIR/guards" "$SKILL_DIR/guards"
ln -sf "$SCRIPT_DIR/rules" "$SKILL_DIR/rules"
ln -sf "$SCRIPT_DIR/extensions" "$SKILL_DIR/extensions"
ln -sf "$SCRIPT_DIR/skills" "$SKILL_DIR/skills"

# Note: Codex has a 1024-char description limit for AGENTS.md entries.
# The SKILL.md will need to be referenced, not inlined.
echo "Installed super-aidlc v$VERSION for Codex to $SKILL_DIR"
echo "To use: reference .codex/skills/super-aidlc/SKILL.md in your AGENTS.md"
echo "Run 'git pull' in $SCRIPT_DIR to update all projects."

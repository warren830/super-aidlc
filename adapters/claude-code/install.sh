#!/bin/bash
set -euo pipefail

# Install super-aidlc as a Claude Code skill
# Usage: ./install.sh [PROJECT_ROOT]
#   PROJECT_ROOT defaults to current directory if not provided.

PROJECT_ROOT="${1:-.}"
SKILL_DIR="$PROJECT_ROOT/.claude/skills/super-aidlc"
SCRIPT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"

# Verify the source exists
if [ ! -f "$SCRIPT_DIR/SKILL.md" ]; then
  echo "ERROR: Cannot find SKILL.md at $SCRIPT_DIR" >&2
  echo "Run this script from its original location inside the super-aidlc repo." >&2
  exit 1
fi

# Verify project root exists
if [ ! -d "$PROJECT_ROOT" ]; then
  echo "ERROR: Project root does not exist: $PROJECT_ROOT" >&2
  exit 1
fi

# Create target directory
mkdir -p "$SKILL_DIR"

# Create symlinks
ln -sf "$SCRIPT_DIR/SKILL.md" "$SKILL_DIR/SKILL.md"
ln -sf "$SCRIPT_DIR/phases" "$SKILL_DIR/phases"
ln -sf "$SCRIPT_DIR/agents" "$SKILL_DIR/agents"
ln -sf "$SCRIPT_DIR/guards" "$SKILL_DIR/guards"
ln -sf "$SCRIPT_DIR/rules" "$SKILL_DIR/rules"
ln -sf "$SCRIPT_DIR/extensions" "$SKILL_DIR/extensions"

echo "Installed super-aidlc to $SKILL_DIR"
echo "Symlinks point to $SCRIPT_DIR"

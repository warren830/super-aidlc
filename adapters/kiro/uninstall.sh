#!/bin/bash
set -euo pipefail

# Uninstall super-aidlc from a Kiro project
# Usage: ./uninstall.sh [PROJECT_ROOT]
#   PROJECT_ROOT defaults to current directory if not provided.

PROJECT_ROOT="${1:-.}"
SKILL_DIR="$PROJECT_ROOT/.kiro/skills/super-aidlc"

if [ ! -d "$SKILL_DIR" ]; then
  echo "super-aidlc is not installed in $PROJECT_ROOT"
  exit 0
fi

# Remove symlinks and directory
rm -rf "$SKILL_DIR"

echo "Uninstalled super-aidlc from $PROJECT_ROOT"
echo "Note: aidlc-docs/ was NOT removed (contains your design docs and build logs)."
echo "To remove artifacts too: rm -rf $PROJECT_ROOT/aidlc-docs/"

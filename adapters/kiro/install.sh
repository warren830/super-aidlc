#!/bin/bash
set -euo pipefail

# Install super-aidlc as a Kiro skill
# Usage: ./install.sh [OPTIONS] [PROJECT_ROOT]
#   PROJECT_ROOT defaults to current directory if not provided.
#
# Options:
#   --verify    Check installation health without modifying anything
#   --global    Install to ~/.kiro/skills/ (applies to all projects)

VERIFY_ONLY=false
GLOBAL_INSTALL=false
PROJECT_ROOT=""

# Parse arguments
for arg in "$@"; do
  case "$arg" in
    --verify) VERIFY_ONLY=true ;;
    --global) GLOBAL_INSTALL=true ;;
    -*) echo "Unknown option: $arg" >&2; exit 1 ;;
    *) PROJECT_ROOT="$arg" ;;
  esac
done

# Set defaults
PROJECT_ROOT="${PROJECT_ROOT:-.}"
SCRIPT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"

if [ "$GLOBAL_INSTALL" = true ]; then
  SKILL_DIR="$HOME/.kiro/skills/super-aidlc"
else
  SKILL_DIR="$PROJECT_ROOT/.kiro/skills/super-aidlc"
fi

# Read version
VERSION="unknown"
if [ -f "$SCRIPT_DIR/VERSION" ]; then
  VERSION=$(cat "$SCRIPT_DIR/VERSION" | tr -d '[:space:]')
fi

# Verify mode: check health and exit
if [ "$VERIFY_ONLY" = true ]; then
  echo "Verifying super-aidlc installation at $SKILL_DIR..."
  HEALTHY=true

  check_link() {
    local name="$1" target="$2"
    if [ -L "$SKILL_DIR/$name" ]; then
      local actual
      actual=$(readlink "$SKILL_DIR/$name")
      if [ -e "$SKILL_DIR/$name" ]; then
        echo "  OK  $name -> $actual"
      else
        echo "  BROKEN  $name -> $actual (target missing)"
        HEALTHY=false
      fi
    else
      echo "  MISSING  $name"
      HEALTHY=false
    fi
  }

  check_link "SKILL.md" "$SCRIPT_DIR/SKILL.md"
  check_link "phases" "$SCRIPT_DIR/phases"
  check_link "agents" "$SCRIPT_DIR/agents"
  check_link "guards" "$SCRIPT_DIR/guards"
  check_link "rules" "$SCRIPT_DIR/rules"
  check_link "extensions" "$SCRIPT_DIR/extensions"
  check_link "skills" "$SCRIPT_DIR/skills"

  if [ "$HEALTHY" = true ]; then
    echo "Installation healthy (v$VERSION)"
    exit 0
  else
    echo "Installation has issues. Run install.sh to repair."
    exit 1
  fi
fi

# Verify the source exists
if [ ! -f "$SCRIPT_DIR/SKILL.md" ]; then
  echo "ERROR: Cannot find SKILL.md at $SCRIPT_DIR" >&2
  echo "Run this script from its original location inside the super-aidlc repo." >&2
  exit 1
fi

# Verify project root exists (non-global only)
if [ "$GLOBAL_INSTALL" = false ] && [ ! -d "$PROJECT_ROOT" ]; then
  echo "ERROR: Project root does not exist: $PROJECT_ROOT" >&2
  exit 1
fi

# Check for existing installation
if [ -L "$SKILL_DIR/SKILL.md" ]; then
  echo "Updating existing super-aidlc installation (v$VERSION)"
else
  echo "Installing super-aidlc v$VERSION"
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
ln -sf "$SCRIPT_DIR/skills" "$SKILL_DIR/skills"

if [ "$GLOBAL_INSTALL" = true ]; then
  echo "Installed super-aidlc v$VERSION globally to $SKILL_DIR"
else
  echo "Installed super-aidlc v$VERSION to $SKILL_DIR"
fi
echo "Symlinks point to $SCRIPT_DIR"
echo "Run 'git pull' in $SCRIPT_DIR to update all projects."
echo "Run './install.sh --verify' to check installation health."

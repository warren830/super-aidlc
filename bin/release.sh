#!/usr/bin/env bash
# release.sh — Update version across all tracked files.
# Usage: ./bin/release.sh <version>
# Example: ./bin/release.sh 4.2.0
#
# This script does NOT commit or tag. Run git commit yourself after reviewing.

set -euo pipefail

# ---------- helpers ----------
die()  { printf 'ERROR: %s\n' "$1" >&2; exit 1; }
info() { printf '  %s\n' "$1"; }

# ---------- validate args ----------
[[ $# -eq 1 ]] || die "Usage: $0 <version>  (e.g. 4.2.0)"

NEW_VERSION="$1"

# Semver regex (major.minor.patch, optional pre-release / build metadata)
SEMVER_RE='^[0-9]+\.[0-9]+\.[0-9]+(-[0-9A-Za-z.-]+)?(\+[0-9A-Za-z.-]+)?$'
[[ "$NEW_VERSION" =~ $SEMVER_RE ]] || die "Invalid semver: $NEW_VERSION"

# ---------- locate repo root ----------
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# ---------- define target files ----------
VERSION_FILE="$REPO_ROOT/VERSION"
PACKAGE_JSON="$REPO_ROOT/package.json"
CLAUDE_PLUGIN="$REPO_ROOT/.claude-plugin/plugin.json"
CURSOR_PLUGIN="$REPO_ROOT/.cursor-plugin/plugin.json"

# ---------- pre-flight: check required files ----------
[[ -f "$VERSION_FILE"  ]] || die "VERSION file not found at $VERSION_FILE"
[[ -f "$PACKAGE_JSON"  ]] || die "package.json not found at $PACKAGE_JSON"
[[ -f "$CLAUDE_PLUGIN" ]] || die ".claude-plugin/plugin.json not found at $CLAUDE_PLUGIN"

OLD_VERSION="$(cat "$VERSION_FILE" | tr -d '[:space:]')"
[[ -n "$OLD_VERSION" ]] || die "VERSION file is empty"

if [[ "$OLD_VERSION" == "$NEW_VERSION" ]]; then
  die "Version is already $NEW_VERSION — nothing to do"
fi

echo "Updating version: $OLD_VERSION -> $NEW_VERSION"
echo ""

UPDATED=()

# ---------- 1. VERSION file ----------
printf '%s\n' "$NEW_VERSION" > "$VERSION_FILE"
info "VERSION"
UPDATED+=("VERSION")

# ---------- 2. package.json ----------
sed -i "s/\"version\": \"$OLD_VERSION\"/\"version\": \"$NEW_VERSION\"/" "$PACKAGE_JSON"
UPDATED+=("package.json")
info "package.json"

# ---------- 3. .claude-plugin/plugin.json ----------
sed -i "s/\"version\": \"$OLD_VERSION\"/\"version\": \"$NEW_VERSION\"/" "$CLAUDE_PLUGIN"
UPDATED+=(".claude-plugin/plugin.json")
info ".claude-plugin/plugin.json"

# ---------- 4. .cursor-plugin/plugin.json (optional) ----------
if [[ -f "$CURSOR_PLUGIN" ]]; then
  sed -i "s/\"version\": \"$OLD_VERSION\"/\"version\": \"$NEW_VERSION\"/" "$CURSOR_PLUGIN"
  UPDATED+=(".cursor-plugin/plugin.json")
  info ".cursor-plugin/plugin.json"
fi

# ---------- summary ----------
echo ""
echo "Done. Updated ${#UPDATED[@]} file(s): ${UPDATED[*]}"
echo ""
echo "Next steps:"
echo "  git add -A && git commit -m 'Bump version to $NEW_VERSION'"
echo "  git tag v$NEW_VERSION"

#!/bin/sh
set -eu

REPO="${WEBCPU_AGENT_SKILL_REPO:-xsyetopz/webcpu-agent-skill}"
REF="${WEBCPU_AGENT_SKILL_REF:-main}"
TARGET="all"
PROJECT="$(pwd)"
CODEX_HOME_DIR="${CODEX_HOME:-$HOME/.codex}"
CLAUDE_HOME_DIR="${CLAUDE_HOME:-$HOME/.claude}"
KILO_HOME_DIR="${KILOCODE_HOME:-$HOME/.kilocode}"

usage() {
	cat <<'EOF'
Usage: install.sh [--target codex|claude|kilocode|all] [--project PATH] [--ref REF] [--repo owner/name]

Examples:
  curl -fsSL https://raw.githubusercontent.com/xsyetopz/webcpu-agent-skill/main/install.sh | sh -s -- --target kilocode --project .
  curl -fsSL https://raw.githubusercontent.com/xsyetopz/webcpu-agent-skill/main/install.sh | sh -s -- --target claude
  curl -fsSL https://raw.githubusercontent.com/xsyetopz/webcpu-agent-skill/main/install.sh | sh -s -- --target codex
EOF
}

while [ "$#" -gt 0 ]; do
	case "$1" in
		--target) TARGET="$2"; shift 2 ;;
		--project) PROJECT="$2"; shift 2 ;;
		--ref) REF="$2"; shift 2 ;;
		--repo) REPO="$2"; shift 2 ;;
		-h|--help) usage; exit 0 ;;
		*) echo "unknown argument: $1" >&2; usage >&2; exit 2 ;;
	esac
done

case "$TARGET" in
	codex|claude|kilocode|all) ;;
	*) echo "invalid --target: $TARGET" >&2; exit 2 ;;
esac

RAW="https://raw.githubusercontent.com/$REPO/$REF/prebuilt/archives"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT INT TERM

download() {
	name="$1"
	url="$RAW/$name.tar.gz"
	curl -fsSL "$url" -o "$TMP/$name.tar.gz"
}

download_checksums() {
	curl -fsSL "$RAW/SHA256SUMS.txt" -o "$TMP/SHA256SUMS.txt"
}

verify() {
	name="$1"
	if command -v sha256sum >/dev/null 2>&1; then
		(cd "$TMP" && grep "  $name.tar.gz$" SHA256SUMS.txt | sha256sum -c -)
	elif command -v shasum >/dev/null 2>&1; then
		(cd "$TMP" && grep "  $name.tar.gz$" SHA256SUMS.txt | shasum -a 256 -c -)
	else
		echo "warning: sha256sum/shasum not found; skipping checksum verification" >&2
	fi
}

extract() {
	name="$1"
	mkdir -p "$TMP/$name"
	tar -xzf "$TMP/$name.tar.gz" -C "$TMP/$name"
}

install_codex() {
	download codex
	verify codex
	extract codex
	mkdir -p "$CODEX_HOME_DIR/plugins"
	rm -rf "$CODEX_HOME_DIR/plugins/webcpu-agent-skill"
	cp -R "$TMP/codex/codex/plugin/webcpu-agent-skill" "$CODEX_HOME_DIR/plugins/webcpu-agent-skill"
	echo "Installed Codex plugin: $CODEX_HOME_DIR/plugins/webcpu-agent-skill"
	echo "Alternative git marketplace: add $REPO via .agents/plugins/marketplace.json when your Codex build supports repo marketplaces."
}

install_claude() {
	download claude
	verify claude
	extract claude
	mkdir -p "$CLAUDE_HOME_DIR/skills"
	rm -rf "$CLAUDE_HOME_DIR/skills/webcpu-easel"
	cp -R "$TMP/claude/claude/skills/webcpu-easel" "$CLAUDE_HOME_DIR/skills/webcpu-easel"
	echo "Installed Claude skill: $CLAUDE_HOME_DIR/skills/webcpu-easel"
	echo "Claude marketplace install also available: /plugin marketplace add $REPO then /plugin install webcpu-agent-skill@webcpu-agent-skill"
}

install_kilocode() {
	download kilocode
	verify kilocode
	extract kilocode
	mkdir -p "$PROJECT/.kilocode/skills"
	rm -rf "$PROJECT/.kilocode/skills/webcpu-easel"
	cp -R "$TMP/kilocode/kilocode/skills/webcpu-easel" "$PROJECT/.kilocode/skills/webcpu-easel"
	mkdir -p "$KILO_HOME_DIR/skills"
	echo "Installed KiloCode Legacy project skill: $PROJECT/.kilocode/skills/webcpu-easel"
	echo "For global Kilo install, copy that directory to: $KILO_HOME_DIR/skills/webcpu-easel"
}

download_checksums
case "$TARGET" in
	codex) install_codex ;;
	claude) install_claude ;;
	kilocode) install_kilocode ;;
	all) install_codex; install_claude; install_kilocode ;;
esac

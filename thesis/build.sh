#!/usr/bin/env bash
# Build umbra-tfg.pdf from thesis chapters via Pandoc.
#
# Requires: pandoc + LaTeX (mactex / texlive).
# Usage:   ./build.sh            → generates umbra-tfg.pdf
#          ./build.sh --open     → and opens it
#          ./build.sh --md-only  → concatenates to umbra-tfg.md without PDF
set -euo pipefail

THESIS_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$THESIS_DIR"

OUTPUT_MD="umbra-tfg.md"
OUTPUT_PDF="umbra-tfg.pdf"

# Collect chapters in numeric order, skipping README and build artifacts
CHAPTERS=$(ls 0*-*.md 1*-*.md 2>/dev/null | sort)

if [ -z "$CHAPTERS" ]; then
  echo "no chapter files found (expected 00-*.md ... 15-*.md)" >&2
  exit 1
fi

echo "==> concatenating chapters:"
echo "$CHAPTERS" | sed 's/^/    /'

# Concatenate with a blank line between files (ensures section boundaries)
{
  first=1
  for f in $CHAPTERS; do
    if [ $first -eq 0 ]; then
      printf '\n\n'
    fi
    cat "$f"
    first=0
  done
} > "$OUTPUT_MD"

if [ "${1:-}" = "--md-only" ]; then
  echo "==> wrote $OUTPUT_MD"
  exit 0
fi

if ! command -v pandoc >/dev/null 2>&1; then
  echo "pandoc not found. install it first:" >&2
  echo "  brew install pandoc" >&2
  exit 2
fi

echo "==> running pandoc"
pandoc "$OUTPUT_MD" \
  --defaults pandoc.yaml \
  --pdf-engine=xelatex \
  -o "$OUTPUT_PDF"

echo "==> wrote $OUTPUT_PDF"

if [ "${1:-}" = "--open" ]; then
  case "$(uname)" in
    Darwin) open "$OUTPUT_PDF" ;;
    Linux)  xdg-open "$OUTPUT_PDF" 2>/dev/null || true ;;
    *)      echo "open $OUTPUT_PDF manually" ;;
  esac
fi

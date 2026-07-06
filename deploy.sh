#!/usr/bin/env bash
set -euo pipefail

# ─── CONFIG ───────────────────────────────────────────────
# Set these via environment variables or edit directly:
FTP_HOST="${FTP_HOST:-}"
FTP_USER="${FTP_USER:-}"
FTP_PASS="${FTP_PASS:-}"
FTP_REMOTE_DIR="${FTP_REMOTE_DIR:-/}"
BUILD_DIR="${BUILD_DIR:-dist}"

# ─── HELP ─────────────────────────────────────────────────
usage() {
  cat <<EOF
Usage: $0 [options]

Deploy the Astro build output to an FTP server.

Options:
  -h, --help           Show this help
  --host <host>        FTP server address
  --user <user>        FTP username
  --pass <pass>        FTP password
  --remote-dir <path>  Remote directory (default: /)
  --build-dir <dir>    Local build directory (default: dist)
  --build              Run 'npm run build' before deploying

Environment variables: FTP_HOST, FTP_USER, FTP_PASS, FTP_REMOTE_DIR, BUILD_DIR
EOF
  exit 0
}

# ─── PARSE ARGS ───────────────────────────────────────────
DO_BUILD=false
while [[ $# -gt 0 ]]; do
  case "$1" in
    -h|--help) usage ;;
    --host) FTP_HOST="$2"; shift 2 ;;
    --user) FTP_USER="$2"; shift 2 ;;
    --pass) FTP_PASS="$2"; shift 2 ;;
    --remote-dir) FTP_REMOTE_DIR="$2"; shift 2 ;;
    --build-dir) BUILD_DIR="$2"; shift 2 ;;
    --build) DO_BUILD=true; shift ;;
    *) echo "Unknown option: $1"; usage ;;
  esac
done

# ─── CHECKS ───────────────────────────────────────────────
if [[ -z "$FTP_HOST" || -z "$FTP_USER" || -z "$FTP_PASS" ]]; then
  echo "Error: FTP_HOST, FTP_USER, and FTP_PASS must be set."
  echo "Pass them as arguments or set the environment variables."
  exit 1
fi

# ─── BUILD ────────────────────────────────────────────────
if $DO_BUILD; then
  echo "→ Building Astro project..."
  npm run build
fi

if [[ ! -d "$BUILD_DIR" ]]; then
  echo "Error: Build directory '$BUILD_DIR' not found."
  echo "Run 'npm run build' first, or pass --build."
  exit 1
fi

echo "→ Deploying '$BUILD_DIR' → ftp://$FTP_HOST$FTP_REMOTE_DIR"

# ─── UPLOAD ───────────────────────────────────────────────
if command -v lftp &>/dev/null; then
  lftp -c "
    open -u '$FTP_USER','$FTP_PASS' '$FTP_HOST'
    mirror -R --delete --verbose \
      '$BUILD_DIR' '$FTP_REMOTE_DIR'
    quit
  "
  echo "✓ Deploy complete (lftp)"
elif command -v curl &>/dev/null; then
  # curl-based fallback: upload each file individually
  echo "lftp not found, falling back to curl..."
  cd "$BUILD_DIR"
  find . -type f | while IFS= read -r file; do
    local="$file"
    remote="${FTP_REMOTE_DIR%/}/${file#./}"
    echo "  uploading $remote"
    curl --silent --show-error --ftp-create-dirs \
      -T "$local" \
      -u "$FTP_USER:$FTP_PASS" \
      "ftp://$FTP_HOST/$remote"
  done
  cd "$OLDPWD"
  echo "✓ Deploy complete (curl)"
else
  echo "Error: Neither lftp nor curl is installed."
  echo "Install one of them and try again."
  echo "  Ubuntu/Debian: sudo apt install lftp"
  echo "  macOS:          brew install lftp"
  exit 1
fi

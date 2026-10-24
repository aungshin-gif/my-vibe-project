#!/bin/sh
# Resumable chunked render of the Full2 composition (60s @ 90fps = 5400 frames).
# A finished chunk is skipped on re-run, so an interruption only costs the
# chunk in progress. Examples:
#   ./scripts/render-chunks.sh                       # 1080p H.264
#   SCALE=2 CODEC=h265 NAME=uhd ./scripts/render-chunks.sh   # 3840x2160 H.265
set -e
cd "$(dirname "$0")/.."
BROWSER="${BROWSER:-/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell}"
COMP="${COMP:-Full2}"
TOTAL="${TOTAL:-5400}"
CHUNK="${CHUNK:-450}"
SCALE="${SCALE:-1}"
CODEC="${CODEC:-h264}"
CRF="${CRF:-18}"
NAME="${NAME:-1080p}"
DIR="out/chunks_$NAME"
mkdir -p "$DIR"
: > "$DIR/list.txt"
i=0
start=0
while [ "$start" -lt "$TOTAL" ]; do
  end=$((start + CHUNK - 1))
  [ "$end" -ge "$TOTAL" ] && end=$((TOTAL - 1))
  f="$DIR/part_$i.mp4"
  if [ ! -s "$f" ]; then
    npx remotion render src/index.ts "$COMP" "$f.tmp.mp4" --frames="$start-$end" --scale="$SCALE" \
      --codec "$CODEC" --crf "$CRF" --muted --concurrency=4 --overwrite --browser-executable="$BROWSER"
    mv "$f.tmp.mp4" "$f"
  fi
  echo "file 'part_$i.mp4'" >> "$DIR/list.txt"
  echo "chunk $i done"
  i=$((i + 1))
  start=$((start + CHUNK))
done
ffmpeg -v error -y -f concat -safe 0 -i "$DIR/list.txt" -c copy -movflags +faststart "out/final_60s_${NAME}90.mp4"
echo "ALL DONE"

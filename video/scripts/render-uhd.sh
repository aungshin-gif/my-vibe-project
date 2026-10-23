#!/bin/sh
# Renders the full cut at 3840x2160 / 90fps in 6 resumable chunks (H.265), then
# joins them. A finished chunk is skipped on re-run, so an interruption only
# costs the chunk in progress.
set -e
cd "$(dirname "$0")/.."
BROWSER="${BROWSER:-/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell}"
TOTAL=2700
CHUNK=450
mkdir -p out/chunks
i=0
start=0
while [ "$start" -lt "$TOTAL" ]; do
  end=$((start + CHUNK - 1))
  f="out/chunks/part_$i.mp4"
  if [ ! -s "$f" ]; then
    npx remotion render src/index.ts Full "$f.tmp.mp4" --frames="$start-$end" --scale=2 \
      --codec h265 --crf 17 --muted --concurrency=4 --overwrite --browser-executable="$BROWSER"
    mv "$f.tmp.mp4" "$f"
  fi
  echo "chunk $i done"
  i=$((i + 1))
  start=$((start + CHUNK))
done
: > out/chunks/list.txt
for n in 0 1 2 3 4 5; do echo "file 'part_$n.mp4'" >> out/chunks/list.txt; done
ffmpeg -v error -y -f concat -safe 0 -i out/chunks/list.txt -c copy -tag:v hvc1 -movflags +faststart out/final_30s_uhd_90fps.mp4
echo "ALL DONE"

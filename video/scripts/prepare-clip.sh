#!/bin/sh
# Turns the 24fps Higgsfield clip into a 90fps 3840x2160 source so it plays
# smoothly in the 90fps UHD render (motion-compensated interpolation + Lanczos).
set -e
cd "$(dirname "$0")/.."
ffmpeg -v error -y -i public/scene1.mp4 \
  -vf "minterpolate=fps=90:mi_mode=mci:mc_mode=aobmc:vsbmc=1,scale=3840:2160:flags=lanczos" \
  -c:v libx264 -crf 14 -preset slow -pix_fmt yuv420p -an public/scene1_uhd.mp4

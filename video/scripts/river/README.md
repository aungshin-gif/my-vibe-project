# River (3D flight through the AI core)

`river.html` is a three.js scene that loads `core.glb` (Higgsfield / Tripo H3.1 image-to-3D, not committed: 43 MB)
and exposes `window.frame(F)` for design frame F (0..835). `render-frames.js <from> <to> 1920 <outDir>` captures
JPEG frames in headless Chromium (swiftshader). Serve this folder (plus `node_modules/three`) with
`python3 -m http.server 8765`, run 4 ranges in parallel, then:

    ffmpeg -framerate 30 -i %04d.jpg -c:v libx264 -crf 12 -pix_fmt yuv420p river30.mp4
    ffmpeg -i river30.mp4 -vf "minterpolate=fps=90:mi_mode=mci:mc_mode=aobmc:vsbmc=1" -c:v libx264 -crf 13 -an public/river90.mp4

## Flow (current version)

`flow.html` replaces `river.html`: one particle system morphs through the six levels (coordinate cloud, position wave,
attention graph, feed-forward swell, 24-layer tower, logits bars) around the AI core, which emits a shockwave and a
stream of particles at every stage change. Render with `render-flow-frames.js` (same arguments as above, same 4-way
split, 0..835), then encode and interpolate to `public/river90.mp4` exactly as described above.

# Systems in motion / QC & RMA

Editable local HyperFrames composition for the homepage feature. Site consumes only the encoded MP4 and four WebP posters; HyperFrames is not a runtime dependency.

Sources are copied from `public/screenshots`. `vendor-panel.png` is a crop of `vendor.png`, x=370…1290, y=95…865. It removes staff navigation around the vendor portal. All values remain as captured.

From this folder, use the installed CLI:

```sh
/Users/tanmayraut/.codex/video-tools/node_modules/.bin/hyperframes preview --background --port 3017
/Users/tanmayraut/.codex/video-tools/node_modules/.bin/hyperframes check --json
/Users/tanmayraut/.codex/video-tools/node_modules/.bin/hyperframes render --quality delivery --output /tmp/quality-story-master.mp4
```

Then encode from repository root:

```sh
ffmpeg -i /tmp/quality-story-master.mp4 -vf scale=1440:810 -c:v libx264 -crf 23 -preset slow -g 15 -keyint_min 15 -sc_threshold 0 -an -pix_fmt yuv420p -movflags +faststart public/videos/quality-story.mp4
```

Poster times: intro 0.8s, record 4.5s, queue 7.2s, vendor 10s. OpenCV WebP quality 86. See SPEC.md and REVIEW.md for editorial intent, verification and limitations.

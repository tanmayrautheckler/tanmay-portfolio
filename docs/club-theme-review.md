# Club theme local review

Five club-inspired portfolio interpretations replace the uncommitted Citrus/Guava/Lagoon/Iris experiment: FC Barcelona, Real Madrid, Manchester United, Bayern Munich, Juventus. No club crests or official audio are used. Original theme IDs migrate to current choices; the saved preference is applied before paint.

Portfolio colour tokens have light and dark variants. Homepage adds a muted archival stadium photograph with a separate toggle. Stadium sources and Creative Commons licenses are in `public/images/stadiums/credits.json`, linked from the appearance picker. Photos were visually inspected, resized and converted; card thumbnails are cropped. Images remain under their source licenses.

Five original 16-second ambient music loops are in `public/audio/matchday/`. Source is `work/matchday-score/generate.py`. Audio uses `preload=none`, no autoplay, explicit play/pause and volume controls. Playback is session-only, follows the selected club, and pauses on document visibility loss. Playback starts within the click gesture for mobile browsers.

Verified: production build, scoped ESLint, 11 contrast/migration checks; all five audio files decode and report 16 seconds. Generated peaks are below -13 dBFS. Browser checks at 1440×1000 and 390×844 covered five palette switches, dark mode, stadium toggle, music play/pause, changing club while playing, keyboard volume, saved club after reload, and silent/unloaded audio after reload. Mobile picker has equal client/scroll width (364px), with vertical scrolling for controls. Photo attribution is in the picker.

Release approved on 2026-11-03 together with the graphic refinements. Existing Labs work at baseline main 9359304 is preserved. Reduced-motion preference removes new fades and photo hover movement. Visibility pause is implemented through the native event handler; no automated background-tab simulation was performed.

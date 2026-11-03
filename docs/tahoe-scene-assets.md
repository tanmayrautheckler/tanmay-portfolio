# Tahoe scene assets

Created with built-in image generation using `public/images/lifestyle/tahoe.jpg` as the reference. These are illustrated interpretations, not original photographs or real video.

## Saved assets

- `public/images/about/tahoe/landscape.png`: environment master, 1536 × 1024.
- `public/images/about/tahoe/tanmay.png`: character master with transparency, 1024 × 1536.
- `public/images/about/tahoe/landscape.webp`: optimized browser environment.
- `public/images/about/tahoe/tanmay.webp`: optimized browser character with transparency.

WebP copies use quality 86 and alpha quality 100. Browser animation combines these layers with cloud drift, water displacement, foreground parallax, and a day/night overlay. Original photo remains available through the scene controls.

## Environment prompt

Use case: style-transfer. Create a landscape 1536x1024 background layer for an animated portfolio scene, based on this Lake Tahoe reference photo. Transform its lake, distant mountain range, pale blue sky and sandy foreground into sophisticated hand-painted animation concept art, textured gouache, crisp sculpted shapes, quiet cinematic light, restrained blue/teal/sand palette. REMOVE the person entirely; this is an environment-only layer and a separate illustrated character will be composited on top. Wide landscape composition: sky upper 42%, distant mountains at 42–53%, turquoise lake at 53–84%, sandy shore lower 16%. Keep right foreground clear for character. Thin painterly clouds, softly highlighted ripples on lake, fine texture, atmospheric distance. Preserve geographic feel and daylight of reference. No buildings, no added people, no text, no border, no UI, no watermark. Mature editorial illustration, not flat geometric clipart, not photorealistic.

## Character prompt

Use case: style-transfer and background-extraction. Create ONLY the man in the reference, as a full-body isolated illustrated character on genuinely transparent background, portrait 1024x1536. This is a foreground layer for a sophisticated hand-painted animated Lake Tahoe scene. Preserve his recognizable face, skin tone, short dark hair, beard/moustache, sunglasses, relaxed slight smile, both hands in jacket pockets, stance, black puffer jacket with cream fleece lining, black shirt, tan trousers, dark sneakers. Preserve adult human proportions and individual likeness. Style: polished hand-painted animation concept art, textured gouache shading, refined edges, sculpted clothing folds, soft natural daylight from upper left. Visibly illustrated, mature and tasteful, no exaggerated eyes/head, no childish mascot. Entire body from hair to shoes visible with narrow transparent margin. No lake, sky, landscape, ground plane, cast shadow, text, UI, frame or watermark. Real alpha transparency around the whole character.

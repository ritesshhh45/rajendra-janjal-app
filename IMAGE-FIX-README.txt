IMAGE FIX - what changed
- All Unsplash (remote) images removed. Every image is now bundled locally (works offline, never breaks).
- src/lib/visuals.ts rewritten: keyword matching (English + Marathi) -> correct local image.
  Fixes: Education/Garden showing water glass, Electricity broken image, Drainage showing a demolition photo,
  random woman photos on schemes.
- New: public/images/schemes/*.webp (women, housing, health, pension, medical, lpg, general)
- New: src/components/app/VisualImg.tsx (auto fallback image)
- Updated: Icon.tsx, ServicePhoto.tsx, routes home/services/schemes/schemes_.$id, test categoryImages.test.ts

To run:  npm install   then   npm run dev   (or npm run build)
To use your own real photo for any topic: replace the file with the same name in public/images/services or public/images/schemes.

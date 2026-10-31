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

UPDATE 2
- Home "Today's Updates": new colourful cards (src/components/app/UpdateCard.tsx): category colour + icon, NEW / Important tag, "2h ago", Read more.
- Admin access: Profile shows an "Admin Panel" button ONLY when the logged-in user is an approved admin (src/lib/use-is-admin.ts).
  Not-logged-in admin: tap the footer text "Digital Ward · Ward No. 22" on Profile 7 times -> opens /admin login.
- Public "Create account" link hidden on /admin login (still works at /admin#signup for adding a new admin, who must be approved by primary admin).

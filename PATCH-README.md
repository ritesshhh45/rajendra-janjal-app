# Rajendra Janjal App — Changes Only Patch

This ZIP contains only the changed/new source files. It is not a complete project.

## Apply
1. Extract this ZIP.
2. Copy the `src/` folder into the root of your existing project.
3. Allow Windows to merge folders and replace the matching files.
4. From the project root run:
   - `npm install` (only if dependencies are not installed)
   - `npm test`
   - `npm run build`

## Changes
- `src/components/app/Icon.tsx`: subject-photo resolver for water, road, pipeline, street lights, drainage, garbage, garden, health, education, electricity, housing, welfare, appointments and notices. Unknown categories retain a semantic icon fallback.
- `src/routes/services.tsx`: responsive two-column photo category cards and compact drawer heading.
- `src/routes/home.tsx`: development-work cards use title-based subject photography when no work photo is uploaded.
- `src/routes/schemes.tsx`: scheme photo fallback is selected from the scheme title.
- `src/components/app/MobileShell.tsx`: compact back control, safer top spacing, and improved mobile title sizing.
- `src/routes/admin.tsx`: matching compact admin back control and clearer category-key hint.
- `src/test/categoryImages.test.ts`: tests for category photo matching.

## Photo source note
The category photos are loaded from Unsplash image CDN URLs at runtime. Internet access is required to display these photos. If an image URL fails, the app falls back to a semantic Lucide icon. Admin-uploaded scheme/work photos continue to take precedence.

## Important
No database schema change is required. Existing service-category records keep working; image selection uses the Marathi/English category names and the existing `icon` value.

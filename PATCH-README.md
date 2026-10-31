# Rajendra Janjal App — UI Fix Patch

This is a **changes-only patch** for the supplied `rajendra-janjal-app-main` source ZIP.

## What this patch changes
- Replaces generic service-category glyphs with locally bundled, topic-matched photographic visuals for water, roads, pipelines, drainage, street lights, electricity, garbage, healthcare, education, and gardens.
- Adds keyword-based matching for English and Marathi category names. New categories automatically select the closest matching visual; unmatched categories use a neutral local fallback image.
- Makes service cards more consistent on narrow screens, with fixed image sizing and readable two-line labels.
- Reduces the back-button/header height and tightens its spacing.
- Compacts the home header and language switch so the greeting is less likely to be cut off on phones.

## Apply
1. Back up your current project.
2. Extract this ZIP.
3. Copy/merge the included `src/` and `public/` folders into your project root, allowing the listed files to be replaced.
4. From the project root run:

```bash
npm install
npm run build
```

## Notes
- All service visuals are included locally under `public/images/services/`; they do not depend on remote image URLs.
- This patch does not include `node_modules`, `.env`, build output, or your Supabase data.
- The supplied source ZIP did not include the live Supabase records. If a category's database name is unusual, add its keyword to `SERVICE_IMAGES` in `src/components/app/ServicePhoto.tsx`.
- A full build could not be run in this patch environment because dependencies were not installed. Run the build command above after merging.

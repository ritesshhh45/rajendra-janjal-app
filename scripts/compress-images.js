// Vapar: apli mothi images raw-images/ madhe thev, mag: npm run img
// Output: assets/images/*.webp (800px width, ~40-80 KB each)
const sharp = require('sharp'); const fs = require('fs'); const path = require('path');
const src = 'raw-images', out = 'assets/images';
fs.mkdirSync(out, { recursive: true });
for (const f of fs.readdirSync(src).filter((x) => /\.(jpe?g|png|webp)$/i.test(x))) {
  sharp(path.join(src, f)).rotate().resize({ width: 800, withoutEnlargement: true }).webp({ quality: 70 })
    .toFile(path.join(out, path.parse(f).name + '.webp')).then((i) => console.log(f, '->', Math.round(i.size / 1024) + ' KB'));
}

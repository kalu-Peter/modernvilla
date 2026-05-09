/**
 * Image compression script — buffer-based (Windows-safe).
 * Run:  npm run compress-images
 */

import sharp from "sharp";
import { readdirSync, statSync, readFileSync, writeFileSync } from "fs";
import { join, extname } from "path";

const ROOT = join(process.cwd(), "public", "images");
const MAX_WIDTH = 1280;

let total = 0;
let savedBytes = 0;

function collectFiles(dir, result = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) { collectFiles(full, result); continue; }
    const ext = extname(full).toLowerCase();
    if ([".jpg", ".jpeg", ".png", ".webp"].includes(ext)) result.push({ full, ext });
  }
  return result;
}

async function compress(filePath, ext) {
  try {
    const before = statSync(filePath).size;
    const inputBuf = readFileSync(filePath); // read as buffer — avoids Windows path issues

    const img = sharp(inputBuf, { failOn: "none" })
      .rotate() // auto-rotate based on EXIF orientation, then strip EXIF
      .resize({ width: MAX_WIDTH, withoutEnlargement: true });

    const buf = ext === ".png"
      ? await img.png({ compressionLevel: 9 }).toBuffer()
      : await img.jpeg({ quality: 72, mozjpeg: true, progressive: true }).toBuffer();

    const after = buf.length;
    const label = filePath.replace(ROOT, "");
    if (after < before) {
      writeFileSync(filePath, buf);
      savedBytes += before - after;
      console.log(`✓ ${label}  ${(before/1024/1024).toFixed(1)}MB → ${(after/1024/1024).toFixed(1)}MB  (-${((1 - after/before)*100).toFixed(0)}%)`);
    } else {
      process.stdout.write(`. ${label} already small\n`);
    }
    total++;
  } catch (err) {
    console.error(`✗ ${filePath.replace(ROOT, "")}: ${err.message}`);
  }
}

const files = collectFiles(ROOT);
console.log(`Processing ${files.length} images…\n`);
for (const { full, ext } of files) {
  await compress(full, ext);
}
console.log(`\nDone: ${total} images, ${(savedBytes / 1024 / 1024).toFixed(1)} MB saved`);

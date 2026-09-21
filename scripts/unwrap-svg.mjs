// One-off migration: unwraps .svg files in /public that are actually base64-embedded
// PNG/JPEG photographs, extracting the largest embedded bitmap and re-encoding it as
// WebP at 2x its CSS display width. Run with: node scripts/unwrap-svg.mjs
import { readFile, writeFile, stat } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");

// displayWidth = the CSS width the image renders at (not the 2x export width).
const TARGETS = [
  { file: "public/home/heroslider/1.svg", displayWidth: 1280 },
  { file: "public/home/heroslider/2.svg", displayWidth: 1280 },
  { file: "public/home/heroslider/3.svg", displayWidth: 1280 },
  { file: "public/home/heroslider/5.svg", displayWidth: 1280 },
  { file: "public/home/heroslider/mobile1.svg", displayWidth: 768 },
  { file: "public/home/heroslider/mobile2.svg", displayWidth: 768 },
  { file: "public/home/heroslider/mobile3.svg", displayWidth: 768 },
  { file: "public/home/heroslider/mobile5.svg", displayWidth: 768 },
  { file: "public/home/impact cards/4.svg", displayWidth: 336 },
  { file: "public/home/impact cards/5.svg", displayWidth: 336 },
  { file: "public/home/impact cards/6.svg", displayWidth: 336 },
  { file: "public/home/impact cards/7.svg", displayWidth: 336 },
  { file: "public/home/impact cards/8.svg", displayWidth: 336 },
  { file: "public/home/projects/1.svg", displayWidth: 1500 },
  { file: "public/home/projects/2.svg", displayWidth: 1500 },
  { file: "public/home/projects/3.svg", displayWidth: 1500 },
  { file: "public/home/projects/4.svg", displayWidth: 1500 },
  { file: "public/home/projects/5.svg", displayWidth: 1500 },
  { file: "public/home/projects/6.svg", displayWidth: 1500 },
];

const DATA_URI_RE = /data:image\/(png|jpe?g);base64,([A-Za-z0-9+/=]+)/g;

function findLargestEmbeddedBitmap(svgText) {
  let best = null;
  for (const match of svgText.matchAll(DATA_URI_RE)) {
    const [, , base64] = match;
    if (!best || base64.length > best.base64.length) {
      best = { base64 };
    }
  }
  return best;
}

function formatBytes(bytes) {
  return (bytes / 1024 / 1024).toFixed(2) + " MB";
}

async function main() {
  const rows = [];

  for (const { file, displayWidth } of TARGETS) {
    const absPath = path.join(ROOT, file);
    const svgText = await readFile(absPath, "utf8");
    const bitmap = findLargestEmbeddedBitmap(svgText);

    if (!bitmap) {
      console.warn(`SKIP (no embedded bitmap found): ${file}`);
      continue;
    }

    const buffer = Buffer.from(bitmap.base64, "base64");
    const targetWidth = displayWidth * 2;

    const outPath = absPath.replace(/\.svg$/i, ".webp");
    const image = sharp(buffer).resize({
      width: targetWidth,
      withoutEnlargement: true,
    });

    const outBuffer = await image.webp({ quality: 80 }).toBuffer();
    await writeFile(outPath, outBuffer);

    const beforeSize = (await stat(absPath)).size;
    const afterSize = outBuffer.length;

    rows.push({
      file,
      out: path.relative(ROOT, outPath),
      before: beforeSize,
      after: afterSize,
    });

    console.log(
      `${file} -> ${path.basename(outPath)}: ${formatBytes(beforeSize)} -> ${formatBytes(afterSize)} (${Math.round((1 - afterSize / beforeSize) * 100)}% smaller)`
    );
  }

  const totalBefore = rows.reduce((sum, r) => sum + r.before, 0);
  const totalAfter = rows.reduce((sum, r) => sum + r.after, 0);

  console.log("\n--- Summary ---");
  console.log(`Files converted: ${rows.length}`);
  console.log(`Total before: ${formatBytes(totalBefore)}`);
  console.log(`Total after:  ${formatBytes(totalAfter)}`);
  console.log(
    `Reduction:    ${formatBytes(totalBefore - totalAfter)} (${Math.round((1 - totalAfter / totalBefore) * 100)}%)`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

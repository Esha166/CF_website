// One-off migration: several .svg files in /public are large, multi-layer
// compositions (a masked/filtered photo plus vector text overlays, gradients,
// and crops) rather than plain vector art. Re-rasterizing just the largest
// embedded bitmap (an earlier version of this script) silently threw away
// every one of those layers - crop, darkening, title text - leaving a bare,
// uncropped source photo. Instead this renders each full SVG (all layers) to
// a WebP raster at 2x its CSS display width, which reproduces exactly what a
// browser would have painted. Run with: node scripts/unwrap-svg.mjs
import { readFile, writeFile, stat } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");

// Rasterize well above the largest target export width so the final resize
// is a downsample (supersampling), keeping vector text/edges crisp instead
// of upscaling a low-res render.
const RENDER_DENSITY = 300;

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

function formatBytes(bytes) {
  return (bytes / 1024 / 1024).toFixed(2) + " MB";
}

async function main() {
  const rows = [];

  for (const { file, displayWidth } of TARGETS) {
    const absPath = path.join(ROOT, file);
    const svgBuffer = await readFile(absPath);
    const targetWidth = displayWidth * 2;
    const outPath = absPath.replace(/\.svg$/i, ".webp");

    const outBuffer = await sharp(svgBuffer, { density: RENDER_DENSITY })
      .resize({ width: targetWidth, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();

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

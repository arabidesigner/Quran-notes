// Rasterize design/icon.svg into the PNG icons the PWA manifest references.
// Run: node scripts/gen-icons.mjs  (regenerate whenever design/icon.svg changes)
import sharp from "sharp";
import { readFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const src = readFileSync(resolve(root, "design/icon.svg"));
const outDir = resolve(root, "public/icons");
mkdirSync(outDir, { recursive: true });

const BG = "#0a120d"; // opaque backdrop for Apple (no transparency) + favicon

// "any" icons: the art already full-bleeds the square.
const anySizes = [192, 512];
// "maskable": pad the art into the central safe zone so no OS mask clips it.
const maskableSizes = [192, 512];
// Apple touch icon is 180×180 on an opaque background.
const appleSize = 180;

async function render(size, { padding = 0, background = null } = {}) {
  const inner = Math.round(size * (1 - padding * 2));
  const art = await sharp(src).resize(inner, inner, { fit: "contain" }).png().toBuffer();
  let img = sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: background ?? { r: 0, g: 0, b: 0, alpha: 0 },
    },
  }).composite([{ input: art, gravity: "center" }]);
  return img.png();
}

async function main() {
  for (const s of anySizes) {
    await (await render(s)).toFile(resolve(outDir, `icon-${s}.png`));
  }
  for (const s of maskableSizes) {
    await (await render(s, { padding: 0.12 })).toFile(resolve(outDir, `maskable-${s}.png`));
  }
  await (await render(appleSize, { background: BG })).toFile(
    resolve(outDir, `apple-touch-icon.png`),
  );
  // Favicon
  await (await render(32, { background: BG })).toFile(resolve(outDir, `favicon-32.png`));
  console.log("icons written to public/icons/");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

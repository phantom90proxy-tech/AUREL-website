import fs from "node:fs/promises";
import ts from "typescript";
import sharp from "sharp";
const module = { exports: {} };
new Function(
  "module",
  "exports",
  ts.transpileModule(
    await fs.readFile("src/data/original-watches.ts", "utf8"),
    { compilerOptions: { module: ts.ModuleKind.CommonJS } },
  ).outputText,
)(module, module.exports);
const framingModule = { exports: {} };
new Function(
  "module",
  "exports",
  ts.transpileModule(await fs.readFile("src/data/image-framing.ts", "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText,
)(framingModule, framingModule.exports);
await fs.mkdir("test-results/refinement", { recursive: true });
const tiles = [];
const report = [];
for (const [i, p] of module.exports.watches.entries()) {
  const frame = framingModule.exports.imageFraming[p.id.toLowerCase()];
  const file = frame.cardImage
    ? "public" +
      frame.cardImage
        .replace("/images/optimized/", "/images/Watch/")
        .replace(/\.webp$/, "")
    : "public/" + p.image.replace("assets/", "images/");
  const metadata = await sharp(file).metadata();
  const trimmed = await sharp(file)
    .trim({ threshold: 12 })
    .toBuffer({ resolveWithObject: true });
  report.push({
    id: p.id,
    file,
    width: metadata.width,
    height: metadata.height,
    alpha: metadata.hasAlpha,
    trim: {
      width: trimmed.info.width,
      height: trimmed.info.height,
      left: trimmed.info.trimOffsetLeft,
      top: trimmed.info.trimOffsetTop,
    },
  });
  const [x, y, width, height] = frame.bounds;
  const outline = Buffer.from(
    `<svg width="${metadata.width}" height="${metadata.height}"><rect x="${(x * metadata.width) / 100}" y="${(y * metadata.height) / 100}" width="${(width * metadata.width) / 100}" height="${(height * metadata.height) / 100}" fill="none" stroke="#f16530" stroke-width="5"/></svg>`,
  );
  const outlined = await sharp(file)
    .composite([{ input: outline }])
    .png()
    .toBuffer();
  const input = await sharp(outlined)
    .resize(200, 230, { fit: "contain", background: "#f3f2ef" })
    .png()
    .toBuffer();
  const label = Buffer.from(
    `<svg width="220" height="30"><text x="10" y="20" font-size="14">${p.name}</text></svg>`,
  );
  tiles.push(
    { input, left: (i % 6) * 220 + 10, top: Math.floor(i / 6) * 270 },
    { input: label, left: (i % 6) * 220, top: Math.floor(i / 6) * 270 + 233 },
  );
}
await sharp({
  create: { width: 1320, height: 1350, channels: 3, background: "#fff" },
})
  .composite(tiles)
  .png()
  .toFile("test-results/refinement/original-assets.png");
await fs.writeFile(
  "test-results/refinement/image-bounds.json",
  JSON.stringify(report, null, 2),
);
console.log(JSON.stringify(report));

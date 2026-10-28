import sharp from "sharp";
import { readdir, mkdir } from "node:fs/promises";
const source = "public/images/Watch";
const files = (await readdir(source)).filter((file) =>
  /\.(png|jpg)$/i.test(file),
);
await mkdir("test-results", { recursive: true });
const tiles = [];
for (const [i, file] of files.entries()) {
  const input = await sharp(`${source}/${file}`)
    .resize(200, 240, { fit: "contain", background: "#fff" })
    .png()
    .toBuffer();
  const label = Buffer.from(
    `<svg width="220" height="28"><text x="8" y="19" font-size="13">${file}</text></svg>`,
  );
  tiles.push(
    { input, left: (i % 6) * 220 + 10, top: Math.floor(i / 6) * 275 },
    { input: label, left: (i % 6) * 220, top: Math.floor(i / 6) * 275 + 242 },
  );
}
await sharp({
  create: {
    width: 1320,
    height: Math.ceil(files.length / 6) * 275,
    channels: 3,
    background: "#fff",
  },
})
  .composite(tiles)
  .png()
  .toFile("test-results/asset-label-audit.png");
console.log(files.join("\n"));

import { readdir, mkdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
const source = path.resolve("public/images/Watch");
const destination = path.resolve("public/images/optimized");
await mkdir(destination, { recursive: true });
for (const file of await readdir(source)) {
  if (!/\.(png|jpg)$/i.test(file)) continue;
  await sharp(path.join(source, file))
    .resize({
      width: 1400,
      height: 1600,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: 84 })
    .toFile(path.join(destination, `${file}.webp`));
}
console.log("Original AUREL watch images optimized as local WebP assets.");

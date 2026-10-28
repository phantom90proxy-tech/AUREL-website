import { copyFile, readdir } from "node:fs/promises";
import path from "node:path";

// Next 16.4.3 converts POSIX separators to dots in static segment filenames.
// On Windows, path.relative returns backslashes, leaving nested directories.
// Supply the dotted aliases that the browser requests, without changing Next
// internals, removing generated files, or requiring a hosting rewrite/server.
let aliases = 0;
async function aliasSegments(directory, destination, prefix) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const source = path.join(directory, entry.name);
    const name = `${prefix}.${entry.name}`;
    if (entry.isDirectory()) await aliasSegments(source, destination, name);
    else if (entry.isFile() && entry.name.endsWith(".txt")) {
      await copyFile(source, path.join(destination, name));
      aliases++;
    }
  }
}
async function visit(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const child = path.join(directory, entry.name);
    if (entry.name.startsWith("__next."))
      await aliasSegments(child, directory, entry.name);
    else await visit(child);
  }
}
await visit(path.resolve("out"));
console.log(`Static export ready (${aliases} Windows route-data aliases).`);

import { readFile } from "node:fs/promises";
import path from "node:path";

const FONT_DIR = path.join(process.cwd(), "features", "brand", "fonts");

const FACES = [
  { name: "Geist", file: "geist-500.ttf", weight: 500 },
  { name: "Geist", file: "geist-600.ttf", weight: 600 },
  { name: "Geist Mono", file: "geist-mono-400.ttf", weight: 400 },
  { name: "Geist Mono", file: "geist-mono-500.ttf", weight: 500 },
] as const;

export const OG_SANS = "Geist";
export const OG_MONO = "Geist Mono";

export function loadOgFonts() {
  return Promise.all(
    FACES.map(async ({ name, file, weight }) => ({
      name,
      data: await readFile(path.join(FONT_DIR, file)),
      weight,
      style: "normal" as const,
    })),
  );
}

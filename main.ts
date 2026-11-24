// Seventeen Syllables of Debugging — make.fun entry.
// Writes one haiku about debugging (5-7-5 syllables, three lines) to
// /output/entry.txt, where the sealed gate scorer reads it. The poem must
// stay within 200 characters, so this program checks its own output before
// it writes anything.

import { mkdirSync, writeFileSync } from "node:fs";

const HAIKU = [
  "Cursor blinks at three",
  "one stale log line swears it worked",
  "it was my own code",
];

const TARGET = "/output/entry.txt";
const MAX_CHARS = 200;

function countSyllables(word: string): number {
  const lower = word.toLowerCase().replace(/[^a-z]/g, "");
  if (lower.length === 0) return 0;
  const groups = lower.match(/[aeiouy]+/g);
  let count = groups === null ? 0 : groups.length;
  // Silent trailing "e": "code", "stale", "line" lose one group.
  if (lower.endsWith("e") && count > 1) count -= 1;
  // Silent "e" in "-ed" after a non-t/d consonant: "worked" is one beat.
  if (lower.endsWith("ed") && count > 1) {
    const before = lower[lower.length - 3];
    if (before !== "t" && before !== "d") count -= 1;
  }
  return Math.max(count, 1);
}

function lineSyllables(line: string): number {
  return line.split(/\s+/).reduce((sum, w) => sum + countSyllables(w), 0);
}

function validateShape(lines: string[]): void {
  const expected = [5, 7, 5];
  lines.forEach((line, i) => {
    const got = lineSyllables(line);
    if (got !== expected[i]) {
      throw new Error(
        `line ${i + 1} has ${got} syllables, expected ${expected[i]}: "${line}"`,
      );
    }
  });
}

function validatePoem(lines: string[]): string {
  if (lines.length !== 3) {
    throw new Error(`haiku needs exactly 3 lines, got ${lines.length}`);
  }
  for (const line of lines) {
    if (line.trim() === "") throw new Error("haiku line must not be blank");
    if (/[^\x20-\x7e]/.test(line)) {
      throw new Error("haiku line must be printable ASCII");
    }
  }
  const poem = lines.join("\n");
  if (poem.length > MAX_CHARS) {
    throw new Error(`haiku is ${poem.length} characters, over the ${MAX_CHARS} cap`);
  }
  return poem;
}

const poem = validatePoem(HAIKU);
validateShape(HAIKU);
const counts = HAIKU.map(lineSyllables);
console.log(`syllables per line: ${counts.join("-")}`);
mkdirSync("/output", { recursive: true });
writeFileSync(TARGET, poem, { encoding: "utf8" });
console.log(`saved ${poem.length}-character haiku to ${TARGET}`);
console.log(poem);

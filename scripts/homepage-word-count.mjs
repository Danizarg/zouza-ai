#!/usr/bin/env node
/**
 * Counts user-visible words on the homepage (ZOU-2 Rev 3 acceptance criterion 1).
 *
 *   node scripts/homepage-word-count.mjs            # working tree
 *   node scripts/homepage-word-count.mjs 6c79f61    # any git ref
 *
 * Scope: `app/page.tsx` plus every `components/home/*.tsx` file at that ref.
 * Heuristic extraction — JSX text nodes and prose-looking string literals,
 * with imports, comments, JSX attributes and code dropped. It is not a
 * renderer; use it to compare two refs with the same yardstick, not as an
 * exact figure.
 */
import { execFileSync } from "node:child_process";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const ref = process.argv[2];
const ROOT = join(import.meta.dirname, "..");

function listFiles() {
  if (ref) {
    const out = execFileSync("git", ["ls-tree", "-r", "--name-only", ref, "--", "app/page.tsx", "components/home"], {
      cwd: ROOT,
      encoding: "utf8",
    });
    return out.split(/\r?\n/).filter((f) => f.endsWith(".tsx"));
  }
  return ["app/page.tsx", ...readdirSync(join(ROOT, "components/home")).filter((f) => f.endsWith(".tsx")).map((f) => `components/home/${f}`)];
}

function readFile(file) {
  return ref
    ? execFileSync("git", ["show", `${ref}:${file}`], { cwd: ROOT, encoding: "utf8" })
    : readFileSync(join(ROOT, file), "utf8");
}

const ENTITIES = { "&rsquo;": "'", "&lsquo;": "'", "&ldquo;": "“", "&rdquo;": "”", "&amp;": "&", "&nbsp;": " ", "&middot;": "·" };
const decode = (s) => s.replace(/&[a-z]+;/g, (m) => ENTITIES[m] ?? " ").replace(/\$\{[^}]*\}/g, " ");

/** Prose, not a class list / path / identifier: has letters and either a space or sentence punctuation, and not every token is class-like. */
function looksLikeCopy(raw) {
  const s = decode(raw).trim();
  if (!/[A-Za-z]/.test(s)) return false;
  if (!/\s/.test(s) && !/[.!?…]$/.test(s)) return false;
  const tokens = s.split(/\s+/);
  const classLike = tokens.filter((t) => /^[\w\-:/.\[\]%()#,!]+$/.test(t) && /[-:/\[]/.test(t));
  return classLike.length < Math.ceil(tokens.length / 2);
}

const CODE_LINE = /^(const|let|var|function|export|return|if|else|import|type|interface|default|case|switch|for|while|async|await|key=|[}\])({[]|\/\/|[=;,:.?|&]|\.\.\.)|=>|;$|^\w+\($|^[\w$.]+$|^\w+\s*[:=]/;

function extract(src) {
  const texts = [];
  src = src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
  src = src.replace(/^\s*import[\s\S]*?;\s*$/gm, "");
  // JSX attributes: className="…", href={…}, transition={{ … }}, aria-hidden, etc.
  src = src.replace(/\s[\w-]+=(?:"[^"]*"|'[^']*'|\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\})/g, "");
  // String literals that read as copy.
  src = src.replace(/"((?:[^"\\]|\\.)*)"|'((?:[^'\\]|\\.)*)'|`((?:[^`\\]|\\.)*)`/g, (_, a, b, c) => {
    const s = a ?? b ?? c ?? "";
    if (looksLikeCopy(s)) texts.push(decode(s));
    return '""';
  });
  // JSX text nodes: drop tags and expression braces, keep prose lines.
  src = src.replace(/<[^<>]*>/g, " ").replace(/\{[^{}]*\}/g, " ");
  for (const line of src.split(/\r?\n/)) {
    const t = decode(line).trim();
    if (!/[A-Za-z]/.test(t) || CODE_LINE.test(t) || t === '""') continue;
    texts.push(t.replace(/""/g, " "));
  }
  return texts;
}

const countWords = (s) => (s.match(/[A-Za-zÀ-ɏ][\w'’À-ɏ-]*/g) ?? []).length;

let total = 0;
const rows = [];
for (const file of listFiles()) {
  const words = extract(readFile(file)).reduce((n, t) => n + countWords(t), 0);
  rows.push({ file, words });
  total += words;
}

if (process.argv.includes("--verbose")) {
  for (const file of listFiles()) for (const t of extract(readFile(file))) console.log(`${file}: ${t}`);
}
console.table(rows);
console.log(`${ref ?? "working tree"}: ${total} user-visible words`);

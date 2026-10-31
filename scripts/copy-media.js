// TypeDoc 0.28 dropped the old `media` option, so the logo/images referenced
// from custom.css are copied into the output by hand after each build.
const { cpSync, existsSync } = require("node:fs");
const path = require("node:path");

const SRC = path.join(__dirname, "..", "media");
const DEST = path.join(__dirname, "..", "docs", "media");

if (!existsSync(SRC)) {
  console.log("No media/ directory to copy, skipping.");
  process.exit(0);
}

cpSync(SRC, DEST, { recursive: true });
console.log(`Copied media/ -> ${path.relative(process.cwd(), DEST)}`);

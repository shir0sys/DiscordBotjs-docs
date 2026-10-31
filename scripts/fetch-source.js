const { execSync } = require("node:child_process");
const { existsSync } = require("node:fs");
const path = require("node:path");

const VENDOR_DIR = path.join(__dirname, "..", "vendor", "discordbot.js");
const REPO_URL = "https://github.com/shir0sys/discordbot.js.git";

function run(command, cwd) {
  execSync(command, { cwd, stdio: "inherit" });
}

if (existsSync(VENDOR_DIR)) {
  console.log("Updating vendored discordbot.js source...");
  run("git fetch origin main", VENDOR_DIR);
  run("git reset --hard origin/main", VENDOR_DIR);
} else {
  console.log("Cloning discordbot.js source...");
  run(`git clone --depth 1 ${REPO_URL} "${VENDOR_DIR}"`);
}

console.log("Installing discordbot.js dependencies (needed for TypeDoc to resolve types)...");
run("npm install", VENDOR_DIR);

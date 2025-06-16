// list-changed-files.js
import { exec } from "node:child_process";

const base = process.argv[2] || "origin/main";  // e.g. the branch you’re comparing against
const head = process.argv[3] || "HEAD";

exec(`git diff --name-only ${base} ${head}`, (err, stdout, stderr) => {
  if (err) {
    console.error("Error running git diff:", stderr);
    process.exit(1);
  }
  const files = stdout
    .trim()
    .split("\n")
    .filter((f) => f.length > 0);
  console.log("Changed files:", files);
});
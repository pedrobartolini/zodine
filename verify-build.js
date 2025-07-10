#!/usr/bin/env node

// Quick verification script to test package exports
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distPath = path.join(__dirname, "dist");

console.log("🔍 Verifying package build...\n");

// Check if dist directory exists
if (!fs.existsSync(distPath)) {
  console.error("❌ dist directory not found. Run npm run build first.");
  process.exit(1);
}

// Check required files
const requiredFiles = [
  "index.js",
  "index.d.ts",
  "core.js",
  "core.d.ts",
  "endpoints.js",
  "endpoints.d.ts",
  "types.js",
  "types.d.ts"
];

let allFilesExist = true;
for (const file of requiredFiles) {
  const filePath = path.join(distPath, file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - missing`);
    allFilesExist = false;
  }
}

if (allFilesExist) {
  console.log("\n✅ All required files are present!");
  console.log("📦 Package is ready for publishing.");
  console.log("\nNext steps:");
  console.log("1. npm login");
  console.log("2. npm publish");
} else {
  console.log("\n❌ Some files are missing. Please run npm run build.");
  process.exit(1);
}

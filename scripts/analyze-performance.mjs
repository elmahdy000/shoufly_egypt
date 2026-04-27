#!/usr/bin/env node

/**
 * Performance analysis script
 * Run with: node scripts/analyze-performance.mjs
 */

import { readFileSync, readdirSync, statSync } from "fs";
import { join, resolve } from "path";

const appDir = resolve(process.cwd(), "app");
const componentsDir = resolve(process.cwd(), "components");
const libDir = resolve(process.cwd(), "lib");

function getFileSize(filePath) {
  try {
    return statSync(filePath).size;
  } catch {
    return 0;
  }
}

function findLargeFiles(dir, maxSizeKB = 50, extension = ".tsx") {
  const largeFiles = [];

  function scanDir(currentDir) {
    try {
      const entries = readdirSync(currentDir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = join(currentDir, entry.name);
        if (entry.isDirectory()) {
          scanDir(fullPath);
        } else if (entry.name.endsWith(extension)) {
          const sizeKB = getFileSize(fullPath) / 1024;
          if (sizeKB > maxSizeKB) {
            largeFiles.push({
              path: fullPath.replace(process.cwd(), ""),
              sizeKB: Math.round(sizeKB * 10) / 10,
            });
          }
        }
      }
    } catch {
      // Directory might not exist
    }
  }

  scanDir(dir);
  return largeFiles.sort((a, b) => b.sizeKB - a.sizeKB);
}

function analyzeImports(filePath) {
  try {
    const content = readFileSync(filePath, "utf-8");
    const imports = [];
    
    // Match import statements
    const importRegex = /import\s+.*?\s+from\s+['"]([^'"]+)['"];?/g;
    let match;
    while ((match = importRegex.exec(content)) !== null) {
      imports.push(match[1]);
    }
    
    // Match dynamic imports
    const dynamicImportRegex = /import\(['"]([^'"]+)['"]\)/g;
    while ((match = dynamicImportRegex.exec(content)) !== null) {
      imports.push(`(dynamic) ${match[1]}`);
    }
    
    return imports;
  } catch {
    return [];
  }
}

function checkReactOptimizations(filePath) {
  try {
    const content = readFileSync(filePath, "utf-8");
    const issues = [];
    
    // Check for missing memo on large components
    if (content.length > 10000 && !content.includes("memo") && !content.includes("useMemo")) {
      issues.push("Consider adding React.memo or useMemo");
    }
    
    // Check for inline arrow functions in JSX
    const inlineFunctionRegex = /on\w+={\s*\([^)]*\)\s*=>/g;
    const inlineMatches = content.match(inlineFunctionRegex);
    if (inlineMatches && inlineMatches.length > 5) {
      issues.push(`Found ${inlineMatches.length} inline arrow functions - consider using useCallback`);
    }
    
    // Check for useEffect without dependencies
    const effectRegex = /useEffect\(\s*\(\)\s*=>\s*{/g;
    if (effectRegex.test(content)) {
      issues.push("Found useEffect without dependencies array");
    }
    
    return issues;
  } catch {
    return [];
  }
}

console.log("🔍 Performance Analysis Report\n");

// Check large files
console.log("📁 Large Files (>50KB):");
const largeAppFiles = findLargeFiles(appDir);
const largeComponentFiles = findLargeFiles(componentsDir);
const allLargeFiles = [...largeAppFiles, ...largeComponentFiles];

if (allLargeFiles.length === 0) {
  console.log("  ✅ No oversized files found!");
} else {
  for (const file of allLargeFiles.slice(0, 10)) {
    console.log(`  ⚠️  ${file.path} (${file.sizeKB}KB)`);
  }
}

// Check bundle optimizations
console.log("\n📦 Bundle Optimization:");
const nextConfig = readFileSync("next.config.ts", "utf-8");
const hasImageOptimization = nextConfig.includes("images:");
const hasCompression = nextConfig.includes("compress:");
const hasPackageOptimization = nextConfig.includes("optimizePackageImports");

console.log(`  ${hasImageOptimization ? "✅" : "❌"} Image optimization`);
console.log(`  ${hasCompression ? "✅" : "❌"} Compression enabled`);
console.log(`  ${hasPackageOptimization ? "✅" : "❌"} Package imports optimized`);

// Check for performance hooks usage
console.log("\n⚡ Performance Hooks Usage:");
let useMemoCount = 0;
let useCallbackCount = 0;
let memoCount = 0;
let lazyCount = 0;

function countHooks(dir) {
  try {
    const entries = readdirSync(dir, { withFileTypes: true, recursive: true });
    for (const entry of entries) {
      if (entry.isFile() && entry.name.endsWith(".tsx")) {
        const content = readFileSync(join(entry.parentPath || dir, entry.name), "utf-8");
        useMemoCount += (content.match(/useMemo/g) || []).length;
        useCallbackCount += (content.match(/useCallback/g) || []).length;
        memoCount += (content.match(/React\.memo|from "react"[^]*memo/g) || []).length;
        lazyCount += (content.match(/React\.lazy|dynamic\s*\(/g) || []).length;
      }
    }
  } catch {
    // Ignore
  }
}

try {
  countHooks(appDir);
  countHooks(componentsDir);
} catch {
  // Ignore
}

console.log(`  useMemo: ${useMemoCount} usages`);
console.log(`  useCallback: ${useCallbackCount} usages`);
console.log(`  React.memo: ${memoCount} usages`);
console.log(`  Dynamic imports: ${lazyCount} usages`);

// Recommendations
console.log("\n💡 Recommendations:");
if (allLargeFiles.length > 0) {
  console.log("  • Split large components into smaller chunks");
  console.log("  • Use dynamic imports for below-the-fold content");
}
if (lazyCount < 5) {
  console.log("  • Consider using dynamic imports for heavy components");
}
if (useMemoCount < 10) {
  console.log("  • Add useMemo for expensive computations in lists");
}

console.log("\n✅ Analysis complete!");

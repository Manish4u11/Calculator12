const fs = require("fs");
const path = require("path");

// ============================================
// CONFIGURATION - Ye sab tags check karne hain
// ============================================
const REQUIRED_TAGS = {
  og: [
    { property: "og:type", label: "OG Type" },
    { property: "og:title", label: "OG Title" },
    { property: "og:description", label: "OG Description" },
    { property: "og:image", label: "OG Image" },
    { property: "og:url", label: "OG URL" },
    { property: "og:site_name", label: "OG Site Name" },
    { property: "og:locale", label: "OG Locale" },
  ],
  twitter: [
    { property: "twitter:card", label: "Twitter Card" },
    { property: "twitter:title", label: "Twitter Title" },
    { property: "twitter:description", label: "Twitter Description" },
    { property: "twitter:image", label: "Twitter Image" },
    { property: "twitter:site", label: "Twitter Site" },
  ],
};

// ============================================
// HELPER FUNCTIONS
// ============================================

function getAllHtmlFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory() && file !== "node_modules" && file !== ".git") {
      getAllHtmlFiles(filePath, fileList);
    } else if (file.endsWith(".html")) {
      fileList.push(filePath);
    }
  });
  return fileList;
}

// Robust tag checker - multiline tags ko bhi handle kare
function checkTagExists(content, property) {
  // Normalize: saare newlines aur multiple spaces ko single space mein badlo
  const normalized = content.replace(/[\r\n]+/g, " ").replace(/\s{2,}/g, " ");
  // property aur name dono check karo (Twitter tags name= use karte hain)
  const regex = new RegExp(
    `<meta[^>]*(?:property=["']${property}["']|name=["']${property}["'])[^>]*>`,
    "i",
  );
  return regex.test(normalized);
}

// Count karo ki ek tag kitni baar aaya hai (duplicate detection)
function countTagOccurrences(content, property) {
  const normalized = content.replace(/[\r\n]+/g, " ").replace(/\s{2,}/g, " ");
  const regex = new RegExp(
    `<meta[^>]*(?:property=["']${property}["']|name=["']${property}["'])[^>]*>`,
    "gi",
  );
  const matches = normalized.match(regex);
  return matches ? matches.length : 0;
}

function extractTitle(content) {
  const match = content.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (match) {
    return match[1]
      .replace(/<[^>]+>/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }
  return null;
}

// ============================================
// MAIN SCRIPT
// ============================================

console.log("\n🔍 OG TAGS DIAGNOSTIC REPORT");
console.log("═".repeat(100));

const publicDir = path.join(__dirname, "public");

if (!fs.existsSync(publicDir)) {
  console.error('❌ ERROR: "public" folder nahi mila!');
  process.exit(1);
}

const htmlFiles = getAllHtmlFiles(publicDir);
console.log(`\n📊 Total HTML Files Found: ${htmlFiles.length}\n`);

const results = {
  complete: [],
  incomplete: [],
  skipped: [],
};

htmlFiles.forEach((file) => {
  const content = fs.readFileSync(file, "utf8");
  const relativePath = path.relative(publicDir, file);

  // Skip component files
  if (relativePath.includes("components/")) {
    results.skipped.push({
      file: relativePath,
      reason: "Component file (no <head> tag)",
    });
    return;
  }

  // Check if file has <head> tag
  if (!content.includes("<head>")) {
    results.skipped.push({
      file: relativePath,
      reason: "No <head> tag found",
    });
    return;
  }

  // Check each OG tag
  const ogResults = REQUIRED_TAGS.og.map((tag) => ({
    ...tag,
    exists: checkTagExists(content, tag.property),
    count: countTagOccurrences(content, tag.property),
  }));

  // Check each Twitter tag
  const twitterResults = REQUIRED_TAGS.twitter.map((tag) => ({
    ...tag,
    exists: checkTagExists(content, tag.property),
    count: countTagOccurrences(content, tag.property),
  }));

  // Calculate totals
  const ogPresent = ogResults.filter((t) => t.exists).length;
  const ogMissing = ogResults.filter((t) => !t.exists);
  const ogDuplicates = ogResults.filter((t) => t.count > 1);

  const twitterPresent = twitterResults.filter((t) => t.exists).length;
  const twitterMissing = twitterResults.filter((t) => !t.exists);
  const twitterDuplicates = twitterResults.filter((t) => t.count > 1);

  const isComplete = ogMissing.length === 0 && twitterMissing.length === 0;
  const hasDuplicates = ogDuplicates.length > 0 || twitterDuplicates.length > 0;

  if (isComplete) {
    results.complete.push({
      file: relativePath,
      ogPresent,
      ogTotal: REQUIRED_TAGS.og.length,
      twitterPresent,
      twitterTotal: REQUIRED_TAGS.twitter.length,
      hasDuplicates,
      ogDuplicates,
      twitterDuplicates,
    });
  } else {
    results.incomplete.push({
      file: relativePath,
      ogPresent,
      ogTotal: REQUIRED_TAGS.og.length,
      ogMissing: ogMissing.map((t) => t.label + " (" + t.property + ")"),
      twitterPresent,
      twitterTotal: REQUIRED_TAGS.twitter.length,
      twitterMissing: twitterMissing.map(
        (t) => t.label + " (" + t.property + ")",
      ),
      hasDuplicates,
      ogDuplicates,
      twitterDuplicates,
    });
  }
});

// ============================================
// DETAILED REPORT
// ============================================

console.log("✅ COMPLETE FILES (All Required Tags Present):");
console.log("─".repeat(100));
if (results.complete.length > 0) {
  results.complete.forEach((r, index) => {
    console.log(`\n  ${index + 1}. 📄 ${r.file}`);
    console.log(`     ✓ OG Tags: ${r.ogPresent}/${r.ogTotal} present`);
    console.log(
      `     ✓ Twitter Tags: ${r.twitterPresent}/${r.twitterTotal} present`,
    );

    if (r.hasDuplicates) {
      console.log(`     ⚠️  DUPLICATE TAGS FOUND:`);
      r.ogDuplicates.forEach((t) => {
        console.log(
          `        - ${t.label} (${t.property}): ${t.count} baar mila`,
        );
      });
      r.twitterDuplicates.forEach((t) => {
        console.log(
          `        - ${t.label} (${t.property}): ${t.count} baar mila`,
        );
      });
    } else {
      console.log(`     ✓ Status: PERFECT - No duplicates`);
    }
  });
} else {
  console.log("\n  (Koi file complete nahi hai)");
}

console.log("\n\n❌ INCOMPLETE FILES (Missing Tags):");
console.log("─".repeat(100));
if (results.incomplete.length > 0) {
  results.incomplete.forEach((r, index) => {
    console.log(`\n  ${index + 1}. 📄 ${r.file}`);
    console.log(`     OG Tags: ${r.ogPresent}/${r.ogTotal} present`);
    console.log(
      `     Twitter Tags: ${r.twitterPresent}/${r.twitterTotal} present`,
    );

    if (r.ogMissing.length > 0) {
      console.log(`     ❌ Missing OG Tags:`);
      r.ogMissing.forEach((tag) => {
        console.log(`        - ${tag}`);
      });
    }

    if (r.twitterMissing.length > 0) {
      console.log(`      Missing Twitter Tags:`);
      r.twitterMissing.forEach((tag) => {
        console.log(`        - ${tag}`);
      });
    }

    if (r.hasDuplicates) {
      console.log(`     ⚠️  Duplicate Tags Also Found`);
    }

    console.log(`     💡 Solution: Run "node add-og-tags.js" to fix`);
  });
} else {
  console.log("\n   Koi file incomplete nahi hai - Sab perfect hain!");
}

console.log("\n\n⏭️  SKIPPED FILES (Not Checked):");
console.log("─".repeat(100));
if (results.skipped.length > 0) {
  results.skipped.forEach((r, index) => {
    console.log(`\n  ${index + 1}. ⊘ ${r.file}`);
    console.log(`     Reason: ${r.reason}`);
  });
} else {
  console.log("\n  (Koi file skip nahi hui)");
}

// ============================================
// FINAL SUMMARY
// ============================================

console.log("\n\n" + "═".repeat(100));
console.log(" FINAL SUMMARY:");
console.log("═".repeat(100));
console.log(`\n  ✅ Complete Files: ${results.complete.length}`);
console.log(`  ❌ Incomplete Files: ${results.incomplete.length}`);
console.log(`  ️  Skipped Files: ${results.skipped.length}`);
console.log(`  📁 Total Files: ${htmlFiles.length}`);

const totalDuplicates =
  results.complete.filter((r) => r.hasDuplicates).length +
  results.incomplete.filter((r) => r.hasDuplicates).length;

if (totalDuplicates > 0) {
  console.log(
    `\n  ⚠️  WARNING: ${totalDuplicates} file(s) mein DUPLICATE tags hain!`,
  );
  console.log(
    `     Ye SEO ke liye accha nahi hai. "node add-og-tags.js" run karein.`,
  );
}

if (results.incomplete.length === 0 && totalDuplicates === 0) {
  console.log("\n  🎉🎉 CONGRATULATIONS!");
  console.log("  ✅ All files have complete OG tags!");
  console.log("  ✅ No duplicates found!");
  console.log("  🚀 Your website is ready for social media sharing!");
} else if (results.incomplete.length === 0) {
  console.log("\n  ⚠️  All tags present but duplicates need cleaning.");
  console.log('   Run "node add-og-tags.js" to remove duplicates.');
} else {
  console.log("\n  ⚠️  ACTION REQUIRED:");
  console.log(
    `  Run "node add-og-tags.js" to fix ${results.incomplete.length} incomplete file(s)`,
  );
}

console.log("\n" + "═".repeat(100) + "\n");

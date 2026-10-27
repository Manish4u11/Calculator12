const fs = require("fs");
const path = require("path");

// ============================================
// CONFIGURATION
// ============================================
const config = {
  siteName: "Calculator12",
  domain: "https://calculator12.com",
  ogImage: "/og-image.png",
  twitterHandle: "@calculator12",
  defaultDescription:
    "Free online calculators for finance, health, math, science & more. No registration required.",
};

// Known pages ke liye custom titles/descriptions
const pageMeta = {
  "index.html": {
    title: "Calculator12 - Free Online Calculators | 500+ Tools",
    desc: "Access 500+ free online calculators for finance, health, math, conversion, and more. Available in 100+ languages.",
  },
  "about.html": {
    title: "About Calculator12 - Our Mission",
    desc: "Learn about Calculator12's mission to provide free, accurate calculators for everyone.",
  },
  "contact.html": {
    title: "Contact Calculator12 - Get in Touch",
    desc: "Have questions or feedback? Contact the Calculator12 team.",
  },
  "careers.html": {
    title: "Careers at Calculator12 - Join Our Team",
    desc: "Explore career opportunities at Calculator12.",
  },
  "privacy-policy.html": {
    title: "Privacy Policy - Calculator12",
    desc: "Read Calculator12's Privacy Policy.",
  },
  "terms-of-service.html": {
    title: "Terms of Service - Calculator12",
    desc: "Read Calculator12's Terms of Service.",
  },
  "cookie-policy.html": {
    title: "Cookie Policy - Calculator12",
    desc: "Learn about Calculator12's Cookie Policy.",
  },
  "faq.html": {
    title: "FAQ - Frequently Asked Questions | Calculator12",
    desc: "Find answers to common questions about Calculator12.",
  },
  "sitemap.html": {
    title: "Sitemap - Calculator12",
    desc: "Complete sitemap of Calculator12.",
  },
  "blog.html": {
    title: "Blog - Insights, Guides & Tips | Calculator12",
    desc: "Explore the Calculator12 blog for expert guides and tutorials.",
  },
  "popular.html": {
    title: "Popular Calculators - Calculator12",
    desc: "Browse the most popular calculators on Calculator12.",
  },
  "categories.html": {
    title: "All Categories - Calculator12",
    desc: "Explore all calculator categories on Calculator12.",
  },
  "all-calculators.html": {
    title: "All Calculators - Calculator12",
    desc: "Browse all free calculators on Calculator12.",
  },
  "404.html": {
    title: "404 - Page Not Found | Calculator12",
    desc: "The page you're looking for doesn't exist.",
  },
};

// Ye sab tags check karne hain (OG + Twitter)
const ALL_META_TAGS = [
  "og:type",
  "og:title",
  "og:description",
  "og:image",
  "og:url",
  "og:site_name",
  "og:locale",
  "twitter:card",
  "twitter:title",
  "twitter:description",
  "twitter:image",
  "twitter:site",
  "twitter:url",
];

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

function extractTitle(content) {
  const match = content.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (match) {
    return match[1]
      .replace(/<[^>]+>/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }
  return config.siteName;
}

function extractDescription(content) {
  const match = content.match(
    /<meta\s+name=["']description["'][^>]*content=["']([^"']+)["'][^>]*>/i,
  );
  if (match) {
    return match[1].trim();
  }
  return config.defaultDescription;
}

function getRelativeUrl(filePath, publicDir) {
  const relativePath = path.relative(publicDir, filePath).replace(/\\/g, "/");
  return "/" + relativePath;
}

// ============================================
// CORE FUNCTION: Remove ALL OG/Twitter tags (handles multiline & duplicates)
// ============================================
function removeAllOGAndTwitterTags(content) {
  // 1. OG/Twitter meta tags remove karo
  const ogTwitterRegex =
    /<meta\s+[^>]*(?:property\s*=\s*["'](?:og:|twitter:)[^"']*["']|name\s*=\s*["']twitter:[^"']*["'])[^>]*>\s*/gi;
  let cleaned = content.replace(ogTwitterRegex, "");

  // 2. Bekar comments bhi remove karo
  const commentRegex =
    /<!--\s*(?:Open Graph\s*\/\s*Facebook|Twitter)\s*-->\s*/gi;
  cleaned = cleaned.replace(commentRegex, "");

  return cleaned;
}

// Count duplicates before cleaning
function countDuplicates(content) {
  const duplicates = [];
  ALL_META_TAGS.forEach((tag) => {
    const normalized = content.replace(/[\r\n]+/g, " ").replace(/\s{2,}/g, " ");
    const regex = new RegExp(
      `<meta[^>]*(?:property=["']${tag}["']|name=["']${tag}["'])[^>]*>`,
      "gi",
    );
    const matches = normalized.match(regex);
    const count = matches ? matches.length : 0;
    if (count > 1) {
      duplicates.push({ tag, count });
    }
  });
  return duplicates;
}

function generateOGTags(title, description, pageUrl) {
  return `\n    <!-- Open Graph / Facebook -->\n    <meta property="og:type" content="website" />\n    <meta property="og:site_name" content="${config.siteName}" />\n    <meta property="og:title" content="${title}" />\n    <meta property="og:description" content="${description}" />\n    <meta property="og:image" content="${config.domain}${config.ogImage}" />\n    <meta property="og:url" content="${config.domain}${pageUrl}" />\n    <meta property="og:locale" content="en_US" />\n\n    <!-- Twitter -->\n    <meta name="twitter:card" content="summary_large_image" />\n    <meta name="twitter:site" content="${config.twitterHandle}" />\n    <meta name="twitter:title" content="${title}" />\n    <meta name="twitter:description" content="${description}" />\n    <meta name="twitter:image" content="${config.domain}${config.ogImage}" />\n`;
}

// ============================================
// MAIN SCRIPT
// ============================================

console.log("\n🚀 CALCULATOR12 OG TAGS MANAGER");
console.log("   (Add + Replace + Remove Duplicates - All in One)");
console.log("═".repeat(70));

const publicDir = path.join(__dirname, "public");

if (!fs.existsSync(publicDir)) {
  console.error('\n❌ ERROR: "public" folder nahi mila!');
  console.error("   Please run this script from E:\\Calculator12\n");
  process.exit(1);
}

const htmlFiles = getAllHtmlFiles(publicDir);
console.log(`\n📊 Total HTML Files Found: ${htmlFiles.length}\n`);

const results = {
  added: [],
  replaced: [],
  cleaned: [],
  skipped: [],
  errors: [],
};

htmlFiles.forEach((file) => {
  try {
    let content = fs.readFileSync(file, "utf8");
    const relativePath = path.relative(publicDir, file);
    const fileName = path.basename(file);

    // 1. Component files skip karein
    if (relativePath.includes("components/") || !content.includes("<head>")) {
      results.skipped.push(relativePath);
      return;
    }

    // 2. Pehle duplicates count karein (reporting ke liye)
    const duplicatesBefore = countDuplicates(content);
    const hadDuplicates = duplicatesBefore.length > 0;

    // 3. Check karein ki OG tags pehle se hain ya nahi
    const hasAnyOGTag =
      /<meta[^>]*(?:property=["']og:|name=["']twitter:)/i.test(content);

    // 4. Title aur Description decide karein
    let title = config.siteName;
    let description = config.defaultDescription;

    if (pageMeta[fileName]) {
      title = pageMeta[fileName].title;
      description = pageMeta[fileName].desc;
    } else {
      title = extractTitle(content);
      description = extractDescription(content);
    }

    // 5.  CRITICAL STEP: Pehle PURANE sabhi OG/Twitter tags REMOVE karo
    //    (Ye duplicates ko bhi hata dega, chahe kitne bhi hon)
    const cleanedContent = removeAllOGAndTwitterTags(content);
    const wasCleaned = hadDuplicates || hasAnyOGTag;

    // 6. Naye clean tags generate karo
    const pageUrl = getRelativeUrl(file, publicDir);
    const newOgTags = generateOGTags(title, description, pageUrl);

    // 7. Description meta tag ke baad inject karo
    const descRegex = /(<meta\s+name=["']description["'][^>]*>)/i;
    let finalContent;

    if (descRegex.test(cleanedContent)) {
      finalContent = cleanedContent.replace(descRegex, `$1${newOgTags}`);
    } else {
      finalContent = cleanedContent.replace(/<head\s*>/i, `<head>${newOgTags}`);
    }

    // 8. Cleanup: Multiple blank lines ko fix karo
    finalContent = finalContent.replace(/\n{3,}/g, "\n\n");

    // 9. File save karo
    fs.writeFileSync(file, finalContent, "utf8");

    // 10. Result categorize karo
    if (hadDuplicates) {
      results.cleaned.push({
        file: relativePath,
        duplicatesRemoved: duplicatesBefore,
      });
    } else if (hasAnyOGTag) {
      results.replaced.push(relativePath);
    } else {
      results.added.push(relativePath);
    }
  } catch (err) {
    results.errors.push({
      file: path.relative(__dirname, file),
      error: err.message,
    });
  }
});

// ============================================
// DETAILED REPORT
// ============================================

console.log("═".repeat(70));
console.log("  OG TAGS SETUP COMPLETE!");
console.log("═".repeat(70));

console.log(`\n✅ ADDED (Naye tags lagaye): ${results.added.length} files`);
if (results.added.length > 0) {
  results.added.forEach((f) => console.log(`   • ${f}`));
}

console.log(
  `\n🔄 REPLACED (Purane tags update kiye): ${results.replaced.length} files`,
);
if (results.replaced.length > 0) {
  results.replaced.forEach((f) => console.log(`   • ${f}`));
}

console.log(
  `\n🧹 CLEANED (Duplicates remove kiye): ${results.cleaned.length} files`,
);
if (results.cleaned.length > 0) {
  results.cleaned.forEach((r) => {
    console.log(`   • ${r.file}`);
    r.duplicatesRemoved.forEach((d) => {
      console.log(`      - ${d.tag}: ${d.count} baar tha → ab sirf 1 baar`);
    });
  });
}

console.log(`\n⏭️  SKIPPED (Components): ${results.skipped.length} files`);

if (results.errors.length > 0) {
  console.log(`\n❌ ERRORS: ${results.errors.length} files`);
  results.errors.forEach((e) => console.log(`   • ${e.file}: ${e.error}`));
}

// ============================================
// FINAL SUMMARY
// ============================================

const totalProcessed =
  results.added.length + results.replaced.length + results.cleaned.length;

console.log("\n" + "═".repeat(70));
console.log(" FINAL SUMMARY:");
console.log("═".repeat(70));
console.log(`\n  📁 Total Files Processed: ${totalProcessed}`);
console.log(`  ✅ Added: ${results.added.length}`);
console.log(`  🔄 Replaced: ${results.replaced.length}`);
console.log(`  🧹 Cleaned (Duplicates Removed): ${results.cleaned.length}`);
console.log(`  ⏭️  Skipped: ${results.skipped.length}`);
console.log(`  ❌ Errors: ${results.errors.length}`);

if (results.cleaned.length > 0) {
  console.log("\n  ✨ DUPLICATES SUCCESSFULLY REMOVED!");
  console.log("     Ab har tag sirf EK baar hai har file mein.");
}

if (results.errors.length === 0 && results.cleaned.length === 0) {
  console.log("\n   PERFECT! Koi duplicates nahi, sab clean hai!");
}

console.log("\n  💡 Future Tip:");
console.log(
  "     Jab bhi naye calculators banayein, bas ye script dobara run karein:",
);
console.log("     node add-og-tags.js");
console.log("     Ye automatically duplicates bhi remove kar degi!");

console.log("\n" + "═".repeat(70) + "\n");

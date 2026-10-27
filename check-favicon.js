const fs = require("fs");
const path = require("path");

function getAllHtmlFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory() && file !== "node_modules") {
      getAllHtmlFiles(filePath, fileList);
    } else if (file.endsWith(".html")) {
      fileList.push(filePath);
    }
  });
  return fileList;
}

console.log(" सभी HTML files check कर रहा हूँ...\n");

const htmlFiles = getAllHtmlFiles(__dirname);
const problems = [];
const good = [];

htmlFiles.forEach((file) => {
  const content = fs.readFileSync(file, "utf8");
  const relativePath = path.relative(__dirname, file);

  const hasOldFavicon = /rel=["']icon["'][\s\S]*?>C<\/text><\/svg>/i.test(
    content,
  );
  const hasNewFavicon =
    content.includes("viewBox='0 0 120 120'") && content.includes("lg1");
  const hasAnyFavicon = content.includes('rel="icon"');

  if (hasOldFavicon) {
    problems.push({
      file: relativePath,
      issue: '❌ अभी भी पुराना "C" favicon है',
    });
  } else if (!hasAnyFavicon) {
    problems.push({ file: relativePath, issue: "️ कोई favicon नहीं है" });
  } else if (!hasNewFavicon) {
    problems.push({
      file: relativePath,
      issue: "⚠️ favicon है लेकिन Calculator Icon वाला नहीं",
    });
  } else {
    good.push(relativePath);
  }
});

console.log(`📊 Total Files: ${htmlFiles.length}`);
console.log(`✅ सही Files: ${good.length}`);
console.log(`❌ समस्या वाली Files: ${problems.length}\n`);

if (problems.length > 0) {
  console.log(" समस्या वाली Files:");
  console.log("─".repeat(60));
  problems.forEach((p) => {
    console.log(`${p.issue}`);
    console.log(`   📄 ${p.file}`);
    console.log("");
  });
} else {
  console.log("🎉 सभी files में सही favicon है! कोई समस्या नहीं।");
}

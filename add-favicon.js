const fs = require("fs");
const path = require("path");

// आपका नया Calculator Icon Favicon Code
const newFaviconCode = `<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 120'><defs><linearGradient id='lg1' x1='0%25' y1='0%25' x2='100%25' y2='100%25'><stop offset='0%25' style='stop-color:%238b5cf6'/><stop offset='100%25' style='stop-color:%2306b6d4'/></linearGradient><linearGradient id='lg2' x1='100%25' y1='0%25' x2='0%25' y2='100%25'><stop offset='0%25' style='stop-color:%23ec4899'/><stop offset='100%25' style='stop-color:%238b5cf6'/></linearGradient></defs><rect x='10' y='10' width='100' height='100' rx='25' fill='url(%23lg1)' opacity='0.15' stroke='url(%23lg1)' stroke-width='3'/><rect x='25' y='22' width='70' height='25' rx='6' fill='url(%23lg2)' opacity='0.9'/><text x='60' y='40' font-family='Arial' font-size='18' fill='white' text-anchor='middle' font-weight='bold'>=</text><circle cx='35' cy='62' r='10' fill='url(%23lg1)' opacity='0.8'/><text x='35' y='67' font-family='Arial' font-size='14' fill='white' text-anchor='middle' font-weight='bold'>+</text><circle cx='60' cy='62' r='10' fill='url(%23lg2)' opacity='0.8'/><text x='60' y='67' font-family='Arial' font-size='14' fill='white' text-anchor='middle' font-weight='bold'>−</text><circle cx='85' cy='62' r='10' fill='url(%23lg1)' opacity='0.8'/><text x='85' y='67' font-family='Arial' font-size='14' fill='white' text-anchor='middle' font-weight='bold'>×</text><circle cx='35' cy='87' r='10' fill='url(%23lg2)' opacity='0.8'/><text x='35' y='92' font-family='Arial' font-size='14' fill='white' text-anchor='middle' font-weight='bold'>÷</text><circle cx='60' cy='87' r='10' fill='url(%23lg1)' opacity='0.8'/><text x='60' y='92' font-family='Arial' font-size='14' fill='white' text-anchor='middle' font-weight='bold'>√</text><circle cx='85' cy='87' r='10' fill='url(%23lg2)' opacity='0.8'/><text x='85' y='92' font-family='Arial' font-size='14' fill='white' text-anchor='middle' font-weight='bold'>%</text></svg>" />
<link rel="apple-touch-icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 120'><defs><linearGradient id='lg1' x1='0%25' y1='0%25' x2='100%25' y2='100%25'><stop offset='0%25' style='stop-color:%238b5cf6'/><stop offset='100%25' style='stop-color:%2306b6d4'/></linearGradient><linearGradient id='lg2' x1='100%25' y1='0%25' x2='0%25' y2='100%25'><stop offset='0%25' style='stop-color:%23ec4899'/><stop offset='100%25' style='stop-color:%238b5cf6'/></linearGradient></defs><rect x='10' y='10' width='100' height='100' rx='25' fill='url(%23lg1)' opacity='0.15' stroke='url(%23lg1)' stroke-width='3'/><rect x='25' y='22' width='70' height='25' rx='6' fill='url(%23lg2)' opacity='0.9'/><text x='60' y='40' font-family='Arial' font-size='18' fill='white' text-anchor='middle' font-weight='bold'>=</text><circle cx='35' cy='62' r='10' fill='url(%23lg1)' opacity='0.8'/><text x='35' y='67' font-family='Arial' font-size='14' fill='white' text-anchor='middle' font-weight='bold'>+</text><circle cx='60' cy='62' r='10' fill='url(%23lg2)' opacity='0.8'/><text x='60' y='67' font-family='Arial' font-size='14' fill='white' text-anchor='middle' font-weight='bold'>−</text><circle cx='85' cy='62' r='10' fill='url(%23lg1)' opacity='0.8'/><text x='85' y='67' font-family='Arial' font-size='14' fill='white' text-anchor='middle' font-weight='bold'>×</text><circle cx='35' cy='87' r='10' fill='url(%23lg2)' opacity='0.8'/><text x='35' y='92' font-family='Arial' font-size='14' fill='white' text-anchor='middle' font-weight='bold'>÷</text><circle cx='60' cy='87' r='10' fill='url(%23lg1)' opacity='0.8'/><text x='60' y='92' font-family='Arial' font-size='14' fill='white' text-anchor='middle' font-weight='bold'>√</text><circle cx='85' cy='87' r='10' fill='url(%23lg2)' opacity='0.8'/><text x='85' y='92' font-family='Arial' font-size='14' fill='white' text-anchor='middle' font-weight='bold'>%</text></svg>" />`;

// 100% Flexible Regex: यह लाइन ब्रेक्स (\n), स्पेस, और सिंगल/डबल कोट्स सबको मैच करेगा
const oldFaviconRegex =
  /<link[\s\S]*?rel=["']icon["'][\s\S]*?href=["']data:image\/svg\+xml[\s\S]*?>C<\/text><\/svg>["'][\s\S]*?\/?>/gi;

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

console.log("🔍 HTML files ढूंढ रहा हूँ...");
const htmlFiles = getAllHtmlFiles(__dirname);
console.log(`✅ Total ${htmlFiles.length} HTML files मिलीं।\n`);

console.log("⚙️ Favicon replace/add कर रहा हूँ...");
let replacedCount = 0;
let addedCount = 0;

htmlFiles.forEach((file) => {
  let content = fs.readFileSync(file, "utf8");
  let modified = false;

  // 1. पुराना "C" favicon ढूंढो और replace करो (अब यह 100% काम करेगा)
  if (oldFaviconRegex.test(content)) {
    content = content.replace(oldFaviconRegex, newFaviconCode);
    replacedCount++;
    modified = true;
  }
  // 2. अगर बिल्कुल भी favicon नहीं है, तो <head> के बाद add करो
  else if (!content.includes('rel="icon"')) {
    content = content.replace(/<head\s*>/i, `<head>\n${newFaviconCode}`);
    addedCount++;
    modified = true;
  }

  // अगर फाइल में बदलाव हुआ है, तो सेव करो
  if (modified) {
    fs.writeFileSync(file, content, "utf8");
  }
});

console.log(`\n🎉 SUCCESS!`);
console.log(`✅ ${replacedCount} files में पुराना favicon REPLACE हो गया।`);
console.log(`✅ ${addedCount} files में नया favicon ADD हो गया।`);
console.log(
  `\n💡 अब browser में Hard Refresh (Ctrl + Shift + R) करके check करें!`,
);

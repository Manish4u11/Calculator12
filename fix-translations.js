#!/usr/bin/env node
/*
 * ============================================
 * Calculator12 - Enterprise Translation Manager v4.1 (SAFE MODE)
 * Features: Safe fix, Smart HTML Scanner, Quality Report
 * NO auto-fill with [TODO], NO unsafe deletions
 * ============================================
 */

const fs = require("fs");
const path = require("path");
const readline = require("readline");

// ============================================
// CONFIGURATION
// ============================================
const CONFIG = {
  translationsPath: path.join(
    __dirname,
    "public",
    "engines",
    "translation",
    "translations.js",
  ),
  backupDir: path.join(
    __dirname,
    "public",
    "engines",
    "translation",
    "backups",
  ),
  htmlScanDir: path.join(__dirname, "public"),
  jsScanDir: path.join(__dirname, "public"), // Also scan JS files for keys
  supportedLanguages: [
    "en",
    "hi",
    "es",
    "fr",
    "de",
    "pt",
    "ru",
    "ar",
    "zh",
    "ja",
    "ko",
    "vi",
    "id",
  ],
  defaultLanguage: "en",
  maxBackupFiles: 10,
  qualityThresholds: {
    excellent: 95,
    good: 80,
    average: 60,
    poor: 40,
  },
};

// ============================================
// UTILITY FUNCTIONS
// ============================================
const Utils = {
  ensureDir: (dirPath) => {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  },

  createBackup: (filePath) => {
    Utils.ensureDir(CONFIG.backupDir);
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const fileName = `translations-${timestamp}.js`;
    const backupPath = path.join(CONFIG.backupDir, fileName);

    fs.copyFileSync(filePath, backupPath);
    console.log(`💾 Backup created: ${fileName}`);

    Utils.cleanupOldBackups();
    return backupPath;
  },

  cleanupOldBackups: () => {
    if (!fs.existsSync(CONFIG.backupDir)) return;
    const files = fs
      .readdirSync(CONFIG.backupDir)
      .filter((f) => f.startsWith("translations-"))
      .sort()
      .reverse();

    if (files.length > CONFIG.maxBackupFiles) {
      files.slice(CONFIG.maxBackupFiles).forEach((file) => {
        fs.unlinkSync(path.join(CONFIG.backupDir, file));
      });
    }
  },

  // Extract keys from HTML
  extractKeysFromHTML: (content) => {
    const keys = new Set();

    const patterns = [
      /data-i18n=["']([^"']+)["']/g,
      /data-i18n-html=["']([^"']+)["']/g,
      /data-i18n-placeholder=["']([^"']+)["']/g,
    ];

    patterns.forEach((regex) => {
      let match;
      while ((match = regex.exec(content)) !== null) {
        const key = match[1].trim();
        if (key && key.length > 0) {
          keys.add(key);
        }
      }
    });

    return Array.from(keys);
  },

  // Extract keys from JavaScript files (t() function calls)
  extractKeysFromJS: (content) => {
    const keys = new Set();

    // Match t("key") or t('key')
    const tCallRegex = /t\(["']([^"']+)["']\)/g;
    let match;
    while ((match = tCallRegex.exec(content)) !== null) {
      const key = match[1].trim();
      if (key && key.length > 2 && !key.includes(" ")) {
        keys.add(key);
      }
    }

    // Match window.i18n.t("key")
    const i18nCallRegex = /window\.i18n\.t\(["']([^"']+)["']\)/g;
    while ((match = i18nCallRegex.exec(content)) !== null) {
      const key = match[1].trim();
      if (key && key.length > 2) {
        keys.add(key);
      }
    }

    return Array.from(keys);
  },

  // Scan all files recursively
  scanAllFiles: (dir) => {
    const htmlKeys = new Set();
    const jsKeys = new Set();
    const htmlFiles = [];
    const jsFiles = [];

    const scan = (currentDir) => {
      if (!fs.existsSync(currentDir)) return;

      const items = fs.readdirSync(currentDir);
      items.forEach((item) => {
        const fullPath = path.join(currentDir, item);

        try {
          const stat = fs.statSync(fullPath);

          if (stat.isDirectory()) {
            // Skip node_modules, .git, backups
            if (
              !item.startsWith(".") &&
              item !== "node_modules" &&
              item !== "backups"
            ) {
              scan(fullPath);
            }
          } else if (item.endsWith(".html")) {
            htmlFiles.push(fullPath);
            const content = fs.readFileSync(fullPath, "utf8");
            const keys = Utils.extractKeysFromHTML(content);
            keys.forEach((key) => htmlKeys.add(key));
          } else if (
            item.endsWith(".js") &&
            !item.includes("translations.js") &&
            !item.includes("fix-translations")
          ) {
            jsFiles.push(fullPath);
            const content = fs.readFileSync(fullPath, "utf8");
            const keys = Utils.extractKeysFromJS(content);
            keys.forEach((key) => jsKeys.add(key));
          }
        } catch (err) {
          // Skip files we can't read
        }
      });
    };

    scan(dir);

    // Combine all keys
    const allKeys = new Set([...htmlKeys, ...jsKeys]);

    return {
      htmlKeys: Array.from(htmlKeys),
      jsKeys: Array.from(jsKeys),
      allKeys: Array.from(allKeys),
      htmlFiles,
      jsFiles,
    };
  },

  calculateQualityScore: (langKeys, referenceKeys) => {
    if (referenceKeys.length === 0) return 100;
    const coverage = (langKeys.length / referenceKeys.length) * 100;
    return Math.round(coverage * 100) / 100;
  },

  getQualityGrade: (score) => {
    if (score >= CONFIG.qualityThresholds.excellent)
      return { grade: "A+", color: "🟢" };
    if (score >= CONFIG.qualityThresholds.good)
      return { grade: "A", color: "🟢" };
    if (score >= CONFIG.qualityThresholds.average)
      return { grade: "B", color: "" };
    if (score >= CONFIG.qualityThresholds.poor)
      return { grade: "C", color: "🟠" };
    return { grade: "F", color: "🔴" };
  },

  askQuestion: (question) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    return new Promise((resolve) => {
      rl.question(question, (answer) => {
        rl.close();
        resolve(answer.trim().toLowerCase());
      });
    });
  },
};

// ============================================
// MAIN TRANSLATION FIXER CLASS
// ============================================
class TranslationFixer {
  constructor() {
    this.stats = {
      totalLanguages: 0,
      totalKeys: 0,
      duplicatesRemoved: 0,
      spacesFixed: 0,
      missingKeysFound: 0,
      syntaxErrorsFixed: 0,
      htmlFilesScanned: 0,
      jsFilesScanned: 0,
    };
    this.translations = null;
    this.allUsedKeys = [];
  }

  async loadTranslations() {
    console.log("\n📂 Step 1: Loading translations.js...\n");

    if (!fs.existsSync(CONFIG.translationsPath)) {
      throw new Error(`❌ File not found: ${CONFIG.translationsPath}`);
    }

    Utils.createBackup(CONFIG.translationsPath);

    let content = fs.readFileSync(CONFIG.translationsPath, "utf8");

    const match = content.match(
      /window\.CalculatorTranslations\s*=\s*({[\s\S]*?});\s*$/m,
    );
    if (!match) {
      throw new Error("❌ Could not find CalculatorTranslations object");
    }

    let objectString = match[1];
    const originalString = objectString;

    objectString = objectString
      .replace(/console\.log\([^)]*\);?/g, "")
      .replace(/,\s*([\]}])/g, "$1")
      .replace(/:\s+/g, ":")
      .replace(/\s+/g, " ");

    if (originalString !== objectString) {
      this.stats.syntaxErrorsFixed++;
      console.log("🔧 Auto-fixed syntax errors\n");
    }

    try {
      this.translations = new Function("return " + objectString)();
      console.log(
        `✅ Successfully parsed ${Object.keys(this.translations).length} languages\n`,
      );
    } catch (error) {
      throw new Error(` Parse error: ${error.message}`);
    }
  }

  async scanAllFiles() {
    console.log(
      "🔍 Step 2: Scanning HTML & JS files for translation keys...\n",
    );

    const result = Utils.scanAllFiles(CONFIG.htmlScanDir);
    this.allUsedKeys = result.allKeys;
    this.stats.htmlFilesScanned = result.htmlFiles.length;
    this.stats.jsFilesScanned = result.jsFiles.length;

    console.log(`✅ Scanned ${result.htmlFiles.length} HTML files`);
    console.log(`✅ Scanned ${result.jsFiles.length} JS files`);
    console.log(`✅ Found ${result.htmlKeys.length} keys in HTML`);
    console.log(`✅ Found ${result.jsKeys.length} keys in JavaScript`);
    console.log(`✅ Total unique keys: ${result.allKeys.length}\n`);
  }

  async fixTranslations() {
    console.log("🛠️  Step 3: Cleaning translations (spaces & duplicates)...\n");

    const fixedTranslations = {};

    for (const [lang, translationsObj] of Object.entries(this.translations)) {
      const cleanLang = lang.trim();
      console.log(` Processing: ${cleanLang}`);

      const cleanData = {};
      const seenKeys = new Set();
      const sortedKeys = Object.keys(translationsObj).sort();

      for (const key of sortedKeys) {
        const cleanKey = key.trim();
        let value = translationsObj[key];

        if (cleanKey !== key) this.stats.spacesFixed++;
        if (typeof value === "string") {
          const trimmed = value.trim();
          if (trimmed !== value) this.stats.spacesFixed++;
          value = trimmed;
        }

        if (seenKeys.has(cleanKey)) {
          this.stats.duplicatesRemoved++;
          console.log(`   ⚠️  Duplicate removed: "${cleanKey}"`);
          continue;
        }

        seenKeys.add(cleanKey);
        cleanData[cleanKey] = value;
      }

      fixedTranslations[cleanLang] = cleanData;
      this.stats.totalKeys += Object.keys(cleanData).length;
      console.log(`   ✅ ${Object.keys(cleanData).length} keys cleaned\n`);
    }

    this.translations = fixedTranslations;
    this.stats.totalLanguages = Object.keys(fixedTranslations).length;
  }

  detectMissingKeys() {
    console.log("🔎 Step 4: Detecting missing translation keys...\n");

    const referenceLang = CONFIG.defaultLanguage;
    const referenceKeys = Object.keys(this.translations[referenceLang] || {});
    const missingReport = {};

    for (const [lang, translationsObj] of Object.entries(this.translations)) {
      if (lang === referenceLang) continue;

      const langKeys = Object.keys(translationsObj);
      const missing = referenceKeys.filter((key) => !langKeys.includes(key));

      if (missing.length > 0) {
        missingReport[lang] = missing;
        this.stats.missingKeysFound += missing.length;
        console.log(`⚠️  ${lang}: ${missing.length} missing keys`);
        if (missing.length <= 10) {
          missing.forEach((k) => console.log(`      - ${k}`));
        }
      }
    }

    if (Object.keys(missingReport).length === 0) {
      console.log("✅ No missing keys found!\n");
    } else {
      console.log(
        `\n Total missing keys across all languages: ${this.stats.missingKeysFound}\n`,
      );
    }

    return missingReport;
  }

  detectUnusedKeys() {
    console.log("🗑️  Step 5: Detecting potentially unused keys...\n");
    console.log("⚠️  WARNING: Only keys NOT found in HTML/JS will be marked.");
    console.log('️  Some keys might be used dynamically and appear "unused".\n');

    const unusedReport = {};
    const usedKeysSet = new Set(this.allUsedKeys);

    for (const [lang, translationsObj] of Object.entries(this.translations)) {
      const unused = Object.keys(translationsObj).filter(
        (key) => !usedKeysSet.has(key),
      );

      if (unused.length > 0) {
        unusedReport[lang] = unused;
        console.log(`📋 ${lang}: ${unused.length} potentially unused keys`);
        if (unused.length <= 15) {
          unused.forEach((k) => console.log(`      - ${k}`));
        }
      }
    }

    if (Object.keys(unusedReport).length === 0) {
      console.log("✅ No unused keys found!\n");
    }

    return unusedReport;
  }

  async handleMissingKeys(missingReport) {
    console.log("\n🤖 Step 6: Handling missing keys...\n");
    console.log("Options:");
    console.log("  1. Leave them missing (safest - keeps file clean)");
    console.log('  2. Add empty string "" as placeholder');
    console.log(
      "  3. Copy from English with [TODO] prefix (NOT RECOMMENDED - will show on website)",
    );
    console.log("");

    const answer = await Utils.askQuestion(
      "Choose option (1/2/3), default is 1: ",
    );

    if (answer === "2") {
      for (const [lang, missingKeys] of Object.entries(missingReport)) {
        missingKeys.forEach((key) => {
          this.translations[lang][key] = "";
        });
        console.log(
          `✅ ${lang}: Added ${missingKeys.length} empty placeholders`,
        );
      }
    } else if (answer === "3") {
      console.log("\n⚠️  WARNING: [TODO] prefix will be visible to users!");
      const confirm = await Utils.askQuestion("Are you sure? (y/n): ");
      if (confirm === "y") {
        const referenceLang = CONFIG.defaultLanguage;
        for (const [lang, missingKeys] of Object.entries(missingReport)) {
          missingKeys.forEach((key) => {
            const englishValue = this.translations[referenceLang][key];
            if (englishValue) {
              this.translations[lang][key] = `[TODO:${lang}] ${englishValue}`;
            }
          });
          console.log(
            `✅ ${lang}: Filled ${missingKeys.length} keys with [TODO] prefix`,
          );
        }
      } else {
        console.log("⏭️  Skipped");
      }
    } else {
      console.log("⏭️  Left missing keys as-is (recommended)\n");
    }
  }

  async handleUnusedKeys(unusedReport) {
    console.log("\n️  Step 7: Handling unused keys...\n");

    if (Object.keys(unusedReport).length === 0) {
      console.log("✅ Nothing to do\n");
      return;
    }

    const answer = await Utils.askQuestion(
      "Remove unused keys? (y/n, default n): ",
    );

    if (answer !== "y") {
      console.log("⏭️  Kept all keys (safe choice)\n");
      return;
    }

    for (const [lang, unusedKeys] of Object.entries(unusedReport)) {
      unusedKeys.forEach((key) => {
        delete this.translations[lang][key];
      });
      console.log(`✅ ${lang}: Removed ${unusedKeys.length} unused keys`);
    }
    console.log("");
  }

  generateQualityReport() {
    console.log("\n📊 Step 8: Quality Report\n");
    console.log("═".repeat(70));
    console.log("LANGUAGE COVERAGE & QUALITY SCORE");
    console.log("═".repeat(70));

    const referenceLang = CONFIG.defaultLanguage;
    const referenceKeys = Object.keys(this.translations[referenceLang] || {});
    const report = [];

    for (const [lang, translationsObj] of Object.entries(this.translations)) {
      const langKeys = Object.keys(translationsObj);
      const coverage = Utils.calculateQualityScore(langKeys, referenceKeys);
      const { grade, color } = Utils.getQualityGrade(coverage);

      report.push({ lang, coverage, grade, color, totalKeys: langKeys.length });

      console.log(
        `${color} ${lang.toUpperCase().padEnd(6)} | Coverage: ${coverage.toFixed(1)}% | Grade: ${grade} | Keys: ${langKeys.length}`,
      );
    }

    console.log("═".repeat(70));
    console.log(
      `\n📈 Average Coverage: ${(report.reduce((sum, r) => sum + r.coverage, 0) / report.length).toFixed(1)}%`,
    );
    console.log(
      `🔑 Reference Language (${referenceLang}): ${referenceKeys.length} keys`,
    );
    console.log(`📄 Total HTML files scanned: ${this.stats.htmlFilesScanned}`);
    console.log(`📄 Total JS files scanned: ${this.stats.jsFilesScanned}\n`);

    return report;
  }

  saveTranslations() {
    console.log("💾 Step 9: Saving fixed translations...\n");

    const output = `console.log("✅ TRANSLATIONS FILE LOADED SUCCESSFULLY (Fixed v4.1 - Safe Mode)!");

window.CalculatorTranslations = ${JSON.stringify(this.translations, null, 2)};
`;

    fs.writeFileSync(CONFIG.translationsPath, output, "utf8");
    const fileSize = (fs.statSync(CONFIG.translationsPath).size / 1024).toFixed(
      2,
    );
    console.log(`✅ File saved: ${fileSize} KB\n`);
  }

  printSummary() {
    console.log("\n🎉 ═══════════════════════════════════════════════════════");
    console.log("🎉 TRANSLATION FIX COMPLETE! (Safe Mode)");
    console.log("═══════════════════════════════════════════════════════\n");
    console.log(` Languages Processed: ${this.stats.totalLanguages}`);
    console.log(`🔑 Total Valid Keys: ${this.stats.totalKeys}`);
    console.log(`🧹 Spaces Fixed: ${this.stats.spacesFixed}`);
    console.log(`🗑️  Duplicates Removed: ${this.stats.duplicatesRemoved}`);
    console.log(`🔍 Missing Keys Found: ${this.stats.missingKeysFound}`);
    console.log(`🔧 Syntax Errors Fixed: ${this.stats.syntaxErrorsFixed}`);
    console.log(` HTML Files Scanned: ${this.stats.htmlFilesScanned}`);
    console.log(`📄 JS Files Scanned: ${this.stats.jsFilesScanned}`);
    console.log(`💾 Backup Created: Yes`);
    console.log("\n═══════════════════════════════════════════════════════\n");
  }

  async run() {
    console.log("\n🚀 ═══════════════════════════════════════════════════════");
    console.log(" Calculator12 - Enterprise Translation Manager v4.1");
    console.log("🚀 (SAFE MODE - No auto-fill, No unsafe deletions)");
    console.log("🚀 ═══════════════════════════════════════════════════════\n");

    try {
      await this.loadTranslations();
      await this.scanAllFiles();
      await this.fixTranslations();

      const missingReport = this.detectMissingKeys();
      const unusedReport = this.detectUnusedKeys();

      await this.handleMissingKeys(missingReport);
      await this.handleUnusedKeys(unusedReport);

      this.generateQualityReport();
      this.saveTranslations();
      this.printSummary();

      console.log("✅ All operations completed successfully!\n");
    } catch (error) {
      console.error(
        "\n❌ ═══════════════════════════════════════════════════════",
      );
      console.error(`❌ ERROR: ${error.message}`);
      console.error(
        "❌ ═══════════════════════════════════════════════════════\n",
      );

      const backups = fs
        .readdirSync(CONFIG.backupDir)
        .filter((f) => f.startsWith("translations-"))
        .sort()
        .reverse();

      if (backups.length > 0) {
        const latestBackup = path.join(CONFIG.backupDir, backups[0]);
        fs.copyFileSync(latestBackup, CONFIG.translationsPath);
        console.log("🔄 Restored from latest backup\n");
      }

      process.exit(1);
    }
  }
}

const fixer = new TranslationFixer();
fixer.run().catch(console.error);

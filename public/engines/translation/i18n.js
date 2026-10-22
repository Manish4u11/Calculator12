/* ============================================
Calculator12.com - Global i18n & Language Selector Engine
(Final Version with Currency Auto-Detection)
============================================ */

class I18nEngine {
  constructor() {
    this.supportedLangs = [
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
    ];

    // 1. Language Detection: URL > LocalStorage > Browser
    const urlMatch = window.location.pathname.match(/-([a-z]{2})(?:\.html)?$/);
    const langFromUrl = urlMatch ? urlMatch[1] : null;

    // ✅ FIX: .trim() lagaya taaki purane cache mein spaces se bug na aaye
    const storedLang = localStorage.getItem("c12_lang");
    this.currentLang =
      langFromUrl ||
      (storedLang ? storedLang.trim() : null) ||
      this.detectBrowserLanguage();

    console.log(
      `✅ Language detected: ${this.currentLang} (from URL: ${langFromUrl})`,
    );

    localStorage.setItem("c12_lang", this.currentLang);

    // 2. Currency Map (Language ke hisaab se default currency)
    this.currencyMap = {
      en: "USD",
      hi: "INR",
      es: "EUR",
      fr: "EUR",
      de: "EUR",
      pt: "BRL",
      ru: "RUB",
      ar: "SAR",
      zh: "CNY",
      ja: "JPY",
      ko: "KRW",
      vi: "VND",
      id: "IDR",
    };

    // 2b. Regional Defaults Map (Global Parameters for Units & Formats)
    // Har language ke liye default units aur formats define kiye gaye hain.
    this.regionalDefaults = {
      en: {
        weight: "lbs", // US/UK default (Stone ko engine logic mein handle karenge)
        height: "ft/in",
        temp: "F",
        distance: "mi",
        volume: "gal",
        dateFormat: "MM/DD/YYYY",
      },
      hi: {
        weight: "kg", // India mein kg standard hai, lekin height aksar ft/in mein boli jati hai
        height: "ft/in", // ✅ Aapki requirement ke hisaab se India ke liye ft/in
        temp: "C",
        distance: "km",
        volume: "L",
        dateFormat: "DD/MM/YYYY",
      },
      zh: {
        weight: "jin", // ✅ China: 1 kg = 2 Jin (Engine mein conversion rate 2.0 set hoga)
        height: "cm",
        temp: "C",
        distance: "km",
        volume: "L",
        dateFormat: "YYYY-MM-DD",
      },
      fr: {
        weight: "kg",
        height: "cm",
        temp: "C",
        distance: "km",
        volume: "L",
        dateFormat: "DD/MM/YYYY",
      },
      de: {
        weight: "kg",
        height: "cm",
        temp: "C",
        distance: "km",
        volume: "L",
        dateFormat: "DD.MM.YYYY",
      },
      es: {
        weight: "kg",
        height: "cm",
        temp: "C",
        distance: "km",
        volume: "L",
        dateFormat: "DD/MM/YYYY",
      },
      ar: {
        weight: "kg",
        height: "cm",
        temp: "C",
        distance: "km",
        volume: "L",
        dateFormat: "DD/MM/YYYY",
      },
      ja: {
        weight: "kg",
        height: "cm",
        temp: "C",
        distance: "km",
        volume: "L",
        dateFormat: "YYYY/MM/DD",
      },
      ko: {
        weight: "kg",
        height: "cm",
        temp: "C",
        distance: "km",
        volume: "L",
        dateFormat: "YYYY-MM-DD",
      },
      pt: {
        weight: "kg",
        height: "cm",
        temp: "C",
        distance: "km",
        volume: "L",
        dateFormat: "DD/MM/YYYY",
      },
      ru: {
        weight: "kg",
        height: "cm",
        temp: "C",
        distance: "km",
        volume: "L",
        dateFormat: "DD.MM.YYYY",
      },
      vi: {
        weight: "kg",
        height: "cm",
        temp: "C",
        distance: "km",
        volume: "L",
        dateFormat: "DD/MM/YYYY",
      },
      id: {
        weight: "kg",
        height: "cm",
        temp: "C",
        distance: "km",
        volume: "L",
        dateFormat: "DD/MM/YYYY",
      },
    };

    // 3. Auto-Currency: Language ke hisaab se set karo
    this.currentCurrency = this.currencyMap[this.currentLang] || "USD";

    console.log(
      `💰 Currency set to: ${this.currentCurrency} for language: ${this.currentLang}`,
    );

    localStorage.setItem("c12_currency", this.currentCurrency);
    localStorage.removeItem("c12_currency_manual");

    // 4. Load Translations
    this.translations = {};
    this.loadTranslations();
  }

  loadTranslations() {
    if (
      window.CalculatorTranslations &&
      typeof window.CalculatorTranslations === "object"
    ) {
      this.translations = window.CalculatorTranslations;
      this.init();
      console.log(
        `✅ i18n Engine Ready. Language: ${this.currentLang}, Currency: ${this.currentCurrency}`,
      );
    } else {
      setTimeout(() => this.loadTranslations(), 100);
    }
  }

  detectBrowserLanguage() {
    const browserLang = navigator.language.split("-")[0];
    return this.supportedLangs.includes(browserLang) ? browserLang : "en";
  }

  init() {
    this.applyTranslations();
    this.applyDirection();
  }

  applyTranslations() {
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      const translation = this.t(key);
      if (translation) el.textContent = translation;
    });
  }

  applyDirection() {
    const htmlTag = document.documentElement;
    if (this.currentLang === "ar") {
      htmlTag.setAttribute("dir", "rtl");
      htmlTag.setAttribute("lang", "ar");
    } else {
      htmlTag.setAttribute("dir", "ltr");
      htmlTag.setAttribute("lang", this.currentLang);
    }
  }

  t(key) {
    // 1. Basic validation: Agar key hi nahi hai, toh empty string return karo
    if (!key || typeof key !== "string") return "";
    if (!this.translations || typeof this.translations !== "object") return key;

    // 2. Try current language (aur check karo ki value empty string toh nahi hai)
    const currentLangTranslation = this.translations[this.currentLang]?.[key];
    if (currentLangTranslation && currentLangTranslation.trim() !== "") {
      return currentLangTranslation;
    }

    // 3. Fallback to English
    const enTranslation = this.translations["en"]?.[key];
    if (enTranslation && enTranslation.trim() !== "") {
      // Developer ko alert karo (sirf localhost par) taaki wo missing translation fix kar sake
      if (
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1"
      ) {
        console.warn(
          `⚠️ Missing translation for key "${key}" in language "${this.currentLang}". Fallback to English used.`,
        );
      }
      return enTranslation;
    }

    // 4. Ultimate Fallback: Return the key itself (UI break nahi hogi, aur developer ko key ka naam dikhega)
    if (
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1"
    ) {
      console.error(
        `❌ CRITICAL: Translation missing for key "${key}" in ALL languages.`,
      );
    }
    return key;
  }

  formatNumber(value, options = {}) {
    const { style = "decimal", decimals = 2 } = options;

    const localeMap = {
      en: "en-US",
      hi: "en-IN",
      es: "es-ES",
      fr: "fr-FR",
      de: "de-DE",
      pt: "pt-BR",
      ru: "ru-RU",
      ar: "ar-SA",
      zh: "zh-CN",
      ja: "ja-JP",
      ko: "ko-KR",
      vi: "vi-VN",
      id: "id-ID",
    };

    const locale = localeMap[this.currentLang] || "en-US";
    const currency = options.currency || this.currentCurrency || "USD";

    return new Intl.NumberFormat(locale, {
      style: style,
      currency: currency,
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);
  }

  setLanguage(lang) {
    if (!this.supportedLangs.includes(lang)) return;

    this.currentLang = lang;
    localStorage.setItem("c12_lang", lang);

    // Language change = Currency auto change
    this.currentCurrency = this.currencyMap[lang] || "USD";
    localStorage.setItem("c12_currency", this.currentCurrency);

    this.init();
  }

  setCurrency(currency) {
    this.currentCurrency = currency;
    localStorage.setItem("c12_currency", currency);
    localStorage.setItem("c12_currency_manual", "true");
    document.dispatchEvent(
      new CustomEvent("currencyChanged", { detail: { currency } }),
    );
  }
}

class LanguageSelector {
  constructor() {
    this.toggleBtn = document.getElementById("langToggle");
    this.dropdown = document.getElementById("langDropdown");
    this.currentFlag = document.getElementById("currentFlag");
    this.currentLangText = document.getElementById("currentLang");
    this.options = document.querySelectorAll(".lang-option");

    if (this.toggleBtn) this.init();
  }

  init() {
    this.toggleBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      this.toggle();
    });

    document.addEventListener("click", (e) => {
      if (
        this.dropdown &&
        !this.dropdown.contains(e.target) &&
        !this.toggleBtn.contains(e.target)
      ) {
        this.close();
      }
    });

    this.options.forEach((option) => {
      option.addEventListener("click", () => {
        this.selectLanguage(option.dataset.lang, option.dataset.flag);
      });
    });

    this.loadSavedLanguage();
  }

  toggle() {
    const isExpanded = this.toggleBtn.getAttribute("aria-expanded") === "true";
    if (isExpanded) this.close();
    else this.open();
  }

  open() {
    this.dropdown.classList.add("active");
    this.toggleBtn.setAttribute("aria-expanded", "true");
  }

  close() {
    this.dropdown.classList.remove("active");
    this.toggleBtn.setAttribute("aria-expanded", "false");
  }

  selectLanguage(lang, flag) {
    if (this.currentFlag) this.currentFlag.textContent = flag;
    if (this.currentLangText)
      this.currentLangText.textContent = lang.toUpperCase();

    this.options.forEach((opt) => {
      opt.classList.toggle("active", opt.dataset.lang === lang);
    });

    localStorage.setItem("c12_lang", lang);

    // URL Redirect Logic
    const path = window.location.pathname;
    const match = path.match(/^(.*?\/)([^\/]+?)(?:-([a-z]{2}))?(\.html)?$/);

    if (match) {
      const dir = match[1];
      const baseName = match[2];
      const ext = match[4] || "";

      let newFileName = baseName;
      if (lang !== "en") {
        newFileName += `-${lang}`;
      }
      newFileName += ext;

      const newUrl = `${dir}${newFileName}`;

      if (newUrl !== path) {
        window.location.href = newUrl;
        return;
      }
    }

    if (window.i18n) {
      window.i18n.setLanguage(lang);

      const currencyDropdown = document.getElementById("currency-dropdown");
      if (currencyDropdown) {
        currencyDropdown.value = window.i18n.currentCurrency;
        this.updateInputPrefix(window.i18n.currentCurrency);
        if (window.engine) window.engine.calculate();
      }
    }

    this.close();
    console.log(`✅ Language changed to: ${lang}`);
  }

  updateInputPrefix(currency) {
    const symbols = {
      USD: "$",
      INR: "₹",
      EUR: "€",
      GBP: "£",
      JPY: "¥",
      AUD: "A$",
      CAD: "C$",
      BRL: "R$",
      RUB: "₽",
      SAR: "﷼",
      CNY: "¥",
      KRW: "₩",
      VND: "₫",
      IDR: "Rp",
    };

    // ✅ FIX: querySelectorAll se saare prefixes update honge
    const prefixEls = document.querySelectorAll(".input-prefix");
    prefixEls.forEach((el) => {
      el.textContent = symbols[currency] || "$";
    });
  }

  loadSavedLanguage() {
    const savedLang = localStorage.getItem("c12_lang") || "en";
    const option = document.querySelector(
      `.lang-option[data-lang="${savedLang}"]`,
    );

    if (option) {
      if (this.currentFlag) this.currentFlag.textContent = option.dataset.flag;
      if (this.currentLangText)
        this.currentLangText.textContent = savedLang.toUpperCase();
      this.options.forEach((opt) =>
        opt.classList.toggle("active", opt.dataset.lang === savedLang),
      );
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  window.i18n = new I18nEngine();
  window.langSelector = new LanguageSelector();
});

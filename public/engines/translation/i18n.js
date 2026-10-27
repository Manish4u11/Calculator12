/* ============================================
Calculator12.com - Global i18n & Language Selector Engine
(Final Version with Currency Auto-Detection)
============================================ */

class I18nEngine {
  constructor() {
    // ✅ FIX 1: Removed trailing spaces so setLanguage() works perfectly
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
    this.regionalDefaults = {
      en: {
        weight: "lbs",
        height: "ft/in",
        temp: "F",
        distance: "mi",
        volume: "gal",
        dateFormat: "MM/DD/YYYY",
      },
      hi: {
        weight: "kg",
        height: "ft/in",
        temp: "C",
        distance: "km",
        volume: "L",
        dateFormat: "DD/MM/YYYY",
      },
      zh: {
        weight: "jin",
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

      // ✅ FIX: Currency UI को update करें (dropdown aur symbol)
      setTimeout(() => this.updateCurrencyUI(), 100);

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
    // 1. Normal text translation (Buttons, Labels, Headings)
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      const translation = this.t(key);
      if (translation) el.textContent = translation;
    });

    // 2. HTML block translation (SEO Content, Paragraphs with tags)
    document.querySelectorAll("[data-i18n-html]").forEach((el) => {
      const key = el.getAttribute("data-i18n-html");
      const translation = this.t(key);
      if (translation) el.innerHTML = translation;
    });

    // 3. ✅ NEW: Placeholder translation (Search, Newsletter inputs)
    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
      const key = el.getAttribute("data-i18n-placeholder");
      const translation = this.t(key);
      if (translation) el.setAttribute("placeholder", translation);
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
    if (!key || typeof key !== "string") return "";
    if (!this.translations || typeof this.translations !== "object") return key;

    const currentLangTranslation = this.translations[this.currentLang]?.[key];
    if (currentLangTranslation && currentLangTranslation.trim() !== "") {
      return currentLangTranslation;
    }

    const enTranslation = this.translations["en"]?.[key];
    if (enTranslation && enTranslation.trim() !== "") {
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
    this.currentCurrency = this.currencyMap[lang] || "USD";
    localStorage.setItem("c12_currency", this.currentCurrency);

    this.init();

    // ✅ FIX: Currency UI को तुरंत update करें
    setTimeout(() => this.updateCurrencyUI(), 50);
  }

  setCurrency(currency) {
    this.currentCurrency = currency;
    localStorage.setItem("c12_currency", currency);
    localStorage.setItem("c12_currency_manual", "true");
    document.dispatchEvent(
      new CustomEvent("currencyChanged", { detail: { currency } }),
    );
  }

  updateCurrencyUI() {
    // 1. Currency dropdown को update करें
    const currencyDropdown = document.getElementById("currency-dropdown");
    if (currencyDropdown) {
      currencyDropdown.value = this.currentCurrency;
    }

    // 2. Input prefix (currency symbol) को update करें
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

    const prefixEls = document.querySelectorAll(".input-prefix");
    prefixEls.forEach((el) => {
      el.textContent = symbols[this.currentCurrency] || "$";
    });

    console.log(
      `💰 Currency UI updated to: ${this.currentCurrency} (${symbols[this.currentCurrency] || "$"})`,
    );
  }
}

class LanguageSelector {
  constructor() {
    this.waitForHeader();
  }

  waitForHeader() {
    this.toggleBtn = document.getElementById("langToggle");
    if (!this.toggleBtn) {
      setTimeout(() => this.waitForHeader(), 100);
      return;
    }
    this.init();
  }

  init() {
    this.dropdown = document.getElementById("langDropdown");
    this.currentFlag = document.getElementById("currentFlag");
    this.currentLangText = document.getElementById("currentLang");
    this.options = document.querySelectorAll(".lang-option");

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

    // ✅ FIX 2: Delay slightly to ensure components-loader has fully injected the header DOM
    setTimeout(() => this.loadSavedLanguage(), 150);
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

    if (window.i18n) {
      window.i18n.setLanguage(lang);
      const currencyDropdown = document.getElementById("currency-dropdown");
      if (currencyDropdown) {
        currencyDropdown.value = window.i18n.currentCurrency;
        this.updateInputPrefix(window.i18n.currentCurrency);
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
    const prefixEls = document.querySelectorAll(".input-prefix");
    prefixEls.forEach((el) => {
      el.textContent = symbols[currency] || "$";
    });
  }

  // ✅ FIX 3: Re-fetch elements right before updating to avoid detached DOM node issues
  loadSavedLanguage() {
    this.currentFlag = document.getElementById("currentFlag");
    this.currentLangText = document.getElementById("currentLang");
    this.options = document.querySelectorAll(".lang-option");

    const savedLang = localStorage.getItem("c12_lang") || "en";
    const option = document.querySelector(
      `.lang-option[data-lang="${savedLang}"]`,
    );

    if (option && this.currentFlag && this.currentLangText) {
      this.currentFlag.textContent = option.dataset.flag;
      this.currentLangText.textContent = savedLang.toUpperCase();
      this.options.forEach((opt) =>
        opt.classList.toggle("active", opt.dataset.lang === savedLang),
      );
      console.log(`✅ UI successfully updated to saved language: ${savedLang}`);
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  window.i18n = new I18nEngine();
  window.langSelector = new LanguageSelector();
});

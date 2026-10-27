/* ============================================
   Calculator12.com - Component Loader Engine v2.0
   Loads header.html and footer.html dynamically
   Handles navigation, active states, and relative paths
   ============================================ */

class ComponentLoader {
  constructor() {
    this.currentPath = window.location.pathname;
    this.pageDepth = this.calculatePageDepth();
    this.init();
  }

  /**
   * Calculate how deep the current page is from root
   * Example: /index.html = 0, /calculators/finance/emi.html = 2
   */
  calculatePageDepth() {
    const path = this.currentPath.replace(/^\/+|\/+$/g, "");
    if (!path || path === "index.html") return 0;
    return (path.match(/\//g) || []).length;
  }

  /**
   * Get relative path prefix based on page depth
   */
  getRelativePrefix() {
    if (this.pageDepth === 0) return "";
    return "../".repeat(this.pageDepth);
  }

  /**
   * Initialize component loading
   */
  async init() {
    await this.loadComponent("header-container", "header.html");
    await this.loadComponent("footer-container", "footer.html");

    // ✅ NEW: Load Related Calculators component (if container exists on page)
    await this.loadComponent(
      "related-calculators-container",
      "related-calculators.html",
    );

    // After loading, setup navigation and theme
    this.setupNavigation();
    this.setupLanguageSelector();
    this.setupMobileMenu();

    // Re-initialize theme switcher after header is loaded
    if (typeof ThemeSwitcher !== "undefined") {
      new ThemeSwitcher();
    }
  }

  /**
   * Load a component (header/footer) from assets/components/
   */
  async loadComponent(containerId, fileName) {
    const container = document.getElementById(containerId);
    if (!container) return;

    try {
      const prefix = this.getRelativePrefix();
      const path = `${prefix}assets/components/${fileName}`;

      const response = await fetch(path);
      if (!response.ok) throw new Error(`Failed to load ${fileName}`);

      const html = await response.text();
      container.innerHTML = html;

      // ✅ FIX: Re-apply translations to the newly injected content
      if (window.i18n && typeof window.i18n.translatePage === "function") {
        window.i18n.translatePage(container);
      } else if (
        window.i18n &&
        typeof window.i18n.applyTranslations === "function"
      ) {
        window.i18n.applyTranslations(container);
      }
    } catch (error) {
      console.error(`Component Loader Error (${fileName}):`, error);
    }
  }

  /**
   * Setup navigation links and active states
   */
  setupNavigation() {
    const navLinks = document.querySelectorAll("[data-nav-link]");
    const prefix = this.getRelativePrefix();

    // Detect current category from URL
    const categoryMatch = this.currentPath.match(/\/calculators\/([^\/]+)/);
    const currentCategory = categoryMatch ? categoryMatch[1] : null;

    navLinks.forEach((link) => {
      const linkType = link.getAttribute("data-nav-link");
      let href = "#";
      let isActive = false;

      switch (linkType) {
        case "home":
          href = `${prefix}index.html`;
          isActive =
            this.currentPath === "/" ||
            this.currentPath === "" ||
            this.currentPath.endsWith("/index.html") ||
            this.currentPath.endsWith("index.html");
          break;

        case "category":
          if (currentCategory) {
            // Calculator page पर - category name दिखाएं
            const categoryName = this.formatCategoryName(currentCategory);
            link.textContent = categoryName;
            href = "#";
            isActive = true;
          } else {
            // Home/Popular page पर - "Categories" दिखाएं
            const categoriesText =
              window.i18n && window.i18n.t
                ? window.i18n.t("nav.categories")
                : "Categories";
            link.textContent = categoriesText;
            href = `${prefix}categories.html`;
            // ✅ Categories page पर active
            isActive =
              this.currentPath.endsWith("/categories.html") ||
              this.currentPath.endsWith("/categories") ||
              this.currentPath.endsWith("categories.html") ||
              this.currentPath.endsWith("categories") ||
              this.currentPath === "/categories" ||
              this.currentPath === "/categories.html";
          }
          break;

        case "all-calculators":
          href = `${prefix}all-calculators.html`;
          isActive = this.currentPath.endsWith("/all-calculators.html");
          break;

        case "popular":
          href = `${prefix}popular.html`;
          // ✅ Both with and without .html extension
          isActive =
            this.currentPath.endsWith("/popular.html") ||
            this.currentPath.endsWith("/popular") ||
            this.currentPath.endsWith("popular.html") ||
            this.currentPath.endsWith("popular") ||
            this.currentPath === "/popular" ||
            this.currentPath === "/popular.html";
          break;

        case "about":
          href = `${prefix}about.html`;
          isActive =
            this.currentPath.endsWith("/about.html") ||
            this.currentPath.endsWith("/about") ||
            this.currentPath.endsWith("about.html") ||
            this.currentPath.endsWith("about");
          break;
      }

      link.setAttribute("href", href);

      // Set active class
      const navItem = link.closest(".nav__item");
      if (navItem) {
        if (isActive) {
          link.classList.add("nav__link--active");
        } else {
          link.classList.remove("nav__link--active");
        }
      }
    });
  }

  /**
   * Format category name from URL slug (Translation-aware)
   * Example: "finance" -> "वित्त" (in Hindi), "Finance" (in English)
   */
  formatCategoryName(slug) {
    const categoryTranslationKeys = {
      finance: "nav.finance",
      health: "nav.health",
      math: "nav.math",
      conversion: "nav.conversion",
      date: "nav.date",
      education: "nav.education",
      construction: "nav.construction",
      ai: "nav.ai",
      science: "nav.science",
      technology: "nav.technology",
      lifestyle: "nav.lifestyle",
      other: "nav.other",
    };

    const translationKey = categoryTranslationKeys[slug];

    // Use i18n translation if available
    if (translationKey && window.i18n && window.i18n.t) {
      return window.i18n.t(translationKey);
    }

    // Fallback to English
    const fallbackNames = {
      finance: "Finance",
      health: "Health",
      math: "Math",
      conversion: "Conversion",
      date: "Date & Time",
      education: "Education",
      construction: "Construction",
      ai: "AI Tools",
      science: "Science",
      technology: "Technology",
      lifestyle: "Lifestyle",
      other: "Other",
    };

    return fallbackNames[slug] || slug.charAt(0).toUpperCase() + slug.slice(1);
  }

  /**
   * Setup language selector dropdown
   */
  setupLanguageSelector() {
    const langToggle = document.getElementById("langToggle");
    const langDropdown = document.getElementById("langDropdown");

    if (!langToggle || !langDropdown) return;

    // Toggle dropdown
    langToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      const isExpanded = langToggle.getAttribute("aria-expanded") === "true";
      langToggle.setAttribute("aria-expanded", !isExpanded);
      langDropdown.classList.toggle("show");
    });

    // Close dropdown when clicking outside
    document.addEventListener("click", () => {
      langToggle.setAttribute("aria-expanded", "false");
      langDropdown.classList.remove("show");
    });

    // Language option clicks
    const langOptions = langDropdown.querySelectorAll(".lang-option");
    langOptions.forEach((option) => {
      option.addEventListener("click", () => {
        const lang = option.getAttribute("data-lang");
        const flag = option.getAttribute("data-flag");

        // Update UI immediately
        const currentFlag = document.getElementById("currentFlag");
        const currentLang = document.getElementById("currentLang");
        if (currentFlag) currentFlag.textContent = flag;
        if (currentLang) currentLang.textContent = lang.toUpperCase();

        // Update active state
        langOptions.forEach((opt) => opt.classList.remove("active"));
        option.classList.add("active");

        // Close dropdown
        langDropdown.classList.remove("show");
        langToggle.setAttribute("aria-expanded", "false");

        // Save to localStorage
        localStorage.setItem("c12_lang", lang);

        // Trigger i18n engine
        if (window.i18n && window.i18n.setLanguage) {
          window.i18n.setLanguage(lang);

          // Update currency if exists
          const currencyDropdown = document.getElementById("currency-dropdown");
          if (currencyDropdown && window.i18n.currentCurrency) {
            currencyDropdown.value = window.i18n.currentCurrency;
          }
        }

        console.log(`✅ Language changed to: ${lang}`);
      });
    });
  }

  /**
   * Setup mobile menu toggle
   */
  setupMobileMenu() {
    const mobileToggle = document.querySelector(".mobile-menu-toggle");
    const headerNav = document.querySelector(".header__nav");

    if (!mobileToggle || !headerNav) return;

    mobileToggle.addEventListener("click", () => {
      const isExpanded = mobileToggle.getAttribute("aria-expanded") === "true";
      mobileToggle.setAttribute("aria-expanded", !isExpanded);
      mobileToggle.classList.toggle("active");
      headerNav.classList.toggle("show");
    });
  }
}

// Initialize on DOM ready
document.addEventListener("DOMContentLoaded", () => {
  new ComponentLoader();
});

console.log("✅ Component Loader v2.0 Initialized");

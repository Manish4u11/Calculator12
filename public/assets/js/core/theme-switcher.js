/* ============================================
   Calculator12.com - Theme Switcher
   ============================================ */

class ThemeSwitcher {
  constructor() {
    this.theme = localStorage.getItem("theme") || "light";
    this.toggleBtn = document.querySelector(".theme-toggle");
    this.init();
  }

  init() {
    this.applyTheme();
    this.attachEventListeners();
  }

  applyTheme() {
    document.documentElement.setAttribute("data-theme", this.theme);
    if (this.toggleBtn) {
      this.toggleBtn.setAttribute("aria-pressed", this.theme === "dark");
    }
  }

  toggleTheme() {
    this.theme = this.theme === "light" ? "dark" : "light";
    localStorage.setItem("theme", this.theme);
    this.applyTheme();
  }

  attachEventListeners() {
    if (this.toggleBtn) {
      this.toggleBtn.addEventListener("click", () => this.toggleTheme());
    }
  }
}

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  new ThemeSwitcher();
});

/* ============================================
Calculator12.com - Universal Calculator Builder Engine v3.0
Production-Ready, Feature-Rich, Multi-Language, Global Parameters
============================================ */

class UniversalCalculator {
  /**
   * @param {string} containerId - Container element ka ID
   * @param {Object} config - Calculator configuration object
   */
  constructor(containerId, config) {
    this.container = document.getElementById(containerId);
    this.config = config;
    this.values = {};
    this.results = {};
    this.chartInstance = null;
    this.history = [];
    this.maxHistory = 5;

    if (!this.container) {
      console.error(`Container with ID '${containerId}' not found.`);
      return;
    }

    if (!this.config) {
      console.error("Calculator config is required.");
      return;
    }

    // ✅ NEW: Load history from localStorage
    this.loadHistory();

    // Initialize
    this.init();
  }

  /**
   * Initialize calculator - render HTML and attach events
   */
  init() {
    this.render();
    this.attachEvents();
    this.injectSchema();
    this.setupLanguageSupport();

    // Initial calculation if default values exist
    if (this.hasDefaultValues()) {
      this.calculate();
    }

    console.log(
      `✅ ${this.config.title || "Calculator"} initialized successfully!`,
    );
  }

  /**
   * Setup Language Support & Currency Auto-Detection
   */
  setupLanguageSupport() {
    // ✅ NEW: Listen for language changes
    if (window.i18n) {
      // Auto-update currency prefix if exists
      this.updateCurrencyPrefix();

      // Listen for currency changes
      document.addEventListener("currencyChanged", () => {
        this.updateCurrencyPrefix();
        if (this.config.realTime !== false) {
          this.calculate();
        }
      });
    }
  }

  /**
   * Update currency prefix based on current language/currency
   */
  updateCurrencyPrefix() {
    if (!window.i18n) return;

    const currencySymbols = {
      USD: "$",
      INR: "₹",
      EUR: "€",
      GBP: "£",
      JPY: "¥",
      CNY: "¥",
      KRW: "₩",
      RUB: "₽",
      BRL: "R$",
      SAR: "",
      VND: "₫",
      IDR: "Rp",
      AUD: "A$",
      CAD: "C$",
    };

    const currentCurrency = window.i18n.currentCurrency || "USD";
    const symbol = currencySymbols[currentCurrency] || "$";

    // Update all input prefixes
    const prefixElements = this.container.querySelectorAll(".input-prefix");
    prefixElements.forEach((el) => {
      el.textContent = symbol;
    });
  }

  /**
   * Check if any input has default value
   */
  hasDefaultValues() {
    return this.config.inputs.some((input) => input.defaultValue !== undefined);
  }

  // ==========================================
  // 1. HTML RENDERING
  // ==========================================

  /**
   * Main render function - generates complete calculator HTML
   */
  render() {
    let html = `<div class="universal-calc-wrapper" data-calc-id="${this.config.id || "calc"}">`;

    // Custom HTML (if provided)
    if (this.config.customHTML) {
      html += this.config.customHTML;
    }

    // Inputs Section
    html += this.renderInputs();

    // Calculate Button
    html += this.renderCalculateButton();

    // Error Message
    html += `<div id="uc-error" class="error-message" style="display: none;" role="alert"></div>`;

    // Results Section (Sirf tab render karo jab results ho)
    if (this.config.results && this.config.results.length > 0) {
      html += this.renderResults();
    }

    // Advanced Features (Charts/Tables) - Sirf tab jab charts ya tables ho
    const hasCharts = this.config.charts && this.config.charts.length > 0;
    const hasTables = this.config.tables && this.config.tables.length > 0;
    if (hasCharts || hasTables) {
      html += `<div id="uc-advanced-area" class="advanced-feature-area"></div>`;
    }

    // Action Buttons - Sirf tab jab features ho aur kam se kam ek feature true ho
    if (this.config.features && Object.keys(this.config.features).length > 0) {
      const hasAnyFeature = Object.values(this.config.features).some(
        (v) => v === true,
      );
      if (hasAnyFeature) {
        html += this.renderActionButtons();
      }
    }

    // ✅ NEW: History Section (if enabled)
    if (this.config.features?.showHistory && this.history.length > 0) {
      html += this.renderHistory();
    }

    html += `</div>`;

    this.container.innerHTML = html;

    // Set default values if provided
    this.setDefaultValues();

    // ✅ NEW: Render charts after DOM is ready
    if (this.config.charts) {
      setTimeout(() => this.renderCharts(), 100);
    }
  }

  /**
   * Render all input fields
   */
  renderInputs() {
    let html = `<div class="calc-inputs-grid">`;

    this.config.inputs.forEach((input) => {
      // ✅ NEW: Handle conditional inputs
      if (input.conditional && !this.checkCondition(input.conditional)) {
        return; // Skip rendering if condition is not met
      }
      html += this.renderSingleInput(input);
    });

    html += `</div>`;
    return html;
  }

  /**
   * Check conditional logic
   */
  checkCondition(condition) {
    const { field, operator, value } = condition;
    const fieldValue = this.values[field];

    switch (operator) {
      case "equals":
        return fieldValue === value;
      case "notEquals":
        return fieldValue !== value;
      case "greaterThan":
        return fieldValue > value;
      case "lessThan":
        return fieldValue < value;
      case "isEmpty":
        return !fieldValue || fieldValue === "";
      default:
        return true;
    }
  }

  /**
   * Render single input field based on type
   */
  renderSingleInput(input) {
    const tooltip = input.tooltip ? `title="${input.tooltip}"` : "";
    const required = input.required ? "required" : "";
    const ariaLabel = `aria-label="${input.label}"`;

    // ✅ Direct translation use karein agar i18n available hai
    const translatedLabel =
      window.i18n && input.i18nKey ? window.i18n.t(input.i18nKey) : input.label;

    const i18nAttr = input.i18nKey ? `data-i18n="${input.i18nKey}"` : "";

    let inputHTML = "";
    switch (input.type) {
      case "select":
        inputHTML = this.renderSelectInput(input);
        break;
      case "slider":
        inputHTML = this.renderSliderInput(input);
        break;
      case "radio":
        inputHTML = this.renderRadioInput(input);
        break;
      case "checkbox":
        inputHTML = this.renderCheckboxInput(input);
        break;
      case "toggle":
        inputHTML = this.renderToggleInput(input);
        break;
      case "date":
        inputHTML = this.renderDateInput(input);
        break;
      case "unit-toggle":
        inputHTML = this.renderUnitToggleInput(input);
        break;
      default:
        inputHTML = this.renderNumberInput(input);
    }

    return `
    <div class="form-group" ${tooltip} ${input.conditional ? `data-conditional="${JSON.stringify(input.conditional).replace(/"/g, "&quot;")}"` : ""}>
      <label for="${input.id}" ${i18nAttr} ${ariaLabel}>${translatedLabel}</label>
      ${inputHTML}
      ${input.hint ? `<small class="input-hint">${input.hint}</small>` : ""}
      ${input.error ? `<small class="input-error" style="color: var(--color-error);">${input.error}</small>` : ""}
    </div>
  `;
  }

  /**
   * Render number input with prefix/suffix
   */
  renderNumberInput(input) {
    // ✅ NEW: Auto-detect currency symbol from i18n
    let prefix = input.prefix;
    if (!prefix && input.currency && window.i18n) {
      const currencySymbols = {
        USD: "$",
        INR: "₹",
        EUR: "€",
        GBP: "£",
        JPY: "¥",
      };
      const currency = window.i18n.currentCurrency || "USD";
      prefix = currencySymbols[currency] || "$";
    }

    const prefixHTML = prefix
      ? `<span class="input-prefix">${prefix}</span>`
      : "";
    const suffix = input.suffix
      ? `<span class="input-suffix">${input.suffix}</span>`
      : "";
    const hasWrapper = prefixHTML || suffix;

    const inputElement = `
      <input 
        type="number" 
        id="${input.id}" 
        placeholder="${input.placeholder || "Enter value"}"
        step="${input.step || "any"}"
        min="${input.min !== undefined ? input.min : ""}"
        max="${input.max !== undefined ? input.max : ""}"
        ${input.required ? "required" : ""}
        ${input.disabled ? "disabled" : ""}
        aria-label="${input.label}"
        class="${input.className || ""}"
      >
    `;

    if (hasWrapper) {
      return `
        <div class="input-wrapper">
          ${prefixHTML}
          ${inputElement}
          ${suffix}
        </div>
      `;
    }

    return inputElement;
  }

  /**
   * Render select dropdown
   */
  renderSelectInput(input) {
    let options = input.options
      .map((opt) => {
        const value = typeof opt === "object" ? opt.value : opt;
        const label =
          typeof opt === "object"
            ? opt.i18nKey && window.i18n
              ? window.i18n.t(opt.i18nKey)
              : opt.label
            : opt;
        const selected = input.defaultValue === value ? "selected" : "";
        return `<option value="${value}" ${selected}>${label}</option>`;
      })
      .join("");

    return `
      <select id="${input.id}" aria-label="${input.label}" class="${input.className || ""}">
        ${options}
      </select>
    `;
  }

  /**
   * Render slider with value display
   */
  renderSliderInput(input) {
    return `
      <div class="slider-wrapper">
        <input 
          type="range" 
          id="${input.id}" 
          min="${input.min || 0}"
          max="${input.max || 100}"
          step="${input.step || 1}"
          value="${input.defaultValue || input.min || 0}"
          aria-label="${input.label}"
        >
        <span class="slider-value" id="${input.id}-value">${input.defaultValue || input.min || 0}</span>
      </div>
    `;
  }

  /**
   * Render radio buttons
   */
  renderRadioInput(input) {
    let radios = input.options
      .map((opt, index) => {
        const value = typeof opt === "object" ? opt.value : opt;
        const label =
          typeof opt === "object"
            ? opt.i18nKey && window.i18n
              ? window.i18n.t(opt.i18nKey)
              : opt.label
            : opt;
        const checked = input.defaultValue === value ? "checked" : "";
        const id = `${input.id}-${index}`;

        return `
        <label class="radio-label">
          <input type="radio" name="${input.id}" id="${id}" value="${value}" ${checked}>
          <span>${label}</span>
        </label>
      `;
      })
      .join("");

    return `<div class="radio-group">${radios}</div>`;
  }

  /**
   * Render checkbox
   */
  renderCheckboxInput(input) {
    const checked = input.defaultValue ? "checked" : "";
    const label =
      input.checkboxLabel ||
      (input.i18nKey && window.i18n
        ? window.i18n.t(input.i18nKey)
        : input.label);
    return `
      <label class="checkbox-label">
        <input type="checkbox" id="${input.id}" ${checked} aria-label="${input.label}">
        <span>${label}</span>
      </label>
    `;
  }

  /**
   * Render toggle switch
   */
  renderToggleInput(input) {
    const checked = input.defaultValue ? "checked" : "";
    return `
      <label class="toggle-switch">
        <input type="checkbox" id="${input.id}" ${checked} aria-label="${input.label}">
        <span class="toggle-slider"></span>
      </label>
    `;
  }

  /**
   * Render date input
   */
  renderDateInput(input) {
    return `
      <input 
        type="date" 
        id="${input.id}" 
        value="${input.defaultValue || ""}"
        min="${input.min || ""}"
        max="${input.max || ""}"
        aria-label="${input.label}"
        class="${input.className || ""}"
      >
    `;
  }

  /**
   * Render unit toggle buttons (like kg/lbs/stones)
   */
  renderUnitToggleInput(input) {
    let buttons = input.options
      .map((opt, index) => {
        const value = typeof opt === "object" ? opt.value : opt;
        const label =
          typeof opt === "object"
            ? opt.i18nKey && window.i18n
              ? window.i18n.t(opt.i18nKey)
              : opt.label
            : opt;
        const active = index === 0 ? "active" : "";

        return `<button type="button" class="${active}" data-unit="${value}">${label}</button>`;
      })
      .join("");

    return `
      <div class="unit-toggle" id="${input.id}-toggle" role="group" aria-label="${input.label}">
        ${buttons}
      </div>
      <input type="hidden" id="${input.id}" value="${input.options[0]?.value || input.options[0]}">
    `;
  }

  /**
   * Render calculate button - hideButton true hone par button nahi dikhayega
   */
  renderCalculateButton() {
    if (this.config.hideButton) return "";

    const buttonText =
      this.config.buttonText || `Calculate ${this.config.title || ""}`;
    return `<button id="uc-calculate-btn" class="btn btn-primary btn-block">${buttonText}</button>`;
  }

  /**
   * Render results section - Empty hone par kuch return nahi karega
   */
  renderResults() {
    if (!this.config.results || this.config.results.length === 0) return "";

    let html = `<div class="calc-results-grid">`;
  }

  /**
   * Render single result card
   */
  renderSingleResult(result) {
    const highlightClass = result.highlight ? "result-item--highlight" : "";
    const icon = result.icon ? `<i class="fas ${result.icon}"></i>` : "";
    const colorClass = result.color ? `result-item--${result.color}` : "";
    const label =
      result.i18nKey && window.i18n
        ? window.i18n.t(result.i18nKey)
        : result.label;

    return `
      <div class="result-item ${highlightClass} ${colorClass}">
        <div class="result-item__content">
          ${icon ? `<span class="result-item__icon">${icon}</span>` : ""}
          <span class="result-item__label" ${result.i18nKey ? `data-i18n="${result.i18nKey}"` : ""}>${label}</span>
        </div>
        <span class="result-item__value" id="res-${result.id}" aria-live="polite">--</span>
      </div>
    `;
  }

  /**
   * Render action buttons (Export, Share, etc.) - Empty hone par kuch return nahi karega
   */
  renderActionButtons() {
    const features = this.config.features;
    if (!features) return "";

    let buttons = [];

    if (features.pdfExport) {
      const label =
        features.pdfExportI18nKey && window.i18n
          ? window.i18n.t(features.pdfExportI18nKey)
          : "Export PDF";
      buttons.push(
        `<button id="uc-export-pdf" class="btn btn-secondary"><i class="fas fa-file-pdf"></i> ${label}</button>`,
      );
    }

    if (features.shareResults) {
      const label =
        features.shareI18nKey && window.i18n
          ? window.i18n.t(features.shareI18nKey)
          : "Share";
      buttons.push(
        `<button id="uc-share" class="btn btn-secondary"><i class="fas fa-share-alt"></i> ${label}</button>`,
      );
    }

    if (features.copyToClipboard) {
      const label =
        features.copyI18nKey && window.i18n
          ? window.i18n.t(features.copyI18nKey)
          : "Copy";
      buttons.push(
        `<button id="uc-copy" class="btn btn-secondary"><i class="fas fa-copy"></i> ${label}</button>`,
      );
    }

    if (features.resetButton) {
      const label =
        features.resetI18nKey && window.i18n
          ? window.i18n.t(features.resetI18nKey)
          : "Reset";
      buttons.push(
        `<button id="uc-reset" class="btn btn-ghost"><i class="fas fa-redo"></i> ${label}</button>`,
      );
    }

    // Agar koi button nahi hai, toh empty div mat banao
    if (buttons.length === 0) return "";

    return `<div class="calc-action-buttons">${buttons.join("")}</div>`;
  }

  /**
   * Render history section
   */
  renderHistory() {
    if (this.history.length === 0) return "";

    const title =
      this.config.historyTitle ||
      (window.i18n ? window.i18n.t("calc.history") : "Recent Calculations");

    let html = `
      <div class="calc-history">
        <h3>${title}</h3>
        <ul class="history-list">
    `;

    this.history.forEach((item, index) => {
      html += `
        <li class="history-item" data-index="${index}">
          <span class="history-date">${new Date(item.timestamp).toLocaleString()}</span>
          <span class="history-result">${item.result}</span>
        </li>
      `;
    });

    html += `
        </ul>
      </div>
    `;

    return html;
  }

  /**
   * Set default values for inputs
   */
  setDefaultValues() {
    // ✅ FIX: Auto-select unit based on user's language regional defaults
    this.config.inputs.forEach((input) => {
      if (
        input.type === "unit-toggle" &&
        window.i18n &&
        window.i18n.regionalDefaults
      ) {
        const lang = window.i18n.currentLang;
        const defaults =
          window.i18n.regionalDefaults[lang] ||
          window.i18n.regionalDefaults["en"];

        // Find which input this unit toggle belongs to (e.g., "weight" or "height")
        const inputName = input.id.replace("_unit", "");
        if (defaults && defaults[inputName]) {
          input.defaultValue = defaults[inputName];
        }
      }
    });

    this.config.inputs.forEach((input) => {
      if (input.defaultValue !== undefined) {
        const element = document.getElementById(input.id);
        if (element) {
          element.value = input.defaultValue;

          // Update slider value display
          if (input.type === "slider") {
            const valueDisplay = document.getElementById(`${input.id}-value`);
            if (valueDisplay) {
              valueDisplay.textContent = input.defaultValue;
            }
          }

          // Update unit toggle active state
          if (input.type === "unit-toggle") {
            const toggleContainer = document.getElementById(
              `${input.id}-toggle`,
            );
            if (toggleContainer) {
              const buttons = toggleContainer.querySelectorAll("button");
              buttons.forEach((btn) => {
                btn.classList.toggle(
                  "active",
                  btn.dataset.unit === input.defaultValue,
                );
              });
            }
          }
        }
      }
    });
  }

  // ==========================================
  // 2. EVENT HANDLING
  // ==========================================

  /**
   * Attach all event listeners
   */
  attachEvents() {
    // Calculate button
    const calcBtn = document.getElementById("uc-calculate-btn");
    if (calcBtn) {
      calcBtn.addEventListener("click", () => this.calculate());
    }

    // Real-time calculation on input change
    this.config.inputs.forEach((input) => {
      const element = document.getElementById(input.id);
      if (element) {
        element.addEventListener("input", () => {
          // Update slider value display
          if (input.type === "slider") {
            const valueDisplay = document.getElementById(`${input.id}-value`);
            if (valueDisplay) {
              valueDisplay.textContent = element.value;
            }
          }

          // Real-time calculation
          if (this.config.realTime !== false) {
            this.calculate();
          }

          // Check and update conditional inputs
          this.updateConditionalInputs();
        });

        // Also listen for change events (for select, radio, etc.)
        element.addEventListener("change", () => {
          if (this.config.realTime !== false) {
            this.calculate();
          }
          this.updateConditionalInputs();
        });
      }

      // Unit toggle buttons
      if (input.type === "unit-toggle") {
        const toggleContainer = document.getElementById(`${input.id}-toggle`);
        if (toggleContainer) {
          const buttons = toggleContainer.querySelectorAll("button");
          buttons.forEach((btn) => {
            btn.addEventListener("click", () => {
              buttons.forEach((b) => b.classList.remove("active"));
              btn.classList.add("active");
              document.getElementById(input.id).value = btn.dataset.unit;

              if (this.config.realTime !== false) {
                this.calculate();
              }
            });
          });
        }
      }
    });

    // Action buttons
    this.attachActionEvents();

    // History item clicks
    this.attachHistoryEvents();
  }

  /**
   * Update conditional inputs visibility
   */
  updateConditionalInputs() {
    this.config.inputs.forEach((input) => {
      if (input.conditional) {
        const element = document.getElementById(input.id);
        const parent = element?.closest(".form-group");
        if (parent) {
          const isVisible = this.checkCondition(input.conditional);
          parent.style.display = isVisible ? "block" : "none";
        }
      }
    });
  }

  /**
   * Attach action button events
   */
  attachActionEvents() {
    if (this.config.features) {
      const features = this.config.features;

      if (features.pdfExport) {
        const pdfBtn = document.getElementById("uc-export-pdf");
        if (pdfBtn) {
          pdfBtn.addEventListener("click", () => this.exportPDF());
        }
      }

      if (features.shareResults) {
        const shareBtn = document.getElementById("uc-share");
        if (shareBtn) {
          shareBtn.addEventListener("click", () => this.shareResults());
        }
      }

      if (features.copyToClipboard) {
        const copyBtn = document.getElementById("uc-copy");
        if (copyBtn) {
          copyBtn.addEventListener("click", () => this.copyToClipboard());
        }
      }

      if (features.resetButton) {
        const resetBtn = document.getElementById("uc-reset");
        if (resetBtn) {
          resetBtn.addEventListener("click", () => this.reset());
        }
      }
    }
  }

  /**
   * Attach history events
   */
  attachHistoryEvents() {
    const historyItems = this.container.querySelectorAll(".history-item");
    historyItems.forEach((item) => {
      item.addEventListener("click", () => {
        const index = parseInt(item.dataset.index);
        this.loadFromHistory(index);
      });
    });
  }

  // ==========================================
  // 3. CALCULATION & VALIDATION
  // ==========================================

  /**
   * Main calculation function
   */
  calculate() {
    // Collect input values
    this.config.inputs.forEach((input) => {
      // Skip conditional inputs that are hidden
      if (input.conditional && !this.checkCondition(input.conditional)) {
        return;
      }

      const element = document.getElementById(input.id);
      if (element) {
        if (input.type === "checkbox" || input.type === "toggle") {
          this.values[input.id] = element.checked;
        } else if (input.type === "radio") {
          const checked = document.querySelector(
            `input[name="${input.id}"]:checked`,
          );
          this.values[input.id] = checked ? checked.value : "";
        } else {
          this.values[input.id] = parseFloat(element.value) || 0;
        }
      }
    });

    // Validation
    if (this.config.validate) {
      const error = this.config.validate(this.values);
      if (error) {
        this.showError(error);
        return;
      }
    }

    // Run calculation
    try {
      this.results = this.config.calculate(this.values);
      this.showResults(this.results);

      // ✅ NEW: Save to history
      if (this.config.features?.saveHistory) {
        this.saveToHistory();
      }

      // Render advanced features
      if (this.config.charts || this.config.tables) {
        this.renderAdvancedFeatures();
      }

      this.clearError();
    } catch (e) {
      this.showError("Calculation Error: " + e.message);
      console.error("Calculation Error:", e);
    }
  }

  /**
   * Validate inputs (custom validation function)
   */
  validate() {
    // Custom validation logic from config
    if (this.config.validate) {
      return this.config.validate(this.values);
    }
    return null;
  }

  // ==========================================
  // 4. DISPLAY & FORMATTING
  // ==========================================

  /**
   * Display calculation results
   */
  showResults(results) {
    for (const [key, value] of Object.entries(results)) {
      const element = document.getElementById(`res-${key}`);
      if (element) {
        const formattedValue = this.formatValue(value, key);
        element.textContent = formattedValue;

        // Animation
        element.classList.add("result-updated");
        setTimeout(() => element.classList.remove("result-updated"), 500);
      }
    }
  }

  /**
   * Format value based on result config
   */
  formatValue(value, resultId) {
    const resultConfig = this.config.results.find((r) => r.id === resultId);
    if (!resultConfig) return value;

    // ✅ FIX: Number formatting ab window.i18n engine se dynamically hogi
    if (typeof value === "number") {
      const format = resultConfig.format || "normal";
      const decimals =
        resultConfig.decimals !== undefined ? resultConfig.decimals : 2;

      if (format === "currency") {
        // Agar config mein specific currency hai toh wo use karo, warna i18n ki current currency
        const currency =
          resultConfig.currency ||
          (window.i18n ? window.i18n.currentCurrency : "USD");
        return window.i18n
          ? window.i18n.formatNumber(value, {
              style: "currency",
              currency,
              decimals,
            })
          : value;
      }

      if (format === "percent") {
        return value.toFixed(decimals) + "%";
      }

      // Normal number formatting with dynamic locale
      return window.i18n
        ? window.i18n.formatNumber(value, { style: "decimal", decimals })
        : value.toLocaleString();
    }

    return value;
  }

  /**
   * Show error message
   */
  showError(message) {
    const errorBox = document.getElementById("uc-error");
    if (errorBox) {
      errorBox.textContent = message;
      errorBox.style.display = "block";
      errorBox.classList.add("show");
    }
  }

  /**
   * Clear error message
   */
  clearError() {
    const errorBox = document.getElementById("uc-error");
    if (errorBox) {
      errorBox.textContent = "";
      errorBox.style.display = "none";
      errorBox.classList.remove("show");
    }
  }

  // ==========================================
  // 5. ADVANCED FEATURES
  // ==========================================

  /**
   * ✅ FIXED: Render charts and tables (safe)
   */
  renderAdvancedFeatures() {
    const advancedArea = document.getElementById("uc-advanced-area");
    if (!advancedArea) return;

    let html = "";

    // Render charts
    if (this.config.charts) {
      this.config.charts.forEach((chart) => {
        html += this.renderChart(chart);
      });
    }

    // Render tables
    if (this.config.tables) {
      this.config.tables.forEach((table) => {
        html += this.renderTable(table);
      });
    }

    advancedArea.innerHTML = html;

    // ✅ Render actual charts AFTER HTML is inserted (with delay for DOM)
    if (this.config.charts) {
      setTimeout(() => {
        try {
          this.renderCharts();
        } catch (error) {
          console.error(" Error rendering charts:", error);
        }
      }, 100);
    }
  }

  /**
   * Render chart container
   */
  renderChart(chart) {
    const title =
      chart.i18nKey && window.i18n
        ? window.i18n.t(chart.i18nKey)
        : chart.title || "Chart";

    return `
      <div class="chart-container" data-chart-id="${chart.id}">
        <h4>${title}</h4>
        <div id="chart-${chart.id}" class="chart-area"></div>
      </div>
    `;
  }

  /**
   * ✅ FIXED: Render actual SVG charts (with error handling)
   */
  renderCharts() {
    if (!this.config.charts) return;

    try {
      this.config.charts.forEach((chart) => {
        const chartElement = document.getElementById(`chart-${chart.id}`);
        if (!chartElement) return;

        switch (chart.type) {
          case "pie":
            this.renderPieChart(chartElement, chart);
            break;
          case "bar":
            this.renderBarChart(chartElement, chart);
            break;
          case "gauge":
            this.renderGaugeChart(chartElement, chart);
            break;
          default:
            this.renderPieChart(chartElement, chart);
        }
      });
    } catch (error) {
      console.error("❌ Chart rendering error:", error);
    }
  }

  /**
   * ✅ FIXED: Render SVG Pie Chart (with NaN protection)
   */
  renderPieChart(container, chart) {
    // Get data safely
    const data = chart.data || this.results[chart.dataKey] || [];

    // ✅ NaN/Empty check - agar data nahi hai toh empty state dikhao
    if (!data || data.length === 0) {
      container.innerHTML = `
        <div class="chart-empty-state" style="text-align: center; padding: 40px 20px; color: var(--text-tertiary);">
          <i class="fas fa-chart-pie" style="font-size: 48px; opacity: 0.3; margin-bottom: 16px;"></i>
          <p>Enter values to see the chart</p>
        </div>
      `;
      return;
    }

    // Filter out NaN values
    const validData = data.filter(
      (item) => !isNaN(item.value) && item.value > 0,
    );

    if (validData.length === 0) {
      container.innerHTML = `
        <div class="chart-empty-state" style="text-align: center; padding: 40px 20px; color: var(--text-tertiary);">
          <i class="fas fa-chart-pie" style="font-size: 48px; opacity: 0.3; margin-bottom: 16px;"></i>
          <p>Enter valid values to see the chart</p>
        </div>
      `;
      return;
    }

    const size = chart.size || 200;
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size / 2 - 20;

    let total = validData.reduce((sum, item) => sum + item.value, 0);
    let currentAngle = -90; // Start from top

    let paths = "";
    let legends = "";

    validData.forEach((item, index) => {
      // ✅ NaN protection for each value
      const value = parseFloat(item.value) || 0;
      if (value <= 0) return;

      const percentage = (value / total) * 100;
      const angle = (value / total) * 360;
      const color = item.color || this.getDefaultColor(index);

      // Calculate path coordinates
      const startRad = (currentAngle * Math.PI) / 180;
      const endRad = ((currentAngle + angle) * Math.PI) / 180;

      const x1 = centerX + radius * Math.cos(startRad);
      const y1 = centerY + radius * Math.sin(startRad);
      const x2 = centerX + radius * Math.cos(endRad);
      const y2 = centerY + radius * Math.sin(endRad);

      const largeArcFlag = angle > 180 ? 1 : 0;

      const pathData = [
        `M ${centerX} ${centerY}`,
        `L ${x1} ${y1}`,
        `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
        "Z",
      ].join(" ");

      paths += `<path d="${pathData}" fill="${color}" stroke="white" stroke-width="2">
        <title>${item.label}: ${percentage.toFixed(1)}%</title>
      </path>`;

      // Legend with i18n support
      const label =
        item.i18nKey && window.i18n ? window.i18n.t(item.i18nKey) : item.label;
      legends += `
        <div class="chart-legend-item">
          <span class="chart-legend-color" style="background: ${color}; width: 12px; height: 12px; border-radius: 2px; display: inline-block;"></span>
          <span class="chart-legend-label">${label}: ${percentage.toFixed(1)}%</span>
        </div>
      `;

      currentAngle += angle;
    });

    container.innerHTML = `
      <div class="chart-wrapper" style="display: flex; align-items: center; justify-content: center; gap: 20px; flex-wrap: wrap;">
        <svg viewBox="0 0 ${size} ${size}" class="pie-chart" style="max-width: ${size}px; width: 100%;">
          ${paths}
        </svg>
        <div class="chart-legends" style="display: flex; flex-direction: column; gap: 8px;">
          ${legends}
        </div>
      </div>
    `;
  }

  /**
   * ✅ NEW: Render SVG Bar Chart
   */
  renderBarChart(container, chart) {
    const data = chart.data || this.results[chart.dataKey] || [];
    const width = chart.width || 400;
    const height = chart.height || 200;
    const padding = 40;
    const barWidth = (width - padding * 2) / data.length - 10;

    const maxValue = Math.max(...data.map((d) => d.value));

    let bars = "";
    let legends = "";

    data.forEach((item, index) => {
      const barHeight = (item.value / maxValue) * (height - padding * 2);
      const x = padding + index * ((width - padding * 2) / data.length) + 5;
      const y = height - padding - barHeight;
      const color = item.color || this.getDefaultColor(index);

      bars += `
        <rect x="${x}" y="${y}" width="${barWidth}" height="${barHeight}" fill="${color}" rx="4">
          <title>${item.label}: ${item.value}</title>
        </rect>
        <text x="${x + barWidth / 2}" y="${height - padding + 20}" text-anchor="middle" class="chart-bar-label">${item.label}</text>
      `;

      const label =
        item.i18nKey && window.i18n ? window.i18n.t(item.i18nKey) : item.label;
      legends += `
        <div class="chart-legend-item">
          <span class="chart-legend-color" style="background: ${color}"></span>
          <span class="chart-legend-label">${label}: ${item.value}</span>
        </div>
      `;
    });

    container.innerHTML = `
      <div class="chart-wrapper">
        <svg viewBox="0 0 ${width} ${height}" class="bar-chart">
          ${bars}
        </svg>
        ${chart.showLegends ? `<div class="chart-legends">${legends}</div>` : ""}
      </div>
    `;
  }

  /**
   * ✅ NEW: Render SVG Gauge Chart
   */
  renderGaugeChart(container, chart) {
    const value = this.results[chart.valueKey] || 0;
    const min = chart.min || 0;
    const max = chart.max || 100;
    const size = chart.size || 200;

    const percentage = Math.min(Math.max((value - min) / (max - min), 0), 1);
    const angle = -180 + percentage * 180; // -180 to 0 degrees

    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size / 2 - 20;

    // Gauge background (gray arc)
    const bgPath = this.createArcPath(centerX, centerY, radius, -180, 0);

    // Gauge value (colored arc)
    const valuePath = this.createArcPath(centerX, centerY, radius, -180, angle);

    // Needle position
    const needleAngle = ((angle + 180) * Math.PI) / 180;
    const needleLength = radius - 10;
    const needleX = centerX + needleLength * Math.cos(needleAngle);
    const needleY = centerY + needleLength * Math.sin(needleAngle);

    container.innerHTML = `
      <div class="chart-wrapper">
        <svg viewBox="0 0 ${size} ${size}" class="gauge-chart">
          <!-- Background Arc -->
          <path d="${bgPath}" fill="none" stroke="#e5e7eb" stroke-width="20" stroke-linecap="round"/>
          
          <!-- Value Arc -->
          <path d="${valuePath}" fill="none" stroke="url(#gaugeGradient)" stroke-width="20" stroke-linecap="round"/>
          
          <!-- Gradient Definition -->
          <defs>
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style="stop-color:#10b981;stop-opacity:1" />
              <stop offset="50%" style="stop-color:#f59e0b;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#ef4444;stop-opacity:1" />
            </linearGradient>
          </defs>
          
          <!-- Needle -->
          <line x1="${centerX}" y1="${centerY}" x2="${needleX}" y2="${needleY}" stroke="#374151" stroke-width="3" stroke-linecap="round"/>
          <circle cx="${centerX}" cy="${centerY}" r="8" fill="#374151"/>
          
          <!-- Value Text -->
          <text x="${centerX}" y="${centerY + 30}" text-anchor="middle" class="chart-gauge-value">${value}</text>
          
          <!-- Min/Max Labels -->
          <text x="${padding}" y="${size - padding}" text-anchor="start" class="chart-gauge-label">${min}</text>
          <text x="${size - padding}" y="${size - padding}" text-anchor="end" class="chart-gauge-label">${max}</text>
        </svg>
      </div>
    `;
  }

  /**
   * Helper: Create SVG arc path
   */
  createArcPath(cx, cy, r, startAngle, endAngle) {
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    const x1 = cx + r * Math.cos(startRad);
    const y1 = cy + r * Math.sin(startRad);
    const x2 = cx + r * Math.cos(endRad);
    const y2 = cy + r * Math.sin(endRad);

    const largeArcFlag = Math.abs(endAngle - startAngle) > 180 ? 1 : 0;

    return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArcFlag} 1 ${x2} ${y2}`;
  }

  /**
   * Helper: Get default color
   */
  getDefaultColor(index) {
    const colors = [
      "#8b5cf6", // Purple
      "#06b6d4", // Cyan
      "#ec4899", // Pink
      "#10b981", // Green
      "#f59e0b", // Amber
      "#ef4444", // Red
    ];
    return colors[index % colors.length];
  }

  /**
   * Render table
   */
  renderTable(table) {
    const title =
      table.i18nKey && window.i18n
        ? window.i18n.t(table.i18nKey)
        : table.title || "Table";

    let html = `
      <div class="table-container">
        <h4>${title}</h4>
        <table class="data-table">
          <thead>
            <tr>
              ${table.columns
                .map(
                  (col) =>
                    `<th>${
                      col.i18nKey && window.i18n
                        ? window.i18n.t(col.i18nKey)
                        : col
                    }</th>`,
                )
                .join("")}
            </tr>
          </thead>
          <tbody>
    `;

    table.data.forEach((row) => {
      html += `<tr>${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`;
    });

    html += `
          </tbody>
        </table>
      </div>
    `;

    return html;
  }

  /**
   * Export results as PDF
   */
  exportPDF() {
    // ✅ NEW: Better PDF export using browser print
    const printWindow = window.open("", "_blank");
    const title = this.config.title || "Calculator Results";
    const date = new Date().toLocaleString();

    let resultsHTML = "";
    this.config.results.forEach((result) => {
      const element = document.getElementById(`res-${result.id}`);
      if (element) {
        const label =
          result.i18nKey && window.i18n
            ? window.i18n.t(result.i18nKey)
            : result.label;
        resultsHTML += `
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">${label}</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${element.textContent}</td>
          </tr>
        `;
      }
    });

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #8b5cf6; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th { background: #8b5cf6; color: white; padding: 10px; text-align: left; }
          .meta { color: #666; margin-bottom: 20px; }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        <div class="meta">Generated on: ${date}</div>
        <table>
          ${resultsHTML}
        </table>
        <script>window.onload = function() { window.print(); window.close(); }</script>
      </body>
      </html>
    `);

    printWindow.document.close();
  }

  /**
   * Share results
   */
  shareResults() {
    const shareData = {
      title: this.config.title || "Calculator Results",
      text: this.getResultsText(),
      url: this.getShareableURL(),
    };

    if (navigator.share) {
      navigator.share(shareData);
    } else {
      this.copyToClipboard();
    }
  }

  /**
   * Copy results to clipboard
   */
  copyToClipboard() {
    const text = this.getResultsText();
    navigator.clipboard
      .writeText(text)
      .then(() => {
        // ✅ NEW: Better user feedback
        this.showNotification("Results copied to clipboard!");
      })
      .catch(() => {
        this.showError("Failed to copy to clipboard");
      });
  }

  /**
   * Show notification
   */
  showNotification(message) {
    const notification = document.createElement("div");
    notification.className = "calc-notification";
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: var(--color-success);
      color: white;
      padding: 12px 24px;
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-lg);
      z-index: 10000;
      animation: slideIn 0.3s ease-out;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = "slideOut 0.3s ease-out";
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  /**
   * Get shareable URL with results
   */
  getShareableURL() {
    const params = new URLSearchParams();
    Object.keys(this.values).forEach((key) => {
      params.set(key, this.values[key]);
    });
    return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
  }

  /**
   * Get results as text
   */
  getResultsText() {
    let text = `${this.config.title || "Calculator"} Results\n\n`;
    text += `Generated: ${new Date().toLocaleString()}\n\n`;

    this.config.results.forEach((result) => {
      const element = document.getElementById(`res-${result.id}`);
      if (element) {
        const label =
          result.i18nKey && window.i18n
            ? window.i18n.t(result.i18nKey)
            : result.label;
        text += `${label}: ${element.textContent}\n`;
      }
    });

    return text;
  }

  /**
   * Reset calculator
   */
  reset() {
    this.config.inputs.forEach((input) => {
      const element = document.getElementById(input.id);
      if (element) {
        if (input.type === "checkbox" || input.type === "toggle") {
          element.checked = input.defaultValue || false;
        } else {
          element.value = input.defaultValue || "";
        }
      }
    });

    this.clearResults();
    this.clearError();
    this.values = {};
  }

  /**
   * Clear all results
   */
  clearResults() {
    this.config.results.forEach((result) => {
      const element = document.getElementById(`res-${result.id}`);
      if (element) {
        element.textContent = "--";
      }
    });
  }

  // ==========================================
  // 6. HISTORY MANAGEMENT
  // ==========================================

  /**
   * Save calculation to history
   */
  saveToHistory() {
    if (!this.config.features?.saveHistory) return;

    const historyItem = {
      timestamp: new Date().toISOString(),
      values: { ...this.values },
      results: { ...this.results },
      result: this.getResultsText().split("\n")[2] || "", // First result line
    };

    this.history.unshift(historyItem);
    if (this.history.length > this.maxHistory) {
      this.history.pop();
    }

    // Save to localStorage
    const storageKey = `calc_history_${this.config.id || "default"}`;
    localStorage.setItem(storageKey, JSON.stringify(this.history));

    // Re-render history section
    this.renderHistorySection();
  }

  /**
   * Load history from localStorage
   */
  loadHistory() {
    const storageKey = `calc_history_${this.config.id || "default"}`;
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        this.history = JSON.parse(saved);
      } catch (e) {
        console.error("Failed to load history:", e);
        this.history = [];
      }
    }
  }

  /**
   * Load calculation from history
   */
  loadFromHistory(index) {
    if (index < 0 || index >= this.history.length) return;

    const item = this.history[index];
    this.values = { ...item.values };

    // Restore input values
    Object.keys(this.values).forEach((key) => {
      const element = document.getElementById(key);
      if (element) {
        element.value = this.values[key];
      }
    });

    // Recalculate
    this.calculate();
  }

  /**
   * Render history section (dynamic)
   */
  renderHistorySection() {
    const historyContainer = this.container.querySelector(".calc-history");
    if (historyContainer) {
      historyContainer.outerHTML = this.renderHistory();
      this.attachHistoryEvents();
    }
  }

  // ==========================================
  // 7. SEO INTEGRATION
  // ==========================================

  /**
   * Inject JSON-LD schema for SEO
   */
  injectSchema() {
    if (!this.config.seo) return;

    const schema = {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: this.config.title || "Calculator",
      applicationCategory: this.config.seo.category || "FinanceApplication",
      operatingSystem: "Web",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      description: this.config.seo.description || "",
    };

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);
  }
}

// ==========================================
// GLOBAL FUNCTION FOR EASY USAGE
// ==========================================

/**
 * Build calculator - global function
 * @param {string} containerId - Container element ID
 * @param {Object} config - Calculator configuration
 * @returns {UniversalCalculator}
 */
function buildCalculator(containerId, config) {
  return new UniversalCalculator(containerId, config);
}

// Export to global scope
window.UniversalCalculator = UniversalCalculator;
window.buildCalculator = buildCalculator;

console.log("✅ Universal Calculator Engine v3.0 Loaded Successfully!");
console.log(
  "🚀 Features: Multi-language, Global Units, SVG Charts, History, Conditional Inputs, PDF Export",
);

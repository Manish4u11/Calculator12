/* ============================================
   Calculator12.com - Master Calculator Engine
   ============================================
   Ye file poore project ka core calculation brain hai.
   Har calculator isi engine ka use karega inputs lene,
   validate karne, aur results dikhane ke liye.
   ============================================ */

class CalculatorEngine {
  constructor() {
    this.inputs = {};
    this.resultElement = null;
    this.errorElement = null;
  }

  // ==========================================
  // 1. INPUT HANDLING & VALIDATION
  // ==========================================

  /**
   * Input field se value leta hai aur number me convert karta hai
   * @param {string} id - Input field ka ID
   * @param {number} defaultValue - Agar field khali ho to default value
   * @returns {number}
   */
  getInputValue(id, defaultValue = 0) {
    const element = document.getElementById(id);
    if (!element) {
      console.warn(`Input element with ID '${id}' not found.`);
      return defaultValue;
    }

    let value = parseFloat(element.value);

    // Agar value NaN (Not a Number) ya khali hai, to default return karo
    if (isNaN(value) || element.value.trim() === "") {
      return defaultValue;
    }

    return value;
  }

  /**
   * Multiple inputs ko ek saath object me store karta hai
   * @param {Object} config - { id: defaultValue }
   * @returns {Object}
   */
  getAllInputs(config) {
    const values = {};
    for (const [id, defaultValue] of Object.entries(config)) {
      values[id] = this.getInputValue(id, defaultValue);
    }
    this.inputs = values;
    return values;
  }

  /**
   * Input validation: Check karta hai ki value positive hai ya nahi
   */
  validatePositive(id, value) {
    if (value < 0) {
      this.showError(`${id} cannot be negative.`);
      return false;
    }
    return true;
  }

  // ==========================================
  // 2. RESULT & ERROR DISPLAY
  // ==========================================

  /**
   * Result element me formatted number dikhata hai
   * @param {string} elementId - Result div/span ka ID
   * @param {number} value - Calculated value
   * @param {Object} options - Formatting options (currency, decimals, etc.)
   */
  showResult(elementId, value, options = {}) {
    const element = document.getElementById(elementId);
    if (!element) return;

    // Pehle koi purana error hatayein
    this.clearError();

    // Number formatting
    const formattedValue = this.formatNumber(value, options);

    // Animation ke liye class add karein
    element.classList.add("result-updated");
    element.textContent = formattedValue;

    // 500ms baad animation class hata dein
    setTimeout(() => {
      element.classList.remove("result-updated");
    }, 500);
  }

  /**
   * Error message dikhata hai
   */
  showError(message) {
    const errorElement = document.getElementById("calc-error");
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.style.display = "block";
      errorElement.classList.add("show");
    }
    console.error("Calculation Error:", message);
  }

  /**
   * Error message ko chhupata hai
   */
  clearError() {
    const errorElement = document.getElementById("calc-error");
    if (errorElement) {
      errorElement.textContent = "";
      errorElement.style.display = "none";
      errorElement.classList.remove("show");
    }
  }

  // ==========================================
  // 3. FORMATTING UTILITIES
  // ==========================================

  /**
   * Number ko beautifully format karta hai (e.g., 100000 -> 1,00,000 ya $100,000)
   */
  formatNumber(value, options = {}) {
    const {
      decimals = 2,
      currency = false,
      currencySymbol = "",
      locale = "en-IN", // Indian numbering system by default
    } = options;

    if (isNaN(value) || !isFinite(value)) {
      return "0";
    }

    // Rounding
    const roundedValue = Number(value.toFixed(decimals));

    // Formatting
    let formatted = roundedValue.toLocaleString(locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });

    // Currency symbol add karna
    if (currency && currencySymbol) {
      formatted = `${currencySymbol}${formatted}`;
    }

    return formatted;
  }

  /**
   * Percentage format karta hai
   */
  formatPercentage(value, decimals = 2) {
    return `${this.formatNumber(value, { decimals })}%`;
  }

  // ==========================================
  // 4. EVENT LISTENER HELPER
  // ==========================================

  /**
   * Kisi bhi input pe 'input' event lagata hai taaki real-time calculation ho
   * @param {string} inputId - Input ka ID
   * @param {Function} callback - Jab input change ho to kya function chale
   */
  onInputChange(inputId, callback) {
    const element = document.getElementById(inputId);
    if (element) {
      element.addEventListener("input", callback);
    }
  }

  /**
   * Calculate button pe click event lagata hai
   */
  onCalculateClick(buttonId, callback) {
    const button = document.getElementById(buttonId);
    if (button) {
      button.addEventListener("click", (e) => {
        e.preventDefault();
        callback();
      });
    }
  }
}

// Engine ko global scope me export karte hain taaki har calculator use kar sake
window.CalculatorEngine = CalculatorEngine;

console.log("✅ Calculator12 Master Engine Loaded Successfully!");

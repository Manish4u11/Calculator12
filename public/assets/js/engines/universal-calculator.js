/* ============================================
   Calculator12.com - Universal Calculator Builder Engine
   ============================================
   Ye engine kisi bhi calculator ko sirf ek "Config" object se 
   automatically generate kar deta hai.
   ============================================ */

class UniversalCalculator {
  constructor(containerId, config) {
    this.container = document.getElementById(containerId);
    this.config = config;
    this.values = {};

    if (this.container && this.config) {
      this.render();
      this.attachEvents();
    }
  }

  // 1. HTML Automatically Generate Karna
  render() {
    let html = `<div class="universal-calc-wrapper">`;

    // Custom HTML (Agar user ne koi extra content daala hai)
    if (this.config.customHTML) {
      html += this.config.customHTML;
    }

    // Inputs Generate Karna
    html += `<div class="calc-inputs-grid">`;
    this.config.inputs.forEach((input) => {
      html += `
        <div class="form-group">
          <label for="${input.id}">${input.label}</label>
          <input type="${input.type || "number"}" id="${input.id}" placeholder="${input.placeholder || "Enter value"}" step="${input.step || "any"}">
        </div>
      `;
    });
    html += `</div>`;

    // Calculate Button
    html += `<button id="uc-calculate-btn" class="btn btn-primary btn-block">Calculate ${this.config.title}</button>`;

    // Error Message Box
    html += `<div id="uc-error" class="error-message" style="display: none;"></div>`;

    // Results Area
    html += `<div class="calc-results-grid" id="uc-results-area">`;
    this.config.results.forEach((res) => {
      html += `
        <div class="result-item">
          <span class="result-item__label">${res.label}</span>
          <span class="result-item__value" id="res-${res.id}">--</span>
        </div>
      `;
    });
    html += `</div>`;

    // Custom Chart/Table Area (Advanced Feature Hook)
    if (this.config.showChart || this.config.showTable) {
      html += `<div id="uc-advanced-area" class="advanced-feature-area" style="margin-top: 20px;"></div>`;
    }

    html += `</div>`;
    this.container.innerHTML = html;
  }

  // 2. Events Attach Karna (Real-time + Button Click)
  attachEvents() {
    const btn = document.getElementById("uc-calculate-btn");
    const inputs = this.config.inputs.map((i) => document.getElementById(i.id));

    const runCalc = () => this.calculate();

    if (btn) btn.addEventListener("click", runCalc);

    inputs.forEach((input) => {
      if (input) input.addEventListener("input", runCalc);
    });
  }

  // 3. Calculation Logic Run Karna
  calculate() {
    // Values lena
    this.config.inputs.forEach((input) => {
      this.values[input.id] =
        parseFloat(document.getElementById(input.id).value) || 0;
    });

    // Validation (Agar config me hai)
    if (this.config.validate) {
      const error = this.config.validate(this.values);
      if (error) {
        this.showError(error);
        return;
      }
    }

    // Formula Run Karna
    try {
      const results = this.config.calculate(this.values);
      this.showResults(results);

      // Advanced Feature Hook (Charts/Tables)
      if (
        this.config.renderAdvanced &&
        (this.config.showChart || this.config.showTable)
      ) {
        this.config.renderAdvanced(
          results,
          this.values,
          document.getElementById("uc-advanced-area"),
        );
      }
    } catch (e) {
      this.showError("Calculation Error: " + e.message);
    }
  }

  // 4. Results Dikhana
  showResults(results) {
    document.getElementById("uc-error").style.display = "none";
    for (const [key, value] of Object.entries(results)) {
      const el = document.getElementById(`res-${key}`);
      if (el) {
        // Formatting (Currency, Percentage, ya Normal)
        let displayValue = value;
        if (typeof value === "number") {
          if (this.config.format === "currency") {
            displayValue =
              "₹ " +
              value.toLocaleString("en-IN", { maximumFractionDigits: 2 });
          } else if (this.config.format === "percent") {
            displayValue = value.toFixed(2) + "%";
          } else {
            displayValue = value.toLocaleString("en-IN", {
              maximumFractionDigits: 2,
            });
          }
        }
        el.textContent = displayValue;
        el.classList.add("result-updated");
        setTimeout(() => el.classList.remove("result-updated"), 500);
      }
    }
  }

  showError(msg) {
    const errBox = document.getElementById("uc-error");
    errBox.textContent = msg;
    errBox.style.display = "block";
  }
}

// Global function taaki har calculator ise easily use kar sake
function buildCalculator(containerId, config) {
  return new UniversalCalculator(containerId, config);
}

console.log("✅ Universal Calculator Engine Loaded!");

/* ============================================
   Calculator12.com - EMI Calculator Logic
   ============================================ */

document.addEventListener("DOMContentLoaded", () => {
  // Master Engine ko initialize karte hain
  const engine = new CalculatorEngine();

  // DOM Elements ko select karte hain
  const calculateBtn = document.getElementById("calculate-btn");
  const loanAmountInput = document.getElementById("loan-amount");
  const interestRateInput = document.getElementById("interest-rate");
  const loanTenureInput = document.getElementById("loan-tenure");
  const tenureTypeSelect = document.getElementById("tenure-type");

  // ==========================================
  // Main Calculation Function
  // ==========================================
  function calculateEMI() {
    // 1. Inputs lena
    const principal = engine.getInputValue("loan-amount");
    const annualRate = engine.getInputValue("interest-rate");
    let tenure = engine.getInputValue("loan-tenure");
    const tenureType = tenureTypeSelect.value;

    // 2. Validation
    if (principal <= 0 || annualRate <= 0 || tenure <= 0) {
      engine.showError("Please enter valid positive values for all fields.");
      return;
    }

    // 3. Tenure ko months me convert karna
    const months = tenureType === "years" ? tenure * 12 : tenure;

    // 4. Monthly Interest Rate nikalna (Annual Rate / 12 / 100)
    const monthlyRate = annualRate / 12 / 100;

    // 5. EMI Formula: [P x R x (1+R)^N] / [(1+R)^N - 1]
    const emi =
      (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
      (Math.pow(1 + monthlyRate, months) - 1);

    // 6. Total Interest aur Total Payment nikalna
    const totalPayment = emi * months;
    const totalInterest = totalPayment - principal;

    // 7. Results dikhana (Indian Currency Format me)
    engine.showResult("monthly-emi", emi, {
      currency: true,
      currencySymbol: "",
    });
    engine.showResult("total-interest", totalInterest, {
      currency: true,
      currencySymbol: "₹",
    });
    engine.showResult("total-payment", totalPayment, {
      currency: true,
      currencySymbol: "₹",
    });
  }

  // ==========================================
  // Event Listeners
  // ==========================================

  // Button click par calculate karna
  engine.onCalculateClick("calculate-btn", calculateEMI);

  // Real-time calculation (jab user input change kare)
  engine.onInputChange("loan-amount", calculateEMI);
  engine.onInputChange("interest-rate", calculateEMI);
  engine.onInputChange("loan-tenure", calculateEMI);
  tenureTypeSelect.addEventListener("change", calculateEMI);
});

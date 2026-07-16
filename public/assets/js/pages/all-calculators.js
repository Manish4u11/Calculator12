/* ============================================
   Calculator12.com - Master Calculators Data & Render Logic
   ============================================ */

// 1. Master Data (Aapki di hui poori 27 categories ki list)
const calculatorsData = [
  {
    category: "Financial Calculators",
    icon: "fa-coins",
    iconClass: "icon-finance",
    items: [
      "EMI Calculator",
      "Loan Calculator",
      "Home Loan Calculator",
      "Mortgage Calculator",
      "Personal Loan Calculator",
      "Car Loan Calculator",
      "Education (Student) Loan Calculator",
      "Business Loan Calculator",
      "Loan Affordability Calculator",
      "Loan Payoff Calculator",
      "Debt Payoff Calculator",
      "Refinance Calculator",
      "Interest Calculator",
      "Simple Interest Calculator",
      "Compound Interest Calculator",
      "Savings Calculator",
      "Investment Calculator",
      "SIP Calculator",
      "SWP Calculator",
      "Lumpsum Calculator",
      "Mutual Fund Calculator",
      "FD Calculator",
      "RD Calculator",
      "PPF Calculator",
      "EPF Calculator",
      "NPS Calculator",
      "Retirement Calculator",
      "Retirement Withdrawal Calculator",
      "Pension Calculator",
      "FIRE Calculator",
      "Inflation Calculator",
      "Future Value Calculator",
      "Present Value Calculator",
      "Time Value of Money Calculator",
      "CAGR Calculator",
      "ROI Calculator",
      "ROI Percentage Calculator",
      "IRR Calculator",
      "NPV Calculator",
      "Dividend Calculator",
      "Bond Calculator",
      "Yield Calculator",
      "Net Worth Calculator",
      "Credit Card Calculator",
      "APR Calculator",
      "APY Calculator",
      "Cash Flow Calculator",
      "Lease Calculator",
      "Insurance Calculator",
      "Currency Converter",
      "Exchange Rate Calculator",
    ],
  },
  {
    category: "Business & Tax Calculators",
    icon: "fa-chart-line",
    iconClass: "icon-finance",
    items: [
      "Profit Calculator",
      "Gross Profit Calculator",
      "Net Profit Calculator",
      "Margin Calculator",
      "Profit Margin Calculator",
      "Markup Calculator",
      "Break-even Calculator",
      "GST Calculator",
      "VAT Calculator",
      "Sales Tax Calculator",
      "Income Tax Calculator",
      "Tax Refund Calculator",
      "Import Duty Calculator",
      "Export Cost Calculator",
      "Payroll Calculator",
      "Salary Calculator",
      "Salary Hike Calculator",
      "Pay Raise Calculator",
      "Overtime Calculator",
      "Bonus Calculator",
      "Commission Calculator",
      "Freelance Rate Calculator",
      "Invoice Calculator",
      "Expense Calculator",
      "Budget Calculator",
      "Depreciation Calculator",
      "Business Valuation Calculator",
    ],
  },
  {
    category: "Math Calculators",
    icon: "fa-square-root-alt",
    iconClass: "icon-math",
    items: [
      "Percentage Calculator",
      "Percentage Increase Calculator",
      "Percentage Decrease Calculator",
      "Fraction Calculator",
      "Decimal Calculator",
      "Ratio Calculator",
      "Proportion Calculator",
      "Average Calculator",
      "Mean Calculator",
      "Median Calculator",
      "Mode Calculator",
      "Standard Deviation Calculator",
      "Variance Calculator",
      "Statistics Calculator",
      "Z Score Calculator",
      "Probability Calculator",
      "Permutation Calculator",
      "Combination Calculator",
      "Algebra Calculator",
      "Equation Solver",
      "Quadratic Equation Calculator",
      "Polynomial Calculator",
      "Scientific Calculator",
      "Matrix Calculator",
      "Matrix Inverse Calculator",
      "Determinant Calculator",
      "Vector Calculator",
      "Complex Number Calculator",
      "Log Calculator",
      "Exponent Calculator",
      "Power Calculator",
      "Root Calculator",
      "Square Root Calculator",
      "Cube Root Calculator",
      "LCM Calculator",
      "GCF / HCF Calculator",
      "Prime Number Calculator",
      "Factor Calculator",
      "Factorial Calculator",
      "Fibonacci Calculator",
      "Random Number Generator",
    ],
  },
  {
    category: "Geometry Calculators",
    icon: "fa-shapes",
    iconClass: "icon-math",
    items: [
      "Geometry Calculator",
      "Area Calculator",
      "Perimeter Calculator",
      "Volume Calculator",
      "Surface Area Calculator",
      "Circle Calculator",
      "Triangle Calculator",
      "Rectangle Calculator",
      "Cube Calculator",
      "Sphere Calculator",
      "Cylinder Calculator",
      "Cone Calculator",
      "Pythagorean Calculator",
      "Distance Calculator",
      "Midpoint Calculator",
      "Slope Calculator",
      "Coordinate Calculator",
    ],
  },
  {
    category: "Unit Converters",
    icon: "fa-arrows-rotate",
    iconClass: "icon-conversion",
    items: [
      "Length Converter",
      "Weight Converter",
      "Area Converter",
      "Volume Converter",
      "Temperature Converter",
      "Speed Converter",
      "Pressure Converter",
      "Force Converter",
      "Torque Converter",
      "Power Converter",
      "Energy Converter",
      "Fuel Economy Converter",
      "Density Converter",
      "Time Converter",
      "Data Storage Converter",
      "Frequency Converter",
      "Angle Converter",
      "Electric Current Converter",
      "Voltage Converter",
      "Resistance Converter",
      "Capacitance Converter",
      "Inductance Converter",
      "Flow Rate Converter",
      "Viscosity Converter",
      "CSS Unit Converter",
      "Color Converter",
      "Number Base Converter",
    ],
  },
  {
    category: "Date & Time Calculators",
    icon: "fa-calendar-check",
    iconClass: "icon-date",
    items: [
      "Age Calculator",
      "Age Difference Calculator",
      "Birthday Calculator",
      "Anniversary Calculator",
      "Date Difference Calculator",
      "Days Between Dates",
      "Business Days Calculator",
      "Working Days Calculator",
      "Week Number Calculator",
      "Month Calculator",
      "Year Calculator",
      "Countdown Calculator",
      "Time Duration Calculator",
      "Time Difference Calculator",
      "Hour Calculator",
      "Minute Calculator",
      "Stopwatch",
      "Timer",
      "Time Zone Converter",
      "Unix Timestamp Converter",
      "Leap Year Calculator",
    ],
  },
  {
    category: "Health & Fitness Calculators",
    icon: "fa-heart-pulse",
    iconClass: "icon-health",
    items: [
      "BMI Calculator",
      "BMR Calculator",
      "Body Fat Calculator",
      "Lean Body Mass Calculator",
      "Ideal Weight Calculator",
      "Healthy Weight Calculator",
      "Calorie Calculator",
      "Calories Burned Calculator",
      "Calories Per Day Calculator",
      "Water Intake Calculator",
      "Protein Intake Calculator",
      "Carbohydrate Intake Calculator",
      "Fat Intake Calculator",
      "Macro Calculator",
      "TDEE Calculator",
      "Heart Rate Calculator",
      "Target Heart Rate Calculator",
      "VO2 Max Calculator",
      "One Rep Max Calculator",
      "Waist-to-Hip Ratio Calculator",
      "Waist-to-Height Ratio Calculator",
      "Body Surface Area Calculator",
      "Blood Pressure Calculator",
      "Blood Sugar Calculator",
      "Cholesterol Ratio Calculator",
      "Diabetes Risk Calculator",
      "BAC Calculator",
      "Sleep Calculator",
      "Sleep Cycle Calculator",
    ],
  },
  {
    category: "Pregnancy & Baby",
    icon: "fa-baby",
    iconClass: "icon-health",
    items: [
      "Pregnancy Calculator",
      "Due Date Calculator",
      "Pregnancy Week Calculator",
      "Pregnancy Weight Calculator",
      "Ovulation Calculator",
      "Period Calculator",
      "Baby Growth Calculator",
      "Child Height Calculator",
      "Child Weight Calculator",
      "Baby Gender Predictor (Fun)",
    ],
  },
  {
    category: "Sports Calculators",
    icon: "fa-running",
    iconClass: "icon-health",
    items: [
      "Running Pace Calculator",
      "Marathon Pace Calculator",
      "Cycling Speed Calculator",
      "Swimming Pace Calculator",
      "Walking Pace Calculator",
      "Cricket Run Rate Calculator",
      "Cricket Strike Rate Calculator",
      "Heart Rate Zone Calculator",
      "BMI for Athletes",
    ],
  },
  {
    category: "Science Calculators",
    icon: "fa-flask",
    iconClass: "icon-math",
    items: [
      "Force Calculator",
      "Velocity Calculator",
      "Acceleration Calculator",
      "Momentum Calculator",
      "Work Calculator",
      "Energy Calculator",
      "Kinetic Energy Calculator",
      "Potential Energy Calculator",
      "Power Calculator",
      "Gravity Calculator",
      "Pressure Calculator",
      "Heat Calculator",
      "Mole Calculator",
      "Molarity Calculator",
      "Molecular Weight Calculator",
      "Density Calculator",
      "Gas Law Calculator",
      "Ideal Gas Calculator",
      "pH Calculator",
      "Dilution Calculator",
      "Reaction Yield Calculator",
      "Half-Life Calculator",
      "DNA Calculator",
      "Genetics Calculator",
    ],
  },
  {
    category: "Engineering Calculators",
    icon: "fa-cogs",
    iconClass: "icon-conversion",
    items: [
      "Beam Calculator",
      "Structural Load Calculator",
      "Steel Weight Calculator",
      "Pipe Flow Calculator",
      "Pipe Volume Calculator",
      "Wire Size Calculator",
      "Cable Size Calculator",
      "Voltage Drop Calculator",
      "Transformer Calculator",
      "Motor Calculator",
      "Gear Ratio Calculator",
      "Pulley Calculator",
      "Torque Calculator",
      "Bearing Life Calculator",
    ],
  },
  {
    category: "Construction Calculators",
    icon: "fa-hard-hat",
    iconClass: "icon-finance",
    items: [
      "Concrete Calculator",
      "Cement Calculator",
      "Brick Calculator",
      "Sand Calculator",
      "Tile Calculator",
      "Paint Calculator",
      "Flooring Calculator",
      "Roofing Calculator",
      "Gravel Calculator",
      "Asphalt Calculator",
      "Drywall Calculator",
      "Excavation Calculator",
      "Stair Calculator",
      "Fence Calculator",
      "Wall Calculator",
      "Foundation Calculator",
      "Wood Calculator",
    ],
  },
  {
    category: "Education Calculators",
    icon: "fa-graduation-cap",
    iconClass: "icon-education",
    items: [
      "GPA Calculator",
      "CGPA Calculator",
      "Grade Calculator",
      "Marks Calculator",
      "Exam Score Calculator",
      "Attendance Calculator",
      "Study Time Calculator",
      "Rank Calculator",
      "GPA Converter",
    ],
  },
  {
    category: "Internet & Technology",
    icon: "fa-wifi",
    iconClass: "icon-conversion",
    items: [
      "Internet Speed Calculator",
      "Download Time Calculator",
      "Upload Time Calculator",
      "Bandwidth Calculator",
      "Storage Calculator",
      "Screen Resolution Calculator",
      "Screen Size Calculator",
      "Aspect Ratio Calculator",
      "Pixel Density Calculator",
      "IP Subnet Calculator",
    ],
  },
  {
    category: "Developer Tools",
    icon: "fa-code",
    iconClass: "icon-math",
    items: [
      "JSON Formatter",
      "JSON Validator",
      "Base64 Encoder",
      "Base64 Decoder",
      "Hash Generator",
      "UUID Generator",
      "Regex Tester",
      "Binary Calculator",
      "Octal Calculator",
      "Hex Calculator",
    ],
  },
  {
    category: "AI & Productivity",
    icon: "fa-robot",
    iconClass: "icon-math",
    items: [
      "AI Token Calculator",
      "AI Cost Calculator",
      "Prompt Cost Calculator",
      "Prompt Length Calculator",
      "LLM Pricing Calculator",
      "API Cost Calculator",
      "GPT Cost Calculator",
      "AI Image Cost Calculator",
      "AI Video Cost Calculator",
      "GPU Cost Calculator",
      "Cloud Cost Calculator",
      "Cloud Storage Cost Calculator",
      "SaaS Pricing Calculator",
      "Subscription Cost Calculator",
      "Reading Time Calculator",
      "Writing Time Calculator",
      "Character Counter",
      "Word Counter",
      "Text Statistics Calculator",
      "Keyword Density Calculator",
      "Plagiarism Percentage Estimator",
    ],
  },
  {
    category: "SEO & Marketing",
    icon: "fa-bullhorn",
    iconClass: "icon-finance",
    items: [
      "CPM Calculator",
      "CPC Calculator",
      "CTR Calculator",
      "CAC Calculator",
      "CLV Calculator",
      "Email ROI Calculator",
      "ROAS Calculator",
      "Conversion Rate Calculator",
    ],
  },
  {
    category: "E-commerce Calculators",
    icon: "fa-shopping-cart",
    iconClass: "icon-finance",
    items: [
      "Amazon FBA Calculator",
      "Etsy Fee Calculator",
      "eBay Fee Calculator",
      "Shopify Profit Calculator",
      "Selling Price Calculator",
    ],
  },
  {
    category: "Crypto Calculators",
    icon: "fa-bitcoin",
    iconClass: "icon-finance",
    items: [
      "Bitcoin Profit Calculator",
      "Crypto Profit Calculator",
      "Mining Calculator",
      "Staking Calculator",
      "Gas Fee Calculator",
      "DCA Calculator",
    ],
  },
  {
    category: "Real Estate",
    icon: "fa-home",
    iconClass: "icon-finance",
    items: [
      "Property Value Calculator",
      "Property Tax Calculator",
      "Rent Calculator",
      "Rental Yield Calculator",
      "Closing Cost Calculator",
      "Stamp Duty Calculator",
    ],
  },
  {
    category: "Automobile",
    icon: "fa-car",
    iconClass: "icon-conversion",
    items: [
      "Mileage Calculator",
      "Fuel Cost Calculator",
      "Fuel Consumption Calculator",
      "EV Charging Cost Calculator",
      "Car Depreciation Calculator",
      "Road Trip Cost Calculator",
    ],
  },
  {
    category: "Travel",
    icon: "fa-plane",
    iconClass: "icon-conversion",
    items: [
      "Trip Cost Calculator",
      "Travel Budget Calculator",
      "Jet Lag Calculator",
    ],
  },
  {
    category: "Home Calculators",
    icon: "fa-house-chimney",
    iconClass: "icon-finance",
    items: [
      "Electricity Bill Calculator",
      "Water Bill Calculator",
      "AC Running Cost Calculator",
      "Solar Panel Calculator",
      "Appliance Cost Calculator",
    ],
  },
  {
    category: "Food & Cooking",
    icon: "fa-utensils",
    iconClass: "icon-health",
    items: [
      "Recipe Converter",
      "Cooking Converter",
      "Coffee Ratio Calculator",
      "Baking Calculator",
      "Meat Temperature Calculator",
    ],
  },
  {
    category: "Pets",
    icon: "fa-paw",
    iconClass: "icon-health",
    items: [
      "Dog Age Calculator",
      "Cat Age Calculator",
      "Pet BMI Calculator",
      "Dog Pregnancy Calculator",
      "Pet Food Calculator",
    ],
  },
  {
    category: "Lifestyle & Astrology",
    icon: "fa-star",
    iconClass: "icon-education",
    items: [
      "Love Calculator",
      "Love Percentage Calculator",
      "Zodiac Calculator",
      "Zodiac Sign Calculator",
      "Chinese Zodiac Calculator",
      "Name Numerology Calculator",
      "Numerology Calculator",
      "Lucky Number Calculator",
      "Life Path Calculator",
      "Moon Phase Calculator",
      "Sunrise Sunset Calculator",
      "Biorhythm Calculator",
      "Age on Other Planets Calculator",
      "Alien Age Calculator",
      "Moon Age Calculator",
      "Planet Age Calculator",
    ],
  },
  {
    category: "Fun Tools",
    icon: "fa-dice",
    iconClass: "icon-math",
    items: [
      "Dice Roller",
      "Coin Flip",
      "Random Name Picker",
      "Random Password Generator",
      "Death Clock (Entertainment)",
    ],
  },
];

// 2. Render Function (HTML generate karta hai)
function renderCalculators(data) {
  const container = document.getElementById("calculators-container");
  const loadingText = document.getElementById("loading-text");

  if (!container) return;

  container.innerHTML = ""; // Purana clear karein

  data.forEach((cat) => {
    const categoryDiv = document.createElement("div");
    categoryDiv.className = "related-category-simple";
    categoryDiv.dataset.category = cat.category.toLowerCase();

    let listItems = "";
    cat.items.forEach((item) => {
      // EMI Calculator ko actual link dena, baaki ko '#' (baad me update honge)
      const link =
        item === "EMI Calculator"
          ? "calculators/finance/emi-calculator.html"
          : "#";
      listItems += `<li><a href="${link}">${item}</a></li>`;
    });

    categoryDiv.innerHTML = `
      <div class="related-category-simple__icon ${cat.iconClass}">
        <i class="fas ${cat.icon}"></i>
      </div>
      <h3 class="related-category-simple__title">${cat.category}</h3>
      <ul class="related-category-simple__list">
        ${listItems}
      </ul>
    `;

    container.appendChild(categoryDiv);
  });

  if (loadingText) loadingText.style.display = "none";
}

// 3. Search Filter Function
function setupSearch() {
  const searchInput = document.getElementById("calc-search");
  if (!searchInput) return;

  searchInput.addEventListener("input", (e) => {
    const searchTerm = e.target.value.toLowerCase().trim();
    const categories = document.querySelectorAll(".related-category-simple");

    categories.forEach((category) => {
      const links = category.querySelectorAll(
        ".related-category-simple__list a",
      );
      let hasVisibleLink = false;

      links.forEach((link) => {
        const text = link.textContent.toLowerCase();
        if (text.includes(searchTerm)) {
          link.parentElement.style.display = "block";
          hasVisibleLink = true;
        } else {
          link.parentElement.style.display = "none";
        }
      });

      category.style.display = hasVisibleLink ? "block" : "none";
    });
  });
}

// 4. Page load hone par run karein
document.addEventListener("DOMContentLoaded", () => {
  renderCalculators(calculatorsData);
  setupSearch();
});

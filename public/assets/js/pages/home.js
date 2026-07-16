/* ============================================
   Calculator12.com - Home Page Functionality
   ============================================ */

document.addEventListener("DOMContentLoaded", () => {
  console.log("Home page module loaded");

  // ==========================================
  // FAQ Accordion Logic
  // ==========================================
  const faqItems = document.querySelectorAll(".faq-item");

  faqItems.forEach((item) => {
    const header = item.querySelector(".faq-item__header");

    if (header) {
      header.addEventListener("click", () => {
        // Check if current item is already active
        const isActive = item.classList.contains("active");

        // Close all other open FAQ items (Accordion behavior)
        faqItems.forEach((otherItem) => {
          otherItem.classList.remove("active");
          const otherHeader = otherItem.querySelector(".faq-item__header");
          if (otherHeader) {
            otherHeader.setAttribute("aria-expanded", "false");
          }
        });

        // If it wasn't active before, open it now
        if (!isActive) {
          item.classList.add("active");
          header.setAttribute("aria-expanded", "true");
        }
      });
    }
  });

  // ==========================================
  // Newsletter Form Prevent Default (Demo)
  // ==========================================
  const newsletterForm = document.querySelector(".newsletter__form");
  if (newsletterForm) {
    newsletterForm.addEventListener("submit", (e) => {
      e.preventDefault();
      alert("Thank you for subscribing! (Demo only)");
      newsletterForm.reset();
    });
  }
});

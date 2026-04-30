/* ══════════════════════════════════════════════════════
   IRONFORGE GYM — script.js
   Features:
   - Sticky navbar scroll behaviour
   - Mobile nav toggle
   - Scroll reveal animations
   - Modal open / close
   - Form validation
   - WhatsApp booking redirect
   ══════════════════════════════════════════════════════ */

/* ──────────────────────────────
   CONFIG — Change phone number here
   Format: country code + number, no "+" sign, no spaces
   ────────────────────────────── */
const WHATSAPP_NUMBER = "923454105434"; // ← REPLACE with your real number


/* ══════════════════════════════
   STICKY NAVBAR
   Adds .scrolled class when user scrolls past 60px
══════════════════════════════ */
(function initNavbar() {
  const navbar = document.getElementById("navbar");
  if (!navbar) return;

  function onScroll() {
    if (window.scrollY > 60) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll(); // run once on load in case page loads mid-scroll
})();


/* ══════════════════════════════
   MOBILE NAV TOGGLE
   Toggles the side-drawer navigation on small screens
══════════════════════════════ */
(function initMobileNav() {
  const toggle  = document.getElementById("navToggle");
  const navLinks = document.getElementById("navLinks");
  if (!toggle || !navLinks) return;

  // Open / close drawer
  toggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");
    toggle.classList.toggle("open", isOpen);
    toggle.setAttribute("aria-expanded", isOpen);
    // Prevent body scroll when drawer is open
    document.body.style.overflow = isOpen ? "hidden" : "";
  });

  // Close drawer when any link is clicked
  navLinks.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("open");
      toggle.classList.remove("open");
      toggle.setAttribute("aria-expanded", false);
      document.body.style.overflow = "";
    });
  });
})();


/* ══════════════════════════════
   SCROLL REVEAL
   Uses IntersectionObserver to animate elements
   into view as the user scrolls.
══════════════════════════════ */
(function initScrollReveal() {
  // Add .reveal class to target elements
  const targets = [
    ".about-grid",
    ".trainer-card",
    ".plan-card",
    ".gallery-item",
    ".contact-grid",
    ".section-header",
  ];

  targets.forEach(selector => {
    document.querySelectorAll(selector).forEach((el, i) => {
      el.classList.add("reveal");
      // Stagger delay for sibling elements (cards in a grid)
      if (i % 4 === 1) el.classList.add("reveal-delay-1");
      if (i % 4 === 2) el.classList.add("reveal-delay-2");
      if (i % 4 === 3) el.classList.add("reveal-delay-3");
    });
  });

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target); // animate once only
        }
      });
    },
    { threshold: 0.12 }
  );

  document.querySelectorAll(".reveal").forEach(el => observer.observe(el));
})();


/* ══════════════════════════════
   MODAL SYSTEM
   Opens when user clicks a "Select Plan" button.
   Closes on X button, Escape key, or outside click.
══════════════════════════════ */
const modalOverlay = document.getElementById("modalOverlay");
const modal        = document.getElementById("modal");
const modalClose   = document.getElementById("modalClose");
const fieldPlan    = document.getElementById("fieldPlan");

/**
 * openModal(planName)
 * Shows the booking modal and pre-fills the selected plan.
 * @param {string} planName - e.g. "Standard — PKR 6,500/month"
 */
function openModal(planName) {
  // Auto-fill the plan field
  if (fieldPlan) fieldPlan.value = planName || "";

  // Show overlay + trigger CSS transition
  modalOverlay.classList.add("active");
  document.body.style.overflow = "hidden"; // prevent background scroll

  // Focus first input for accessibility
  setTimeout(() => {
    const firstInput = modal.querySelector("input:not([readonly])");
    if (firstInput) firstInput.focus();
  }, 350);
}

/**
 * closeModal()
 * Hides the booking modal and resets validation state.
 */
function closeModal() {
  modalOverlay.classList.remove("active");
  document.body.style.overflow = "";
  clearValidation();
}

// X button
if (modalClose) {
  modalClose.addEventListener("click", closeModal);
}

// Click outside the modal box to close
if (modalOverlay) {
  modalOverlay.addEventListener("click", (e) => {
    // Only close if the click was directly on the overlay (not the modal itself)
    if (e.target === modalOverlay) closeModal();
  });
}

// Escape key to close
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && modalOverlay.classList.contains("active")) {
    closeModal();
  }
});

// Wire up all "Select Plan" buttons
document.querySelectorAll(".plan-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const planName = btn.getAttribute("data-plan") || "Not specified";
    openModal(planName);
  });
});


/* ══════════════════════════════
   FORM VALIDATION
   Checks required fields before generating
   the WhatsApp message.
══════════════════════════════ */

/**
 * validateField(inputEl, errorId, customCheck)
 * Marks a field as valid or invalid.
 * @param {HTMLElement} inputEl     - The input / select element
 * @param {string}      errorId     - ID of the <span> error message
 * @param {Function}    [customCheck] - Optional extra validation fn → returns bool
 * @returns {boolean}
 */
function validateField(inputEl, errorId, customCheck) {
  const group = inputEl.closest(".form-group");
  const errEl = document.getElementById(errorId);
  let valid = inputEl.value.trim() !== "";

  // Extra custom check if provided
  if (valid && customCheck) {
    valid = customCheck(inputEl.value.trim());
  }

  group.classList.toggle("has-error", !valid);
  if (errEl) errEl.style.display = valid ? "none" : "block";
  return valid;
}

/** Remove all error states from the form */
function clearValidation() {
  document.querySelectorAll(".form-group.has-error").forEach(g => {
    g.classList.remove("has-error");
  });
}

/**
 * validateForm()
 * Runs all field validations and returns true only if all pass.
 * @returns {boolean}
 */
function validateForm() {
  const nameEl   = document.getElementById("fieldName");
  const phoneEl  = document.getElementById("fieldPhone");
  const ageEl    = document.getElementById("fieldAge");
  const genderEl = document.getElementById("fieldGender");

  const nameOk   = validateField(nameEl,   "errName",   v => v.length >= 2);
  const phoneOk  = validateField(phoneEl,  "errPhone",  v => /^[\d\s\+\-\(\)]{7,15}$/.test(v));
  const ageOk    = validateField(ageEl,    "errAge",    v => { const n = parseInt(v); return !isNaN(n) && n >= 10 && n <= 100; });
  const genderOk = validateField(genderEl, "errGender");

  return nameOk && phoneOk && ageOk && genderOk;
}

// Live validation — clear error as user types/changes
["fieldName", "fieldPhone", "fieldAge", "fieldGender"].forEach(id => {
  const el = document.getElementById(id);
  if (!el) return;
  el.addEventListener("input",  () => el.closest(".form-group").classList.remove("has-error"));
  el.addEventListener("change", () => el.closest(".form-group").classList.remove("has-error"));
});


/* ══════════════════════════════
   WHATSAPP BOOKING
   Collects form data → builds a formatted message
   → redirects to wa.me deep link.
══════════════════════════════ */
const bookingForm = document.getElementById("bookingForm");

if (bookingForm) {
  bookingForm.addEventListener("submit", (e) => {
    e.preventDefault(); // prevent default browser submission

    // Run validation — stop if any field is invalid
    if (!validateForm()) return;

    // ── Collect values ──
    const name    = document.getElementById("fieldName").value.trim();
    const phone   = document.getElementById("fieldPhone").value.trim();
    const age     = document.getElementById("fieldAge").value.trim();
    const gender  = document.getElementById("fieldGender").value.trim();
    const plan    = document.getElementById("fieldPlan").value.trim() || "Not specified";
    const message = document.getElementById("fieldMessage").value.trim() || "No additional message";

    /* ── Build formatted WhatsApp message ──
       Exactly as specified in the requirements.
       Each line is kept intentional for clarity.
    */
    const waMessage =
`Hello, I want to join your *GYM*.

*Name*: ${name}
*Phone*: ${phone}
*Age*: ${age}
*Gender*: ${gender}
*Selected Plan*: ${plan}
*Message*: I need this type of *website* for my *business*😊`;

    // Encode message for URL (encodeURIComponent handles spaces, newlines, etc.)
    const encodedMessage = encodeURIComponent(waMessage);

    // Build final WhatsApp deep link
    const waURL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;

    // ── Redirect user to WhatsApp ──
    window.open(waURL, "_blank", "noopener,noreferrer");

    // Close modal after redirect
    closeModal();

    // Reset form fields
    bookingForm.reset();
  });
}


/* ══════════════════════════════
   SMOOTH SCROLL FALLBACK
   For browsers that don't support CSS scroll-behavior.
══════════════════════════════ */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener("click", function (e) {
    const target = document.querySelector(this.getAttribute("href"));
    if (!target) return;
    e.preventDefault();
    const navHeight = document.getElementById("navbar")?.offsetHeight || 70;
    const offsetTop = target.getBoundingClientRect().top + window.scrollY - navHeight;
    window.scrollTo({ top: offsetTop, behavior: "smooth" });
  });
});

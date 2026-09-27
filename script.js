// ============ Header scroll state ============
const header = document.getElementById("siteHeader");
const onScroll = () => {
  header.classList.toggle("is-scrolled", window.scrollY > 12);
};
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

// ============ Mobile nav toggle ============
const navToggle = document.getElementById("navToggle");
const navLinks = document.getElementById("navLinks");

navToggle.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("is-open");
  navToggle.setAttribute("aria-expanded", String(isOpen));
});

navLinks.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
  });
});

// ============ Scroll reveal ============
const revealTargets = document.querySelectorAll(".reveal, .reveal-stagger");

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        if (entry.target.classList.contains("reveal-stagger")) {
          Array.from(entry.target.children).forEach((child, i) => {
            child.style.setProperty("--stagger-index", i);
          });
        }
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
);

revealTargets.forEach((el) => revealObserver.observe(el));

// ============ Animated stat counters ============
const counters = document.querySelectorAll(".counter");

const animateCounter = (el) => {
  const target = parseInt(el.dataset.target, 10) || 0;
  const prefix = el.dataset.prefix || "";
  const suffix = el.dataset.suffix || "";
  const duration = 1400;
  const start = performance.now();

  const tick = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = Math.round(eased * target);
    el.textContent = `${prefix}${value}${suffix}`;
    if (progress < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
};

const counterObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.5 }
);

counters.forEach((el) => counterObserver.observe(el));

// ============ Donation amount selector ============
const amountRow = document.getElementById("amountRow");
const customAmount = document.getElementById("customAmount");
const donateForm = document.getElementById("donateForm");
const donateFeedback = document.getElementById("donateFeedback");

let selectedAmount = 50;

amountRow.addEventListener("click", (e) => {
  const btn = e.target.closest(".amount-btn");
  if (!btn) return;
  amountRow.querySelectorAll(".amount-btn").forEach((b) => b.classList.remove("active"));
  btn.classList.add("active");
  selectedAmount = Number(btn.dataset.amount);
  customAmount.value = "";
});

customAmount.addEventListener("input", () => {
  if (customAmount.value) {
    amountRow.querySelectorAll(".amount-btn").forEach((b) => b.classList.remove("active"));
    selectedAmount = Number(customAmount.value);
  }
});

donateForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const amount = customAmount.value ? Number(customAmount.value) : selectedAmount;
  donateFeedback.textContent = `Thank you! A $${amount} gift makes a real difference, payment processing isn't connected yet on this preview.`;
  donateFeedback.classList.add("visible");
});

// ============ Newsletter form (UI only) ============
const newsletterForm = document.getElementById("newsletterForm");
const newsletterFeedback = document.getElementById("newsletterFeedback");

newsletterForm.addEventListener("submit", (e) => {
  e.preventDefault();
  newsletterForm.reset();
  newsletterFeedback.textContent = "Thanks for signing up! (Connect an email provider to make this live.)";
  newsletterFeedback.classList.add("visible");
});

// ============ Contact form (UI only) ============
const contactForm = document.getElementById("contactForm");
const contactFeedback = document.getElementById("contactFeedback");

contactForm.addEventListener("submit", (e) => {
  e.preventDefault();
  contactForm.reset();
  contactFeedback.textContent = "Thanks for reaching out! We'll get back to you soon. (Connect this form to an email service to make it live.)";
  contactFeedback.classList.add("visible");
});

// ============ Footer year ============
document.getElementById("year").textContent = new Date().getFullYear();

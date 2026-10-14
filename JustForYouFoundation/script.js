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

// ============ Supabase (public, read/insert-limited) ============
// The anon key is designed to be public. Row Level Security limits it to
// reading active partners and calling submit_contact_message(); visitors
// can't read, change or delete anything else. See supabase/migrations/.
const SUPABASE_URL = "https://ntkbnrnoyejwonpfxnfy.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50a2Jucm5veWVqd29ucGZ4bmZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE5NTI3MTksImV4cCI6MjEwNzUyODcxOX0.oKny6BlVvJP4s56FyWMlm7klMbb-LvLquMMVhUJPQfk";
const supabaseHeaders = {
  apikey: SUPABASE_ANON_KEY,
  Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
  "Content-Type": "application/json",
};

// ============ Contact form → Supabase ============
const contactForm = document.getElementById("contactForm");
const contactFeedback = document.getElementById("contactFeedback");
const contactButton = contactForm.querySelector('button[type="submit"]');
const pageLoadedAt = Date.now();

// Same rules the database enforces; checking here just gives faster feedback.
const NAME_PATTERN = /^[\p{L}\s.'’,-]{1,100}$/u;
const EMAIL_PATTERN = /^[a-z0-9._%+-]+@[a-z0-9-]+(\.[a-z0-9-]+)*\.[a-z]{2,}$/i;

const showContactFeedback = (text) => {
  contactFeedback.textContent = text; // textContent, never innerHTML
  contactFeedback.classList.add("visible");
};

const validateContact = ({ name, email, message }) => {
  if (!NAME_PATTERN.test(name)) return "Please use only letters, spaces and . , ' - in your name.";
  if (email.length > 254 || !EMAIL_PATTERN.test(email)) return "Please enter a valid email address.";
  if (message.length > 2000) return "Please keep your message under 2000 characters.";
  if (/[<>]/.test(message)) return "Please remove the < and > characters from your message.";
  if (/(javascript|vbscript|data)\s*:/i.test(message)) {
    return "Please remove links that start with javascript:, vbscript: or data:.";
  }
  return null;
};

contactForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const data = new FormData(contactForm);
  const fields = {
    name: String(data.get("name") || "").replace(/\s+/g, " ").trim(),
    email: String(data.get("email") || "").trim().toLowerCase(),
    message: String(data.get("message") || "").trim(),
  };
  const thanks = "Thanks for reaching out! We'll get back to you soon.";

  // Bots fill the hidden field or submit instantly; pretend it worked.
  if (data.get("website") || Date.now() - pageLoadedAt < 3000) {
    contactForm.reset();
    showContactFeedback(thanks);
    return;
  }

  const problem = validateContact(fields);
  if (problem) {
    showContactFeedback(problem);
    return;
  }

  contactButton.disabled = true;
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/submit_contact_message`, {
      method: "POST",
      headers: supabaseHeaders,
      body: JSON.stringify({ p_name: fields.name, p_email: fields.email, p_message: fields.message }),
    });
    if (res.ok) {
      contactForm.reset();
      showContactFeedback(thanks);
    } else {
      // 22023 = a validation message written by submit_contact_message()
      const err = await res.json().catch(() => ({}));
      showContactFeedback(
        err.code === "22023" && err.message
          ? err.message
          : "Sorry, something went wrong. Please try again or email us directly."
      );
    }
  } catch {
    showContactFeedback("Sorry, we couldn't send your message. Please check your connection and try again.");
  } finally {
    contactButton.disabled = false;
  }
});

// ============ Partners (from Supabase) ============
// Add a partner with scripts/add-partner.mjs (or the Supabase dashboard) and
// a card appears here. No code changes needed for any number of partners.
const partnerGrid = document.getElementById("partnerGrid");

const safeUrl = (value, { httpsOnly = false, host = null } = {}) => {
  try {
    const url = new URL(value);
    const okProtocol = httpsOnly ? url.protocol === "https:" : /^https?:$/.test(url.protocol);
    if (!okProtocol || (host && url.host !== host)) return null;
    return url.href;
  } catch {
    return null;
  }
};

const buildPartnerCard = (partner, index) => {
  const card = document.createElement("a");
  card.className = "partner-card reveal";
  card.href = partner.website;
  card.target = "_blank";
  card.rel = "noopener noreferrer";
  card.setAttribute("aria-label", `${partner.name} (opens in a new tab)`);
  card.style.setProperty("--stagger-index", index);

  const logoWrap = document.createElement("span");
  logoWrap.className = "partner-card-logo";
  const img = document.createElement("img");
  img.src = partner.logo;
  img.alt = `${partner.name} logo`;
  img.loading = "lazy";
  img.decoding = "async";
  img.referrerPolicy = "no-referrer";
  logoWrap.appendChild(img);

  const name = document.createElement("span");
  name.className = "partner-card-name";
  name.textContent = partner.name;

  card.append(logoWrap, name);
  return card;
};

const loadPartners = async () => {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/partners?select=id,name,website_url,logo_url&order=sort_order.asc,id.asc`,
      { headers: supabaseHeaders }
    );
    if (!res.ok) throw new Error(`Partners request failed (${res.status})`);
    const supabaseHost = new URL(SUPABASE_URL).host;
    const partners = (await res.json())
      .map((row) => ({
        name: String(row.name || "").trim(),
        website: safeUrl(row.website_url),
        logo: safeUrl(row.logo_url, { httpsOnly: true, host: supabaseHost }),
      }))
      .filter((p) => p.name && p.website && p.logo);

    if (!partners.length) {
      partnerGrid.hidden = true;
      return;
    }
    partnerGrid.replaceChildren(...partners.map(buildPartnerCard));
    partnerGrid.dataset.count = String(partners.length);
    partnerGrid.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));
  } catch (err) {
    console.warn(err);
    partnerGrid.hidden = true;
  }
};

loadPartners();

// ============ Footer year ============
document.getElementById("year").textContent = new Date().getFullYear();

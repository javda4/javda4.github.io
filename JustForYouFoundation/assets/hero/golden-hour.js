// ============================================================
// Hero: "Golden Hour"
// A slow Ken Burns crossfade through the kids' photos, with golden
// fireflies drifting up through the scene. Pauses when the hero is
// off screen or the tab is hidden. Reduced motion: one still photo,
// no fireflies.
// ============================================================

(function () {
  const host = document.getElementById("heroCinema");
  if (!host) return;

  const hero = host.closest(".hero");
  hero.classList.add("is-cinema");

  const base = new URL("../gallery/", document.currentScript.src).href;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const SLIDE_MS = 6500;

  // focus = background-position keeping the child in frame; pan = drift direction
  const SLIDES = [
    { img: "gallery-1.webp", focus: "58% 35%", panX: "-1.5%", panY: "-1%" },
    { img: "gallery-5.webp", focus: "52% 40%", panX: "1.5%",  panY: "-1.5%" },
    { img: "gallery-2.webp", focus: "48% 40%", panX: "-1%",   panY: "1%" },
    { img: "gallery-4.webp", focus: "28% 50%", panX: "1.5%",  panY: "-0.5%" },
    { img: "gallery-6.webp", focus: "62% 35%", panX: "-1.5%", panY: "-1%" },
    { img: "gallery-3.webp", focus: "62% 40%", panX: "1%",    panY: "-1%" },
  ];

  const slides = SLIDES.map((s) => {
    const el = document.createElement("div");
    el.className = "cinema-slide";
    el.style.backgroundImage = `url("${base + s.img}")`;
    el.style.setProperty("--focus", s.focus);
    el.style.setProperty("--pan-x", s.panX);
    el.style.setProperty("--pan-y", s.panY);
    host.appendChild(el);
    return el;
  });

  const ticks = document.createElement("div");
  ticks.className = "cinema-ticks";
  ticks.style.setProperty("--slide-ms", SLIDE_MS + "ms");
  slides.forEach(() => ticks.appendChild(document.createElement("span")));
  hero.appendChild(ticks);

  let index = 0;
  function show(i) {
    slides.forEach((el, n) => {
      el.classList.toggle("is-leaving", el.classList.contains("is-active") && n !== i);
      if (n !== i) el.classList.remove("is-active");
    });
    // restart the Ken Burns animation on the incoming slide
    const el = slides[i];
    el.classList.remove("is-leaving", "is-active");
    void el.offsetWidth;
    el.classList.add("is-active");
    Array.from(ticks.children).forEach((t, n) => {
      t.classList.remove("is-active");
      if (n === i) { void t.offsetWidth; t.classList.add("is-active"); }
    });
  }
  show(0);

  if (reduceMotion) return;

  setInterval(() => {
    if (document.hidden || !heroVisible) return;
    index = (index + 1) % slides.length;
    show(index);
  }, SLIDE_MS);

  // ---------- fireflies ----------
  const canvas = document.createElement("canvas");
  canvas.className = "hero-fireflies";
  canvas.setAttribute("aria-hidden", "true");
  host.insertAdjacentElement("afterend", canvas);
  const ctx = canvas.getContext("2d");

  // Pre-rendered glow sprites (gold and cream)
  function sprite(rgb) {
    const s = document.createElement("canvas");
    s.width = s.height = 64;
    const g = s.getContext("2d");
    const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, `rgba(${rgb}, 1)`);
    grad.addColorStop(0.18, `rgba(${rgb}, 0.85)`);
    grad.addColorStop(0.45, `rgba(${rgb}, 0.18)`);
    grad.addColorStop(1, `rgba(${rgb}, 0)`);
    g.fillStyle = grad;
    g.fillRect(0, 0, 64, 64);
    return s;
  }
  const SPRITES = [sprite("232, 184, 74"), sprite("255, 236, 190"), sprite("246, 214, 140")];

  let W = 0, H = 0, dpr = 1, flies = [];
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = hero.clientWidth;
    H = hero.clientHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = W < 768 ? 34 : 70;
    flies = Array.from({ length: count }, () => spawn(true));
  }
  function spawn(anywhere) {
    return {
      x: Math.random() * W,
      y: anywhere ? Math.random() * H : H + 20,
      r: 6 + Math.random() * 16,
      vy: 8 + Math.random() * 22,          // px per second upward
      swayAmp: 10 + Math.random() * 30,
      swayFreq: 0.2 + Math.random() * 0.5,
      phase: Math.random() * Math.PI * 2,
      flicker: 0.6 + Math.random() * 1.6,
      sprite: SPRITES[(Math.random() * SPRITES.length) | 0],
    };
  }
  resize();
  window.addEventListener("resize", resize);

  let heroVisible = true;
  new IntersectionObserver(([e]) => { heroVisible = e.isIntersecting; }).observe(hero);

  let last = performance.now();
  function frame(now) {
    requestAnimationFrame(frame);
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    if (!heroVisible || document.hidden) return;
    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = "lighter";
    const t = now / 1000;
    for (let i = 0; i < flies.length; i++) {
      const f = flies[i];
      f.y -= f.vy * dt;
      if (f.y < -30) flies[i] = spawn(false);
      const x = f.x + Math.sin(t * f.swayFreq * Math.PI * 2 + f.phase) * f.swayAmp;
      // fade in from the bottom, out near the top, and flicker
      const edge = Math.min(1, (H - f.y) / 140, f.y / 160);
      const a = Math.max(0, edge) * (0.45 + 0.55 * (0.5 + 0.5 * Math.sin(t * f.flicker * 3 + f.phase)));
      ctx.globalAlpha = a * 0.85;
      ctx.drawImage(f.sprite, x - f.r, f.y - f.r, f.r * 2, f.r * 2);
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
  }
  requestAnimationFrame(frame);
})();

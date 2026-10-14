// ============================================================
// "Hands Reaching" scroll transition
//
// A photographic panel (here, a stylised heart-on-gradient
// placeholder standing in for real photography) dissolves into
// thousands of particles, which flow into an open, reaching hand,
// pushes toward the viewer, then dissolves into the next section.
//
// Fully progressive: if the visitor prefers reduced motion, or
// WebGL / Three.js isn't available, the section falls back to a
// short static panel instead of the scroll-jacked animation.
// ============================================================

(function () {
  const section = document.getElementById("transition-hands");
  if (!section) return;

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const hasWebGL = (function () {
    try {
      const c = document.createElement("canvas");
      return !!(
        window.WebGLRenderingContext &&
        (c.getContext("webgl") || c.getContext("experimental-webgl"))
      );
    } catch (e) {
      return false;
    }
  })();

  if (prefersReducedMotion || !hasWebGL || typeof THREE === "undefined") {
    return; // section stays in its default (fallback) CSS state
  }

  const canvas = document.getElementById("handsCanvas");
  const caption = section.querySelector(".transition-caption");
  section.classList.add("enhanced");

  // ---------- helpers ----------

  function smoothstep(a, b, x) {
    const t = Math.min(Math.max((x - a) / (b - a), 0), 1);
    return t * t * (3 - 2 * t);
  }

  // "Photograph" stand-in: a warm gradient with a heart glyph,
  // representing the child/community this section leads from.
  function buildImagePoints(desiredCount) {
    const size = 256;
    const grid = Math.round(Math.sqrt(desiredCount));
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");

    const grad = ctx.createRadialGradient(
      size * 0.32, size * 0.28, 10,
      size * 0.5, size * 0.5, size * 0.72
    );
    grad.addColorStop(0, "#f6dfa4");
    grad.addColorStop(0.35, "#8fb8c9");
    grad.addColorStop(0.7, "#24405a");
    grad.addColorStop(1, "#182a3a");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);

    ctx.save();
    ctx.translate(size / 2, size / 2 + 6);
    ctx.scale(size / 220, size / 220);
    ctx.fillStyle = "#e8b84a";
    ctx.beginPath();
    ctx.moveTo(0, 34);
    ctx.bezierCurveTo(-70, -30, -40, -70, 0, -20);
    ctx.bezierCurveTo(40, -70, 70, -30, 0, 34);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    const img = ctx.getImageData(0, 0, size, size).data;
    const count = grid * grid;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    let p = 0;
    for (let j = 0; j < grid; j++) {
      for (let i = 0; i < grid; i++) {
        const px = Math.min(size - 1, Math.floor((i / grid) * size));
        const py = Math.min(size - 1, Math.floor((j / grid) * size));
        const idx = (py * size + px) * 4;

        positions[p * 3] = (i / grid - 0.5) * 4.6;
        positions[p * 3 + 1] = -(j / grid - 0.5) * 4.6;
        positions[p * 3 + 2] = (Math.random() - 0.5) * 0.05;

        colors[p * 3] = img[idx] / 255;
        colors[p * 3 + 1] = img[idx + 1] / 255;
        colors[p * 3 + 2] = img[idx + 2] / 255;
        p++;
      }
    }

    return { positions, colors, count };
  }

  // Stylised open-hand silhouette, reaching toward the viewer.
  function buildHandPoints(count) {
    const size = 300;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#fff";

    function roundedFinger(w, len) {
      ctx.beginPath();
      ctx.moveTo(-w / 2, 0);
      ctx.lineTo(-w / 2, -len + w / 2);
      ctx.arc(0, -len + w / 2, w / 2, Math.PI, 0);
      ctx.lineTo(w / 2, 0);
      ctx.closePath();
      ctx.fill();
    }

    ctx.save();
    ctx.translate(size * 0.5, size * 0.62);

    // palm
    ctx.beginPath();
    ctx.ellipse(0, 0, size * 0.2, size * 0.26, 0, 0, Math.PI * 2);
    ctx.fill();

    // wrist
    ctx.beginPath();
    ctx.moveTo(-size * 0.12, size * 0.2);
    ctx.lineTo(size * 0.12, size * 0.2);
    ctx.lineTo(size * 0.09, size * 0.34);
    ctx.lineTo(-size * 0.09, size * 0.34);
    ctx.closePath();
    ctx.fill();

    // four fingers
    const fingers = [
      { x: -0.175, len: 0.3, w: 0.052, tilt: -18 },
      { x: -0.075, len: 0.42, w: 0.058, tilt: -6 },
      { x: 0.02, len: 0.46, w: 0.058, tilt: 2 },
      { x: 0.115, len: 0.4, w: 0.055, tilt: 10 },
    ];
    fingers.forEach((f) => {
      ctx.save();
      ctx.translate(f.x * size, -size * 0.24);
      ctx.rotate((f.tilt * Math.PI) / 180);
      roundedFinger(f.w * size, f.len * size);
      ctx.restore();
    });

    // thumb
    ctx.save();
    ctx.translate(-size * 0.23, -size * 0.02);
    ctx.rotate((-55 * Math.PI) / 180);
    roundedFinger(size * 0.075, size * 0.24);
    ctx.restore();

    ctx.restore();

    const data = ctx.getImageData(0, 0, size, size).data;
    const valid = [];
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        if (data[(y * size + x) * 4 + 3] > 40) valid.push([x, y]);
      }
    }

    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const [x, y] = valid[(Math.random() * valid.length) | 0];
      const u = x / size;
      const v = y / size;

      const distFromPalmCenter = Math.hypot(u - 0.5, v - 0.62);
      let z = Math.max(0, 0.35 - distFromPalmCenter) * 1.4;
      if (v < 0.34) z += (0.34 - v) * 1.8;

      positions[i * 3] = (u - 0.5) * 4.6;
      positions[i * 3 + 1] = -(v - 0.5) * 4.6;
      positions[i * 3 + 2] = z;
    }

    return positions;
  }

  // ---------- shaders ----------

  const VERTEX_SHADER = `
    attribute vec3 aImagePos;
    attribute vec3 aHandPos;
    attribute vec3 aColor;
    uniform float uProgress;
    uniform float uTime;
    uniform float uPixelRatio;
    uniform float uBaseSize;
    varying vec3 vColor;
    varying float vAlpha;
    varying float vGlow;

    float hash(vec3 p) {
      return fract(sin(dot(p, vec3(12.9898, 78.233, 45.164))) * 43758.5453);
    }

    void main() {
      float liquid = smoothstep(0.0, 0.06, uProgress) * (1.0 - smoothstep(0.10, 0.26, uProgress));
      float morphT = smoothstep(0.16, 0.55, uProgress);
      vec3 base = mix(aImagePos, aHandPos, morphT);

      vec3 seed = aImagePos * 3.3 + uTime * 0.5;
      vec3 wobble = vec3(
        hash(seed) - 0.5,
        hash(seed + 11.7) - 0.5,
        hash(seed + 23.1) - 0.5
      );
      base += wobble * liquid * 0.55;

      float reachT = smoothstep(0.55, 0.80, uProgress);
      base.z += reachT * 1.6;
      base.xy *= (1.0 + reachT * 0.22);

      float dissolve = smoothstep(0.78, 0.94, uProgress);
      base += normalize(base + vec3(0.0001)) * dissolve * 3.2;

      vAlpha = 1.0 - dissolve;
      vGlow = reachT;
      vColor = mix(aColor, vec3(0.910, 0.722, 0.290), morphT * 0.85 + reachT * 0.15);

      vec4 mvPosition = modelViewMatrix * vec4(base, 1.0);
      gl_Position = projectionMatrix * mvPosition;
      gl_PointSize = uBaseSize * uPixelRatio * (18.0 / -mvPosition.z);
    }
  `;

  const FRAGMENT_SHADER = `
    precision mediump float;
    varying vec3 vColor;
    varying float vAlpha;
    varying float vGlow;

    void main() {
      vec2 uv = gl_PointCoord - vec2(0.5);
      float d = length(uv);
      float circle = smoothstep(0.5, 0.36, d);
      if (circle <= 0.001) discard;
      vec3 col = vColor * (1.0 + vGlow * 0.22);
      gl_FragColor = vec4(col, circle * vAlpha);
    }
  `;

  // ---------- scene setup ----------

  const isMobile = window.innerWidth < 768;
  const desiredCount = isMobile ? 3600 : 8100;

  const imagePoints = buildImagePoints(desiredCount);
  const count = imagePoints.count;
  const handPositions = buildHandPoints(count);

  const geometry = new THREE.BufferGeometry();
  const positionAttr = new THREE.BufferAttribute(imagePoints.positions, 3);
  geometry.setAttribute("position", positionAttr);
  geometry.setAttribute("aImagePos", positionAttr);
  geometry.setAttribute("aHandPos", new THREE.BufferAttribute(handPositions, 3));
  geometry.setAttribute("aColor", new THREE.BufferAttribute(imagePoints.colors, 3));

  const material = new THREE.ShaderMaterial({
    uniforms: {
      uProgress: { value: 0 },
      uTime: { value: 0 },
      uPixelRatio: { value: Math.min(window.devicePixelRatio || 1, 2) },
      uBaseSize: { value: isMobile ? 3.0 : 2.2 },
    },
    vertexShader: VERTEX_SHADER,
    fragmentShader: FRAGMENT_SHADER,
    transparent: true,
    depthWrite: false,
  });

  const points = new THREE.Points(geometry, material);
  points.frustumCulled = false;

  const scene = new THREE.Scene();
  scene.add(points);

  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.set(0, 0, 6);

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    renderer.setSize(rect.width, rect.height, false);
    camera.aspect = rect.width / rect.height;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener("resize", resize);

  function getProgress() {
    const rect = section.getBoundingClientRect();
    const total = rect.height - window.innerHeight;
    if (total <= 0) return 1;
    return Math.min(Math.max(-rect.top / total, 0), 1);
  }

  let targetProgress = 0;
  window.addEventListener(
    "scroll",
    () => {
      targetProgress = getProgress();
    },
    { passive: true }
  );
  targetProgress = getProgress();

  let smoothProgress = targetProgress;
  const NAVY = [24, 42, 58];
  const CREAM = [255, 248, 236];

  function animate(t) {
    requestAnimationFrame(animate);
    smoothProgress += (targetProgress - smoothProgress) * 0.08;

    material.uniforms.uProgress.value = smoothProgress;
    material.uniforms.uTime.value = t * 0.001;

    camera.position.z = 6 - smoothProgress * 0.6;

    if (caption) {
      const capIn = smoothstep(0.05, 0.2, targetProgress);
      const capOut = 1 - smoothstep(0.36, 0.5, targetProgress);
      caption.style.opacity = String(Math.min(capIn, capOut));
    }

    const bgT = smoothstep(0.9, 1.0, targetProgress);
    const r = Math.round(NAVY[0] + (CREAM[0] - NAVY[0]) * bgT);
    const g = Math.round(NAVY[1] + (CREAM[1] - NAVY[1]) * bgT);
    const b = Math.round(NAVY[2] + (CREAM[2] - NAVY[2]) * bgT);
    section.style.background = `rgb(${r}, ${g}, ${b})`;

    renderer.render(scene, camera);
  }
  requestAnimationFrame(animate);
})();

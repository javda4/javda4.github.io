// ============================================================
// Hero "Gallery" scene — the authored @designcodeio/threeui
// Gallery component (verified source, Three.js r128 API),
// mounted as the full hero-section background. True 3D geometry
// throughout: sixteen curved CylinderGeometry panels cycling
// five placeholder photos, held in one Group that slowly rotates
// around Y — no vertical bob, so the panels hold a steady orbit
// behind/in front of the fixed hero copy.
//
// What's new here: the hero copy sits at a fixed depth in the
// middle of that rotation. Rather than always drawing on top of
// (or always behind) the gallery, each panel is classified every
// frame by its real 3D world position relative to the copy's
// depth plane and rendered into one of two stacked, transparent
// canvases sharing the same scene/camera — one layered above the
// DOM text, one below. As the cylinder turns, panels swinging
// toward the camera cross into the "front" canvas and cover the
// text; once they swing more than 180° around to the far side of
// the drum, they cross into the "back" canvas and pass behind it.
// The DOM text itself never rotates and always faces the visitor.
// ============================================================

(function () {
  const backHost = document.getElementById("heroGallery");
  const frontHost = document.getElementById("heroGalleryFront");
  if (!backHost) return;

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

  if (!hasWebGL || typeof THREE === "undefined") {
    return; // hero falls back to its plain gradient background
  }

  const GALLERY_IMAGE_URLS = [
    "gallery-1.webp",
    "gallery-2.webp",
    "gallery-3.webp",
    "gallery-4.webp",
    "gallery-5.webp",
    "gallery-6.webp", // not in the cycle; only used via PANEL_IMAGE_OVERRIDES
  ].map((name) => new URL(name, document.currentScript.src).href);

  const GALLERY_DEFAULTS = {
    speed: 1,
    scale: 1,
    opacity: 1,
    hue: 0,
    saturation: 1,
    brightness: 1,
  };

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  const settings = GALLERY_DEFAULTS;
  const splitFront = !!frontHost;

  [backHost, frontHost].forEach(function (host) {
    if (!host) return;
    host.setAttribute("role", "img");
    host.setAttribute(
      "aria-label",
      "Rotating placeholder photo gallery, pending real photography"
    );
  });

  function makeCanvas(host) {
    const canvas = document.createElement("canvas");
    canvas.className = "gallery-scene__canvas";
    canvas.setAttribute("aria-hidden", "true");
    canvas.style.opacity = String(clamp(settings.opacity, 0.05, 1));
    canvas.style.filter =
      "hue-rotate(" + clamp(settings.hue, -180, 180) + "deg) " +
      "saturate(" + clamp(settings.saturation, 0, 2) + ") " +
      "brightness(" + clamp(settings.brightness, 0.35, 1.65) + ")";
    host.appendChild(canvas);
    const renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      alpha: true,
      // Antialiasing is disabled here (unlike the single-canvas threeweb
      // version) because this scene now renders twice per frame — once
      // per depth layer — and MSAA on two full-viewport transparent
      // passes was the single biggest cost, dropping integrated GPUs
      // from 60fps to ~10fps. Edge softness is barely missed given the
      // scrim/blur already sitting over this layer.
      antialias: false,
    });
    renderer.setClearColor(0x000000, 0);
    renderer.outputEncoding = THREE.sRGBEncoding;
    return renderer;
  }

  const rendererBack = makeCanvas(backHost);
  const rendererFront = splitFront ? makeCanvas(frontHost) : null;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.z = 18;

  // Depth (world Z) of the hero copy's fixed plane: the cylinder's own
  // rotation axis, i.e. the midpoint of its front-to-back swing. Panels
  // nearer the camera than this render in front of the text; panels
  // farther away render behind it.
  const TEXT_DEPTH_Z = 0;

  const gallery = new THREE.Group();
  scene.add(gallery);

  const geometry = new THREE.CylinderGeometry(
    5, 5, 1.8, 64, 1, true, 0, Math.PI * 0.4
  );
  geometry.computeBoundingBox();
  const localPanelCenter = new THREE.Vector3();
  geometry.boundingBox.getCenter(localPanelCenter);
  const worldPanelCenter = new THREE.Vector3();

  const loader = new THREE.TextureLoader();

  let disposed = false;
  let frame = 0;
  let elapsed = 0;
  let previousTime = 0;
  let hostVisible = true;
  let documentVisible = !document.hidden;
  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const textures = GALLERY_IMAGE_URLS.map(function (url) {
    const texture = loader.load(url, function () {
      if (disposed) {
        texture.dispose();
        return;
      }
      render(previousTime || 0);
    });
    texture.encoding = THREE.sRGBEncoding;
    texture.anisotropy = Math.min(8, rendererBack.capabilities.getMaxAnisotropy());
    return texture;
  });

  // Panels cycle through the first five photos; individual panels can be
  // pinned to another texture. Panel 9 is the second of the three
  // two-girls panels (4, 9, 14), swapped for the hospital-room photo.
  const CYCLE_LENGTH = 5;
  const PANEL_IMAGE_OVERRIDES = { 9: 5 };

  // Panels speed up and turn slightly more transparent as they swing in
  // front of the hero copy. "Frontness" runs 0 (at the text plane or
  // behind it) to 1 (directly facing the camera), so both effects ease in
  // and out smoothly with no jump where a panel crosses into the front layer.
  const BASE_ANGULAR_SPEED = 0.08; // rad/s, the drum's steady rotation
  const FRONT_SPEED_BOOST = 0.75; // up to +75% speed at the very front
  const BACK_OPACITY = 0.85;
  const FRONT_OPACITY = 0.7; // lowest opacity, directly in front of the text
  const DRUM_RADIUS = 5;

  const panels = Array.from({ length: 16 }, function (_, index) {
    const textureIndex =
      index in PANEL_IMAGE_OVERRIDES
        ? PANEL_IMAGE_OVERRIDES[index]
        : index % CYCLE_LENGTH;
    const material = new THREE.MeshBasicMaterial({
      map: textures[textureIndex],
      opacity: BACK_OPACITY,
      side: THREE.DoubleSide,
      toneMapped: false,
      transparent: true,
    });
    const panel = new THREE.Mesh(geometry, material);
    panel.position.y = (index - 8) * 2.4;
    panel.rotation.y = (index / 16) * Math.PI * 4;
    panel.userData.frontness = 0;
    gallery.add(panel);
    return panel;
  });

  function render(time) {
    if (time === undefined) time = performance.now();
    const safeSpeed = clamp(settings.speed, 0, 3);
    const safeScale = clamp(settings.scale, 0.7, 1.35);
    let dt = 0;
    if (previousTime) {
      dt = Math.min((time - previousTime) / 1000, 0.05) * safeSpeed;
      elapsed += dt;
    }
    previousTime = time;
    gallery.rotation.y = elapsed * BASE_ANGULAR_SPEED;
    gallery.scale.setScalar(safeScale);

    // Per-panel extra orbit speed and opacity, driven by last frame's
    // frontness (one frame of lag is imperceptible at these speeds).
    panels.forEach(function (panel) {
      const f = panel.userData.frontness;
      panel.rotation.y += dt * BASE_ANGULAR_SPEED * FRONT_SPEED_BOOST * f;
      panel.material.opacity = BACK_OPACITY - (BACK_OPACITY - FRONT_OPACITY) * f;
    });

    if (!splitFront) {
      rendererBack.render(scene, camera);
      return;
    }

    scene.updateMatrixWorld(true);
    panels.forEach(function (panel) {
      worldPanelCenter.copy(localPanelCenter).applyMatrix4(panel.matrixWorld);
      panel.userData.inFront = worldPanelCenter.z > TEXT_DEPTH_Z;
      panel.userData.frontness = clamp(
        (worldPanelCenter.z - TEXT_DEPTH_Z) / (DRUM_RADIUS * safeScale), 0, 1
      );
    });

    panels.forEach(function (panel) {
      panel.visible = panel.userData.inFront;
    });
    rendererFront.render(scene, camera);

    panels.forEach(function (panel) {
      panel.visible = !panel.userData.inFront;
    });
    rendererBack.render(scene, camera);

    panels.forEach(function (panel) {
      panel.visible = true;
    });
  }

  function tick(time) {
    if (disposed || !hostVisible || !documentVisible) {
      frame = 0;
      previousTime = 0;
      return;
    }
    render(time);
    frame = window.requestAnimationFrame(tick);
  }

  function start() {
    if (reducedMotion) {
      render(0);
      return;
    }
    if (!frame && hostVisible && documentVisible) {
      frame = window.requestAnimationFrame(tick);
    }
  }

  function stop() {
    if (frame) window.cancelAnimationFrame(frame);
    frame = 0;
    previousTime = 0;
  }

  function resize() {
    const bounds = backHost.getBoundingClientRect();
    const width = Math.max(1, Math.round(bounds.width));
    const height = Math.max(1, Math.round(bounds.height));
    // Capped lower than the single-canvas threeweb version (2) for the
    // same reason antialiasing is off above: two full-viewport transparent
    // passes per frame is expensive, and resolution is the biggest lever.
    const dpr = Math.min(window.devicePixelRatio || 1, splitFront ? 1.5 : 2);
    [rendererBack, rendererFront].forEach(function (renderer) {
      if (!renderer) return;
      renderer.setPixelRatio(dpr);
      renderer.setSize(width, height, false);
    });
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    render(previousTime || 0);
  }

  const resizeObserver = new ResizeObserver(resize);
  const intersectionObserver = new IntersectionObserver(function (entries) {
    const entry = entries[0];
    hostVisible = entry ? entry.isIntersecting : true;
    if (hostVisible) start();
    else stop();
  });

  function handleVisibility() {
    documentVisible = !document.hidden;
    if (documentVisible) start();
    else stop();
  }

  resizeObserver.observe(backHost);
  intersectionObserver.observe(backHost);
  document.addEventListener("visibilitychange", handleVisibility);
  resize();
  start();

  window.addEventListener("pagehide", function () {
    disposed = true;
    stop();
    resizeObserver.disconnect();
    intersectionObserver.disconnect();
    document.removeEventListener("visibilitychange", handleVisibility);
    gallery.clear();
    geometry.dispose();
    panels.forEach(function (panel) {
      panel.material.dispose();
    });
    textures.forEach(function (texture) {
      texture.dispose();
    });
    rendererBack.dispose();
    if (rendererFront) rendererFront.dispose();
  });
})();

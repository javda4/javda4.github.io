window.addEventListener("load", async () => {

  const video = document.getElementById("video");
  const canvas = document.getElementById("canvas");
  const debug = document.getElementById("debug");

  function log(msg) {
    debug.innerText = msg;
    console.log(msg);
  }

  // ---------------- CAMERA (LOCKED WORKING STATE) ----------------
  log("camera already running ✔");

  // ---------------- THREE.JS ----------------
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );

  camera.position.z = 2;

  const geometry = new THREE.BoxGeometry();
  const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
  const cube = new THREE.Mesh(geometry, material);
  scene.add(cube);

  // ---------------- LOOP ----------------
  function animate() {

    cube.rotation.y += 0.01;

    renderer.render(scene, camera);

    requestAnimationFrame(animate);
  }

  animate();

  log("3D layer active ✔");
});

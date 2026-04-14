window.addEventListener("load", async () => {

  const video = document.getElementById("video");
  const debug = document.getElementById("debug");

  function log(msg) {
    debug.innerText = msg;
    console.log(msg);
  }

  log("STEP 1: JS LOADED ✔");

  if (!video) {
    log("ERROR: video element not found");
    return;
  }

  try {
    log("STEP 2: requesting camera...");

    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: false
    });

    log("STEP 3: stream received ✔");

    video.srcObject = stream;
    video.muted = true;
    video.playsInline = true;

    await video.play();

    log("STEP 4: video playing ✔ (DONE)");

  } catch (err) {
    log("CAMERA ERROR: " + err.message);
    return;
  }

});

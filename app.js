const video = document.getElementById("video");
const debug = document.getElementById("debug");

async function startCamera() {
  debug.innerText = "requesting camera...";

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: false
    });

    debug.innerText = "stream received";

    video.srcObject = stream;

    video.muted = true;
    video.playsInline = true;

    await video.play();

    debug.innerText = "video playing ✔";

  } catch (e) {
    debug.innerText = "FAILED: " + e.message;
    console.error(e);
  }
}

// HARD DEBUG LOOP
setInterval(() => {
  debug.innerText =
    "readyState=" + video.readyState +
    " | size=" + video.videoWidth + "x" + video.videoHeight;
}, 1000);

startCamera();

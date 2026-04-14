const video = document.getElementById("video");
const debug = document.getElementById("debug");

let landmarker;

function log(msg){
  debug.innerText = msg;
  console.log(msg);
}

async function startCamera(){

  log("requesting camera...");

  const stream = await navigator.mediaDevices.getUserMedia({
    video:true,
    audio:false
  });

  video.srcObject = stream;

  await video.play();

  log("camera ready ✔");
}

async function loadModel(){

  log("loading vision wasm...");

  const fileset = await FilesetResolver.forVisionTasks(
    "./assets/wasm"
  );

  log("loading face model...");

  landmarker = await FaceLandmarker.createFromOptions(fileset,{
    baseOptions:{
      modelAssetPath:"./assets/face_landmarker.task"
    },
    runningMode:"VIDEO",
    numFaces:1
  });

  log("model loaded ✔");
}

function loop(){

  if(landmarker && video.readyState===4){

    const result = landmarker.detectForVideo(video,performance.now());

    if(result.faceLandmarks && result.faceLandmarks.length>0){

      log("FACE DETECTED ✔ points: "+result.faceLandmarks[0].length);

    }else{

      log("no face detected");
    }
  }

  requestAnimationFrame(loop);
}

async function main(){

  await startCamera();
  await loadModel();

  loop();
}

main();

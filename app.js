const video = document.getElementById("video");
const canvas = document.getElementById("overlay");
const ctx = canvas.getContext("2d");
const debug = document.getElementById("debug");

let landmarker;

// ---------------- THREE.JS ----------------

const scene = new THREE.Scene();

const camera3D = new THREE.PerspectiveCamera(
75,
window.innerWidth/window.innerHeight,
0.1,
1000
);

camera3D.position.z = 2;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth/2, window.innerHeight);

document.getElementById("viewer3d").appendChild(renderer.domElement);

// create point cloud
const geometry = new THREE.BufferGeometry();
const vertices = new Float32Array(478*3);

geometry.setAttribute(
"position",
new THREE.BufferAttribute(vertices,3)
);

const material = new THREE.PointsMaterial({
color:0x00ff00,
size:0.01
});

const facePoints = new THREE.Points(geometry,material);
scene.add(facePoints);


// ---------------- CAMERA ----------------

async function startCamera(){

const stream = await navigator.mediaDevices.getUserMedia({
video:true,
audio:false
});

video.srcObject = stream;

await video.play();

// ensure overlay matches video
canvas.width = video.videoWidth;
canvas.height = video.videoHeight;

debug.innerText="camera ready ✔";

}


// ---------------- LOAD MODEL ----------------

async function loadModel(){

const fileset = await FilesetResolver.forVisionTasks(
"https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm"
);

landmarker = await FaceLandmarker.createFromOptions(fileset,{
baseOptions:{
modelAssetPath:"./assets/face_landmarker.task"
},
runningMode:"VIDEO",
numFaces:1
});

debug.innerText="model loaded ✔";

}


// ---------------- DRAW 2D LANDMARKS ----------------

function draw2D(points){

ctx.clearRect(0,0,canvas.width,canvas.height);

ctx.fillStyle="lime";

for(const p of points){

const x=p.x*canvas.width;
const y=p.y*canvas.height;

ctx.beginPath();
ctx.arc(x,y,2,0,Math.PI*2);
ctx.fill();

}

}


// ---------------- UPDATE 3D ----------------

function update3D(points){

const positions = facePoints.geometry.attributes.position.array;

for(let i=0;i<points.length;i++){

positions[i*3] = (points[i].x-0.5);
positions[i*3+1] = -(points[i].y-0.5);
positions[i*3+2] = points[i].z;

}

facePoints.geometry.attributes.position.needsUpdate = true;

}


// ---------------- MAIN LOOP ----------------

function loop(){

if(landmarker && video.readyState===4){

const result = landmarker.detectForVideo(video,performance.now());

if(result.faceLandmarks && result.faceLandmarks.length>0){

const points=result.faceLandmarks[0];

draw2D(points);
update3D(points);

debug.innerText="FACE DETECTED ✔ "+points.length;

}

}

renderer.render(scene,camera3D);

requestAnimationFrame(loop);

}


// ---------------- START ----------------

async function main(){

await startCamera();
await loadModel();

loop();

}

main();

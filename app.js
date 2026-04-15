let currentDemo = null

let stopFaceMesh = null
let stopSLAM = null

async function startFaceMesh(){

  if(stopSLAM){
    stopSLAM()
    stopSLAM = null
  }

  stopFaceMesh = await startFaceMeshDemo()
  currentDemo = "facemesh"

}

async function startSLAM(){

  if(stopFaceMesh){
    stopFaceMesh()
    stopFaceMesh = null
  }

  stopSLAM = await startSLAMDemo()
  currentDemo = "slam"

}

document.getElementById("switchDemo").onclick = () => {

  if(currentDemo === "facemesh"){
    startSLAM()
  } else {
    startFaceMesh()
  }

}

startFaceMesh()

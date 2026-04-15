async function startSLAMDemo(){

const video = document.getElementById("video")
const overlay = document.getElementById("overlay")
const canvas3d = document.getElementById("canvas3d")

const ctx3d = canvas3d.getContext("2d")
const debug = document.getElementById("debug")

debug.innerText = "SLAM MODE"

overlay.getContext("2d").clearRect(0,0,overlay.width,overlay.height)

const stream = await navigator.mediaDevices.getUserMedia({
  video:{
    facingMode:{ideal:"environment"}
  }
})

video.srcObject = stream

canvas3d.width = canvas3d.clientWidth
canvas3d.height = canvas3d.clientHeight

const points = []

function render(){

  ctx3d.fillStyle="rgba(0,0,0,0.15)"
  ctx3d.fillRect(0,0,canvas3d.width,canvas3d.height)

  ctx3d.fillStyle="cyan"

  for(const p of points){

    ctx3d.beginPath()
    ctx3d.arc(p.x,p.y,2,0,Math.PI*2)
    ctx3d.fill()

  }

  requestAnimationFrame(render)

}

video.onplay=()=>{

  setInterval(()=>{

    const x=Math.random()*canvas3d.width
    const y=Math.random()*canvas3d.height

    points.push({x,y})

    if(points.length>3000){
      points.shift()
    }

  },30)

}

render()

return ()=>{

  stream.getTracks().forEach(t=>t.stop())

}

}

import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { buildAnvil } from "./buildAnvil";

export function createForgeScene(host,{paused=false,onReady,onLost}){
  const events=new AbortController();
  const scene=new THREE.Scene();
  const root=new THREE.Group();scene.add(root);
  const renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:"low-power",preserveDrawingBuffer:true});
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.24;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.domElement.setAttribute("aria-hidden","true");host.append(renderer.domElement);
  const camera=new THREE.PerspectiveCamera(31,1,.1,50);
  const environment=new RoomEnvironment(),generator=new THREE.PMREMGenerator(renderer),env=generator.fromScene(environment,.08);scene.environment=env.texture;scene.environmentIntensity=.36;environment.dispose();generator.dispose();
  scene.add(new THREE.HemisphereLight(0x8cb2bc,0x170907,1.45));
  const key=new THREE.DirectionalLight(0xffe4bc,3.5);key.position.set(-3.8,6,7);key.castShadow=true;key.shadow.mapSize.set(1024,1024);Object.assign(key.shadow.camera,{left:-4,right:4,top:4,bottom:-4});key.shadow.normalBias=.025;scene.add(key);
  const fire=new THREE.PointLight(0xff6426,35,11,2);fire.position.set(.2,.25,2.7);scene.add(fire);
  const berry=new THREE.PointLight(0xf276ad,9,9,2);berry.position.set(-3,1,-1);scene.add(berry);
  const fill=new THREE.DirectionalLight(0x65b5c5,1.15);fill.position.set(4,1,5);scene.add(fill);
  let model;
  try{model=buildAnvil(root);}catch(error){renderer.dispose();renderer.forceContextLoss();renderer.domElement.remove();env.dispose();throw error;}
  const shaded=new Set();
  root.traverse(object=>{
    const material=object.material;if(!material?.isMeshStandardMaterial||shaded.has(material))return;shaded.add(material);
    material.onBeforeCompile=shader=>{shader.fragmentShader=shader.fragmentShader.replace("#include <dithering_fragment>",`#include <dithering_fragment>\nfloat cell = mod(floor(gl_FragCoord.x) + floor(gl_FragCoord.y) * 2.0, 4.0) / 4.0;\ngl_FragColor.rgb = floor(gl_FragColor.rgb * 22.0 + cell * 0.36) / 22.0;`);};
    material.customProgramCacheKey=()=>"dsa-forge-instrument-v1";
  });
  let frame=0,lastFrame=0,visible=true,lost=false,disposed=false,time=0,pointerX=0,pointerY=0,targetX=0,targetY=0;
  function schedule(){if(!frame&&!disposed&&!lost&&visible&&!document.hidden)frame=requestAnimationFrame(draw);}
  function draw(now=0){
    frame=0;if(disposed||lost||!visible||document.hidden)return;
    if(!paused&&now-lastFrame<1000/24){schedule();return;}
    const elapsed=lastFrame?Math.min(.08,(now-lastFrame)/1000):0;lastFrame=now;if(!paused)time+=elapsed;
    pointerX=paused?0:pointerX+(targetX-pointerX)*.075;pointerY=paused?0:pointerY+(targetY-pointerY)*.075;
    camera.position.set(5.9+pointerX*.45,2.5-pointerY*.24,11.2);camera.lookAt(0,-.18,0);root.rotation.y=pointerX*.045;root.rotation.x=-pointerY*.018;
    model.update(time,paused);fire.intensity=paused?34:31+Math.sin(time*2.7)*4+Math.sin(time*7.1)*1.5;
    renderer.render(scene,camera);renderer.domElement.dataset.frame=String(Number(renderer.domElement.dataset.frame||0)+1);if(!paused)schedule();
  }
  function resize(){const width=host.clientWidth,height=host.clientHeight;if(!width||!height)return;camera.aspect=width/height;camera.updateProjectionMatrix();renderer.setSize(width,height,false);lastFrame=0;schedule();}
  const resizeObserver=new ResizeObserver(resize);resizeObserver.observe(host);
  const intersection=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(!visible&&frame){cancelAnimationFrame(frame);frame=0;}if(visible){lastFrame=0;schedule();}});intersection.observe(host);
  const panel=host.closest(".forge-intro-art");
  panel?.addEventListener("pointermove",event=>{if(paused||event.pointerType==="touch")return;const rect=host.getBoundingClientRect();targetX=(event.clientX-rect.left)/rect.width-.5;targetY=(event.clientY-rect.top)/rect.height-.5;},{signal:events.signal});
  panel?.addEventListener("pointerleave",()=>{targetX=0;targetY=0;},{signal:events.signal});
  document.addEventListener("visibilitychange",()=>{if(document.hidden&&frame){cancelAnimationFrame(frame);frame=0;}else{lastFrame=0;schedule();}},{signal:events.signal});
  renderer.domElement.addEventListener("webglcontextlost",event=>{event.preventDefault();lost=true;if(frame)cancelAnimationFrame(frame);frame=0;onLost();},{signal:events.signal});
  renderer.domElement.addEventListener("webglcontextrestored",()=>{lost=false;resize();onReady();},{signal:events.signal});
  resize();onReady();
  return {
    setPaused(value){paused=value;lastFrame=0;schedule();},
    dispose(){
      if(disposed)return;disposed=true;events.abort();resizeObserver.disconnect();intersection.disconnect();if(frame)cancelAnimationFrame(frame);
      const geometries=new Set(),materials=new Set(),textures=new Set(model.textures);root.traverse(object=>{if(object.geometry)geometries.add(object.geometry);if(object.material)(Array.isArray(object.material)?object.material:[object.material]).forEach(material=>{materials.add(material);Object.values(material).forEach(value=>{if(value?.isTexture)textures.add(value);});});});
      geometries.forEach(value=>value.dispose());materials.forEach(value=>value.dispose());textures.forEach(value=>value.dispose());env.dispose();key.shadow.dispose();scene.clear();renderer.dispose();renderer.forceContextLoss();renderer.domElement.remove();
    },
  };
}

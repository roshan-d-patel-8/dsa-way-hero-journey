import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { buildInstrument } from "./models";

export function createScene(host,{boxNumber,paused=false,onReady,onLost}) {
  const events=new AbortController();
  const scene=new THREE.Scene();
  const root=new THREE.Group();scene.add(root);
  const renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:"low-power",preserveDrawingBuffer:true});
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.25;
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  renderer.domElement.setAttribute("aria-hidden","true");host.append(renderer.domElement);
  const camera=new THREE.OrthographicCamera(-3.4,3.4,3.1,-3.1,.1,50);
  const environment=new RoomEnvironment(),generator=new THREE.PMREMGenerator(renderer);
  const env=generator.fromScene(environment,.12);scene.environment=env.texture;scene.environmentIntensity=.42;
  environment.dispose();generator.dispose();
  scene.add(new THREE.HemisphereLight(0xb2d4dd,0x141c27,1.65));
  const key=new THREE.DirectionalLight(0xffe5bf,3.4);key.position.set(-3,6,7);key.castShadow=true;
  key.shadow.mapSize.set(1024,1024);Object.assign(key.shadow.camera,{left:-4,right:4,top:4,bottom:-4});key.shadow.normalBias=.025;scene.add(key);
  const accent={3:0xffd65a,5:0xf6a43c,8:0xf276ad,9:0xb996ff}[boxNumber];
  const rim=new THREE.PointLight(accent,24,12,2);rim.position.set(1,1.5,-.3);scene.add(rim);
  const fill=new THREE.DirectionalLight(0x73b7c8,1.3);fill.position.set(4,1,4);scene.add(fill);
  let model;
  try {
    model=buildInstrument(root,boxNumber);
  } catch(error) {
    renderer.dispose();renderer.forceContextLoss();renderer.domElement.remove();env.dispose();
    throw error;
  }
  // A restrained, shared ordered shade treatment unifies metal, glass and map surfaces.
  const shaded=new Set();
  root.traverse(object=>{
    const mat=object.material;
    if(!mat?.isMeshStandardMaterial||shaded.has(mat))return;
    shaded.add(mat);
    mat.onBeforeCompile=shader=>{
      shader.fragmentShader=shader.fragmentShader.replace("#include <dithering_fragment>",`
        #include <dithering_fragment>
        float cell = mod(floor(gl_FragCoord.x) + floor(gl_FragCoord.y) * 2.0, 4.0) / 4.0;
        gl_FragColor.rgb = floor(gl_FragColor.rgb * 24.0 + cell * 0.32) / 24.0;
      `);
    };
    mat.customProgramCacheKey=()=>"dsa-retro-instrument-v1";
  });
  let frame=0,lastFrame=0,visible=true,lost=false,disposed=false,time=0,progress=0,current=0;
  let pointer=0,targetPointer=0;
  function draw(now=0){
    frame=0;
    if(disposed||lost||!visible||document.hidden)return;
    if(!paused && now-lastFrame<1000/24){schedule();return;}
    const elapsed=lastFrame?Math.min(.08,(now-lastFrame)/1000):0;lastFrame=now;
    if(!paused)time+=elapsed;
    pointer=paused?0:pointer+(targetPointer-pointer)*.08;
    camera.position.set(2.1+pointer*.24,1.6,11);camera.lookAt(0,.1,0);
    model.update(progress,current,paused?0:time);
    renderer.render(scene,camera);
    renderer.domElement.dataset.renderedWidth=String(host.clientWidth);
    renderer.domElement.dataset.renderedHeight=String(host.clientHeight);
    renderer.domElement.dataset.progress=String(progress);
    renderer.domElement.dataset.frame=String(Number(renderer.domElement.dataset.frame||0)+1);
    if(!paused)schedule();
  }
  function schedule(){if(!frame&&!disposed&&!lost&&visible&&!document.hidden)frame=requestAnimationFrame(draw);}
  function resize(){
    const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;
    const aspect=w/h,halfH=Math.max(2.7,3.15/aspect),halfW=halfH*aspect;
    camera.left=-halfW;camera.right=halfW;camera.top=halfH;camera.bottom=-halfH;camera.updateProjectionMatrix();
    renderer.setSize(w,h,false);lastFrame=0;schedule();
  }
  const resizeObserver=new ResizeObserver(resize);resizeObserver.observe(host);
  const intersection=new IntersectionObserver(([entry])=>{
    visible=entry.isIntersecting;
    if(!visible&&frame){cancelAnimationFrame(frame);frame=0;}
    if(visible){lastFrame=0;schedule();}
  });intersection.observe(host);
  const panel=host.closest(".bespoke-scene");
  panel?.addEventListener("pointermove",event=>{
    if(paused||event.pointerType==="touch")return;
    const rect=host.getBoundingClientRect();targetPointer=(event.clientX-rect.left)/rect.width-.5;
  },{signal:events.signal});
  panel?.addEventListener("pointerleave",()=>{targetPointer=0;},{signal:events.signal});
  document.addEventListener("visibilitychange",()=>{
    if(document.hidden&&frame){cancelAnimationFrame(frame);frame=0;}else{lastFrame=0;schedule();}
  },{signal:events.signal});
  renderer.domElement.addEventListener("webglcontextlost",event=>{event.preventDefault();lost=true;if(frame)cancelAnimationFrame(frame);frame=0;onLost();},{signal:events.signal});
  renderer.domElement.addEventListener("webglcontextrestored",()=>{lost=false;resize();onReady();},{signal:events.signal});
  resize();onReady();
  return {
    setState(p,c){progress=p;current=c;lastFrame=0;schedule();},
    setPaused(value){paused=value;lastFrame=0;schedule();},
    dispose(){
      if(disposed)return;disposed=true;events.abort();resizeObserver.disconnect();intersection.disconnect();if(frame)cancelAnimationFrame(frame);
      const geometries=new Set(),materials=new Set(),textures=new Set(model.textures);
      root.traverse(object=>{
        if(object.geometry)geometries.add(object.geometry);
        if(object.material)(Array.isArray(object.material)?object.material:[object.material]).forEach(material=>{
          materials.add(material);Object.values(material).forEach(value=>{if(value?.isTexture)textures.add(value);});
        });
      });
      geometries.forEach(value=>value.dispose());materials.forEach(value=>value.dispose());textures.forEach(value=>value.dispose());
      env.dispose();key.shadow.dispose();scene.clear();renderer.dispose();renderer.forceContextLoss();renderer.domElement.remove();
    },
  };
}

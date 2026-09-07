import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

// A bespoke parametric instrument: separate machined parts, not a flat icon.
export function createInstrument(host,{paused=false,onReady,onLost}) {
  const events = new AbortController();
  const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:"low-power",preserveDrawingBuffer:true});
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.65));
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure=1.22;
  renderer.shadowMap.enabled=true;
  renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  renderer.domElement.setAttribute("aria-hidden","true");
  host.append(renderer.domElement);
  const scene=new THREE.Scene();
  const camera=new THREE.PerspectiveCamera(34,1,.1,60);
  const environment=new RoomEnvironment();
  const generator=new THREE.PMREMGenerator(renderer);
  const environmentTarget=generator.fromScene(environment,.05);
  scene.environment=environmentTarget.texture;
  scene.environmentIntensity=.85;
  environment.dispose(); generator.dispose();

  // Fine non-directional variation breaks up polished metal without wood grain.
  let seed=83;
  const rand=()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646;};
  const textureCanvas=document.createElement("canvas");
  textureCanvas.width=textureCanvas.height=256;
  const ctx=textureCanvas.getContext("2d");
  const pixels=ctx.createImageData(256,256);
  for(let i=0;i<pixels.data.length;i+=4) {
    const value=135+rand()*34;
    pixels.data[i]=value;pixels.data[i+1]=value;pixels.data[i+2]=value;pixels.data[i+3]=255;
  }
  ctx.putImageData(pixels,0,0);
  const grain=new THREE.CanvasTexture(textureCanvas);
  grain.wrapS=grain.wrapT=THREE.RepeatWrapping;
  grain.repeat.set(4,2);
  const brass=new THREE.MeshStandardMaterial({color:0xb49763,metalness:.89,roughness:.32,roughnessMap:grain});
  const bright=new THREE.MeshStandardMaterial({color:0xd1b579,metalness:.86,roughness:.23,roughnessMap:grain});
  const antique=new THREE.MeshStandardMaterial({color:0x63503b,metalness:.82,roughness:.46});
  const black=new THREE.MeshStandardMaterial({color:0x14252a,metalness:.55,roughness:.3});
  const steel=new THREE.MeshStandardMaterial({color:0x52626a,metalness:.9,roughness:.3});
  const dark=new THREE.MeshStandardMaterial({color:0x0b1014,metalness:.25,roughness:.55});
  const ink=new THREE.MeshBasicMaterial({color:0xd5c297});
  const glassMaterial=new THREE.ShaderMaterial({
    uniforms:{clarity:{value:.4}},
    vertexShader:`varying vec3 vN; varying vec3 vP; varying vec2 vUv;
      void main(){vUv=uv;vN=normalize(mat3(modelMatrix)*normal);vec4 p=modelMatrix*vec4(position,1.);vP=p.xyz;gl_Position=projectionMatrix*viewMatrix*p;}`,
    fragmentShader:`varying vec3 vN; varying vec3 vP; varying vec2 vUv; uniform float clarity;
      void main(){
        vec3 n=normalize(vN);vec3 v=normalize(cameraPosition-vP);
        float fresnel=pow(1.-abs(dot(n,v)),2.4);
        float reflection=pow(max(dot(reflect(-v,n),normalize(vec3(.1,1.,.8))),0.),24.);
        float glint=pow(max(dot(reflect(-v,n),normalize(vec3(.5,.2,.9))),0.),100.);
        vec3 base=mix(vec3(.009,.029,.046),vec3(.12,.29,.32),fresnel);
        base+=vec3(.33,.47,.40)*reflection*.8+vec3(.72,.77,.68)*glint*.7;
        base+=vec3(.025,.09,.08)*clarity;
        gl_FragColor=vec4(base,1.);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  });

  const model=new THREE.Group();
  model.rotation.y=-.13;
  scene.add(model);
  function mesh(geometry,material,parent=model) {
    const object=new THREE.Mesh(geometry,material);
    object.castShadow=true;object.receiveShadow=true;parent.add(object);return object;
  }
  function cylinder(radius,length,material,parent=model,x=0,y=0,z=0,axis="y",segments=64) {
    const object=mesh(new THREE.CylinderGeometry(radius,radius,length,segments),material,parent);
    if(axis==="x") object.rotation.z=-Math.PI/2;
    if(axis==="z") object.rotation.x=Math.PI/2;
    object.position.set(x,y,z);return object;
  }
  function bar(a,b,width,material,parent=model) {
    const from=new THREE.Vector3(...a),to=new THREE.Vector3(...b);
    const object=mesh(new THREE.CylinderGeometry(width,width,to.distanceTo(from),12),material,parent);
    object.position.copy(from).add(to).multiplyScalar(.5);
    object.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),to.sub(from).normalize());
    return object;
  }
  function ring(radius,tube,material,parent,x,y,z,axis="z") {
    const object=mesh(new THREE.TorusGeometry(radius,tube,10,80),material,parent);
    if(axis==="x")object.rotation.y=Math.PI/2;
    if(axis==="y")object.rotation.x=Math.PI/2;
    object.position.set(x,y,z);return object;
  }
  function screw(x,y,z,parent=model,scale=1) {
    cylinder(.031*scale,.014*scale,bright,parent,x,y,z,"z",16);
    const slit=mesh(new THREE.BoxGeometry(.041*scale,.006*scale,.005*scale),dark,parent);
    slit.position.set(x,y,z+.01*scale);slit.rotation.z=.3;
  }
  function knob(x,y,z,r,parent=model) {
    cylinder(r,.095,antique,parent,x,y,z,"z");
    cylinder(r*.88,.102,bright,parent,x,y,z,"z");
    for(let i=0;i<28;i++){
      const a=i*Math.PI*2/28;
      cylinder(.007,.095,antique,parent,x+Math.cos(a)*r,y+Math.sin(a)*r,z,"z",6);
    }
    screw(x,y,z+.06,parent,.9);
  }

  // A stable tripod with three spreading legs and visible fastening hardware.
  cylinder(.36,.25,black,model,0,-.62,0);
  cylinder(.39,.055,bright,model,0,-.72,0);
  cylinder(.32,.12,antique,model,0,-.42,0);
  for(let i=0;i<3;i++) {
    const a=i*Math.PI*2/3+.2;
    const top=[Math.cos(a)*.26,-.7,Math.sin(a)*.26];
    const foot=[Math.cos(a)*1.32,-2.12,Math.sin(a)*1.32];
    const center=new THREE.Vector3(...top).lerp(new THREE.Vector3(...foot),.7);
    bar(top,foot,.07,black);
    const sleeve=new THREE.Vector3(...top).lerp(new THREE.Vector3(...foot),.8);
    bar([center.x,center.y,center.z],[sleeve.x,sleeve.y,sleeve.z],.089,bright);
    cylinder(.14,.075,dark,model,...foot);
    bar([Math.cos(a)*.11,-1.23,Math.sin(a)*.11],[Math.cos(a)*.82,-1.57,Math.sin(a)*.82],.022,antique);
    cylinder(.105,.10,bright,model,top[0],top[1],top[2],"z");
  }
  cylinder(.19,.06,antique,model,0,-1.25,0);
  cylinder(.15,.69,black,model,0,-.12,0);
  cylinder(.20,.07,bright,model,0,-.23,0);
  cylinder(.21,.11,antique,model,0,.11,0);
  bar([-.28,.07,-.15],[-.28,.57,-.15],.07,antique);
  bar([.28,.07,-.15],[.28,.57,-.15],.07,antique);

  // Altitude circle: engraved divisions, concentric rims, index pointer.
  cylinder(.53,.105,antique,model,0,.39,.30,"z");
  cylinder(.49,.12,bright,model,0,.39,.32,"z");
  cylinder(.37,.13,black,model,0,.39,.34,"z");
  ring(.46,.009,ink,model,0,.39,.389);
  ring(.35,.009,bright,model,0,.39,.412);
  for(let i=0;i<120;i++){
    const a=i*Math.PI/60;
    const length=i%10===0?.075:i%5===0?.046:.022;
    const mark=mesh(new THREE.BoxGeometry(i%10===0?.007:.004,length,.002),dark);
    mark.position.set(Math.sin(a)*(.453-length/2),.39+Math.cos(a)*(.453-length/2),.385);
    mark.rotation.z=-a;
  }
  cylinder(.15,.17,antique,model,0,.39,.36,"z");
  cylinder(.10,.20,bright,model,0,.39,.38,"z");
  screw(0,.39,.49,model,1.5);
  for(let i=0;i<4;i++)screw(Math.cos(i*Math.PI/2)*.295,.39+Math.sin(i*Math.PI/2)*.295,.419,model,.65);
  bar([.16,-.05,.50],[.32,.34,.50],.018,bright);
  knob(.35,-.03,.50,.09);

  const optical=new THREE.Group();
  optical.position.set(0,.64,0);
  optical.rotation.z=.32;
  model.add(optical);
  // Optical train runs along X: eyepiece, drawtube, main barrel, dew shield.
  cylinder(.265,2.68,brass,optical,.0,0,0,"x");
  cylinder(.268,1.26,black,optical,-.05,0,0,"x");
  for(const x of [-1.32,-1.20,-.69,.58,1.22,1.32]) {
    cylinder(x===-.69||x===.58?.29:.281,.045,bright,optical,x,0,0,"x");
    ring(.281,.007,antique,optical,x+.025,0,0,"x");
  }
  cylinder(.18,.52,antique,optical,-1.57,0,0,"x");
  cylinder(.187,.035,bright,optical,-1.82,0,0,"x");
  cylinder(.11,.34,brass,optical,-2.0,0,0,"x");
  cylinder(.145,.16,dark,optical,-2.18,0,0,"x");
  ring(.134,.012,antique,optical,-2.12,0,0,"x");
  // Small rack below the drawtube and finely knurled focus wheel.
  for(let i=0;i<16;i++){
    const tooth=mesh(new THREE.BoxGeometry(.018,.025,.05),bright,optical);
    tooth.position.set(-1.39-i*.025,-.178,0);
  }
  cylinder(.041,.59,steel,optical,-1.43,-.18,0,"z");
  knob(-1.43,-.18,.34,.118,optical);
  knob(-1.43,-.18,-.34,.118,optical);
  cylinder(.35,.73,brass,optical,1.7,0,0,"x");
  for(const x of [1.36,1.45,1.99,2.045])ring(.35,.012,bright,optical,x,0,0,"x");
  cylinder(.326,.034,dark,optical,2.075,0,0,"x");
  const lens=mesh(new THREE.SphereGeometry(.306,48,32),glassMaterial,optical);
  lens.scale.x=.13;lens.position.x=2.086;
  ring(.321,.014,bright,optical,2.10,0,0,"x");
  ring(.302,.007,steel,optical,2.102,0,0,"x");
  for(let i=0;i<8;i++){
    const a=i*Math.PI/4;
    const pin=cylinder(.013,.012,antique,optical,2.111,Math.cos(a)*.337,Math.sin(a)*.337,"x",8);
    pin.castShadow=false;
  }
  // Saddle straps and a secondary sight, each physically separate from the barrel.
  for(const x of [-.54,.44]){
    ring(.295,.022,antique,optical,x,0,0,"x");
    cylinder(.305,.024,bright,optical,x,0,0,"x");
    bar([x,-.29,-.12],[x,-.38,-.12],.045,antique,optical);
    screw(x,-.29,.21,optical,.85);
  }
  bar([-.15,.23,0],[-.15,.51,0],.02,antique,optical);
  bar([.63,.23,0],[.63,.51,0],.02,antique,optical);
  cylinder(.065,.99,black,optical,.25,.51,0,"x",32);
  ring(.067,.012,bright,optical,-.25,.51,0,"x");
  ring(.075,.016,bright,optical,.745,.51,0,"x");
  cylinder(.068,.03,glassMaterial,optical,.755,.51,0,"x",32);

  // A maker's inscription is attached to the front-facing enamel, not floating UI.
  const labelCanvas=document.createElement("canvas");
  labelCanvas.width=1024;labelCanvas.height=256;
  const labelContext=labelCanvas.getContext("2d");
  labelContext.fillStyle="#cdb986";labelContext.textAlign="center";
  labelContext.font="32px Georgia";labelContext.fillText("N O R T H   S T A R",512,89);
  labelContext.font="20px Georgia";labelContext.fillText("OBSERVATORY  ·  INSTRUMENT  III",512,144);
  labelContext.strokeStyle="#a48a51";labelContext.lineWidth=1;
  labelContext.beginPath();labelContext.moveTo(150,177);labelContext.lineTo(874,177);labelContext.stroke();
  const labelTexture=new THREE.CanvasTexture(labelCanvas);
  labelTexture.colorSpace=THREE.SRGBColorSpace;
  const label=mesh(new THREE.PlaneGeometry(.95,.24),new THREE.MeshStandardMaterial({map:labelTexture,transparent:true,roughness:.55,metalness:.5,depthWrite:false}),optical);
  label.position.set(-.04,.04,.27);

  // Turned base, soft contact shadow and a small brass maker's plaque.
  const plinth=cylinder(1.69,.11,black,model,0,-2.21,0,"y",96);
  plinth.scale.z=.88;
  const baseRim=ring(1.67,.018,antique,model,0,-2.166,0,"y");baseRim.scale.y=.88;
  const floor=mesh(new THREE.PlaneGeometry(18,18),new THREE.ShadowMaterial({opacity:.20}),scene);
  floor.rotation.x=-Math.PI/2;floor.position.y=-2.27;floor.castShadow=false;
  const key=new THREE.DirectionalLight(0xffe0a6,3.1);
  key.position.set(-3,6,5);key.castShadow=true;
  key.shadow.mapSize.set(1024,1024);key.shadow.camera.left=-4;key.shadow.camera.right=4;
  key.shadow.camera.top=4;key.shadow.camera.bottom=-4;key.shadow.normalBias=.018;
  scene.add(key);
  const rim=new THREE.DirectionalLight(0xb4d8e3,2.8);rim.position.set(4,2,-4);scene.add(rim);
  const fill=new THREE.DirectionalLight(0xe8e1d2,.5);fill.position.set(0,1,7);scene.add(fill);


  let targetX=0,targetY=0,pointerX=0,pointerY=0,zoom=0,zoomTarget=0,progress=0;
  let frame=0,visible=true,dirty=true,lost=false,disposed=false;
  let targetAngle=.32,actualAngle=.32;
  function draw(){
    frame=0;
    if(disposed||lost||!visible||document.hidden)return;
    const rate=paused?1:.085;
    pointerX+=(targetX-pointerX)*rate;pointerY+=(targetY-pointerY)*rate;
    zoom+=(zoomTarget-zoom)*rate;actualAngle+=(targetAngle-actualAngle)*rate;
    const aspect=host.clientWidth/Math.max(1,host.clientHeight);
    const distance=aspect<1?1.13:1;
    camera.position.set((5.1-zoom*1.45+pointerX*.25)*distance,(2.3+zoom*.5+pointerY*.16)*distance,(8.1-zoom*1.1)*distance);
    camera.lookAt(.10,-.25+zoom*.65,0);
    optical.rotation.z=actualAngle;
    model.rotation.y=-.13+(paused?0:pointerX*.05);
    renderer.render(scene,camera);
    renderer.domElement.dataset.renderedWidth=String(host.clientWidth);
    renderer.domElement.dataset.renderedHeight=String(host.clientHeight);
    dirty=false;
    if(Math.abs(targetX-pointerX)+Math.abs(targetY-pointerY)+Math.abs(zoomTarget-zoom)+Math.abs(targetAngle-actualAngle)>.002) schedule();
  }
  function schedule(){dirty=true;if(!frame&&visible&&!document.hidden&&!lost&&!disposed)frame=requestAnimationFrame(draw);}
  function resize(){
    const w=host.clientWidth,h=host.clientHeight;
    if(!w||!h)return;
    renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();
    renderer.domElement.dataset.renderedWidth="0";
    renderer.domElement.dataset.renderedHeight="0";
    schedule();
  }
  const observer=new ResizeObserver(resize);observer.observe(host);
  const intersection=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(visible&&dirty)schedule();});intersection.observe(host);
  const parent=host.closest(".north-star-observatory") || host;
  parent.addEventListener("pointermove",event=>{
    if(paused||event.pointerType==="touch")return;
    const rect=parent.getBoundingClientRect();
    targetX=(event.clientX-rect.left)/rect.width-.5;targetY=(event.clientY-rect.top)/rect.height-.5;schedule();
  }, {signal:events.signal});
  parent.addEventListener("pointerleave",()=>{targetX=targetY=0;schedule();}, {signal:events.signal});
  document.addEventListener("visibilitychange",()=>{if(!document.hidden)schedule();else if(frame){cancelAnimationFrame(frame);frame=0;}}, {signal:events.signal});
  renderer.domElement.addEventListener("webglcontextlost",event=>{event.preventDefault();lost=true;if(frame)cancelAnimationFrame(frame);frame=0;onLost();}, {signal:events.signal});
  renderer.domElement.addEventListener("webglcontextrestored",()=>{lost=false;schedule();onReady();}, {signal:events.signal});
  resize();draw();onReady();
  return {
    dispose(){
      if(disposed)return;
      disposed=true;
      events.abort();
      observer.disconnect();intersection.disconnect();
      if(frame)cancelAnimationFrame(frame);
      const geometries=new Set(), materials=new Set(), textures=new Set([grain,labelTexture]);
      scene.traverse(object=>{
        if(object.geometry)geometries.add(object.geometry);
        if(object.material){
          const list=Array.isArray(object.material)?object.material:[object.material];
          list.forEach(material=>materials.add(material));
        }
      });
      geometries.forEach(geometry=>geometry.dispose());
      materials.forEach(material=>material.dispose());
      textures.forEach(texture=>texture.dispose());
      environmentTarget.dispose();
      key.shadow.dispose();
      scene.clear();
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
    },
    setProgress(value){progress=value;targetAngle=.32+progress*.013;glassMaterial.uniforms.clarity.value=.4+value*.1;schedule();},
    setInspect(value){zoomTarget=value?1:0;schedule();},
    setPaused(value){paused=value;if(paused){targetX=targetY=0;}schedule();},
  };
}


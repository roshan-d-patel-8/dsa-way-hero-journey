import * as THREE from 'three';

const CYAN = 0x75e2e6;
const GOLD = 0xffba58;
const PINK = 0xe986b0;

// A shared coordinate system integrates the paths, instrument nodes, and grid.
// The waiting coil is a time metaphor, not an assertion of repeated handoffs.
export function createInstrument(stage, { paused: initiallyPaused, onProgress, onRenderer, labels, fallback }) {
  let renderer;
  let width = 0, height = 0, worldWidth = 9.6;
  let mobile = false, progress = 0, target = 0, paused = initiallyPaused;
  let contextLost = false;
  let disposed = false, concept = false, frame = 0, elapsed = 0, lastTime = 0;
  let selected = -1;
  let official, observed, finalScene, camera, finalCamera, composite;
  let targetA, targetB, beams = [], conceptGroup, nodeRings = [];
  const desktop = { official: [[.14,.49],[.50,.49],[.86,.49]], observed: [[.14,.53],[.50,.68],[.86,.50]] };
  const compact = { official: [[.23,.25],[.68,.43],[.72,.72]], observed: [[.23,.25],[.70,.38],[.72,.74]] };
  const matCache = new Set();
  const motionMedia = matchMedia('(prefers-reduced-motion: reduce)');

  function point(x, y, z = .18) { return new THREE.Vector3((x - .5) * worldWidth, (.5 - y) * 6.4, z); }
  function material(color, options = {}) {
    const mat = new THREE.MeshStandardMaterial({ color, metalness: .55, roughness: .36, ...options });
    matCache.add(mat);
    return mat;
  }
  function cleanScene(scene) {
    scene?.traverse((object) => { object.geometry?.dispose(); });
  }
  function line(points, color, opacity = .3) {
    const geom = new THREE.BufferGeometry().setFromPoints(points);
    const mat = new THREE.LineBasicMaterial({ color, transparent: true, opacity });
    matCache.add(mat);
    return new THREE.Line(geom, mat);
  }
  function makeScene(observedView) {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(observedView ? '#091a1e' : '#081a24');
    scene.add(new THREE.AmbientLight(observedView ? 0xc6b484 : 0x8bced8, 2.1));
    const key = new THREE.DirectionalLight(0xffe7b5, 4); key.position.set(-3, 4, 8); scene.add(key);
    const rim = new THREE.PointLight(observedView ? GOLD : CYAN, 17, 14); rim.position.set(2, 1, 3); scene.add(rim);
    const fill = new THREE.PointLight(CYAN, 9, 12); fill.position.set(-3, -1, 2); scene.add(fill);

    // Etched coordinates, contour elevations, and inset stations share the same plane.
    const grid = new THREE.Group();
    for (let x = -worldWidth / 2; x <= worldWidth / 2; x += .32) {
      grid.add(line([new THREE.Vector3(x,-3.2,-.08),new THREE.Vector3(x,3.2,-.08)], 0x426b72, .16));
    }
    for (let y = -3.2; y <= 3.2; y += .32) {
      grid.add(line([new THREE.Vector3(-worldWidth/2,y,-.08),new THREE.Vector3(worldWidth/2,y,-.08)], 0x426b72, .16));
    }
    for (let x = -.43 * worldWidth; x < worldWidth * .48; x += .64) {
      for (let y = -2.9; y < 2.9; y += .64) {
        grid.add(line([new THREE.Vector3(x-.025,y,0),new THREE.Vector3(x+.025,y,0)],0x89b5b4,.26));
        grid.add(line([new THREE.Vector3(x,y-.025,0),new THREE.Vector3(x,y+.025,0)],0x89b5b4,.26));
      }
    }
    scene.add(grid);
    if (observedView) {
      for (let n = 0; n < 15; n++) {
        const points = [];
        for (let i = 0; i <= 180; i++) {
          const a = i / 180 * Math.PI * 2;
          const radius = .11 + n * .033;
          const x = .52 + Math.cos(a) * radius * (.9 + .08 * Math.cos(a * 3 + n * .04));
          const y = .46 + Math.sin(a) * radius * .70 * (1 + .12 * Math.sin(a * 4));
          points.push(point(x, y, -.02));
        }
        scene.add(line(points, 0xb68e4e, .09 + n % 3 * .018));
      }
    }
    return scene;
  }

  function curvePath(scene, coords, color, thickness = .037, flow = true, shadow = true) {
    const curve = new THREE.CatmullRomCurve3(coords.map(([x,y,z]) => point(x,y,z ?? .2)), false, 'centripetal');
    const geo = new THREE.TubeGeometry(curve, 220, thickness, 8, false);
    const mesh = new THREE.Mesh(geo, material(color, { emissive: color, emissiveIntensity: .20 }));
    scene.add(mesh);
    // The offset dark edge makes crossings read as over/under, not flat tangles.
    if (shadow) {
      const shadowCurve = new THREE.CatmullRomCurve3(coords.map(([x,y]) => point(x+.007,y+.012,.015)), false, 'centripetal');
      scene.add(new THREE.Mesh(new THREE.TubeGeometry(shadowCurve,220,thickness*1.8,6,false),material(0x01080c,{metalness:0,roughness:1})));
    }
    if (flow) {
      const dots = [];
      for (let i = 0; i < 3; i++) {
        const dot = new THREE.Mesh(new THREE.SphereGeometry(thickness*1.45,8,8), material(color,{emissive:color,emissiveIntensity:2}));
        scene.add(dot); dots.push(dot);
      }
      beams.push({ curve, dots, speed: color === GOLD ? .012 : .045, offset: Math.random() * .3 });
    }
    return curve;
  }
  function station(scene, xy, index, observedView = false) {
    const p = point(...xy,.14);
    const group = new THREE.Group(); group.position.copy(p);
    const back = new THREE.Mesh(new THREE.CylinderGeometry(.32,.37,.085,8),material(0x102831));
    back.rotation.x = Math.PI / 2; group.add(back);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(.255,.018,6,56),material(observedView ? GOLD : CYAN,{emissive: observedView ? GOLD : CYAN,emissiveIntensity:.35}));
    ring.position.z=.055; group.add(ring);
    const inner = new THREE.Mesh(new THREE.CylinderGeometry(.21,.21,.055,48),material(0x0b1b20));
    inner.rotation.x=Math.PI/2; inner.position.z=.055;group.add(inner);
    const gemstone = new THREE.Mesh(new THREE.OctahedronGeometry(.09),material(observedView ? GOLD : CYAN,{emissive:observedView ? GOLD : CYAN,emissiveIntensity:.6}));
    gemstone.position.z=.14; gemstone.rotation.z=Math.PI/4;group.add(gemstone);
    for(let i=0;i<12;i++) {
      const angle = i/12*Math.PI*2;
      group.add(line([new THREE.Vector3(Math.cos(angle)*.29,Math.sin(angle)*.29,.09),new THREE.Vector3(Math.cos(angle)*.32,Math.sin(angle)*.32,.09)],0xf6d38c,.65));
    }
    scene.add(group);
    if(observedView) nodeRings.push({ring,index,gemstone});
  }
  function batchEtching(scene) {
    // Hundreds of engraved grid/tick lines become a few GPU draw calls.
    scene.updateMatrixWorld(true);
    const groups = new Map(), originals = [];
    scene.traverse((object) => {
      if (!object.isLine || object.isLineSegments) return;
      const key = `${object.material.color.getHex()}-${object.material.opacity}`;
      if (!groups.has(key)) groups.set(key, { positions: [], material: object.material });
      const bucket = groups.get(key), attribute = object.geometry.getAttribute('position');
      for (let i = 1; i < attribute.count; i++) {
        for (const index of [i - 1, i]) {
          const vertex = new THREE.Vector3().fromBufferAttribute(attribute, index).applyMatrix4(object.matrixWorld);
          bucket.positions.push(vertex.x, vertex.y, vertex.z);
        }
      }
      originals.push(object);
    });
    for (const object of originals) { object.removeFromParent(); object.geometry.dispose(); }
    for (const bucket of groups.values()) {
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(bucket.positions, 3));
      scene.add(new THREE.LineSegments(geometry, bucket.material));
    }
  }
  function nodeMarkup() {
    const layout = mobile ? compact : desktop;
    const officialNames = ['RECEIVED','REVIEWED','SCHEDULED'];
    const officialSub = ['Assigned team','Assigned reviewer','Patient notified'];
    const observedNames = ['AFM SUBMITS','COVERED POOL','ACTIVE REVIEW'];
    const observedSub = ['08:07 · correct pool','Owned ≠ being reviewed','15:42–15:45 · 3 minutes'];
    labels.innerHTML = ['official','observed'].map((mode) => layout[mode].map(([x,y],i) => `<div class="node ${mode}" style="left:${x*100}%;top:${(y+.10)*100}%"><span class="number">0${i+1}</span><b>${mode==='official'?officialNames[i]:observedNames[i]}</b><small>${mode==='official'?officialSub[i]:observedSub[i]}</small></div>`).join('')).join('');
    updateProgress();
  }
  function fallbackDrawing() {
    // Keep the non-WebGL view aligned with the same responsive station locations.
    const layout = mobile ? compact : desktop;
    const [start,pool,review] = layout.observed;
    const toPath = (coords) => {
      const curve = new THREE.CatmullRomCurve3(coords.map(([x,y])=>new THREE.Vector3(x*1000,y*650,0)));
      return curve.getPoints(120).map((p,i)=>`${i?'L':'M'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
    };
    const waiting = mobile
      ? [pool,[.82,.49],[.59,.68],[.24,.59],[.29,.40],[.57,.46],[.48,.67],[.20,.68],[.17,.49],[.50,.43],[.58,.57],[.34,.65],[.26,.51],[.41,.46],[.64,.61],review]
      : [pool,[.67,.61],[.77,.39],[.62,.22],[.31,.30],[.27,.49],[.61,.53],[.68,.33],[.50,.21],[.31,.39],[.43,.57],[.75,.45],[.57,.29],[.40,.40],[.65,.58],review];
    const nodes = (mode) => layout[mode].map(([x,y])=>`<circle cx="${x*1000}" cy="${y*650}" r="${mobile?37:23}" fill="#0a2029" stroke="${mode==='official'?'#75e2e6':'#ffc45e'}" stroke-width="2" vector-effect="non-scaling-stroke"/>`).join('');
    const extra = concept ? `<path d="${toPath([review,mobile?[.88,.28]:[.70,.23],mobile?[.31,.31]:[.30,.20],start,pool,review])}" fill="none" style="stroke:#ef7a75" stroke-width="2" vector-effect="non-scaling-stroke"/>` : '';
    fallback.innerHTML=`<defs><pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0V40" fill="none" stroke="#31525a" stroke-width="1"/></pattern></defs><rect width="1000" height="650" fill="url(#grid)"/><g class="fallback-official"><path d="${toPath(layout.official)}" fill="none" stroke="#75e2e6" stroke-width="3" vector-effect="non-scaling-stroke"/>${nodes('official')}</g><g class="fallback-observed"><path d="${toPath([start,pool])}" fill="none" style="stroke:#75e2e6" stroke-width="3" vector-effect="non-scaling-stroke"/><path d="${toPath(waiting)}" fill="none" style="stroke:#ffc45e" stroke-width="4" vector-effect="non-scaling-stroke"/>${extra}${nodes('observed')}</g>`;
  }
  function buildScenes() {
    cleanScene(official); cleanScene(observed);
    for(const mat of matCache) mat.dispose(); matCache.clear();
    beams=[]; nodeRings=[];
    official=makeScene(false);observed=makeScene(true);
    const layout=mobile?compact:desktop;
    layout.official.forEach((xy,i)=>station(official,xy,i));
    curvePath(official,layout.official.map(xy=>[...xy,.13]),CYAN,.029,false);
    layout.observed.forEach((xy,i)=>station(observed,xy,i,true));
    const [start,pool,review]=layout.observed;
    curvePath(observed,[start,mobile?[.33,.33,.25]:[.28,.58,.25],pool],CYAN,.030,true);
    const coils = mobile
      ? [pool,[.82,.49,.26],[.59,.68,.40],[.24,.59,.45],[.29,.40,.50],[.57,.46,.35],[.48,.67,.32],[.20,.68,.26],[.17,.49,.21],[.50,.43,.29],[.58,.57,.5],[.34,.65,.55],[.26,.51,.56],[.41,.46,.6],[.64,.61,.35],review]
      : [pool,[.67,.61,.3],[.77,.39,.30],[.62,.22,.4],[.31,.30,.5],[.27,.49,.38],[.61,.53,.27],[.68,.33,.45],[.50,.21,.58],[.31,.39,.62],[.43,.57,.38],[.75,.45,.28],[.57,.29,.36],[.40,.40,.5],[.65,.58,.62],review];
    curvePath(observed,coils,GOLD,.042,false);
    // Dots are stationary on the waiting coil: no suggestion of continuous work.
    const queueY=mobile?.62:.20;
    for(let i=0;i<14;i++){
      const x=mobile?.10+(i%2)*.045:.35+i*.023;
      const y=mobile?queueY+(Math.floor(i/2)-3)*.018:queueY;
      const dot=new THREE.Mesh(new THREE.BoxGeometry(.035,.035,.022),material(GOLD,{emissive:GOLD,emissiveIntensity:.3}));dot.position.copy(point(x,y,.06));observed.add(dot);
    }
    const patient = mobile ? [[.34,.83,.1],[.16,.80,.18],[.12,.63,.22],[.25,.45,.19],pool] : [[.86,.79,.1],[.92,.66,.14],[.74,.70,.19],[.67,.83,.24],pool];
    curvePath(observed,patient,PINK,.016,false);
    conceptGroup=new THREE.Group(); observed.add(conceptGroup);
    const backtracks=mobile
      ? [[review,[.89,.65,.6],[.87,.32,.7],[.38,.21,.7],start], [pool,[.49,.29,.7],[.14,.36,.8],[.29,.76,.6],review], [review,[.48,.70,.9],[.40,.36,.8],pool]]
      : [[review,[.79,.30,.7],[.40,.18,.8],[.19,.28,.7],start], [pool,[.25,.72,.6],[.12,.37,.7],[.37,.22,.9],[.80,.30,.8],review], [review,[.57,.57,.9],[.39,.36,.75],[.24,.64,.6],pool]];
    backtracks.forEach(points=>curvePath(conceptGroup,points,0xef7a75,.020,true));
    conceptGroup.visible=concept;
    batchEtching(official);batchEtching(observed);
    nodeMarkup();
  }

  function updateProgress() {
    onProgress(progress);
    const oldOpacity=Math.max(0,1-progress*4);
    const newOpacity=Math.min(1,Math.max(0,(progress-.3)/.28));
    labels.querySelectorAll('.official').forEach(el=>{el.style.opacity=oldOpacity;});
    labels.querySelectorAll('.observed').forEach(el=>{el.style.opacity=newOpacity;});
  }
  function resize() {
    if(disposed)return;
    const rect=stage.getBoundingClientRect();
    width=Math.max(1,Math.round(rect.width));height=Math.max(1,Math.round(rect.height));
    mobile=width<450;worldWidth=6.4*width/height;
    if(renderer) {
      renderer.setSize(width,height);
      const pr=renderer.getPixelRatio();targetA.setSize(width*pr,height*pr);targetB.setSize(width*pr,height*pr);
      camera.left=-worldWidth/2;camera.right=worldWidth/2;camera.updateProjectionMatrix();
      composite.uniforms.uAspect.value=width/height;
      buildScenes();
    } else { nodeMarkup(); }
    fallbackDrawing();
    draw();
  }
  function draw() {
    if(!renderer || disposed || contextLost) return;
    for(const beam of beams) {
      beam.dots.forEach((dot,i)=>{dot.position.copy(beam.curve.getPoint((elapsed*beam.speed+i/3+beam.offset)%1));});
    }
    for(const {ring,index,gemstone} of nodeRings) {
      const highlight=selected===index || (selected===3&&index===1) || (selected===5);
      ring.material.emissiveIntensity=highlight?.9:.35;
      gemstone.rotation.z=elapsed*.12+Math.PI/4;
    }
    renderer.setRenderTarget(targetA);renderer.render(official,camera);
    renderer.setRenderTarget(targetB);renderer.render(observed,camera);
    renderer.setRenderTarget(null);
    composite.uniforms.uProgress.value=progress;
    composite.uniforms.uTime.value=elapsed;
    renderer.render(finalScene,finalCamera);
  }
  function tick(time) {
    if(disposed)return;
    const dt=Math.min((time-lastTime)/1000 || 0,.1);lastTime=time;
    if(!paused && !document.hidden) {
      elapsed+=dt;
      const transitioning=progress!==target;
      if(progress!==target) {
        const speed=target===1?.44:.70;
        progress=target>progress?Math.min(target,progress+dt*speed):Math.max(target,progress-dt*speed);
        updateProgress();
      }
      if(progress>0 || transitioning)draw();
    }
    frame=requestAnimationFrame(tick);
  }

  try {
    if(new URLSearchParams(location.search).has('gembaFallback')) throw new Error('Fallback preview requested');
    renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'low-power'});
    renderer.setPixelRatio(Math.min(devicePixelRatio,1.65));
    renderer.outputColorSpace=THREE.SRGBColorSpace;
    renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.1;
    renderer.domElement.setAttribute('aria-hidden','true');
    stage.prepend(renderer.domElement);
    targetA=new THREE.WebGLRenderTarget(1,1);targetB=new THREE.WebGLRenderTarget(1,1);
    camera=new THREE.OrthographicCamera(-4.8,4.8,3.2,-3.2,.1,30);camera.position.z=10;
    finalScene=new THREE.Scene();finalCamera=new THREE.OrthographicCamera(-1,1,1,-1,0,1);
    composite=new THREE.ShaderMaterial({
      uniforms:{uOfficial:{value:targetA.texture},uObserved:{value:targetB.texture},uProgress:{value:0},uTime:{value:0},uAspect:{value:1}},
      vertexShader:'varying vec2 vUv; void main(){vUv=uv;gl_Position=vec4(position.xy,0.0,1.0);}',
      fragmentShader:`
        precision highp float;
        varying vec2 vUv;
        uniform sampler2D uOfficial;uniform sampler2D uObserved;
        uniform float uProgress;uniform float uTime;uniform float uAspect;
        float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453123);}
        void main(){
          vec2 center=vec2(.47,.52);
          vec2 delta=(vUv-center)*vec2(uAspect,1.);
          float dist=length(delta);
          float radius=uProgress*1.55;
          vec2 cell=floor(vUv*vec2(160.*uAspect,160.));
          float grain=hash(cell);
          float edge=dist-radius+(grain-.5)*.022;
          float mask=1.-smoothstep(-.015,.022,edge);
          if(uProgress<.001)mask=0.;if(uProgress>.999)mask=1.;
          float ring=exp(-abs(edge)*95.)*smoothstep(0.,.06,uProgress)*(1.-smoothstep(.78,1.,uProgress));
          float revealGate=smoothstep(0.,.05,uProgress)*(1.-smoothstep(.85,1.,uProgress));
          float ripple=sin(edge*140.)*exp(-abs(edge)*18.)*.011*revealGate;
          vec2 bend=normalize(delta+vec2(.0001))*ripple*vec2(1./uAspect,1.);
          vec2 uv=clamp(vUv+bend,vec2(.002),vec2(.998));
          vec3 tidy=texture2D(uOfficial,uv).rgb;
          // Optical separation occurs only at the sweep boundary, never on text.
          tidy.r=texture2D(uOfficial,clamp(uv+bend*.45,vec2(.002),vec2(.998))).r;
          vec3 real=texture2D(uObserved,uv).rgb;
          vec3 color=mix(tidy,real,mask);
          float ticks=step(.72,fract(atan(delta.y,delta.x)*36.));
          color+=vec3(.70,.44,.14)*ring*(.38+.22*ticks);
          float screen=1.-.14*pow(length((vUv-.5)*1.3),2.);
          gl_FragColor=vec4(color*screen,1.);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }`,
      depthTest:false,depthWrite:false,
    });
    finalScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2,2),composite));
    fallback.setAttribute('hidden','');
    onRenderer('OPTICAL REVEAL · 3D PATH STUDY');
    renderer.domElement.addEventListener('webglcontextlost',(event)=>{
      event.preventDefault();contextLost=true;paused=true;fallback.removeAttribute('hidden');
      renderer.domElement.style.display='none';onRenderer('ILLUSTRATED VIEW · GPU UNAVAILABLE');
      progress=target;updateProgress();
    });
  } catch {
    renderer?.dispose();renderer?.domElement.remove();renderer=null;
    onRenderer('ILLUSTRATED VIEW · NO WEBGL REQUIRED');
  }
  const observer=new ResizeObserver(resize);observer.observe(stage);resize();
  frame=requestAnimationFrame(tick);
  return {
    reveal(value,replay=false) {
      target=value?1:0;
      if(replay) progress=0;
      if(paused || motionMedia.matches || !renderer || contextLost)progress=target;
      updateProgress();draw();
    },
    setConcept(value){concept=value;if(conceptGroup)conceptGroup.visible=value;fallbackDrawing();draw();},
    setPaused(value){paused=value;if(paused){progress=target;updateProgress();draw();}},
    inspect(index){selected=index;draw();},
    dispose(){disposed=true;cancelAnimationFrame(frame);observer.disconnect();cleanScene(official);cleanScene(observed);cleanScene(finalScene);for(const mat of matCache)mat.dispose();composite?.dispose();targetA?.dispose();targetB?.dispose();renderer?.dispose();renderer?.domElement.remove();},
  };
}


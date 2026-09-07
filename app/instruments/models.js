import * as THREE from "three";
import { buildTelescope } from "./buildTelescope";

// Every line, artifact and indicator uses the same world coordinates and illumination.
export function buildInstrument(root, boxNumber) {
  const accents = {3:0xffd65a,5:0xf6a43c,8:0xf276ad,9:0xb996ff};
  const accent = accents[boxNumber];
  const materials = {
    body:new THREE.MeshStandardMaterial({color:0x182c35,metalness:.48,roughness:.57}),
    dark:new THREE.MeshStandardMaterial({color:0x071118,metalness:.25,roughness:.74}),
    metal:new THREE.MeshStandardMaterial({color:0x99846b,metalness:.55,roughness:.55}),
    edge:new THREE.MeshStandardMaterial({color:0xc2b28e,metalness:.52,roughness:.46}),
    lit:new THREE.MeshStandardMaterial({color:accent,emissive:accent,emissiveIntensity:.35,metalness:.3,roughness:.5}),
    dim:new THREE.MeshBasicMaterial({color:0x25454e}),
    line:new THREE.LineBasicMaterial({color:accent,transparent:true,opacity:.32}),
    grid:new THREE.LineBasicMaterial({color:0x39707b,transparent:true,opacity:.35}),
    bright:new THREE.LineBasicMaterial({color:accent,transparent:true,opacity:.85}),
  };
  const textures=[];
  function mesh(geometry, material=materials.body, parent=root, position=[0,0,0]) {
    const object=new THREE.Mesh(geometry,material);object.position.set(...position);
    object.castShadow=true;object.receiveShadow=true;parent.add(object);return object;
  }
  function box(size,position,material=materials.body,parent=root) {return mesh(new THREE.BoxGeometry(...size),material,parent,position);}
  function cylinder(radius,height,position,material=materials.body,parent=root,axis="y",segments=48) {
    const object=mesh(new THREE.CylinderGeometry(radius,radius,height,segments),material,parent,position);
    if(axis==="z")object.rotation.x=Math.PI/2;
    if(axis==="x")object.rotation.z=Math.PI/2;
    return object;
  }
  function ring(radius,tube,position,material=materials.edge,parent=root,axis="z",arc=Math.PI*2) {
    const object=mesh(new THREE.TorusGeometry(radius,tube,8,96,arc),material,parent,position);
    if(axis==="y")object.rotation.x=Math.PI/2;
    if(axis==="x")object.rotation.y=Math.PI/2;
    return object;
  }
  function line(points,material=materials.line,parent=root) {
    const object=new THREE.Line(new THREE.BufferGeometry().setFromPoints(points.map(p=>new THREE.Vector3(...p))),material);parent.add(object);return object;
  }
  function rod(a,b,radius=.035,material=materials.metal,parent=root) {
    const from=new THREE.Vector3(...a),to=new THREE.Vector3(...b);
    const object=cylinder(radius,from.distanceTo(to),from.clone().add(to).multiplyScalar(.5).toArray(),material,parent);
    object.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),to.sub(from).normalize());return object;
  }
  function label(text,position,width=.34,parent=root,color="#b5cbd0") {
    const canvas=document.createElement("canvas");canvas.width=256;canvas.height=64;
    const ctx=canvas.getContext("2d");ctx.fillStyle=color;ctx.font="bold 32px monospace";ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText(text,128,32);
    const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;textures.push(texture);
    const object=mesh(new THREE.PlaneGeometry(width,width/4),new THREE.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false}),parent,position);object.castShadow=false;return object;
  }
  function ticks(radius,position,parent=root,count=72) {
    for(let i=0;i<count;i++){
      const a=i/count*Math.PI*2, length=i%6===0?.12:.05;
      const mark=box([.014,length,.015],[position[0]+Math.sin(a)*radius,position[1]+Math.cos(a)*radius,position[2]],i%6===0?materials.edge:materials.dim,parent);mark.rotation.z=-a;
    }
  }
  // Grounded cabinet: a recessed map and its raised mechanical frame, never a pasted backdrop.
  cylinder(2.65,.20,[0,-2.12,0],materials.dark);
  cylinder(2.57,.075,[0,-1.995,0],materials.body);
  ring(2.49,.019,[0,-1.948,0],materials.lit,root,"y");
  ring(2.22,.012,[0,-1.941,0],materials.dim,root,"y");
  for(let i=-4;i<=4;i++){
    const x=i*.48,z=Math.sqrt(2.38**2-x*x);
    line([[x,-1.938,-z],[x,-1.938,z]],materials.grid);
    line([[-z,-1.938,x],[z,-1.938,x]],materials.grid);
  }
  for(let i=0;i<32;i++){
    const a=i/32*Math.PI*2;
    const mark=box([.025,.022,i%4===0?.15:.07],[Math.sin(a)*2.39,-1.931,Math.cos(a)*2.39],materials.metal);mark.rotation.y=a;
  }
  const back=new THREE.Group();back.position.set(0,.12,-.95);root.add(back);
  cylinder(2.46,.11,[0,0,0],materials.dark,back,"z");
  ring(2.48,.052,[0,0,.01],materials.body,back);
  ring(2.35,.014,[0,0,.075],materials.metal,back);
  ticks(2.27,[0,0,.08],back);
  for(const radius of [.64,1.2,1.78])ring(radius,.006,[0,0,.078],materials.dim,back);
  for(let i=0;i<8;i++){
    const a=i*Math.PI/4;
    line([[Math.cos(a)*.25,Math.sin(a)*.25,.09],[Math.cos(a)*2.2,Math.sin(a)*2.2,.09]],materials.grid,back);
  }
  label("N",[0,2.58,.08],.25,back);label("S",[0,-2.58,.08],.25,back);label("W",[-2.61,0,.08],.25,back);label("E",[2.61,0,.08],.25,back);
  const sweep=new THREE.Group();back.add(sweep);
  line([[0,0,.11],[2.13,0,.11]],materials.line,sweep);
  ring(2.13,.018,[0,0,.11],materials.lit,sweep,"z",.08);
  const markers=[];
  function marker(index,position,parent=root) {
    const group=new THREE.Group();group.position.set(...position);parent.add(group);
    const mat=materials.lit.clone();mat.emissiveIntensity=.15;
    const dot=mesh(new THREE.OctahedronGeometry(.072),mat,group);
    ring(.145,.008,[0,0,0],materials.dim,group);
    label(String(index+1).padStart(2,"0"),[0,-.25,.015],.32,group);
    markers.push({dot,mat,index});return group;
  }
  let updateModel=()=>{};

  if(boxNumber===3){
    const telescope=buildTelescope(root);textures.push(...telescope.textures);
    telescope.model.scale.setScalar(.69);telescope.model.position.set(-.4,-.43,.52);telescope.model.rotation.y=-.08;
    // Curved celestial meridians physically wrap behind and above the telescope.
    for(let meridian=-2;meridian<=2;meridian++){
      const points=[];
      for(let i=0;i<=64;i++){
        const a=-Math.PI/2+i/64*Math.PI;
        points.push([Math.sin(a)*2.18,Math.cos(a)*2.18-.05,-.4-Math.cos(a)*(.3+Math.abs(meridian)*.15)]);
      }
      const arc=line(points,materials.grid);arc.rotation.y=meridian*.28;
    }
    const stars=[[.83,.85,-.59],[1.67,1.04,-.52],[.26,1.87,-.50],[1.28,1.84,-.43]];
    for(let i=0;i<19;i++){
      const a=i*2.399,r=.65+(i%5)*.3;
      mesh(new THREE.OctahedronGeometry(i%4===0?.024:.012),materials.dim,root,[Math.cos(a)*r,Math.sin(a)*r+.16,-.7]);
    }
    line(stars,materials.grid);
    const route=line(stars,materials.bright);route.geometry.setDrawRange(0,1);
    stars.forEach((point,i)=>marker(i,point));
    // A fine sight-line shares the scene's perspective; it is not an opaque spotlight.
    const sight=line([[1.02,.52,.53],stars[0]],materials.line);
    updateModel=(p,c,t)=>{
      root.updateMatrixWorld(true);
      const destination=new THREE.Vector3(...stars[Math.min(c,3)]);
      const direction=telescope.model.worldToLocal(destination.clone()).sub(telescope.optical.position).normalize();
      const aim=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(1,0,0),direction);
      if(t===0)telescope.optical.quaternion.copy(aim);else telescope.optical.quaternion.slerp(aim,.12);
      root.updateMatrixWorld(true);
      const lens=telescope.optical.localToWorld(new THREE.Vector3(2.11,0,0));
      sight.geometry.attributes.position.setXYZ(0,lens.x,lens.y,lens.z);
      route.geometry.setDrawRange(0,Math.max(1,p));
      sight.geometry.attributes.position.setXYZ(1,...stars[Math.min(c,3)]);sight.geometry.attributes.position.needsUpdate=true;
      materials.line.opacity=.22+Math.sin(t*.8)*.06;
    };
  }

  if(boxNumber===5){
    const lock=new THREE.Group();lock.position.set(.62,-.06,.38);root.add(lock);
    // Offset discs expose a deep keyway and the actual pin assembly.
    cylinder(1.12,.32,[0,0,-.25],materials.metal,lock,"z");
    cylinder(1.03,.34,[0,0,-.03],materials.body,lock,"z");
    ring(.97,.06,[0,0,.18],materials.edge,lock);
    ring(.71,.025,[0,0,.24],materials.lit,lock);
    cylinder(.59,.40,[0,0,.23],materials.dark,lock,"z");
    cylinder(.37,.055,[0,0,.47],materials.metal,lock,"z");
    cylinder(.105,.065,[0,.03,.51],materials.dark,lock,"z");
    box([.13,.25,.07],[0,-.1,.52],materials.dark,lock);
    ticks(.84,[0,0,.255],lock,48);
    const shackle=new THREE.Group();lock.add(shackle);
    ring(.63,.105,[0,.95,-.15],materials.edge,shackle,"z",Math.PI);
    rod([-.63,.45,-.15],[-.63,.95,-.15],.105,materials.edge,shackle);
    rod([.63,.45,-.15],[.63,.95,-.15],.105,materials.edge,shackle);
    const pins=[];
    for(let i=0;i<4;i++){
      const x=-.44+i*.29;
      box([.22,.73,.20],[x,.94,.03],materials.dark,lock);
      pins.push(cylinder(.059,.4,[x,.87,.2],materials.edge,lock));
      ring(.064,.012,[x,1.13,.2],materials.lit,lock,"y");
    }
    const keys=[];
    for(let i=0;i<4;i++){
      const key=new THREE.Group();key.position.set(-1.9,1.3-i*.83,.66);root.add(key);keys.push(key);
      const bow=ring(.20,.041,[0,0,0],materials.edge,key);if(i===2){bow.geometry.dispose();bow.geometry=new THREE.TorusGeometry(.2,.041,6,4);bow.rotation.z=Math.PI/4;}
      rod([.19,0,0],[.77,0,0],.036,materials.metal,key);
      for(let j=0;j<3;j++)box([.065,.09+(i+j)%3*.05,.07],[.57+j*.09,-.075,0],materials.edge,key);
      cylinder(.033,.07,[.27,0,0],materials.lit,key,"x");
      marker(i,[-.4,0,0],key);
      line([[-1.02,1.3-i*.83,.61],[-.69,1.3-i*.83,.28],[-.5,.65-i*.35,.13]],materials.line);
    }
    for(let i=0;i<5;i++)line([[.62,-1.15,.18],[.62+(i-2)*.23,-1.58,.13],[.62+(i-2)*.52,-1.94,.1]],materials.bright);
    updateModel=(p,c,t)=>{
      keys.forEach((key,i)=>{key.position.x=-1.9+(i===c?.12:0);key.rotation.x=i<p?Math.PI/7:0;});
      pins.forEach((pin,i)=>{pin.position.y=.87+(i<p?.16:0);});
      shackle.position.y=p===4?.2:0;shackle.rotation.y=p===4?-.26:0;
      sweep.rotation.z=-t*.15-c*.55;
    };
  }

  if(boxNumber===8){
    const balance=new THREE.Group();balance.position.z=.50;root.add(balance);
    cylinder(.77,.13,[0,-1.81,0],materials.metal,balance);
    cylinder(.57,.15,[0,-1.7,0],materials.body,balance);
    cylinder(.12,2.97,[0,-.17,0],materials.metal,balance);
    mesh(new THREE.CylinderGeometry(.14,.24,.67,12),materials.body,balance,[0,-1.27,0]);
    for(let i=0;i<10;i++){
      const a=i*Math.PI/5;
      rod([Math.cos(a)*.127,-.91,Math.sin(a)*.127],[Math.cos(a)*.127,.70,Math.sin(a)*.127],.013,materials.edge,balance);
    }
    for(const y of [-1.48,-1.36,.83,1.04])cylinder(.19,.06,[0,y,0],materials.edge,balance);
    const pivot=new THREE.Group();pivot.position.y=1.23;balance.add(pivot);
    cylinder(.24,.3,[0,0,0],materials.body,pivot,"z");
    ring(.2,.023,[0,0,.17],materials.lit,pivot);
    cylinder(.082,.05,[0,0,.2],materials.edge,pivot,"z");
    box([.085,.012,.01],[0,0,.23],materials.dark,pivot);
    for(let i=0;i<8;i++){
      const a=i*Math.PI/4;
      cylinder(.016,.025,[Math.cos(a)*.19,Math.sin(a)*.19,.205],materials.metal,pivot,"z",8);
    }
    rod([-1.54,0,0],[1.54,0,0],.067,materials.edge,pivot);
    // Engraved dragon-wing silhouettes form the beam's two structural braces.
    for(const side of [-1,1]){
      rod([0,.12,0],[side*.57,.32,0],.033,materials.metal,pivot);
      rod([side*.57,.32,0],[side*1.48,0,0],.033,materials.metal,pivot);
      for(let j=1;j<4;j++)rod([side*j*.34,.05,0],[side*j*.34,.27-j*.035,0],.018,materials.metal,pivot);
    }
    const pans=[];
    for(const side of [-1,1]){
      const pan=new THREE.Group();pan.position.x=side*1.48;pivot.add(pan);pans.push(pan);
      for(const z of [-.34,.34])rod([0,0,0],[0,-1.37,z],.011,materials.edge,pan);
      const bowl=mesh(new THREE.SphereGeometry(.57,48,16,0,Math.PI*2,Math.PI/2,Math.PI/2),materials.metal,pan,[0,-1.31,0]);bowl.scale.y=.23;
      ring(.57,.027,[0,-1.31,0],materials.edge,pan,"y");
      cylinder(.49,.02,[0,-1.30,0],materials.dark,pan);
      ring(.41,.013,[0,-1.28,0],materials.lit,pan,"y");
    }
    // Three evidence channels remain independent; the beam never encodes a success score.
    for(let i=0;i<3;i++){
      const x=(i-1)*1.02;
      box([.79,.35,.5],[x,-1.60,1.0],materials.body);
      box([.64,.20,.018],[x,-1.57,1.263],materials.dark);
      label(["RESULT","PROCESS","EFFECTS"][i],[x,-1.6,1.28],.62);
      marker(i,[x,-1.36,1.25]);
      line([[x,-1.35,.82],[x,-.9,-.12],[x*.6,-.5,-.35]],materials.line);
    }
    marker(3,[0,1.95,.12]);
    updateModel=(p,c,t)=>{
      pivot.rotation.z=Math.sin(t*.58)*.012+(c===0?-.045:c===2?.035:-.012);
      pans.forEach(pan=>pan.rotation.z=-pivot.rotation.z);
      sweep.rotation.z=-t*.1;
    };
  }

  if(boxNumber===9){
    const glass=new THREE.MeshPhysicalMaterial({color:0xc5b1e8,metalness:.08,roughness:.2,transparent:true,opacity:.18,side:THREE.DoubleSide,depthWrite:false});
    const profile=[[.02,-1.5],[.56,-1.45],[.81,-1.12],[.88,-.65],[.86,-.13],[.68,.35],[.31,.77],[.27,1.3],[.36,1.32],[.36,1.44]].map(p=>new THREE.Vector2(...p));
    const vessel=new THREE.Group();vessel.position.set(.27,-.04,.38);root.add(vessel);
    mesh(new THREE.LatheGeometry(profile,64),glass,vessel);
    const outline=materials.line.clone();outline.opacity=.66;
    // Sparse glass meridians make the curved volume legible in the retro display.
    for(let i=0;i<8;i++){
      const a=i/8*Math.PI*2;
      line(profile.map(p=>[Math.cos(a)*p.x,p.y,Math.sin(a)*p.x]),outline,vessel);
    }
    for(const y of [-1.45,1.3,1.44])ring(y<0?.55:.34,.027,[0,y,0],materials.edge,vessel,"y");
    cylinder(.29,.17,[0,1.47,0],materials.body,vessel);
    cylinder(.21,.07,[0,1.59,0],materials.edge,vessel);
    const levels=[-1.02,-.71,-.4,-.08,.32];
    const fluidMaterial=new THREE.MeshStandardMaterial({color:accent,emissive:accent,emissiveIntensity:.2,metalness:.1,roughness:.47});
    const fills=levels.map(level=>{
      const group=new THREE.Group();vessel.add(group);
      const below=profile.filter(point=>point.y<level);
      const next=profile.find(point=>point.y>=level),last=below[below.length-1];
      const radius=THREE.MathUtils.lerp(last.x,next.x,(level-last.y)/(next.y-last.y))-.045;
      const outline=[new THREE.Vector2(0,-1.45),...below.filter(point=>point.y>=-1.45).map(point=>new THREE.Vector2(Math.max(0,point.x-.045),point.y)),new THREE.Vector2(radius,level),new THREE.Vector2(0,level)];
      mesh(new THREE.LatheGeometry(outline,64),fluidMaterial,group);
      cylinder(radius,.012,[0,level+.009,0],materials.lit,group);
      ring(radius*.96,.009,[0,level+.018,0],materials.edge,group,"y");
      return group;
    });
    const orbit=ring(1.13,.026,[0,-.57,0],materials.metal,vessel,"y");orbit.rotation.z=.24;
    ring(1.08,.012,[0,-.57,0],materials.lit,vessel,"y");
    cylinder(1.09,.13,[0,-1.79,0],materials.body,vessel);
    cylinder(.84,.13,[0,-1.65,0],materials.metal,vessel);
    for(let i=0;i<3;i++){
      const a=i*Math.PI*2/3;
      rod([Math.cos(a)*.94,-1.78,Math.sin(a)*.94],[Math.cos(a)*1.04,-.55,Math.sin(a)*1.04],.044,materials.edge,vessel);
    }
    const motes=[];
    for(let i=0;i<9;i++)motes.push(mesh(new THREE.OctahedronGeometry(.022+(i%3)*.009),materials.lit,vessel));
    const sources=[[-1.82,.91,.22],[1.8,.86,-.1],[-1.79,-.74,.63],[1.95,-.69,.56]];
    const currents=[];
    sources.forEach((pos,i)=>{
      const vial=new THREE.Group();vial.position.set(...pos);root.add(vial);
      cylinder(.21,.6,[0,0,0],materials.body,vial);
      cylinder(.16,.42,[0,.05,.02],glass,vial);
      cylinder(.22,.045,[0,.31,0],materials.edge,vial);
      ring(.16,.016,[0,.1,0],materials.lit,vial,"y");
      marker(i,[0,.52,.06],vial);
      const points=[pos,[pos[0]*.76,pos[1]-.30,pos[2]],[.27,-1.75,.38]];
      line(points,materials.line);
      const dot=mesh(new THREE.OctahedronGeometry(.045),materials.lit);currents.push({dot,points});
    });
    const outward=[];
    for(let i=0;i<5;i++)outward.push(line([[.27,-1.85,.38],[(i-2)*.6,-1.92,1.4],[(i-2)*.92,-1.93,2.0]],materials.bright));
    updateModel=(p,c,t)=>{
      fills.forEach((fill,index)=>{fill.visible=index===p;});
      motes.forEach((dot,i)=>{const y=((t*.09+i*.13)%1);dot.position.set(Math.sin(i*2.4+t*.2)*.46,-1.25+y*(.32+p*.24),Math.cos(i*2.4+t*.2)*.46);});
      currents.forEach(({dot,points},i)=>{const f=(t*.21+i*.25)%1;dot.visible=i<=c;const a=new THREE.Vector3(...points[f<.5?0:1]),b=new THREE.Vector3(...points[f<.5?1:2]);dot.position.copy(a.lerp(b,(f*2)%1));});
      outward.forEach(path=>path.visible=p===4);
    };
  }
  return { textures, update(progress,current,time) {
    sweep.rotation.z=-time*.12;
    markers.forEach(({dot,mat,index})=>{
      const active=index===current;
      mat.color.set(index<progress?0xd9ecd3:active?accent:0x46616b);
      mat.emissiveIntensity=index<progress?.45:active?.3+Math.sin(time*1.5)*.12:0;
      dot.rotation.y=time*.28;dot.scale.setScalar(active?1.2:1);
    });
    updateModel(progress,current,time);
  }};
}

import * as THREE from "three";

export function buildAnvil(root) {
  const textures=[];
  const iron=new THREE.MeshStandardMaterial({color:0x26363d,metalness:.86,roughness:.37});
  const ironDark=new THREE.MeshStandardMaterial({color:0x101b20,metalness:.72,roughness:.48});
  const edge=new THREE.MeshStandardMaterial({color:0x8e8d82,metalness:.92,roughness:.3});
  const brass=new THREE.MeshStandardMaterial({color:0xa97935,metalness:.88,roughness:.31});
  const wood=new THREE.MeshStandardMaterial({color:0x4f291c,metalness:.05,roughness:.83});
  const ember=new THREE.MeshStandardMaterial({color:0xff9f32,emissive:0xff531f,emissiveIntensity:2.2,metalness:.32,roughness:.38});
  const rune=new THREE.MeshStandardMaterial({color:0xffd070,emissive:0xf08f24,emissiveIntensity:.65,metalness:.55,roughness:.36});
  const soot=new THREE.MeshStandardMaterial({color:0x080d10,metalness:.25,roughness:.88});

  function mesh(geometry,material=iron,parent=root,position=[0,0,0]){
    const object=new THREE.Mesh(geometry,material);object.position.set(...position);object.castShadow=true;object.receiveShadow=true;parent.add(object);return object;
  }
  function cylinder(radius,height,position,material=iron,parent=root,axis="y",segments=32){
    const object=mesh(new THREE.CylinderGeometry(radius,radius,height,segments),material,parent,position);
    if(axis==="x")object.rotation.z=Math.PI/2;if(axis==="z")object.rotation.x=Math.PI/2;return object;
  }
  function ring(radius,tube,position,material=brass,parent=root,axis="z"){
    const object=mesh(new THREE.TorusGeometry(radius,tube,8,72),material,parent,position);
    if(axis==="y")object.rotation.x=Math.PI/2;if(axis==="x")object.rotation.y=Math.PI/2;return object;
  }
  function canvasLabel(text,color="#ffd071"){
    const canvas=document.createElement("canvas");canvas.width=256;canvas.height=256;
    const context=canvas.getContext("2d");context.clearRect(0,0,256,256);context.fillStyle=color;context.textAlign="center";context.textBaseline="middle";context.font="700 98px Georgia";context.fillText(text,128,130);
    const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.magFilter=THREE.NearestFilter;texture.minFilter=THREE.LinearMipmapLinearFilter;textures.push(texture);return texture;
  }

  // Concentric forge architecture gives the object a physical chamber rather than a flat backdrop.
  const architecture=new THREE.Group();architecture.position.set(0,.15,-1.05);root.add(architecture);
  ring(2.62,.07,[0,.12,0],ironDark,architecture);
  ring(2.31,.025,[0,.12,.04],brass,architecture);
  for(let index=0;index<16;index++){
    const angle=index*Math.PI/8;
    const spoke=mesh(new THREE.BoxGeometry(.025,.38,.04),index%4===0?brass:ironDark,architecture);
    spoke.position.set(Math.sin(angle)*2.45,.12+Math.cos(angle)*2.45,.02);spoke.rotation.z=-angle;
  }

  const anvil=new THREE.Group();anvil.position.set(-.02,-.34,.18);anvil.rotation.y=-.13;root.add(anvil);
  // The extruded silhouette creates a true horn, heel, waist, and foot in one continuous iron body.
  const silhouette=new THREE.Shape();
  silhouette.moveTo(-2.16,.72);silhouette.lineTo(-1.62,.57);silhouette.lineTo(-1.05,.31);silhouette.lineTo(-.74,.13);silhouette.lineTo(-.59,-.25);silhouette.lineTo(-.48,-.86);silhouette.lineTo(-1.02,-1.31);silhouette.lineTo(-1.18,-1.58);silhouette.lineTo(1.18,-1.58);silhouette.lineTo(1.04,-1.31);silhouette.lineTo(.5,-.86);silhouette.lineTo(.43,-.18);silhouette.lineTo(.68,.19);silhouette.lineTo(1.32,.37);silhouette.lineTo(1.9,.53);silhouette.lineTo(2.22,.7);silhouette.closePath();
  const body=mesh(new THREE.ExtrudeGeometry(silhouette,{depth:.88,bevelEnabled:true,bevelSegments:3,steps:1,bevelSize:.055,bevelThickness:.055}),iron,anvil,[0,0,-.44]);
  body.geometry.computeVertexNormals();
  mesh(new THREE.BoxGeometry(3.98,.18,1.06,10,1,4),edge,anvil,[.08,.74,.04]);
  const hardy=mesh(new THREE.BoxGeometry(.25,.05,.25),soot,anvil,[1.47,.845,.11]);hardy.rotation.y=.08;
  mesh(new THREE.BoxGeometry(2.75,.20,1.38),ironDark,anvil,[0,-1.62,.02]);
  for(const x of [-1.18,1.18])for(const z of [-.55,.55])cylinder(.085,.12,[x,-1.76,z],brass,anvil,"y",12);
  ring(.36,.023,[.15,.847,.02],rune,anvil,"y");
  const ingot=mesh(new THREE.BoxGeometry(.78,.11,.34),ember,anvil,[.15,.9,.02]);ingot.rotation.y=-.13;
  for(let index=0;index<4;index++){
    const mark=mesh(new THREE.BoxGeometry(.075,.018,.27),rune,anvil,[.15+(index-1.5)*.16,.965,.02]);mark.rotation.y=-.13;
  }

  const hammer=new THREE.Group();hammer.position.set(-.34,1.54,.73);hammer.rotation.z=-.38;hammer.rotation.x=.08;root.add(hammer);
  cylinder(.11,2.15,[0,-.78,0],wood,hammer,"y",20);
  cylinder(.135,.24,[0,.13,0],brass,hammer,"y",20);
  mesh(new THREE.BoxGeometry(1.22,.5,.56,4,2,2),iron,hammer,[0,.35,0]);
  mesh(new THREE.CylinderGeometry(.24,.33,.54,24),edge,hammer,[0,.83,0]).rotation.z=0;
  mesh(new THREE.CylinderGeometry(.12,.27,.48,24),ironDark,hammer,[0,-.15,0]).rotation.z=0;

  const sealGroup=new THREE.Group();sealGroup.position.set(0,-1.86,.72);root.add(sealGroup);
  const seals=[];
  ["⌂","!","◎","⚡"].forEach((glyph,index)=>{
    const token=new THREE.Group();token.position.set((index-1.5)*.88,index%2*.06,0);token.rotation.x=-.14;sealGroup.add(token);seals.push(token);
    cylinder(.31,.13,[0,0,0],brass,token,"z",8);
    cylinder(.25,.142,[0,0,.02],ironDark,token,"z",8);
    ring(.24,.018,[0,0,.095],rune,token);
    const labelMaterial=new THREE.MeshBasicMaterial({map:canvasLabel(glyph),transparent:true,depthWrite:false});
    const label=mesh(new THREE.PlaneGeometry(.37,.37),labelMaterial,token,[0,0,.105]);label.castShadow=false;
  });

  const plinth=mesh(new THREE.CylinderGeometry(2.55,2.72,.18,64),soot,root,[0,-2.08,0]);
  const plinthRim=ring(2.57,.026,[0,-1.98,0],brass,root,"y");plinthRim.scale.z=.72;plinth.scale.z=.72;
  for(let index=0;index<28;index++){
    const angle=index/28*Math.PI*2;
    const rivet=cylinder(.035,.04,[Math.cos(angle)*2.43,-1.965,Math.sin(angle)*1.72],index%7===0?rune:edge,root,"y",10);rivet.castShadow=false;
  }

  return {
    textures,
    update(time,paused){
      const pulse=paused?0:(Math.sin(time*2.1)+1)/2;
      ember.emissiveIntensity=1.65+pulse*.9;rune.emissiveIntensity=.45+pulse*.36;
      architecture.rotation.z=paused?0:Math.sin(time*.22)*.025;
      hammer.rotation.z=-.38+(paused?0:Math.sin(time*.72)*.025);
      seals.forEach((seal,index)=>{seal.position.y=(index%2)*.06+(paused?0:Math.sin(time*1.1+index)*.028);seal.rotation.z=paused?0:Math.sin(time*.55+index)*.025;});
      ingot.scale.x=1+(paused?0:Math.sin(time*1.8)*.014);
    },
  };
}

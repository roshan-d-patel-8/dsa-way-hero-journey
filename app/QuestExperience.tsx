"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

type Stage = "cover" | "threshold" | "questions" | "complete";

type Question = {
  known: string;
  whisper: string;
  options: string[];
  correct: number;
  answer: string;
  wrong: Record<number, string>;
};

const QUESTIONS: Question[] = [
  {
    known: "The medication cart leaves pharmacy late every morning.",
    whisper: "A rune glimmers on the door, waiting.",
    options: [
      "Why can't the techs just start their restock half an hour earlier?",
      "What is the cart waiting on before it can leave?",
      "Have you thought about ordering a second cart as a backup?",
    ],
    correct: 1,
    answer:
      "The door hums. A voice answers: the techs can't restock until the overnight order list is in hand — and the list arrives late.",
    wrong: {
      0: "It wears a 'why,' but it's an order in disguise — aimed at people, not causes. The techs already start on time; you'd have punished them for a problem you don't understand.",
      2: "A question with a solution hiding inside it. Two carts would both wait on the same delay — gold spent, nothing learned.",
    },
  },
  {
    known: "The overnight order list reaches pharmacy late.",
    whisper: "One rune burns. Four remain dark.",
    options: [
      "Could we just email the list instead of printing it?",
      "Is the night clerk keeping up with the work?",
      "Where does the list come from, and what slows it down?",
    ],
    correct: 2,
    answer:
      "The overnight printer jams almost every morning. The night clerk fights it, reprints, and re-sorts the pages by hand.",
    wrong: {
      0: "A workaround dressed as curiosity. The printed copy is required for the controlled-substance count — the delay remains, and its cause still hides.",
      1: "Blame wearing a question's cloak. The clerk has been fighting a failing process for weeks. Questions aimed at people find fault; questions aimed at the work find causes.",
    },
  },
  {
    known: "The printer jams almost every morning.",
    whisper: "Two runes burn. You feel the door listening.",
    options: [
      "Isn't it about time we requisitioned a newer printer?",
      "What actually happens at the moment it jams?",
      "Should someone stand by the printer at 5 a.m. to clear it?",
    ],
    correct: 1,
    answer:
      "You go and watch at dawn. The paper curls in the tray — and curled paper misfeeds, morning after morning.",
    wrong: {
      0: "A purchase order folded into a question. A new printer arrives… and jams. Whatever ails this one would follow it. The door holds.",
      2: "You've proposed hiring a human to babysit a symptom — forever. That isn't a fix; it's a toll paid daily.",
    },
  },
  {
    known: "The paper curls in the tray.",
    whisper: "Three runes burn. The lock is close now.",
    options: [
      "What if we posted a sign — fan the paper before loading?",
      "When did the curling start — and what changed?",
      "Couldn't the printer be moved somewhere less damp?",
    ],
    correct: 1,
    answer:
      "You dig through the supply records. It's new paper — a thinner, cheaper stock that drinks the basement's humidity. The old stock never curled.",
    wrong: {
      0: "A countermeasure smuggled in as a 'what if.' Signs fade. And you still don't know why this paper curls when the old paper never did.",
      2: "A renovation disguised as a question. The printer must sit beside the pharmacy vault — you'd be redesigning a room to serve a mystery.",
    },
  },
  {
    known: "The paper was switched to a cheaper stock.",
    whisper: "Four runes burn. One question remains.",
    options: [
      "Can't we just demand the old paper back?",
      "Shouldn't the chief of supply hear about this?",
      "Who changed the paper — and did anyone check with pharmacy?",
    ],
    correct: 2,
    answer:
      "Purchasing switched suppliers last month to save cost. No one told pharmacy — because no standard said they had to. The root: a change with no feedback loop to the people it touches.",
    wrong: {
      0: "The old paper returns — until the next 'small' change, to gloves, tubing, labels. You'd escape this room only to wake in the next one.",
      1: "Escalation posing as inquiry. Hand the chief a symptom and you'll get a symptom's answer. Climb down one more why first.",
    },
  },
];

const CHAMBERS = ["Mission", "Vision", "Values", "Root Cause", "People", "Care Availability", "Quality & Safety", "Care Experience", "Financial Health"];

function playTone(kind: "start" | "step" | "wrong" | "rune" | "open", enabled: boolean) {
  if (!enabled || typeof window === "undefined") return;
  const AudioCtor = window.AudioContext ??
    (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtor) return;
  const ctx = new AudioCtor();
  const now = ctx.currentTime;
  const notes = {
    start: [196, 293.66, 392],
    step: [220, 330],
    wrong: [123.47, 103.83],
    rune: [392, 587.33, 783.99],
    open: [196, 293.66, 392, 587.33, 783.99],
  }[kind];
  notes.forEach((frequency, index) => {
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = kind === "wrong" ? "square" : "triangle";
    oscillator.frequency.setValueAtTime(frequency, now + index * 0.075);
    gain.gain.setValueAtTime(0, now + index * 0.075);
    gain.gain.linearRampToValueAtTime(kind === "open" ? 0.07 : 0.045, now + index * 0.075 + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.075 + 0.22);
    oscillator.connect(gain).connect(ctx.destination);
    oscillator.start(now + index * 0.075);
    oscillator.stop(now + index * 0.075 + 0.24);
  });
  window.setTimeout(() => void ctx.close(), 900);
}

function VoxelWorld({ progress, open }: { progress: number; open: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [renderingFailed, setRenderingFailed] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || renderingFailed) return;

    const useFallback = (error: unknown) => {
      console.warn("The cinematic 3D scene is unavailable; using the illustrated fallback.", error);
      setRenderingFailed(true);
    };

    const onContextLost = (event: Event) => {
      event.preventDefault();
      useFallback(new Error("WebGL context lost"));
    };
    canvas.addEventListener("webglcontextlost", onContextLost);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x06131d, 0.035);

    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.set(0.2, 2.15, 12.4);

    let renderer: THREE.WebGLRenderer;
    let composer: EffectComposer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
      composer = new EffectComposer(renderer);
      composer.addPass(new RenderPass(scene, camera));
      const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 1.12, 0.8, 0.12);
      composer.addPass(bloom);
    } catch (error) {
      canvas.removeEventListener("webglcontextlost", onContextLost);
      useFallback(error);
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.18;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;

    const textures: THREE.Texture[] = [];
    const makeStoneTexture = () => {
      const surface = document.createElement("canvas");
      surface.width = 256;
      surface.height = 256;
      const context = surface.getContext("2d");
      if (!context) return null;
      const image = context.createImageData(256, 256);
      for (let i = 0; i < image.data.length; i += 4) {
        const grain = 78 + Math.floor(Math.random() * 58);
        image.data[i] = grain * 0.58;
        image.data[i + 1] = grain * 0.82;
        image.data[i + 2] = grain;
        image.data[i + 3] = 255;
      }
      context.putImageData(image, 0, 0);
      context.globalAlpha = 0.24;
      for (let i = 0; i < 120; i += 1) {
        context.fillStyle = i % 3 ? "#0a2635" : "#83afba";
        context.fillRect(Math.random() * 256, Math.random() * 256, Math.random() * 28 + 2, Math.random() * 3 + 1);
      }
      const texture = new THREE.CanvasTexture(surface);
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(2.4, 2.4);
      texture.colorSpace = THREE.SRGBColorSpace;
      textures.push(texture);
      return texture;
    };

    const stoneTexture = makeStoneTexture();
    const root = new THREE.Group();
    root.position.y = -0.2;
    scene.add(root);

    const stone = new THREE.MeshStandardMaterial({
      color: 0x274553,
      map: stoneTexture,
      bumpMap: stoneTexture,
      bumpScale: 0.18,
      roughness: 0.95,
      metalness: 0.02,
    });
    const stoneDark = new THREE.MeshStandardMaterial({
      color: 0x102936,
      map: stoneTexture,
      bumpMap: stoneTexture,
      bumpScale: 0.12,
      roughness: 1,
    });
    const iron = new THREE.MeshStandardMaterial({ color: 0x14232c, roughness: 0.34, metalness: 0.88 });
    const bronze = new THREE.MeshStandardMaterial({ color: 0x8a5425, roughness: 0.32, metalness: 0.82 });
    const wood = new THREE.MeshStandardMaterial({ color: 0x3f1429, roughness: 0.76, metalness: 0.04 });
    const cyanMetal = new THREE.MeshPhysicalMaterial({ color: 0x84dfff, roughness: 0.16, metalness: 0.92, clearcoat: 0.8 });
    const ember = new THREE.MeshStandardMaterial({ color: 0xf08f24, emissive: 0xe7562f, emissiveIntensity: 1.2, roughness: 0.28 });

    const register = <T extends THREE.Mesh>(mesh: T) => {
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      return mesh;
    };
    const box = (w: number, h: number, d: number, material: THREE.Material, x: number, y: number, z: number) => {
      const mesh = register(new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material));
      mesh.position.set(x, y, z);
      return mesh;
    };
    const rock = (radius: number, material: THREE.Material, x: number, y: number, z: number, seed: number) => {
      const mesh = register(new THREE.Mesh(new THREE.DodecahedronGeometry(radius, 1), material));
      mesh.position.set(x, y, z);
      mesh.scale.set(1 + (seed % 3) * 0.18, 0.58 + (seed % 4) * 0.12, 0.8 + (seed % 5) * 0.08);
      mesh.rotation.set(seed * 0.17, seed * 0.31, seed * 0.11);
      return mesh;
    };

    const doorGroup = new THREE.Group();
    doorGroup.position.set(0.72, -0.05, -0.55);
    root.add(doorGroup);

    doorGroup.add(
      box(1.38, 5.15, 1.4, stoneDark, -2.2, -0.18, -0.12),
      box(1.38, 5.15, 1.4, stoneDark, 2.2, -0.18, -0.12),
      box(0.96, 4.9, 1.62, stone, -2.2, -0.05, 0),
      box(0.96, 4.9, 1.62, stone, 2.2, -0.05, 0),
    );
    doorGroup.add(box(0.14, 4.6, 1.74, bronze, -1.68, -0.05, 0.02), box(0.14, 4.6, 1.74, bronze, 1.68, -0.05, 0.02));

    for (let i = 0; i < 17; i += 1) {
      const angle = Math.PI - (Math.PI * i) / 16;
      const archBlock = box(0.62, 0.74, 1.56, i % 4 === 0 ? stoneDark : stone, Math.cos(angle) * 2.2, Math.sin(angle) * 2.2 + 2.12, 0);
      archBlock.rotation.z = -angle + Math.PI / 2;
      archBlock.rotation.y = Math.sin(i * 1.9) * 0.04;
      doorGroup.add(archBlock);
    }

    const crown = new THREE.Mesh(new THREE.TorusGeometry(2.2, 0.16, 8, 64, Math.PI), bronze);
    crown.rotation.z = Math.PI;
    crown.position.set(0, 2.12, 0.85);
    doorGroup.add(register(crown));

    const leftDoor = box(1.91, 4.22, 0.42, wood, 0, 0.02, 0.27);
    const rightDoor = box(1.91, 4.22, 0.42, wood, 0, 0.02, 0.27);
    leftDoor.geometry.translate(-0.925, 0, 0);
    rightDoor.geometry.translate(0.925, 0, 0);
    doorGroup.add(leftDoor, rightDoor);

    [-1.36, -0.46, 0.46, 1.36].forEach((y) => {
      const bandLeft = box(1.76, 0.13, 0.12, iron, -0.94, y, 0.53);
      const bandRight = box(1.76, 0.13, 0.12, iron, 0.94, y, 0.53);
      doorGroup.add(bandLeft, bandRight);
    });
    [-1.38, -0.55, 0.55, 1.38].forEach((x) => doorGroup.add(box(0.1, 3.98, 0.1, iron, x, 0.02, 0.54)));
    const seal = register(new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.2, 12), bronze));
    seal.rotation.x = Math.PI / 2;
    seal.position.set(0, 0.12, 0.69);
    doorGroup.add(seal);

    const runeMaterials: THREE.MeshStandardMaterial[] = [];
    const runeLights: THREE.PointLight[] = [];
    const runeGroups: THREE.Group[] = [];
    const runeStrokes = [
      [[0, 0, 0.48, 0]],
      [[-0.09, 0, 0.45, 0], [0.09, 0, 0.45, 0]],
      [[-0.11, 0, 0.43, -0.58], [0.11, 0, 0.43, 0.58]],
      [[0, 0, 0.48, 0], [-0.1, 0.09, 0.3, -0.75], [0.1, 0.09, 0.3, 0.75]],
      [[-0.12, 0.02, 0.4, -0.58], [0.12, 0.02, 0.4, 0.58], [0, -0.11, 0.25, 0]],
    ];

    for (let i = 0; i < 5; i += 1) {
      const active = i < progress;
      const runeMat = new THREE.MeshStandardMaterial({
        color: active ? 0xffc45e : 0x6b8c91,
        emissive: 0xf08f24,
        emissiveIntensity: active ? 3.2 : 0.02,
        roughness: 0.3,
        metalness: 0.32,
      });
      runeMaterials.push(runeMat);

      const runeGroup = new THREE.Group();
      runeGroup.position.set(-1.34 + i * 0.67, 2.78, 0.82);
      const socket = register(new THREE.Mesh(new THREE.CylinderGeometry(0.31, 0.31, 0.16, 6), stoneDark));
      socket.rotation.x = Math.PI / 2;
      runeGroup.add(socket);
      for (const [x, y, length, angle] of runeStrokes[i]) {
        const stroke = box(0.052, length, 0.07, runeMat, x, y, 0.14);
        stroke.rotation.z = angle;
        runeGroup.add(stroke);
      }
      const light = new THREE.PointLight(0xf08f24, active ? 8 : 0, 2.2, 2);
      light.position.set(0, 0, 0.55);
      runeLights.push(light);
      runeGroup.add(light);
      runeGroups.push(runeGroup);
      doorGroup.add(runeGroup);
    }

    for (let i = 0; i < 16; i += 1) {
      const side = i % 2 ? -1 : 1;
      const x = side * (2.75 + (i % 4) * 0.22);
      const y = -1.9 + Math.floor(i / 4) * 1.18;
      doorGroup.add(rock(0.58 + (i % 3) * 0.11, i % 4 === 0 ? stoneDark : stone, x, y, -0.25 - (i % 3) * 0.18, i + 3));
    }

    const hero = new THREE.Group();
    hero.position.set(-3.42, -2.18, 1.55);
    hero.rotation.y = 0.18;
    root.add(hero);
    const skin = new THREE.MeshStandardMaterial({ color: 0xb96f4a, roughness: 0.86 });
    const blue = new THREE.MeshStandardMaterial({ color: 0x075d86, roughness: 0.58, metalness: 0.12 });
    const leather = new THREE.MeshStandardMaterial({ color: 0x281a18, roughness: 0.82 });
    const capeMaterial = new THREE.MeshStandardMaterial({ color: 0x741d4b, roughness: 0.9, side: THREE.DoubleSide });

    const torso = register(new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.52, 1.16, 8), blue));
    torso.position.set(0, 1.35, 0);
    const head = register(new THREE.Mesh(new THREE.SphereGeometry(0.34, 12, 8), skin));
    head.position.set(0, 2.26, 0);
    const hair = register(new THREE.Mesh(new THREE.SphereGeometry(0.36, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), leather));
    hair.position.set(0, 2.37, -0.03);
    const shoulderLeft = register(new THREE.Mesh(new THREE.SphereGeometry(0.27, 8, 5), bronze));
    shoulderLeft.position.set(-0.48, 1.72, 0);
    const shoulderRight = shoulderLeft.clone();
    shoulderRight.position.x = 0.48;
    const leftLeg = box(0.28, 1.1, 0.32, leather, -0.22, 0.35, 0);
    const rightLeg = box(0.28, 1.1, 0.32, leather, 0.22, 0.35, 0);
    const belt = box(0.86, 0.16, 0.62, bronze, 0, 0.92, 0);

    const capeShape = new THREE.Shape();
    capeShape.moveTo(-0.45, 0.5);
    capeShape.lineTo(0.45, 0.5);
    capeShape.lineTo(0.68, -1.1);
    capeShape.lineTo(0.18, -0.98);
    capeShape.lineTo(-0.15, -1.15);
    capeShape.lineTo(-0.58, -0.96);
    capeShape.closePath();
    const heroCape = register(new THREE.Mesh(new THREE.ShapeGeometry(capeShape), capeMaterial));
    heroCape.position.set(-0.12, 1.35, -0.36);
    heroCape.rotation.x = -0.11;
    hero.add(torso, head, hair, shoulderLeft, shoulderRight, leftLeg, rightLeg, belt, heroCape);

    const swordBlade = box(0.12, 2.15, 0.08, cyanMetal, 0.96, 1.7, 0.2);
    swordBlade.rotation.z = -0.35;
    const swordEdge = box(0.025, 2.06, 0.1, ember, 0.91, 1.71, 0.21);
    swordEdge.rotation.z = -0.35;
    const swordGuard = box(0.74, 0.15, 0.2, bronze, 0.64, 0.74, 0.18);
    swordGuard.rotation.z = -0.35;
    hero.add(swordBlade, swordEdge, swordGuard);

    const groundTexture = makeStoneTexture();
    if (groundTexture) groundTexture.repeat.set(7, 7);
    const floor = register(new THREE.Mesh(
      new THREE.PlaneGeometry(30, 22, 1, 1),
      new THREE.MeshStandardMaterial({ color: 0x122933, map: groundTexture, bumpMap: groundTexture, bumpScale: 0.22, roughness: 1 }),
    ));
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -2.38;
    scene.add(floor);

    for (let i = 0; i < 24; i += 1) {
      const angle = (i / 24) * Math.PI * 2;
      const radius = 5.1 + (i % 5) * 0.33;
      scene.add(rock(0.48 + (i % 4) * 0.13, i % 3 ? stone : stoneDark, Math.cos(angle) * radius, -2.15, Math.sin(angle) * radius - 0.6, i + 31));
    }

    [-1, 1].forEach((side) => {
      const brazier = new THREE.Group();
      brazier.position.set(side * 3.48, -1.42, 1.1);
      brazier.add(box(0.18, 1.35, 0.18, iron, 0, 0, 0), box(0.7, 0.16, 0.7, bronze, 0, 0.64, 0));
      const flameMaterial = new THREE.MeshBasicMaterial({ color: 0xf08f24, transparent: true, opacity: 0.84, blending: THREE.AdditiveBlending });
      const flame = new THREE.Mesh(new THREE.ConeGeometry(0.23, 0.76, 7), flameMaterial);
      flame.position.y = 1.03;
      brazier.add(flame);
      const flameLight = new THREE.PointLight(0xe7562f, 28, 6, 2);
      flameLight.position.y = 1.08;
      brazier.add(flameLight);
      scene.add(brazier);
    });

    const particles = new THREE.BufferGeometry();
    const points = new Float32Array(420 * 3);
    for (let i = 0; i < points.length; i += 3) {
      points[i] = (Math.random() - 0.5) * 16;
      points[i + 1] = (Math.random() - 0.25) * 11;
      points[i + 2] = (Math.random() - 0.5) * 10;
    }
    particles.setAttribute("position", new THREE.BufferAttribute(points, 3));
    const dust = new THREE.Points(particles, new THREE.PointsMaterial({ color: 0xd6b66a, size: 0.028, transparent: true, opacity: 0.58, blending: THREE.AdditiveBlending, depthWrite: false }));
    scene.add(dust);

    const beamMaterial = new THREE.MeshBasicMaterial({ color: 0x69c9e8, transparent: true, opacity: 0.035, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending });
    const beam = new THREE.Mesh(new THREE.ConeGeometry(2.5, 9, 24, 1, true), beamMaterial);
    beam.position.set(-1.8, 3.2, -1.8);
    beam.rotation.z = 0.22;
    scene.add(beam);

    scene.add(new THREE.HemisphereLight(0x8fd5e8, 0x02080d, 1.35));
    const key = new THREE.DirectionalLight(0x8bdfff, 4.2);
    key.position.set(-4.5, 7, 6);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.near = 0.5;
    key.shadow.camera.far = 30;
    scene.add(key);
    const rim = new THREE.DirectionalLight(0x981f59, 3.4);
    rim.position.set(5, 2, -4);
    scene.add(rim);
    const warm = new THREE.PointLight(0xf08f24, 38, 13, 2);
    warm.position.set(3.6, 1.5, 4.5);
    scene.add(warm);

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      renderer.setSize(rect.width, rect.height, false);
      composer.setSize(rect.width, rect.height);
      camera.aspect = rect.width / rect.height;
      camera.updateProjectionMatrix();
    };
    resize();
    window.addEventListener("resize", resize);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;
    let clock = 0;
    const animate = () => {
      clock += 0.011;
      if (!reduced) {
        root.rotation.y = Math.sin(clock * 0.35) * 0.025;
        root.position.y = -0.2 + Math.sin(clock * 0.62) * 0.018;
        hero.position.y = -2.18 + Math.sin(clock * 2.1) * 0.035;
        heroCape.rotation.x = -0.11 + Math.sin(clock * 1.8) * 0.035;
        swordEdge.material = ember;
        dust.rotation.y += 0.00042;
        beam.material.opacity = 0.03 + Math.sin(clock * 0.72) * 0.012;

        runeMaterials.forEach((material, index) => {
          const solved = index < progress;
          const completionWave = open && Math.floor(clock * 2.8) % 5 === index;
          const waitingPulse = !open && index === Math.min(progress, 4);
          material.emissiveIntensity = solved
            ? 2.8 + Math.sin(clock * 3.2 + index * 0.8) * 0.55 + (completionWave ? 2.5 : 0)
            : waitingPulse ? 0.16 + (Math.sin(clock * 2.2) + 1) * 0.11 : 0.02;
          runeLights[index].intensity = solved ? 7 + (completionWave ? 11 : 0) : waitingPulse ? 0.7 : 0;
          runeGroups[index].scale.setScalar(1 + (completionWave ? 0.09 : 0));
        });

        camera.position.x = 0.2 + Math.sin(clock * 0.3) * 0.09;
        camera.position.y = 2.15 + Math.cos(clock * 0.24) * 0.045;
        camera.lookAt(0.3, 0.55, -0.7);
      }
      const target = open ? 1.15 : 0;
      leftDoor.rotation.y += (target - leftDoor.rotation.y) * 0.055;
      rightDoor.rotation.y += (-target - rightDoor.rotation.y) * 0.055;
      if (open) hero.position.z += (-1.4 - hero.position.z) * 0.012;
      try {
        composer.render();
      } catch (error) {
        useFallback(error);
        return;
      }
      frame = window.requestAnimationFrame(animate);
    };
    animate();
    return () => {
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("webglcontextlost", onContextLost);
      window.cancelAnimationFrame(frame);
      composer.dispose();
      renderer.dispose();
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          (Array.isArray(object.material) ? object.material : [object.material]).forEach((material) => material.dispose());
        }
      });
      particles.dispose();
      textures.forEach((texture) => texture.dispose());
    };
  }, [progress, open, renderingFailed]);

  if (renderingFailed) {
    return (
      <div className={`voxel-fallback ${open ? "is-open" : ""}`} aria-label="Illustrated rune door">
        <div className="fallback-moon" aria-hidden="true" />
        <div className="fallback-door" aria-hidden="true">
          <div className="fallback-runes">
            {[0, 1, 2, 3, 4].map((rune) => <i key={rune} className={rune < progress ? "lit" : ""} />)}
          </div>
          <b className="fallback-door-left" /><b className="fallback-door-right" />
        </div>
        <div className="fallback-hero" aria-hidden="true"><i /><b /><em /></div>
        <span className="fallback-note">CINEMATIC MODE SIMPLIFIED FOR THIS BROWSER</span>
      </div>
    );
  }

  return <canvas ref={canvasRef} className="voxel-world" aria-hidden="true" />;
}

export function QuestExperience() {
  const [stage, setStage] = useState<Stage>("cover");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [wrongChoice, setWrongChoice] = useState<number | null>(null);
  const [correct, setCorrect] = useState(false);
  const [sound, setSound] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const progress = stage === "complete" ? 5 : questionIndex + (correct ? 1 : 0);
  const question = QUESTIONS[questionIndex];

  const begin = useCallback(() => { playTone("start", sound); setStage("threshold"); }, [sound]);
  const choose = (index: number) => {
    if (index === question.correct) { setWrongChoice(null); setCorrect(true); playTone("rune", sound); }
    else { setWrongChoice(index); playTone("wrong", sound); }
  };
  const next = () => {
    if (questionIndex === QUESTIONS.length - 1) { setStage("complete"); playTone("open", sound); return; }
    setQuestionIndex((value) => value + 1); setWrongChoice(null); setCorrect(false); playTone("step", sound);
  };
  const restart = () => { setQuestionIndex(0); setWrongChoice(null); setCorrect(false); setStage("threshold"); playTone("start", sound); };

  return (
    <main className={`quest-shell stage-${stage}`}>
      <div className="brand-strata" aria-hidden="true"><i /><i /><i /><i /><i /></div><div className="scanlines" aria-hidden="true" />
      <header className="quest-header">
        <button className="brand-lockup" type="button" onClick={() => setStage("cover")} aria-label="Return to title screen"><span>PERMANENTE MEDICINE</span><small>The Permanente Medical Group</small></button>
        <div className="header-title"><b>the</b> DSA WAY <small>A Hero&apos;s Journey</small></div>
        <div className="header-actions">
          <button className="sound-button" type="button" aria-pressed={sound} onClick={() => setSound((value) => !value)}><span aria-hidden="true">{sound ? "♫" : "×"}</span> SOUND {sound ? "ON" : "OFF"}</button>
          <button className="map-button" type="button" aria-expanded={menuOpen} onClick={() => setMenuOpen((value) => !value)}>QUEST MAP</button>
        </div>
      </header>
      <aside className={`quest-map ${menuOpen ? "is-open" : ""}`} aria-label="The Nine Chambers">
        <div className="map-heading"><span>THE NINE CHAMBERS</span><button onClick={() => setMenuOpen(false)} aria-label="Close quest map">×</button></div>
        <ol>{CHAMBERS.map((chamber, index) => <li className={index === 3 ? "active" : "locked"} key={chamber}><span>{String(index + 1).padStart(2, "0")}</span><b>{chamber}</b><i>{index === 3 ? "ACTIVE" : "LOCKED"}</i></li>)}</ol>
        <p>Chamber IV is Box 4 of 9 — Root Cause Analysis.</p>
      </aside>

      {stage === "cover" && <section className="cover-screen">
        <div className="cover-copy"><div className="eyebrow"><span>04</span> A DSA LEARNING QUEST</div><h1><span>The DSA Way:</span>A Hero&apos;s Journey</h1><p>Nine chambers. One way forward. Build the instincts that make this the best place to work—and the best place to get care.</p><button className="primary-button" type="button" onClick={begin}><span>Begin the journey</span><b>→</b></button></div>
        <div className="world-frame cover-world"><VoxelWorld progress={0} open={false} /><div className="world-caption">CHAMBER IV · ROOT CAUSE</div></div>
      </section>}

      {stage === "threshold" && <section className="threshold-screen">
        <div className="story-column"><div className="quest-kicker">THE NINE CHAMBERS · A CAREER-FAIR QUEST</div><div className="chamber-tag">The wheel has chosen — Chamber IV: Root Cause</div><h1 className="chamber-title">The Door<br />of Whys</h1><div className="threshold-prose"><p>For the third week running, the morning medication cart reaches the ward late. Nurses scramble. Doses slip.</p><p>Tonight the old door sealed behind you, and words appeared in the wood:</p><blockquote>&quot;I open only for the root. I listen only to questions — but beware: some questions are solutions in disguise, and those bounce off me all the same.&quot;</blockquote><p>Somewhere above, a sensei&apos;s voice: <em>&quot;Most locks are five questions deep.&quot;</em></p></div><button className="primary-button" type="button" onClick={() => { setStage("questions"); playTone("step", sound); }}><span>Cross the threshold</span><b>→</b></button></div>
        <div className="world-frame"><VoxelWorld progress={0} open={false} /><RuneRail progress={0} /></div>
      </section>}

      {stage === "questions" && <section className="question-screen">
        <div className="question-main"><div className="question-heading-row"><div><div className="quest-kicker">THE DOOR OF WHYS</div><div className="chamber-tag">What you know · why {roman(questionIndex + 1)}</div></div><RuneRail progress={progress} /></div><div className="known-panel"><p>{question.known}</p><span>{question.whisper}</span></div>
          <div className="choice-list" aria-label={`Why ${questionIndex + 1} choices`}>{question.options.map((option, index) => <button type="button" key={option} onClick={() => choose(index)} disabled={wrongChoice === index || (correct && index === question.correct)} className={`${correct && index === question.correct ? "is-correct" : ""} ${wrongChoice === index ? "is-wrong" : ""}`}><span>{String(index + 1).padStart(2, "0")}</span><b>{option}</b><i>→</i></button>)}</div>
          {(wrongChoice !== null || correct) && <div className={`feedback-panel ${wrongChoice === null ? "answer" : "refusal"}`} role="status"><div className="feedback-title">{wrongChoice === null ? "The door answers" : "The door does not move"}</div><p>{wrongChoice === null ? question.answer : question.wrong[wrongChoice]}</p>{correct ? <><div className="rune-ignites">{wrongChoice === null ? "— a rune ignites —" : "— the rune remains lit —"}</div><div className="choice-instruction">Inspect another path, or continue when you are ready.</div><button className="next-button" type="button" onClick={next}>{questionIndex === 4 ? "Open the door" : "Descend to the next why"}<span>↓</span></button></> : <blockquote>&quot;That question carried a solution in its sleeve. Ask what is — not what to do.&quot;</blockquote>}</div>}
        </div>
        <div className="world-frame question-world"><VoxelWorld progress={progress} open={false} /><div className="depth-meter"><span style={{ height: `${progress * 20}%` }} /><b>ROOT DEPTH</b><i>{progress}/5</i></div></div>
      </section>}

      {stage === "complete" && <section className="complete-screen">
        <div className="complete-story"><div className="quest-kicker">THE DOOR OPENS</div><h1>Root found.</h1><p className="completion-lead">Five questions, one thread — from a late cart down to a decision made in a purchasing office.</p><ol className="root-chain"><li>The medication cart is late</li><li>↳ why — the order list reaches pharmacy late</li><li>↳ why — the overnight printer jams every morning</li><li>↳ why — the paper curls in the tray</li><li>↳ why — a cheaper stock absorbs the basement&apos;s humidity</li><li>↳ why — purchasing changed suppliers, and no standard required them to tell the people the change would touch</li></ol><p>The root fix costs almost nothing: restore the approved stock, and write the missing rule — <em>any supply change that touches clinical work gets flagged to the people who live with it.</em></p><p>The expensive fixes you were offered — new printers, second carts, earlier shifts — would have treated symptoms forever.</p></div>
        <div className="reward-column">
          <div className="world-frame complete-world">
            <VoxelWorld progress={5} open />
            <div className="cinematic-hud" aria-hidden="true">
              <span>THE FIVE WHYS</span>
              <b>ALL RUNES AWAKENED</b>
            </div>
          </div>
          <div className="weapon-card">
            <span>LEGENDARY TOOL DISCOVERED</span>
            <div className="pixel-sword" aria-hidden="true"><i /><b /><em /></div>
            <h2><small>THE</small> FIVE WHYS</h2>
            <p>A hero&apos;s sharpest weapon isn&apos;t steel—it&apos;s curiosity with stamina.</p>
            <p className="quest-incantation">Ask why. Follow the answer. Repeat until the root has nowhere left to hide.</p>
          </div>
          <div className="completion-meta"><p>Rootfinder — the door barely resisted you</p><strong>This chamber is Box 4 of 9 — Root Cause Analysis.</strong><p>On an A3, masters of improvement spend most of the journey here, understanding the problem, before a single solution is drawn. Spin the wheel again to enter another chamber.</p><button className="primary-button" type="button" onClick={restart}><span>Enter again</span><b>↻</b></button></div>
        </div>
      </section>}
    </main>
  );
}

function RuneRail({ progress }: { progress: number }) {
  return <div className="rune-rail" role="img" aria-label={`${progress} of 5 runes lit`}>{["I", "II", "III", "IV", "V"].map((rune, index) => <span key={rune} className={index < progress ? "lit" : ""}>{rune}</span>)}</div>;
}

function roman(value: number) { return ["I", "II", "III", "IV", "V"][value - 1]; }

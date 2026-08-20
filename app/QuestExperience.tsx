"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";

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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x061b2b, 0.055);
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
    camera.position.set(0, 2.3, 11.5);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.7));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const root = new THREE.Group();
    scene.add(root);
    const doorGroup = new THREE.Group();
    doorGroup.position.set(0.8, 0.15, -0.5);
    root.add(doorGroup);
    const stone = new THREE.MeshStandardMaterial({ color: 0x16465f, roughness: 0.82, metalness: 0.08 });
    const trim = new THREE.MeshStandardMaterial({ color: 0x30b5e6, roughness: 0.38, metalness: 0.45 });
    const wood = new THREE.MeshStandardMaterial({ color: 0x981f59, roughness: 0.75, metalness: 0.05 });
    const ember = new THREE.MeshStandardMaterial({ color: 0xf08f24, emissive: 0xe7562f, emissiveIntensity: 0.35 });
    const box = (w: number, h: number, d: number, material: THREE.Material, x: number, y: number, z: number) => {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
      mesh.position.set(x, y, z);
      return mesh;
    };
    doorGroup.add(box(1.05, 4.8, 1.15, stone, -2.05, 0, 0), box(1.05, 4.8, 1.15, stone, 2.05, 0, 0));
    for (let i = 0; i < 9; i += 1) {
      const angle = Math.PI - (Math.PI * i) / 8;
      const archBlock = box(0.86, 0.86, 1.1, stone, Math.cos(angle) * 2.05, Math.sin(angle) * 2.05 + 1.95, 0);
      archBlock.rotation.z = -angle + Math.PI / 2;
      doorGroup.add(archBlock);
    }
    const leftDoor = box(1.85, 4.1, 0.35, wood, 0, 0.1, 0.18);
    const rightDoor = box(1.85, 4.1, 0.35, wood, 0, 0.1, 0.18);
    leftDoor.geometry.translate(-0.925, 0, 0);
    rightDoor.geometry.translate(0.925, 0, 0);
    doorGroup.add(leftDoor, rightDoor);

    const runeMaterials: THREE.MeshStandardMaterial[] = [];
    for (let i = 0; i < 5; i += 1) {
      const active = i < progress;
      const runeMat = new THREE.MeshStandardMaterial({ color: active ? 0xffd269 : 0x2a6075, emissive: active ? 0xf08f24 : 0x000000, emissiveIntensity: active ? 2 : 0, roughness: 0.35 });
      runeMaterials.push(runeMat);
      const rune = new THREE.Mesh(new THREE.OctahedronGeometry(0.2, 0), runeMat);
      rune.position.set(-1.25 + i * 0.63, 2.7, 0.8);
      doorGroup.add(rune);
    }

    const hero = new THREE.Group();
    hero.position.set(-3.15, -1.75, 1.15);
    root.add(hero);
    const skin = new THREE.MeshStandardMaterial({ color: 0xd79a72, roughness: 0.8 });
    const blue = new THREE.MeshStandardMaterial({ color: 0x0069a7, roughness: 0.65 });
    const dark = new THREE.MeshStandardMaterial({ color: 0x102638, roughness: 0.6 });
    const cape = new THREE.MeshStandardMaterial({ color: 0x981f59, roughness: 0.75 });
    hero.add(box(0.74, 0.67, 0.65, skin, 0, 2.25, 0), box(0.83, 0.24, 0.71, dark, 0, 2.57, 0), box(0.9, 1.18, 0.58, blue, 0, 1.32, 0), box(0.3, 1, 0.36, dark, -0.27, 0.28, 0), box(0.3, 1, 0.36, dark, 0.27, 0.28, 0), box(0.18, 1.45, 0.48, cape, -0.56, 1.25, -0.1));
    const swordBlade = box(0.12, 1.8, 0.1, trim, 0.9, 1.75, 0.1);
    swordBlade.rotation.z = -0.32;
    const swordGuard = box(0.72, 0.14, 0.18, ember, 0.62, 0.93, 0.1);
    swordGuard.rotation.z = -0.32;
    hero.add(swordBlade, swordGuard);

    const floor = new THREE.Mesh(new THREE.PlaneGeometry(24, 18, 16, 12), new THREE.MeshStandardMaterial({ color: 0x08263a, roughness: 0.95, wireframe: true, transparent: true, opacity: 0.22 }));
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -2.27;
    scene.add(floor);
    const particles = new THREE.BufferGeometry();
    const points = new Float32Array(180 * 3);
    for (let i = 0; i < points.length; i += 3) {
      points[i] = (Math.random() - 0.5) * 14;
      points[i + 1] = (Math.random() - 0.35) * 10;
      points[i + 2] = (Math.random() - 0.5) * 8;
    }
    particles.setAttribute("position", new THREE.BufferAttribute(points, 3));
    const dust = new THREE.Points(particles, new THREE.PointsMaterial({ color: 0x8cc23d, size: 0.035, transparent: true, opacity: 0.55 }));
    scene.add(dust);
    scene.add(new THREE.HemisphereLight(0x9eeaff, 0x06111b, 2.15));
    const key = new THREE.PointLight(0x30b5e6, 45, 16);
    key.position.set(-4, 5, 6);
    scene.add(key);
    const warm = new THREE.PointLight(0xf08f24, 32, 12);
    warm.position.set(3, 2, 4);
    scene.add(warm);

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      renderer.setSize(rect.width, rect.height, false);
      camera.aspect = rect.width / rect.height;
      camera.updateProjectionMatrix();
    };
    resize();
    window.addEventListener("resize", resize);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;
    let clock = 0;
    const animate = () => {
      clock += 0.012;
      if (!reduced) {
        root.rotation.y = Math.sin(clock * 0.42) * 0.055;
        hero.position.y = -1.75 + Math.sin(clock * 2.3) * 0.045;
        dust.rotation.y += 0.0009;
        runeMaterials.forEach((material, index) => {
          if (index < progress) material.emissiveIntensity = 1.5 + Math.sin(clock * 3 + index) * 0.65;
        });
      }
      const target = open ? 1.15 : 0;
      leftDoor.rotation.y += (target - leftDoor.rotation.y) * 0.055;
      rightDoor.rotation.y += (-target - rightDoor.rotation.y) * 0.055;
      if (open) hero.position.z += (-1.25 - hero.position.z) * 0.018;
      renderer.render(scene, camera);
      frame = window.requestAnimationFrame(animate);
    };
    animate();
    return () => {
      window.removeEventListener("resize", resize);
      window.cancelAnimationFrame(frame);
      renderer.dispose();
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          (Array.isArray(object.material) ? object.material : [object.material]).forEach((material) => material.dispose());
        }
      });
      particles.dispose();
    };
  }, [progress, open]);

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
    if (correct) return;
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
        <div className="cover-copy"><div className="eyebrow"><span>04</span> A DSA GI LEARNING QUEST</div><h1><span>The DSA Way:</span>A Hero&apos;s Journey</h1><p>Nine chambers. One way forward. Build the instincts that make this the best place to work—and the best place to get care.</p><button className="primary-button" type="button" onClick={begin}><span>Begin the journey</span><b>→</b></button></div>
        <div className="world-frame cover-world"><VoxelWorld progress={0} open={false} /><div className="world-caption">CHAMBER IV · ROOT CAUSE</div></div>
        <div className="cover-manifesto"><div><span>MISSION</span><p>Delivering nation leading health care for the patients and communities we serve.</p></div><div><span>VALUES</span><p>Safety · Compassion · Integrity · Excellence · Continuous Improvement</p></div><div><span>WHO WE ARE</span><p>Imagine Possibilities · Unlock Potential · Deliver the Extraordinary</p></div></div>
      </section>}

      {stage === "threshold" && <section className="threshold-screen">
        <div className="story-column"><div className="quest-kicker">THE NINE CHAMBERS · A CAREER-FAIR QUEST</div><div className="chamber-tag">The wheel has chosen — Chamber IV: Root Cause</div><h1 className="chamber-title">The Door<br />of Whys</h1><div className="threshold-prose"><p>For the third week running, the morning medication cart reaches the ward late. Nurses scramble. Doses slip.</p><p>Tonight the old door sealed behind you, and words appeared in the wood:</p><blockquote>&quot;I open only for the root. I listen only to questions — but beware: some questions are solutions in disguise, and those bounce off me all the same.&quot;</blockquote><p>Somewhere above, a sensei&apos;s voice: <em>&quot;Most locks are five questions deep.&quot;</em></p></div><button className="primary-button" type="button" onClick={() => { setStage("questions"); playTone("step", sound); }}><span>Cross the threshold</span><b>→</b></button></div>
        <div className="world-frame"><VoxelWorld progress={0} open={false} /><RuneRail progress={0} /></div>
      </section>}

      {stage === "questions" && <section className="question-screen">
        <div className="question-main"><div className="question-heading-row"><div><div className="quest-kicker">THE DOOR OF WHYS</div><div className="chamber-tag">What you know · why {roman(questionIndex + 1)}</div></div><RuneRail progress={progress} /></div><div className="known-panel"><p>{question.known}</p><span>{question.whisper}</span></div>
          <div className="choice-list" aria-label={`Why ${questionIndex + 1} choices`}>{question.options.map((option, index) => <button type="button" key={option} onClick={() => choose(index)} disabled={correct || wrongChoice === index} className={`${correct && index === question.correct ? "is-correct" : ""} ${wrongChoice === index ? "is-wrong" : ""}`}><span>{String(index + 1).padStart(2, "0")}</span><b>{option}</b><i>→</i></button>)}</div>
          {(wrongChoice !== null || correct) && <div className={`feedback-panel ${correct ? "answer" : "refusal"}`} role="status"><div className="feedback-title">{correct ? "The door answers" : "The door does not move"}</div><p>{correct ? question.answer : question.wrong[wrongChoice as number]}</p>{correct ? <><div className="rune-ignites">— a rune ignites —</div><button className="next-button" type="button" onClick={next}>{questionIndex === 4 ? "Open the door" : "Descend to the next why"}<span>↓</span></button></> : <blockquote>&quot;That question carried a solution in its sleeve. Ask what is — not what to do.&quot;</blockquote>}</div>}
        </div>
        <div className="world-frame question-world"><VoxelWorld progress={progress} open={false} /><div className="depth-meter"><span style={{ height: `${progress * 20}%` }} /><b>ROOT DEPTH</b><i>{progress}/5</i></div></div>
      </section>}

      {stage === "complete" && <section className="complete-screen">
        <div className="complete-story"><div className="quest-kicker">THE DOOR OPENS</div><h1>Root found.</h1><p className="completion-lead">Five questions, one thread — from a late cart down to a decision made in a purchasing office.</p><ol className="root-chain"><li>The medication cart is late</li><li>↳ why — the order list reaches pharmacy late</li><li>↳ why — the overnight printer jams every morning</li><li>↳ why — the paper curls in the tray</li><li>↳ why — a cheaper stock absorbs the basement&apos;s humidity</li><li>↳ why — purchasing changed suppliers, and no standard required them to tell the people the change would touch</li></ol><p>The root fix costs almost nothing: restore the approved stock, and write the missing rule — <em>any supply change that touches clinical work gets flagged to the people who live with it.</em></p><p>The expensive fixes you were offered — new printers, second carts, earlier shifts — would have treated symptoms forever.</p></div>
        <div className="reward-column"><div className="world-frame complete-world"><VoxelWorld progress={5} open /></div><div className="weapon-card"><span>WEAPON ACQUIRED</span><div className="sword-glyph" aria-hidden="true">†</div><h2>The Five Whys</h2><p>Every hero is offered easy weapons at the threshold.<br />The true weapon is a question, asked five times.</p></div><div className="completion-meta"><p>Rootfinder — the door barely resisted you</p><strong>This chamber is Box 4 of 9 — Root Cause Analysis.</strong><p>On an A3, masters of improvement spend most of the journey here, understanding the problem, before a single solution is drawn. Spin the wheel again to enter another chamber.</p><button className="primary-button" type="button" onClick={restart}><span>Enter again</span><b>↻</b></button></div></div>
      </section>}
      <footer className="hero-footer"><span>MISSION</span><span>VISION</span><span>VALUES</span><span>CORE PRIORITIES</span><strong>WHO WE ARE</strong></footer>
    </main>
  );
}

function RuneRail({ progress }: { progress: number }) {
  return <div className="rune-rail" role="img" aria-label={`${progress} of 5 runes lit`}>{["I", "II", "III", "IV", "V"].map((rune, index) => <span key={rune} className={index < progress ? "lit" : ""}>{rune}</span>)}</div>;
}

function roman(value: number) { return ["I", "II", "III", "IV", "V"][value - 1]; }

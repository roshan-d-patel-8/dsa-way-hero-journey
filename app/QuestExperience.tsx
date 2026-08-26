"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

type Stage = "cover" | "forge-intro" | "forge-game" | "forge-complete" | "keep-intro" | "keep-game" | "keep-complete" | "threshold" | "questions" | "complete";

type Question = {
  known: string;
  whisper: string;
  options: string[];
  correct: number;
  answer: string;
  wrong: Record<number, string>;
};

type ForgeFragment = {
  id: string;
  text: string;
  rejection: string;
};

type ForgeSeal = {
  id: string;
  glyph: string;
  name: string;
  prompt: string;
  coaching: string;
  correctId: string;
  lesson: string;
  fragments: ForgeFragment[];
};

type KeepFragment = {
  id: string;
  text: string;
  rejection: string;
};

type KeepObservation = {
  id: string;
  glyph: string;
  name: string;
  place: string;
  prompt: string;
  coaching: string;
  correctId: string;
  lesson: string;
  mapFact: string;
  sceneCue: string;
  fragments: KeepFragment[];
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

const A3_BOXES = [
  { number: 1, label: "Reason for Action" },
  { number: 2, label: "Current State" },
  { number: 3, label: "Target State" },
  { number: 4, label: "Gap Analysis" },
  { number: 5, label: "Solutions Approach" },
  { number: 6, label: "Rapid Experiments" },
  { number: 7, label: "Completion Plan" },
  { number: 8, label: "Confirmed State" },
  { number: 9, label: "Insights" },
] as const;

const CHAMBERS = A3_BOXES.map(({ label }) => label);

const FORGE_SEALS: ForgeSeal[] = [
  {
    id: "background",
    glyph: "⌂",
    name: "Background",
    prompt: "Choose the fragment that makes the situation legible to someone outside the clinic.",
    coaching: "Where, when, for whom — and how big?",
    correctId: "background-evidence",
    lesson: "Context forged: the reader can see the setting, the pattern, and the measured pain.",
    fragments: [
      { id: "background-blame", text: "Since January, scheduling staff at the East Bay clinic have mishandled adult new-GI referrals, causing long waits and rising patient dissatisfaction.", rejection: "Blame is not background. It narrows the search to a person before the work is understood." },
      { id: "background-evidence", text: "Since January, adult new-GI referrals at the East Bay clinic have waited a median 24 days for first review; 42% wait longer than 30 days.", rejection: "" },
      { id: "background-solution", text: "Since January, the East Bay clinic has needed a centralized referral team with dedicated staff to reduce delays for adult new-GI patients.", rejection: "A countermeasure has entered before the problem is visible. The forge rejects solutions in the background." },
    ],
  },
  {
    id: "problem",
    glyph: "!",
    name: "Problem Statement",
    prompt: "Forge the measurable gap without hiding a remedy inside it.",
    coaching: "Is this a gap you can measure, or a solution wearing the problem's clothes?",
    correctId: "problem-gap",
    lesson: "Gap forged: specific, time-anchored, recurring, and free of blame or prescribed fixes.",
    fragments: [
      { id: "problem-vague", text: "Adult new-GI referrals at the East Bay clinic face unacceptable delays, leaving patients frustrated and staff overwhelmed by an unreliable review process.", rejection: "The pain may be real, but 'unacceptable' and 'unreliable' cannot be measured. The quest still has no trajectory." },
      { id: "problem-capacity", text: "Adult new-GI referrals wait too long because the East Bay clinic lacks enough physicians to review the growing volume within fourteen days.", rejection: "That names a presumed cause — and smuggles in the solution of adding physicians." },
      { id: "problem-gap", text: "New-GI referrals are not meeting the 14-day review standard: median review time is 24 days, with 42% waiting more than 30 days.", rejection: "" },
    ],
  },
  {
    id: "aim",
    glyph: "◎",
    name: "Aim",
    prompt: "Choose an end state with magnitude and time — but no prescribed method.",
    coaching: "If achieved, would we know — and would patients and staff feel it?",
    correctId: "aim-outcome",
    lesson: "Aim forged: a measurable outcome, a deadline, and protection against shifting burden to staff.",
    fragments: [
      { id: "aim-project", text: "Hire one referral coordinator, add two physician review sessions, and launch a live referral dashboard at the East Bay clinic by November 30.", rejection: "Those are interventions, not an aim. The destination should survive even if the route changes." },
      { id: "aim-outcome", text: "Reduce median referral-review time from 24 to 14 days or less by November 30, without increasing physician after-hours work.", rejection: "" },
      { id: "aim-vague", text: "Improve adult new-GI referral access by November 30 so patients are reviewed sooner and physicians experience less after-hours work.", rejection: "The date is useful, but there is no measurable magnitude or recognizable finish line. The target remains in fog." },
    ],
  },
  {
    id: "charter",
    glyph: "⚡",
    name: "Trigger · Scope · Done",
    prompt: "Choose the charter that explains why action begins now, bounds the work, and defines a sustained finish.",
    coaching: "Why now? What is explicitly in and out? What proves the gain will hold?",
    correctId: "charter-objective",
    lesson: "Charter forged: an observable trigger, disciplined boundaries, and a sustained handoff make the quest actionable.",
    fragments: [
      { id: "charter-anecdote", text: "Trigger: one referral waited 61 days last Tuesday. Scope: every access problem across every East Bay specialty. Done: patients and staff agree the redesigned process feels substantially better.", rejection: "Anecdote, mission creep, and sentiment cannot anchor a charter. The forge needs a recurring signal, a workable boundary, and a measurable handoff." },
      { id: "charter-solution", text: "Trigger: a vendor demonstrated a triage platform last month. Scope: adult new-GI referrals across the region. Done: the dashboard launches with automated updates and every staff member completes training.", rejection: "A vendor, a broad region, and completed deliverables do not prove the problem warrants action or that the outcome is sustained." },
      { id: "charter-objective", text: "Trigger: the over-30-day backlog exceeded 40% for three months. Scope: adult new-GI referrals, excluding urgent, procedural, and follow-up work. Done: median review stays at or below 14 days for eight weeks with an operational owner.", rejection: "" },
    ],
  },
];

const KEEP_OBSERVATIONS: KeepObservation[] = [
  {
    id: "arrival",
    glyph: "⌁",
    name: "Arrival",
    place: "The Receiving Gate",
    prompt: "The official atlas says every referral enters a clear, owned path. What can the lantern actually place on the map?",
    coaching: "What did you see enter the process—and at what exact time?",
    correctId: "arrival-observed",
    lesson: "The first chamber appears. You recorded the real thing, the real place, and a timestamp—without guessing what it means.",
    mapFact: "08:07 · Routine referral enters the GI workqueue",
    sceneCue: "08:07 · referral enters the shared queue · owner field blank",
    fragments: [
      { id: "arrival-blame", text: "The referral coordinator probably ignored the new request.", rejection: "A false corridor forms around a person. You did not observe neglect; you observed a referral entering a queue." },
      { id: "arrival-observed", text: "At 08:07, one routine referral appears in the shared GI workqueue with no named owner displayed.", rejection: "" },
      { id: "arrival-fix", text: "The system should automatically assign every referral on arrival.", rejection: "A gleaming shortcut appears—but it leads to Box 5. This chamber maps what is, not what should be." },
    ],
  },
  {
    id: "waiting",
    glyph: "◴",
    name: "Waiting",
    place: "The Silent Gallery",
    prompt: "The referral remains still while work moves around it. Which inscription belongs on the current-state map?",
    coaching: "How long did the work wait, and how long was someone actually touching it?",
    correctId: "waiting-measured",
    lesson: "The gallery lengthens to its true size. Waiting time and touch time are now visible instead of being blended into one average.",
    mapFact: "03h 35m wait · 02m touch",
    sceneCue: "queue entered 08:07 · first opened 11:42 · active touch 02:00",
    fragments: [
      { id: "waiting-rounded", text: "Referrals usually sit for about four hours before anyone looks at them.", rejection: "The lantern rejects a rounded recollection. Box 2 needs the timestamps from this observed journey, not a plausible estimate." },
      { id: "waiting-cause", text: "The referral waits because the team is understaffed in the morning.", rejection: "You have named a cause without testing it. The wait is visible; its reason belongs to a later chamber." },
      { id: "waiting-measured", text: "The referral is first opened at 11:42: 3 hours 35 minutes waiting, followed by 2 minutes of active review.", rejection: "" },
    ],
  },
  {
    id: "handoffs",
    glyph: "⇄",
    name: "Handoffs",
    place: "The Bridge of Many Hands",
    prompt: "The throne-room map shows one smooth crossing. Follow the referral itself. What path did it take?",
    coaching: "Who actually touched the work, in what sequence, and where did responsibility transfer?",
    correctId: "handoffs-traced",
    lesson: "Three bridges rise from the dark. The map now shows the actual sequence of ownership rather than the org chart.",
    mapFact: "Coordinator → MA → physician → scheduler",
    sceneCue: "coordinator → MA → physician → scheduler · 3 transfers",
    fragments: [
      { id: "handoffs-policy", text: "The standard pathway is coordinator directly to physician, then scheduler.", rejection: "That is the written route. You are walking the route this referral actually traveled." },
      { id: "handoffs-traced", text: "The observed referral moves from coordinator to MA to physician to scheduler—three responsibility transfers.", rejection: "" },
      { id: "handoffs-merge", text: "The coordinator and MA steps should be consolidated into one role.", rejection: "A tempting bridge reaches toward a countermeasure. Box 2 records the transfers; it does not redesign them." },
    ],
  },
  {
    id: "rework",
    glyph: "↺",
    name: "Rework",
    place: "The Returning Stair",
    prompt: "A red stair curls back toward an earlier room. What did you witness on this loop?",
    coaching: "Where did the work reverse direction, and what observable event marked the return?",
    correctId: "rework-observed",
    lesson: "The hidden stair burns red. Rework is now drawn as movement through the system—not explained away or blamed on a person.",
    mapFact: "1 return · missing outside records · +2 days",
    sceneCue: "missing outside records · referral returns · +2 days",
    fragments: [
      { id: "rework-observed", text: "At physician review, missing outside records send the referral back to the coordinator; it returns to the physician queue two days later.", rejection: "" },
      { id: "rework-training", text: "The coordinator needs better training on collecting outside records.", rejection: "You may eventually test that theory, but the walk did not establish it. Causes do not belong on this map." },
      { id: "rework-checklist", text: "Add a mandatory records checklist before referrals can advance.", rejection: "A repair has appeared before the current condition is complete. Save it for the countermeasure chamber." },
    ],
  },
  {
    id: "voice",
    glyph: "◖",
    name: "Voice",
    place: "The Listening Alcove",
    prompt: "The brass horn carries the traveler’s own words. Which statement preserves the Voice of the Customer?",
    coaching: "What did the customer say—not what do we think they felt?",
    correctId: "voice-verbatim",
    lesson: "The alcove answers in the traveler’s voice. Experience has become evidence without being translated into an executive assumption.",
    mapFact: "Patient: “I called twice and still didn’t know if you had it.”",
    sceneCue: "patient: “I called twice and still didn’t know if you had received it.”",
    fragments: [
      { id: "voice-verbatim", text: "Patient: “I called twice and still didn’t know whether you had received the referral.”", rejection: "" },
      { id: "voice-interpreted", text: "Patients feel abandoned because the referral department does not communicate.", rejection: "That may be an interpretation, but it is not the customer’s voice. Preserve what was actually said." },
      { id: "voice-portal", text: "Patients need a real-time referral tracker in the portal.", rejection: "The horn goes silent. A proposed feature cannot substitute for listening to the present experience." },
    ],
  },
  {
    id: "map",
    glyph: "▦",
    name: "Current Map",
    place: "The Cartographer’s Table",
    prompt: "The Keep will accept one final inscription. Which summary describes the observed journey without diagnosing or repairing it?",
    coaching: "Can every mark on this map be traced back to something you saw, timed, counted, or heard?",
    correctId: "map-current",
    lesson: "The Unmapped Keep is unmapped no longer. The actual journey is visible, measurable, and ready for the next chamber.",
    mapFact: "6 steps · 3 handoffs · 2 queues · 1 rework loop",
    sceneCue: "6 steps · 3 handoffs · 2 queues · 1 rework loop",
    fragments: [
      { id: "map-current", text: "Observed journey: 6 process steps, 3 handoffs, 2 queues, 1 rework loop, at least 51 hours 35 minutes waiting, and 18 minutes touch time.", rejection: "" },
      { id: "map-root", text: "The root problem is fragmented ownership and insufficient referral staffing.", rejection: "The map fractures at the word ‘root.’ Causes belong in Box 4, after the current condition is fully visible." },
      { id: "map-future", text: "Create one centralized referral team with a single queue and automated patient updates.", rejection: "A beautiful future-state map has replaced the current one. Box 2 must remain honest about today." },
    ],
  },
];

const KEEP_LENS_FINDINGS = [
  { id: "arrival", x: 12, y: 30, official: "Every referral is received into an owned queue.", observed: "08:07 · The referral enters a shared queue. The owner field is blank." },
  { id: "waiting", x: 29, y: 67, official: "Review begins promptly after receipt.", observed: "3 hours 35 minutes waiting · 2 minutes of active review." },
  { id: "handoffs", x: 51, y: 29, official: "One coordinated review hands directly to scheduling.", observed: "Coordinator → MA → physician → scheduler · 3 transfers." },
  { id: "rework", x: 69, y: 69, official: "Complete information moves forward once.", observed: "Missing outside records send the referral backward · +2 days." },
  { id: "voice", x: 88, y: 29, official: "The patient is informed throughout the journey.", observed: "Patient: “I called twice and still didn’t know if you had it.”" },
  { id: "map", x: 88, y: 78, official: "Received → reviewed → scheduled.", observed: "6 steps · 3 handoffs · 2 queues · 1 rework loop · 51h 35m waiting." },
] as const;

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

type KeepSound = "footsteps" | "stopwatch" | "handoff" | "rework" | "voices" | "parchment" | "lantern";
const KEEP_SOUND_CUES: KeepSound[] = ["footsteps", "stopwatch", "handoff", "rework", "voices", "parchment"];

function playKeepSound(kind: KeepSound, enabled: boolean) {
  if (!enabled || typeof window === "undefined") return;
  const AudioCtor = window.AudioContext ??
    (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtor) return;
  const ctx = new AudioCtor();
  const now = ctx.currentTime;
  const master = ctx.createGain();
  master.gain.setValueAtTime(0.72, now);
  master.connect(ctx.destination);

  const note = (frequency: number, start: number, duration: number, volume: number, wave: OscillatorType = "triangle", endFrequency?: number) => {
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = wave;
    oscillator.frequency.setValueAtTime(frequency, now + start);
    if (endFrequency) oscillator.frequency.exponentialRampToValueAtTime(endFrequency, now + start + duration);
    gain.gain.setValueAtTime(0.0001, now + start);
    gain.gain.exponentialRampToValueAtTime(volume, now + start + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + start + duration);
    oscillator.connect(gain).connect(master);
    oscillator.start(now + start);
    oscillator.stop(now + start + duration + 0.03);
  };

  const noise = (start: number, duration: number, volume: number, filterType: BiquadFilterType, frequency: number) => {
    const buffer = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * duration), ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let index = 0; index < data.length; index += 1) data[index] = (Math.random() * 2 - 1) * (1 - index / data.length * 0.28);
    const source = ctx.createBufferSource();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();
    source.buffer = buffer;
    filter.type = filterType;
    filter.frequency.value = frequency;
    filter.Q.value = 1.1;
    gain.gain.setValueAtTime(0.0001, now + start);
    gain.gain.exponentialRampToValueAtTime(volume, now + start + 0.035);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + start + duration);
    source.connect(filter).connect(gain).connect(master);
    source.start(now + start);
  };

  if (kind === "footsteps") {
    [0, .28, .62, .94, 1.29].forEach((start, index) => {
      noise(start, .14, .055, "lowpass", 180);
      note(index % 2 ? 72 : 82, start, .13, .045, "sine", 46);
    });
    noise(0, 1.75, .012, "bandpass", 520);
  } else if (kind === "stopwatch") {
    [0, .34, .68, 1.02, 1.36, 1.7].forEach((start) => {
      note(1420, start, .035, .045, "square", 920);
      note(96, start + .018, .055, .018, "sine", 68);
    });
  } else if (kind === "handoff") {
    [261.63, 329.63, 392, 523.25].forEach((frequency, index) => note(frequency, index * .19, .34, .035, "triangle"));
    [0.05, .26, .47].forEach((start) => noise(start, .17, .026, "highpass", 1550));
  } else if (kind === "rework") {
    note(430, 0, 1.25, .055, "sawtooth", 92);
    noise(.08, 1.1, .035, "bandpass", 360);
    note(123, .82, .48, .04, "square", 82);
  } else if (kind === "voices") {
    noise(0, 2.6, .018, "bandpass", 690);
    [138, 176, 218].forEach((frequency, index) => {
      note(frequency, index * .18, 2.15 - index * .12, .012, "sine", frequency * 1.05);
      note(frequency * 2.02, .11 + index * .15, 1.7, .006, "triangle", frequency * 1.94);
    });
  } else if (kind === "parchment") {
    [0, .18, .38, .58, .83, 1.07].forEach((start, index) => noise(start, .28, .018 + index * .002, "highpass", 1850));
    note(196, 0, 1.55, .02, "triangle", 392);
  } else {
    [261.63, 392, 523.25, 783.99].forEach((frequency, index) => note(frequency, index * .075, .65, .036, "sine"));
    noise(0, .95, .017, "highpass", 2100);
  }
  window.setTimeout(() => void ctx.close(), kind === "voices" ? 3100 : 2400);
}

function VoxelWorld({ progress, open }: { progress: number; open: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [renderingFailed, setRenderingFailed] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || renderingFailed) return;

    const activateFallback = (error: unknown) => {
      console.warn("The cinematic 3D scene is unavailable; using the illustrated fallback.", error);
      setRenderingFailed(true);
    };

    const onContextLost = (event: Event) => {
      event.preventDefault();
      activateFallback(new Error("WebGL context lost"));
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
      activateFallback(error);
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
        activateFallback(error);
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

// Kept as a progressive-enhancement reference while Box II moves to the DOM-based lens game.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function UnmappedKeepWorld({ progress, focus, fracture = false, complete = false }: { progress: number; focus?: number; fracture?: boolean; complete?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [renderingFailed, setRenderingFailed] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || renderingFailed) return;

    const fail = (error: unknown) => {
      console.warn("The Unmapped Keep could not summon its 3D map; using the illustrated atlas.", error);
      setRenderingFailed(true);
    };
    const onContextLost = (event: Event) => {
      event.preventDefault();
      fail(new Error("WebGL context lost"));
    };
    const onContextCreationError = () => fail(new Error("WebGL context creation failed"));
    canvas.addEventListener("webglcontextlost", onContextLost);
    canvas.addEventListener("webglcontextcreationerror", onContextCreationError);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x02080b, 0.048);
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 80);
    camera.position.set(0, 8.7, 9.2);
    camera.lookAt(0, 0, 0);

    let renderer: THREE.WebGLRenderer;
    let composer: EffectComposer | null = null;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    } catch (error) {
      canvas.removeEventListener("webglcontextlost", onContextLost);
      canvas.removeEventListener("webglcontextcreationerror", onContextCreationError);
      fail(error);
      return;
    }
    try {
      composer = new EffectComposer(renderer);
      composer.addPass(new RenderPass(scene, camera));
      composer.addPass(new UnrealBloomPass(new THREE.Vector2(1, 1), complete ? 1.12 : 0.94, 0.76, 0.13));
    } catch (error) {
      console.warn("Bloom is unavailable; continuing with the direct Three.js renderer.", error);
      composer = null;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.7));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;

    const root = new THREE.Group();
    root.rotation.y = -0.08;
    scene.add(root);
    const stone = new THREE.MeshStandardMaterial({ color: 0x172c31, roughness: 0.9, metalness: 0.08 });
    const stoneEdge = new THREE.MeshStandardMaterial({ color: 0x28464a, roughness: 0.78, metalness: 0.18 });
    const dormant = new THREE.MeshStandardMaterial({ color: 0x17272c, emissive: 0x06171c, emissiveIntensity: 0.08, roughness: 0.86 });
    const revealed = new THREE.MeshStandardMaterial({ color: 0x69d5e2, emissive: 0x1d839a, emissiveIntensity: 1.7, roughness: 0.28, metalness: 0.45 });
    const gold = new THREE.MeshStandardMaterial({ color: 0xffcf68, emissive: 0xf08f24, emissiveIntensity: 3.4, roughness: 0.25, metalness: 0.48 });
    const timber = new THREE.MeshStandardMaterial({ color: 0x5f3c27, roughness: 0.82, metalness: 0.04 });
    const paper = new THREE.MeshStandardMaterial({ color: 0xe7d9ac, roughness: 0.92, metalness: 0 });
    const warning = new THREE.MeshStandardMaterial({ color: 0xe75657, emissive: 0x9f213e, emissiveIntensity: 1.8, roughness: 0.42 });
    const falsePath = new THREE.MeshStandardMaterial({ color: 0xe7569a, emissive: 0x981f59, emissiveIntensity: fracture ? 4.2 : 0, transparent: true, opacity: fracture ? 0.92 : 0, roughness: 0.32 });
    const labelTextures: THREE.CanvasTexture[] = [];

    const register = <T extends THREE.Mesh>(mesh: T) => {
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      return mesh;
    };
    const block = (w: number, h: number, d: number, material: THREE.Material, x: number, y: number, z: number) => {
      const mesh = register(new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material));
      mesh.position.set(x, y, z);
      return mesh;
    };
    const makeWorldLabel = (title: string, detail: string, x: number, y: number, z: number, accent = "#75e2e6") => {
      const labelCanvas = document.createElement("canvas");
      labelCanvas.width = 640;
      labelCanvas.height = 170;
      const context = labelCanvas.getContext("2d");
      if (context) {
        context.fillStyle = "rgba(2,10,14,.91)";
        context.fillRect(4, 4, 632, 162);
        context.strokeStyle = accent;
        context.lineWidth = 6;
        context.strokeRect(4, 4, 632, 162);
        context.fillStyle = accent;
        context.font = "800 38px monospace";
        context.fillText(title, 28, 68);
        context.fillStyle = "#d9eef0";
        context.font = "700 23px monospace";
        context.fillText(detail, 28, 119);
      }
      const texture = new THREE.CanvasTexture(labelCanvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      labelTextures.push(texture);
      const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: true, depthWrite: false }));
      sprite.position.set(x, y, z);
      sprite.scale.set(2.25, .6, 1);
      root.add(sprite);
      return sprite;
    };
    const pawnMaterial = (color: number) => new THREE.MeshStandardMaterial({ color, roughness: 0.68, metalness: 0.08 });
    const skin = pawnMaterial(0xb9714b);
    const makePawn = (color: number, x: number, z: number, scale = 1) => {
      const pawn = new THREE.Group();
      const bodyMaterial = pawnMaterial(color);
      const body = register(new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.28, 0.62, 8), bodyMaterial));
      body.position.y = 0.43;
      const head = register(new THREE.Mesh(new THREE.SphereGeometry(0.17, 10, 8), skin));
      head.position.y = 0.88;
      const base = register(new THREE.Mesh(new THREE.CylinderGeometry(0.31, 0.34, 0.1, 10), stoneEdge));
      base.position.y = 0.02;
      pawn.add(body, head, base);
      pawn.position.set(x, 0.02, z);
      pawn.scale.setScalar(scale);
      pawn.userData.baseY = pawn.position.y;
      pawn.userData.phase = Math.random() * Math.PI * 2;
      root.add(pawn);
      return pawn;
    };

    const floor = register(new THREE.Mesh(new THREE.PlaneGeometry(15, 11), new THREE.MeshStandardMaterial({ color: 0x081519, roughness: 1, metalness: 0 })));
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.18;
    root.add(floor);

    const grid = new THREE.GridHelper(14, 28, 0x365b5d, 0x172b2f);
    grid.position.y = -0.165;
    (grid.material as THREE.Material).transparent = true;
    (grid.material as THREE.Material).opacity = 0.34;
    root.add(grid);

    for (let i = -7; i <= 7; i += 1) {
      root.add(block(0.42, 0.66 + (Math.abs(i) % 3) * 0.18, 0.62, i % 2 ? stone : stoneEdge, i, 0.12, -5.18));
      root.add(block(0.42, 0.66 + (Math.abs(i + 1) % 3) * 0.18, 0.62, i % 2 ? stoneEdge : stone, i, 0.12, 5.18));
    }
    for (let i = -4; i <= 4; i += 1) {
      root.add(block(0.62, 0.66 + (Math.abs(i) % 3) * 0.18, 0.42, i % 2 ? stone : stoneEdge, -7.18, 0.12, i * 1.16));
      root.add(block(0.62, 0.66 + (Math.abs(i + 1) % 3) * 0.18, 0.42, i % 2 ? stoneEdge : stone, 7.18, 0.12, i * 1.16));
    }

    const points = [
      new THREE.Vector3(-5.25, 0.04, 2.35),
      new THREE.Vector3(-3.15, 0.04, 0.55),
      new THREE.Vector3(-0.65, 0.04, 1.55),
      new THREE.Vector3(1.2, 0.04, -0.35),
      new THREE.Vector3(3.2, 0.04, 0.85),
      new THREE.Vector3(5.1, 0.04, -2.25),
    ];

    const processZones = [
      ["RECEIVING GATE", "08:07 · REFERRAL ARRIVES"],
      ["SHARED QUEUE", "OWNER: —  ·  STATUS: WAITING"],
      ["COORDINATOR", "HANDOFF 01"],
      ["MA REVIEW", "HANDOFF 02"],
      ["PHYSICIAN REVIEW", "MISSING OUTSIDE RECORDS"],
      ["SCHEDULING", "HANDOFF 03"],
    ] as const;
    processZones.forEach(([title, detail], index) => {
      const point = points[index];
      makeWorldLabel(title, detail, point.x, 1.63, point.z - .62, index === 1 || index === 4 ? "#ffc45e" : "#75e2e6");
    });

    const receivingGate = new THREE.Group();
    receivingGate.add(
      block(.42, 2.2, .52, stoneEdge, -.78, .92, 0),
      block(.42, 2.2, .52, stoneEdge, .78, .92, 0),
      block(2, .38, .58, stone, 0, 1.88, 0),
    );
    receivingGate.position.set(points[0].x, 0, points[0].z + .72);
    receivingGate.rotation.y = -.38;
    root.add(receivingGate);

    [2, 3, 4, 5].forEach((pointIndex, deskIndex) => {
      const point = points[pointIndex];
      const workstation = new THREE.Group();
      const deskTop = block(1.25, .13, .64, timber, 0, .58, 0);
      const deskLegLeft = block(.12, .58, .56, timber, -.48, .26, 0);
      const deskLegRight = block(.12, .58, .56, timber, .48, .26, 0);
      const monitor = block(.5, .36, .08, stoneEdge, .08, .86, -.12);
      const screen = block(.4, .25, .025, deskIndex === 2 ? warning : revealed, .08, .86, -.17);
      workstation.add(deskTop, deskLegLeft, deskLegRight, monitor, screen);
      workstation.position.set(point.x, 0, point.z + .65);
      workstation.rotation.y = deskIndex % 2 ? -.18 : .18;
      root.add(workstation);
    });

    const queueRack = new THREE.Group();
    queueRack.position.set(points[1].x, 0, points[1].z + .55);
    queueRack.add(block(2.15, .12, .92, timber, 0, .18, 0));
    queueRack.add(block(.12, .82, .92, timber, -1.03, .53, 0));
    queueRack.add(block(.12, .82, .92, timber, 1.03, .53, 0));
    const queueFiles: THREE.Mesh[] = [];
    [-.78, -.42, -.06, .3, .66].forEach((offset, index) => {
      const file = block(.27, .08 + index * .035, .62, index === 4 ? warning : paper, offset, .31 + index * .018, 0);
      file.rotation.z = (index - 2) * .035;
      file.userData.baseY = file.position.y;
      queueFiles.push(file);
      queueRack.add(file);
    });
    root.add(queueRack);
    makeWorldLabel("OWNERLESS WORK", "5 FILES · NO NAMED OWNER", points[1].x, 1.05, points[1].z + 1.25, "#e75657");

    const patientBench = new THREE.Group();
    patientBench.position.set(3.9, 0, -3.46);
    patientBench.add(block(1.42, .16, .56, timber, 0, .39, 0), block(.13, .78, .5, timber, -.58, .08, 0), block(.13, .78, .5, timber, .58, .08, 0));
    root.add(patientBench);
    makeWorldLabel("PATIENT WAITING", "2 CALLS · RECEIPT UNKNOWN", 3.9, 1.3, -3.85, "#f276ad");
    const pathMaterials: THREE.MeshStandardMaterial[] = [];
    const pathMeshes: THREE.Mesh[] = [];
    const nodeMaterials: THREE.MeshStandardMaterial[] = [];
    const nodeLights: THREE.PointLight[] = [];

    const corridor = (start: THREE.Vector3, end: THREE.Vector3, material: THREE.Material, width = 0.24) => {
      const midpoint = start.clone().add(end).multiplyScalar(0.5);
      const distance = start.distanceTo(end);
      const mesh = block(distance, 0.11, width, material, midpoint.x, 0.05, midpoint.z);
      mesh.rotation.y = -Math.atan2(end.z - start.z, end.x - start.x);
      return mesh;
    };

    points.forEach((point, index) => {
      const lit = index < progress;
      const material = lit ? revealed.clone() : dormant.clone();
      material.emissiveIntensity = lit ? 1.65 : 0.05;
      nodeMaterials.push(material);
      const plinth = register(new THREE.Mesh(new THREE.CylinderGeometry(0.56, 0.68, 0.2, 8), stoneEdge));
      plinth.position.copy(point);
      plinth.position.y = 0;
      root.add(plinth);
      const node = register(new THREE.Mesh(new THREE.TorusGeometry(0.38, 0.09, 8, 24), material));
      node.rotation.x = Math.PI / 2;
      node.position.copy(point);
      node.position.y = 0.18;
      root.add(node);
      const rune = register(new THREE.Mesh(new THREE.OctahedronGeometry(0.17, 0), material));
      rune.position.copy(point);
      rune.position.y = 0.28;
      rune.rotation.y = index * 0.7;
      root.add(rune);
      const light = new THREE.PointLight(lit ? 0x55d9ec : 0x203a41, lit ? 5 : 0.05, 3.4, 2);
      light.position.copy(point);
      light.position.y = 0.75;
      nodeLights.push(light);
      root.add(light);
      if (index > 0) {
        const pathMaterial = (index <= progress ? revealed : dormant).clone();
        pathMaterial.emissiveIntensity = index <= progress ? 1.35 : 0.03;
        pathMaterials.push(pathMaterial);
        const pathMesh = corridor(points[index - 1], point, pathMaterial);
        if (index === progress) {
          pathMesh.scale.x = 0.025;
          pathMesh.userData.materializing = true;
        }
        pathMeshes.push(pathMesh);
        root.add(pathMesh);
      }
    });

    const branchStart = points[Math.min(progress, 5)];
    const branchEnd = branchStart.clone().add(new THREE.Vector3(progress % 2 ? 1.35 : -1.25, 0, -1.5));
    const falseCorridor = corridor(branchStart, branchEnd, falsePath, 0.18);
    falseCorridor.position.y = 0.1;
    root.add(falseCorridor);
    const falseNode = register(new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.07, 7, 20), falsePath));
    falseNode.rotation.x = Math.PI / 2;
    falseNode.position.copy(branchEnd);
    falseNode.position.y = 0.2;
    root.add(falseNode);

    const focusIndex = focus ?? Math.max(progress - 1, 0);
    const showObservedWork = focus !== undefined || complete;
    const staffPawns = [
      makePawn(0x1786a0, points[2].x - 0.08, points[2].z + 1.18, 0.82),
      makePawn(0x8d3d73, points[3].x + 0.08, points[3].z + 1.2, 0.82),
      makePawn(0x1f7791, points[4].x + 0.08, points[4].z + 1.2, 0.82),
      makePawn(0x9a5b2b, points[5].x - 0.08, points[5].z + 1.18, 0.82),
    ];
    staffPawns.forEach((pawn, index) => {
      pawn.visible = showObservedWork && (complete || focusIndex >= Math.max(0, index));
    });
    const patientPawn = makePawn(0x7d285c, 3.9, -3.23, 0.88);
    patientPawn.visible = showObservedWork;

    const referralMaterial = new THREE.MeshStandardMaterial({ color: 0xffc45e, emissive: 0xf08f24, emissiveIntensity: 2.1, roughness: 0.3, metalness: 0.32 });
    const referralToken = new THREE.Group();
    const referralScroll = register(new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.06, 0.48), referralMaterial));
    referralScroll.rotation.y = 0.28;
    const referralSeal = register(new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.09, 8), gold));
    referralSeal.rotation.x = Math.PI / 2;
    referralSeal.position.set(0, 0.08, 0);
    referralToken.add(referralScroll, referralSeal);
    referralToken.position.copy(points[Math.min(focusIndex, 5)]);
    referralToken.position.y = 0.66;
    referralToken.visible = showObservedWork;
    root.add(referralToken);

    const stopwatch = new THREE.Group();
    stopwatch.position.set(points[1].x - 0.82, 0.69, points[1].z - 0.62);
    const watchFace = register(new THREE.Mesh(new THREE.CylinderGeometry(0.39, 0.39, 0.09, 22), new THREE.MeshStandardMaterial({ color: 0xddebee, roughness: 0.34, metalness: 0.62 })));
    watchFace.rotation.x = Math.PI / 2;
    const watchRim = register(new THREE.Mesh(new THREE.TorusGeometry(0.39, 0.055, 8, 24), stoneEdge));
    watchRim.rotation.x = Math.PI / 2;
    const watchHand = block(0.035, 0.04, 0.31, falsePath, 0, 0.08, -0.09);
    watchHand.geometry.translate(0, 0, 0.12);
    stopwatch.add(watchFace, watchRim, watchHand);
    stopwatch.visible = showObservedWork && (complete || focusIndex === 1 || focusIndex === 5);
    root.add(stopwatch);

    const handoffOrb = register(new THREE.Mesh(new THREE.OctahedronGeometry(0.2, 0), gold));
    handoffOrb.visible = showObservedWork && (complete || focusIndex === 2 || focusIndex === 5);
    root.add(handoffOrb);
    const handoffCurve = new THREE.CatmullRomCurve3([points[2], points[3], points[4], points[5]].map((point) => point.clone().setY(0.72)));
    const journeyCurve = new THREE.CatmullRomCurve3(points.map((point) => point.clone().setY(0.68)));

    const reworkCurve = new THREE.CatmullRomCurve3([
      points[4].clone().setY(0.17),
      points[4].clone().add(new THREE.Vector3(-0.25, 0.38, -1.55)),
      points[2].clone().add(new THREE.Vector3(0.65, 0.2, -1.15)),
      points[2].clone().setY(0.17),
    ]);
    const reworkMaterial = new THREE.MeshStandardMaterial({ color: 0xe75657, emissive: 0xb12245, emissiveIntensity: 2.5, transparent: true, opacity: complete || focusIndex === 3 || focusIndex === 5 ? 0.92 : 0.06, roughness: 0.3 });
    const reworkTube = register(new THREE.Mesh(new THREE.TubeGeometry(reworkCurve, 44, 0.075, 8, false), reworkMaterial));
    reworkTube.visible = showObservedWork && (complete || focusIndex === 3 || focusIndex === 5);
    root.add(reworkTube);
    const reworkToken = register(new THREE.Mesh(new THREE.OctahedronGeometry(0.17, 0), reworkMaterial));
    reworkToken.visible = reworkTube.visible;
    root.add(reworkToken);

    const listeningHorn = new THREE.Group();
    listeningHorn.position.set(4.56, 0.77, -3.22);
    listeningHorn.rotation.set(-0.08, -0.72, -0.28);
    const hornBody = register(new THREE.Mesh(new THREE.ConeGeometry(0.34, 0.85, 18, 1, true), new THREE.MeshStandardMaterial({ color: 0xc0802f, roughness: 0.28, metalness: 0.86, side: THREE.DoubleSide })));
    hornBody.rotation.z = Math.PI / 2;
    const hornMouth = register(new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.055, 8, 24), gold));
    hornMouth.rotation.y = Math.PI / 2;
    hornMouth.position.x = 0.42;
    listeningHorn.add(hornBody, hornMouth);
    const voiceWaves: THREE.Mesh[] = [];
    [0.58, 0.86, 1.14].forEach((distance, index) => {
      const wave = register(new THREE.Mesh(new THREE.TorusGeometry(0.28 + index * 0.12, 0.025, 6, 30, Math.PI), new THREE.MeshBasicMaterial({ color: 0xffd47d, transparent: true, opacity: 0.58 - index * 0.12, blending: THREE.AdditiveBlending, side: THREE.DoubleSide })));
      wave.rotation.set(Math.PI / 2, 0, Math.PI / 2);
      wave.position.x = distance;
      voiceWaves.push(wave);
      listeningHorn.add(wave);
    });
    listeningHorn.visible = showObservedWork && (complete || focusIndex === 4 || focusIndex === 5);
    root.add(listeningHorn);

    const parchmentCanvas = document.createElement("canvas");
    parchmentCanvas.width = 768;
    parchmentCanvas.height = 420;
    const parchmentContext = parchmentCanvas.getContext("2d");
    const parchmentDepth = complete ? 6 : Math.max(progress, focus !== undefined ? focus + 1 : 0);
    if (parchmentContext) {
      const gradient = parchmentContext.createLinearGradient(0, 0, 768, 420);
      gradient.addColorStop(0, "#e0bb78");
      gradient.addColorStop(.55, "#c99653");
      gradient.addColorStop(1, "#8b5a31");
      parchmentContext.fillStyle = gradient;
      parchmentContext.fillRect(0, 0, 768, 420);
      parchmentContext.globalAlpha = .18;
      for (let index = 0; index < 170; index += 1) {
        parchmentContext.fillStyle = index % 3 ? "#4f2b1d" : "#fff1b5";
        parchmentContext.fillRect(Math.random() * 768, Math.random() * 420, Math.random() * 9 + 1, 1);
      }
      parchmentContext.globalAlpha = 1;
      parchmentContext.strokeStyle = "#4f2c22";
      parchmentContext.lineWidth = 5;
      parchmentContext.strokeRect(24, 24, 720, 372);
      parchmentContext.font = "700 23px Georgia";
      parchmentContext.fillStyle = "#3b211b";
      parchmentContext.fillText("THE ACTUAL PATH", 48, 65);
      const mapPoints = [[78, 302], [193, 218], [324, 262], [446, 170], [565, 228], [690, 118]];
      parchmentContext.lineCap = "round";
      parchmentContext.lineJoin = "round";
      for (let index = 1; index < Math.min(parchmentDepth, mapPoints.length); index += 1) {
        parchmentContext.strokeStyle = index === 3 ? "#9d2e3f" : "#18738a";
        parchmentContext.lineWidth = 12;
        parchmentContext.beginPath();
        parchmentContext.moveTo(mapPoints[index - 1][0], mapPoints[index - 1][1]);
        parchmentContext.lineTo(mapPoints[index][0], mapPoints[index][1]);
        parchmentContext.stroke();
      }
      mapPoints.forEach(([x, y], index) => {
        parchmentContext.fillStyle = index < parchmentDepth ? "#ffd86b" : "#6a4935";
        parchmentContext.beginPath();
        parchmentContext.arc(x, y, 17, 0, Math.PI * 2);
        parchmentContext.fill();
        parchmentContext.fillStyle = "#3b211b";
        parchmentContext.font = "700 15px monospace";
        parchmentContext.fillText(String(index + 1).padStart(2, "0"), x - 10, y + 5);
      });
    }
    const parchmentTexture = new THREE.CanvasTexture(parchmentCanvas);
    parchmentTexture.colorSpace = THREE.SRGBColorSpace;
    const parchmentMaterial = new THREE.MeshStandardMaterial({ map: parchmentTexture, roughness: 0.78, metalness: 0, emissive: 0x5e3218, emissiveIntensity: complete || focusIndex === 5 ? 0.24 : 0.08, side: THREE.DoubleSide });
    const parchment = register(new THREE.Mesh(new THREE.PlaneGeometry(4.9, 2.68, 8, 4), parchmentMaterial));
    parchment.position.set(0, 2.1, -4.72);
    parchment.rotation.x = -0.05;
    parchment.scale.setScalar(complete || focusIndex === 5 ? 1 : .88);
    root.add(parchment);

    const lantern = new THREE.Group();
    const lanternGlow = register(new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 12), gold));
    const lanternFrame = register(new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.055, 8, 22), new THREE.MeshStandardMaterial({ color: 0xb87b2f, roughness: 0.32, metalness: 0.86 })));
    lanternFrame.rotation.x = Math.PI / 2;
    lantern.add(lanternGlow, lanternFrame);
    const lanternLight = new THREE.PointLight(0xffb543, 13, 5.2, 1.8);
    lantern.add(lanternLight);
    const lanternVolumeMaterial = new THREE.MeshBasicMaterial({ color: 0xffc45e, transparent: true, opacity: 0.075, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending });
    const lanternVolume = new THREE.Mesh(new THREE.ConeGeometry(1.45, 2.5, 28, 1, true), lanternVolumeMaterial);
    lanternVolume.position.y = -1.17;
    lantern.add(lanternVolume);
    const lanternSpot = new THREE.SpotLight(0xffc45e, 24, 5.4, Math.PI / 3.4, .72, 1.7);
    lanternSpot.position.set(0, 0.1, 0);
    lantern.add(lanternSpot);
    lantern.add(lanternSpot.target);
    lanternSpot.target.position.set(0, -1.6, 0);
    lantern.position.copy(points[Math.min(Math.max(focusIndex, progress - 1, 0), 5)]);
    lantern.position.y = 0.78;
    root.add(lantern);

    const particles = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(260 * 3);
    for (let i = 0; i < particlePositions.length; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 14;
      particlePositions[i + 1] = Math.random() * 4.8;
      particlePositions[i + 2] = (Math.random() - 0.5) * 10;
    }
    particles.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    const motes = new THREE.Points(particles, new THREE.PointsMaterial({ color: 0xffcf73, size: 0.035, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false }));
    root.add(motes);

    scene.add(new THREE.HemisphereLight(0x76dbe8, 0x020506, 1.4));
    const moon = new THREE.DirectionalLight(0x82d9ed, 4.5);
    moon.position.set(-5, 9, 6);
    moon.castShadow = true;
    moon.shadow.mapSize.set(1024, 1024);
    scene.add(moon);
    const emberLight = new THREE.DirectionalLight(0xf08f24, 2.6);
    emberLight.position.set(7, 4, -4);
    scene.add(emberLight);

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      renderer.setSize(rect.width, rect.height, false);
      composer?.setSize(rect.width, rect.height);
      camera.aspect = rect.width / rect.height;
      camera.updateProjectionMatrix();
    };
    resize();
    window.addEventListener("resize", resize);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cameraFocus = points[focusIndex].clone().multiplyScalar(0.16);
    let frame = 0;
    let clock = 0;
    const animate = () => {
      clock += 0.012;
      if (!reduced) {
        root.rotation.y = -0.08 + Math.sin(clock * 0.35) * 0.018;
        lantern.position.y = 0.78 + Math.sin(clock * 2.2) * 0.09;
        lantern.rotation.y += 0.008;
        gold.emissiveIntensity = 3.1 + Math.sin(clock * 3.4) * 0.8;
        lanternLight.intensity = 17 + Math.sin(clock * 2.8) * 4;
        lanternSpot.intensity = 21 + Math.sin(clock * 2.25) * 4;
        lanternVolumeMaterial.opacity = 0.032 + (Math.sin(clock * 1.8) + 1) * 0.012;
        motes.rotation.y += 0.0007;
        falsePath.emissiveIntensity = fracture ? 3.2 + Math.sin(clock * 8) * 1.4 : 0;
        falsePath.opacity = fracture ? 0.68 + Math.sin(clock * 7) * 0.22 : 0;
        pathMeshes.forEach((mesh) => {
          if (mesh.userData.materializing) mesh.scale.x += (1 - mesh.scale.x) * 0.055;
        });
        [...staffPawns, patientPawn].forEach((pawn, index) => {
          pawn.position.y = pawn.userData.baseY + Math.sin(clock * 2.25 + pawn.userData.phase) * (index < 4 ? .035 : .018);
          pawn.rotation.y = Math.sin(clock * .72 + index) * .13;
        });
        queueFiles.forEach((file, index) => {
          file.position.y = file.userData.baseY + Math.sin(clock * 1.7 + index * .55) * .012;
          if (index === queueFiles.length - 1) file.rotation.z = .07 + Math.sin(clock * 2.2) * .035;
        });
        const travel = (clock * .18) % 1;
        if (referralToken.visible) {
          if (complete || focusIndex === 5) referralToken.position.copy(journeyCurve.getPoint(travel));
          else if (focusIndex === 0) referralToken.position.copy(points[0].clone().lerp(points[1], Math.max(0, Math.sin(clock * .72) * .5 + .5))).setY(.66);
          else if (focusIndex === 1) referralToken.position.set(points[1].x + Math.sin(clock * .7) * .08, .66, points[1].z + .05);
          else if (focusIndex === 2) referralToken.position.copy(handoffCurve.getPoint(travel));
          else if (focusIndex === 3) referralToken.position.copy(reworkCurve.getPoint(travel)).setY(.7);
          else referralToken.position.set(points[4].x + .18, .68 + Math.sin(clock * 1.5) * .04, points[4].z - .1);
          referralToken.rotation.y += .018;
        }
        if (handoffOrb.visible) {
          handoffOrb.position.copy(handoffCurve.getPoint((travel + .18) % 1));
          handoffOrb.rotation.x += .025;
          handoffOrb.rotation.y += .036;
        }
        if (reworkToken.visible) {
          reworkToken.position.copy(reworkCurve.getPoint((clock * .22) % 1)).setY(.72);
          reworkToken.rotation.y += .04;
        }
        if (stopwatch.visible) watchHand.rotation.y = -clock * 4.2;
        voiceWaves.forEach((wave, index) => {
          const pulse = (Math.sin(clock * 2.4 - index * .8) + 1) * .5;
          wave.scale.setScalar(.9 + pulse * .26);
          (wave.material as THREE.MeshBasicMaterial).opacity = .18 + pulse * (.42 - index * .06);
        });
        parchment.rotation.z = Math.sin(clock * .34) * .006;
        parchment.position.y = 2.1 + Math.sin(clock * .48) * .025;
        parchmentMaterial.emissiveIntensity = (complete || focusIndex === 5 ? .22 : .07) + (Math.sin(clock * 1.5) + 1) * .025;
        nodeMaterials.forEach((material, index) => {
          if (index < progress) material.emissiveIntensity = 1.45 + Math.sin(clock * 2.6 + index) * 0.35;
          nodeLights[index].intensity = index < progress ? 2.8 + Math.sin(clock * 2.2 + index) * 0.72 : 0.05;
        });
        pathMaterials.forEach((material, index) => {
          if (index < progress) material.emissiveIntensity = 1.15 + Math.sin(clock * 2.1 + index) * 0.22;
        });
        camera.position.x = Math.sin(clock * 0.22) * 0.18;
        camera.position.z = 9.2 + Math.cos(clock * 0.25) * 0.12;
        camera.lookAt(cameraFocus.x, 0, cameraFocus.z);
      }
      try {
        if (composer) composer.render();
        else renderer.render(scene, camera);
      } catch (error) {
        if (composer) {
          console.warn("Bloom render failed; switching to the direct Three.js renderer.", error);
          composer.dispose();
          composer = null;
          renderer.render(scene, camera);
        } else {
          fail(error);
          return;
        }
      }
      frame = window.requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("webglcontextlost", onContextLost);
      canvas.removeEventListener("webglcontextcreationerror", onContextCreationError);
      window.cancelAnimationFrame(frame);
      composer?.dispose();
      renderer.dispose();
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          (Array.isArray(object.material) ? object.material : [object.material]).forEach((material) => material.dispose());
        }
      });
      particles.dispose();
      parchmentTexture.dispose();
      labelTextures.forEach((texture) => texture.dispose());
    };
  }, [progress, focus, fracture, complete, renderingFailed]);

  if (renderingFailed) {
    return <div className="keep-world-fallback" aria-label={`${progress} of 6 rooms mapped`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="a3/box-2.jpg" alt="" width="3840" height="2160" />
      <span style={{ "--keep-progress": `${progress / 6}` } as CSSProperties} />
    </div>;
  }
  return <div className={`unmapped-keep-stack keep-focus-${focus ?? "atlas"}`}>
    <div className="keep-world-blueprint" aria-hidden="true">
      <div className="blueprint-route" />
      <span className="blueprint-zone zone-intake"><b>RECEIVING</b><small>08:07</small></span>
      <span className="blueprint-zone zone-queue"><b>SHARED QUEUE</b><small>OWNER —</small><i /><i /><i /><i /><i /></span>
      <span className="blueprint-zone zone-coordinator"><b>COORDINATOR</b><small>HANDOFF 01</small></span>
      <span className="blueprint-zone zone-ma"><b>MA REVIEW</b><small>HANDOFF 02</small></span>
      <span className="blueprint-zone zone-physician"><b>PHYSICIAN</b><small>RECORDS MISSING</small></span>
      <span className="blueprint-zone zone-scheduling"><b>SCHEDULING</b><small>HANDOFF 03</small></span>
      <span className="blueprint-patient"><b>PATIENT</b><small>2 CALLS · RECEIPT UNKNOWN</small></span>
    </div>
    <canvas ref={canvasRef} className="unmapped-keep-world" aria-label={`The Unmapped Keep: ${progress} of 6 rooms mapped`} />
  </div>;
}

function GembaLensMap({
  lensActive,
  discovered,
  currentId,
  complete = false,
  onDiscover,
}: {
  lensActive: boolean;
  discovered: string[];
  currentId?: string;
  complete?: boolean;
  onDiscover?: (id: string) => void;
}) {
  const [lensPosition, setLensPosition] = useState({ x: 50, y: 50 });
  const revealTerritory = lensActive || complete;
  const moveLens = (clientX: number, clientY: number, element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    setLensPosition({
      x: Math.max(5, Math.min(95, ((clientX - rect.left) / rect.width) * 100)),
      y: Math.max(8, Math.min(92, ((clientY - rect.top) / rect.height) * 100)),
    });
  };

  return <div
    className={`gemba-lens-board ${revealTerritory ? "is-lens-active" : ""} ${complete ? "is-complete" : ""}`}
    style={{ "--lens-x": `${lensPosition.x}%`, "--lens-y": `${lensPosition.y}%` } as CSSProperties}
    onPointerMove={(event) => {
      if (lensActive && event.pointerType !== "touch") moveLens(event.clientX, event.clientY, event.currentTarget);
    }}
  >
    <div className="official-atlas-layer" aria-label="Official process map: received, reviewed, scheduled">
      <div className="atlas-cartouche"><span>APPROVED PROCESS MAP</span><b>REFERRAL PATHWAY · REV 4.2</b><small>OWNER: CLINICAL OPERATIONS</small></div>
      <svg className="official-route-art" viewBox="0 0 1000 600" aria-hidden="true">
        <path d="M120 306 L500 306 L880 306" />
        <circle cx="120" cy="306" r="13" /><circle cx="500" cy="306" r="13" /><circle cx="880" cy="306" r="13" />
      </svg>
      <div className="official-node official-received"><i>01</i><b>RECEIVED</b><span>Owned queue</span><small>✓ STANDARD</small></div>
      <div className="official-node official-reviewed"><i>02</i><b>REVIEWED</b><span>One clinical review</span><small>✓ ON TIME</small></div>
      <div className="official-node official-scheduled"><i>03</i><b>SCHEDULED</b><span>Patient notified</span><small>✓ COMPLETE</small></div>
      <div className="atlas-assurance">NO DELAYS · NO RETURNS · CLEAR OWNERSHIP</div>
    </div>

    <div className="observed-territory-layer" aria-hidden={!revealTerritory}>
      <div className="territory-title"><span>GEMBA LENS · LIVE</span><b>THE PROCESS AS PRACTICED</b><small>ONE REFERRAL · FOLLOWED END TO END</small></div>
      <svg className="territory-route-art" viewBox="0 0 1000 600" aria-hidden="true">
        <path className="territory-main-route" d="M95 185 C165 185 155 390 265 390 S370 180 455 180 S555 380 630 380 S760 180 840 180 S860 420 910 440" />
        <path className="territory-rework-route" d="M650 380 C790 550 835 310 705 330 C620 342 574 446 650 498" />
        <path className="territory-wait-route" d="M190 390 C210 470 310 470 330 390" />
      </svg>
      <div className="territory-node territory-queue"><b>SHARED QUEUE</b><span>OWNER —</span><small>08:07</small><i /><i /><i /><i /><i /></div>
      <div className="territory-node territory-coordinator"><b>COORDINATOR</b><span>11:42 · 02m</span></div>
      <div className="territory-node territory-ma"><b>MA</b><span>HANDOFF 02</span></div>
      <div className="territory-node territory-physician"><b>PHYSICIAN</b><span>RECORDS MISSING</span></div>
      <div className="territory-node territory-scheduler"><b>SCHEDULER</b><span>HANDOFF 03</span></div>
      <div className="territory-patient"><i>◉</i><b>PATIENT</b><span>2 CALLS · “DID YOU GET IT?”</span></div>
      <div className="moving-referral" aria-hidden="true"><span>REF</span></div>
      {KEEP_LENS_FINDINGS.map((finding) => {
        const observation = KEEP_OBSERVATIONS.find(({ id }) => id === finding.id)!;
        const found = discovered.includes(finding.id);
        return <button
          type="button"
          className={`territory-hotspot ${found ? "is-found" : ""} ${currentId === finding.id ? "is-current" : ""}`}
          style={{ left: `${finding.x}%`, top: `${finding.y}%` }}
          disabled={!revealTerritory || complete}
          aria-label={`${found ? "Observed" : "Inspect"}: ${observation.name}`}
          key={finding.id}
          onFocus={() => setLensPosition({ x: finding.x, y: finding.y })}
          onClick={() => onDiscover?.(finding.id)}
        ><i>{observation.glyph}</i><span>{found ? "PINNED" : "INSPECT"}</span></button>;
      })}
    </div>

    {lensActive && !complete && <div className="gemba-lens-ring" aria-hidden="true"><i>ᛟ</i><span>OBSERVE</span></div>}
    <div className="map-territory-status"><i className={revealTerritory ? "territory" : "map"} /><span>{revealTerritory ? "TERRITORY" : "MAP"}</span><b>{revealTerritory ? "Observed work" : "Documented work"}</b></div>
  </div>;
}

export function QuestExperience() {
  const [stage, setStage] = useState<Stage>("cover");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [wrongChoice, setWrongChoice] = useState<number | null>(null);
  const [correct, setCorrect] = useState(false);
  const [sound, setSound] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [previewBox, setPreviewBox] = useState<number | null>(null);
  const [forgeIndex, setForgeIndex] = useState(0);
  const [forgedSeals, setForgedSeals] = useState<string[]>([]);
  const [attemptedFragments, setAttemptedFragments] = useState<string[]>([]);
  const [forgeFeedback, setForgeFeedback] = useState<{ kind: "correct" | "wrong"; text: string } | null>(null);
  const [hornRevealed, setHornRevealed] = useState(false);
  const [keepIndex, setKeepIndex] = useState(0);
  const [chartedObservations, setChartedObservations] = useState<string[]>([]);
  const [keepFeedback, setKeepFeedback] = useState<{ kind: "correct" | "wrong"; text: string } | null>(null);
  const [gembaLensActive, setGembaLensActive] = useState(false);
  const hornAudioRef = useRef<HTMLAudioElement>(null);
  const progress = stage === "complete" ? 5 : questionIndex + (correct ? 1 : 0);
  const question = QUESTIONS[questionIndex];
  const forgeSeal = FORGE_SEALS[forgeIndex];
  const sealForged = forgedSeals.includes(forgeSeal.id);
  const keepObservation = KEEP_OBSERVATIONS[keepIndex];
  const inForge = stage === "forge-intro" || stage === "forge-game" || stage === "forge-complete";
  const inKeep = stage === "keep-intro" || stage === "keep-game" || stage === "keep-complete";
  const activeChamber = inForge ? 0 : inKeep ? 1 : stage === "cover" ? null : 3;

  useEffect(() => {
    if (!inKeep) return;
    const frame = window.requestAnimationFrame(() => {
      const selector = stage === "keep-game"
        ? ".gemba-lens-board"
        : stage === "keep-complete"
          ? ".keep-complete-map"
          : ".keep-intro-world";
      const world = document.querySelector<HTMLElement>(selector);
      if (window.matchMedia("(max-width: 900px)").matches && world) {
        world.scrollIntoView({ block: "start", behavior: "auto" });
      } else {
        window.scrollTo({ top: 0, behavior: "auto" });
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, [inKeep, keepIndex, stage]);

  const resetForge = () => {
    setForgeIndex(0);
    setForgedSeals([]);
    setAttemptedFragments([]);
    setForgeFeedback(null);
    setHornRevealed(false);
    if (hornAudioRef.current) {
      hornAudioRef.current.pause();
      hornAudioRef.current.currentTime = 0;
      hornAudioRef.current.volume = 1;
    }
  };

  const resetKeep = () => {
    setKeepIndex(0);
    setChartedObservations([]);
    setKeepFeedback(null);
    setGembaLensActive(false);
  };

  const returnHome = () => {
    resetForge();
    resetKeep();
    setQuestionIndex(0);
    setWrongChoice(null);
    setCorrect(false);
    setPreviewBox(null);
    setMenuOpen(false);
    setStage("cover");
  };

  const enterBox = (boxNumber: number) => {
    if (boxNumber === 1) {
      resetForge();
      setPreviewBox(null);
      setStage("forge-intro");
      playTone("start", sound);
      return;
    }
    if (boxNumber === 2) {
      resetKeep();
      setPreviewBox(null);
      setStage("keep-intro");
      playTone("start", sound);
      return;
    }
    if (boxNumber === 4) {
      setPreviewBox(null);
      setStage("threshold");
      playTone("start", sound);
      return;
    }
    setPreviewBox(boxNumber);
    playTone("step", sound);
  };
  const discoverKeep = (observationId: string) => {
    const index = KEEP_OBSERVATIONS.findIndex(({ id }) => id === observationId);
    if (index < 0) return;
    const observation = KEEP_OBSERVATIONS[index];
    setKeepIndex(index);
    if (!chartedObservations.includes(observationId)) {
      setChartedObservations((values) => [...values, observationId]);
      playKeepSound(KEEP_SOUND_CUES[index], sound);
    } else {
      playTone("step", sound);
    }
    setKeepFeedback({ kind: "correct", text: observation.lesson });
  };
  const attemptForge = (fragmentId: string) => {
    if (sealForged || attemptedFragments.includes(fragmentId)) return;
    const fragment = forgeSeal.fragments.find(({ id }) => id === fragmentId);
    if (!fragment) return;
    if (fragmentId === forgeSeal.correctId) {
      setForgedSeals((values) => [...values, forgeSeal.id]);
      setForgeFeedback({ kind: "correct", text: forgeSeal.lesson });
      playTone("rune", sound);
      return;
    }
    setAttemptedFragments((values) => [...values, fragmentId]);
    setForgeFeedback({ kind: "wrong", text: fragment.rejection });
    playTone("wrong", sound);
  };
  const advanceForge = () => {
    if (!sealForged) return;
    if (forgeIndex === FORGE_SEALS.length - 1) {
      setHornRevealed(false);
      setStage("forge-complete");
      return;
    }
    setForgeIndex((value) => value + 1);
    setAttemptedFragments([]);
    setForgeFeedback(null);
    playTone("step", sound);
  };
  const revealHorn = () => {
    if (hornRevealed) return;
    setHornRevealed(true);
    if (!sound || !hornAudioRef.current) return;
    hornAudioRef.current.currentTime = 0;
    hornAudioRef.current.volume = 1;
    void hornAudioRef.current.play().catch((error: unknown) => {
      console.warn("The legendary-tool audio could not play in this browser.", error);
    });
  };
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
        <button className="brand-lockup" type="button" onClick={returnHome} aria-label="Return to title screen"><span>PERMANENTE MEDICINE</span><small>The Permanente Medical Group</small></button>
        <div className="header-title"><b>the</b> DSA WAY <small>The Hero&apos;s Journey</small></div>
        <div className="header-actions">
          <button className="sound-button" type="button" aria-pressed={sound} onClick={() => setSound((value) => !value)}><span aria-hidden="true">{sound ? "♫" : "×"}</span> SOUND {sound ? "ON" : "OFF"}</button>
          <button className="map-button" type="button" aria-expanded={menuOpen} onClick={() => setMenuOpen((value) => !value)}>QUEST MAP</button>
        </div>
      </header>
      <aside className={`quest-map ${menuOpen ? "is-open" : ""}`} aria-label="The Nine Chambers">
        <div className="map-heading"><span>THE NINE CHAMBERS</span><button onClick={() => setMenuOpen(false)} aria-label="Close quest map">×</button></div>
        <ol>{CHAMBERS.map((chamber, index) => {
          const active = index === activeChamber;
          const ready = index === 0 || index === 1 || index === 3;
          return <li className={active ? "active" : ready ? "ready" : "locked"} key={chamber}><span>{String(index + 1).padStart(2, "0")}</span><b>{chamber}</b><i>{active ? "ACTIVE" : ready ? "READY" : "LOCKED"}</i></li>;
        })}</ol>
        <p>{inForge ? "Box I — Reason for Action — The Herald's Forge." : inKeep ? "Box II — Current State — The Cartographer's Lie." : "Boxes I, II, and IV are ready. The other A3 chambers are still being forged."}</p>
      </aside>

      {stage === "cover" && <section className="a3-home">
        <div className="a3-home-heading">
          <div><div className="eyebrow"><span>09</span> A DSA LEARNING QUEST</div><h1>The DSA Way: <em>The Hero&apos;s Journey</em></h1></div>
          <p>Nine chambers shape the A3. Choose a box to reveal its path; Boxes 1, 2, and 4 are ready to play.</p>
        </div>
        <div className="a3-grid-viewport">
          <div className="a3-grid" aria-label="The nine boxes of the A3">
            {A3_BOXES.map((box) => <button
              className={`a3-tile a3-box-${box.number} ${box.number === 1 || box.number === 2 || box.number === 4 ? "is-playable" : ""} ${previewBox === box.number ? "is-previewed" : ""}`}
              type="button"
              key={box.number}
              onClick={() => enterBox(box.number)}
              aria-label={box.number === 1 ? "Box 1: Reason for Action. Enter The Herald's Forge" : box.number === 2 ? "Box 2: Current State. Enter The Cartographer's Lie" : box.number === 4 ? "Box 4: Gap Analysis. Enter The Door of Whys" : `Box ${box.number}: ${box.label}. Activity coming soon`}
            >
              {/* Public-path artwork stays compatible with both the app runtime and GitHub Pages. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`a3/box-${box.number}.jpg`} alt="" width="3840" height="2160" loading={box.number <= 4 ? "eager" : "lazy"} decoding="async" />
              <span className="a3-tile-overlay"><small>BOX {String(box.number).padStart(2, "0")}</small><b>{box.label}</b><em>{box.number === 1 ? "ENTER THE HERALD'S FORGE" : box.number === 2 ? "ENTER THE CARTOGRAPHER'S LIE" : box.number === 4 ? "ENTER THE DOOR OF WHYS" : "ACTIVITY COMING SOON"}</em></span>
              {(box.number === 1 || box.number === 2 || box.number === 4) && <span className="a3-playable-badge">PLAYABLE</span>}
            </button>)}
          </div>
        </div>
        <p className="a3-home-status" aria-live="polite">{previewBox
          ? `The ${A3_BOXES[previewBox - 1].label} activity has not been forged yet. Boxes 1, 2, and 4 are ready to play.`
          : null}</p>
      </section>}

      {stage === "keep-intro" && <section className="keep-intro-screen">
        <div className="keep-intro-copy">
          <div className="quest-kicker">THE NINE CHAMBERS · BOX II</div>
          <div className="chamber-tag">The map is not the territory</div>
          <h1>The Cartographer&apos;s<br /><em>Lie</em></h1>
          <div className="keep-prologue">
            <p>The approved map shows a flawless road: received, reviewed, scheduled. Three steps. Clear ownership. No waiting. No traveler lost.</p>
            <p>But a map drawn from policy can hide the kingdom it claims to describe.</p>
            <blockquote>&quot;Do not correct the map yet. First earn the right to see the territory.&quot;</blockquote>
            <p>Awaken the Gemba Lens. Move it across the official pathway and pin every place where practiced work breaks through the parchment.</p>
          </div>
          <div className="keep-observation-preview" aria-label="Six discrepancies hidden in the territory">{KEEP_OBSERVATIONS.map((observation, index) => <span key={observation.id}><i>{observation.glyph}</i><b>{String(index + 1).padStart(2, "0")}</b><em>{observation.name}</em></span>)}</div>
          <button className="primary-button" type="button" onClick={() => { setStage("keep-game"); playKeepSound("footsteps", sound); }}><span>Enter the map room</span><b>→</b></button>
        </div>
        <div className="keep-intro-world">
          <GembaLensMap lensActive={false} discovered={[]} />
          <div className="keep-atlas-label"><span>OFFICIAL ATLAS</span><b>THE PROCESS AS DOCUMENTED</b><small>Beautiful · orderly · unobserved</small></div>
          <div className="keep-lantern-seal" aria-hidden="true"><i /><b>ᛟ</b><span /></div>
        </div>
      </section>}

      {stage === "keep-game" && <section className="keep-lens-game">
        <div className="keep-lens-heading">
          <div><div className="quest-kicker">BOX II · THE CARTOGRAPHER&apos;S LIE</div><h1>The map is <em>not</em> the territory.</h1></div>
          <div className="keep-progress" role="img" aria-label={`${chartedObservations.length} of 6 discrepancies pinned`}>{KEEP_OBSERVATIONS.map((observation) => <span key={observation.id} className={`${chartedObservations.includes(observation.id) ? "lit" : ""} ${observation.id === keepObservation.id ? "current" : ""}`}>{observation.glyph}</span>)}</div>
        </div>
        <div className="keep-lens-layout">
          <div className="keep-lens-map-column">
            <div className="keep-lens-toolbar">
              <div><span>{gembaLensActive ? "LENS ACTIVE" : "OFFICIAL MAP"}</span><b>{gembaLensActive ? "Move across the territory. Inspect what the parchment concealed." : "The process appears orderly because only the policy is visible."}</b></div>
              <button
                type="button"
                className={gembaLensActive ? "is-active" : ""}
                aria-pressed={gembaLensActive}
                onClick={() => {
                  setGembaLensActive((value) => !value);
                  setKeepFeedback(null);
                  playKeepSound("lantern", sound);
                }}
              ><i aria-hidden="true">ᛟ</i><span>{gembaLensActive ? "LOWER GEMBA LENS" : "ACTIVATE GEMBA LENS"}</span></button>
            </div>
            <GembaLensMap
              lensActive={gembaLensActive}
              discovered={chartedObservations}
              currentId={keepObservation.id}
              onDiscover={discoverKeep}
            />
            <p className="keep-lens-instruction">{gembaLensActive ? "Move the lens. Select each glowing discrepancy to pin observed evidence." : "Activate the lens to compare documented work with practiced work."}</p>
          </div>
          <aside className="keep-lens-ledger" aria-live="polite">
            <div className="chamber-tag">FIELD NOTES · {String(chartedObservations.length).padStart(2, "0")} / 06</div>
            {keepFeedback ? <>
              <div className="lens-finding-glyph">{keepObservation.glyph}</div>
              <h2>{keepObservation.name}</h2>
              <div className="lens-comparison">
                <div><span>THE MAP SAID</span><p>{KEEP_LENS_FINDINGS[keepIndex].official}</p></div>
                <div><span>GEMBA SHOWED</span><p>{KEEP_LENS_FINDINGS[keepIndex].observed}</p></div>
              </div>
              <blockquote>Sensei asks: &quot;{keepObservation.coaching}&quot;</blockquote>
              <p className="lens-lesson">{keepFeedback.text}</p>
            </> : <>
              <div className="lens-idle-sigil" aria-hidden="true">ᛟ</div>
              <h2>{gembaLensActive ? "Find the first rupture." : "The parchment looks convincing."}</h2>
              <p className="lens-idle-copy">{gembaLensActive ? "Follow one referral, not the arrows on the slide. Look for ownerless work, waiting, transfers, reversals, and the traveler’s voice." : "It is tidy, approved, and internally consistent. That does not make it true."}</p>
            </>}
            <ol className="lens-evidence-list">{KEEP_OBSERVATIONS.map((observation, index) => {
              const found = chartedObservations.includes(observation.id);
              return <li className={found ? "is-pinned" : ""} key={observation.id}><i>{observation.glyph}</i><div><b>{observation.name}</b><span>{found ? KEEP_LENS_FINDINGS[index].observed : "Hidden in the territory"}</span></div></li>;
            })}</ol>
            {chartedObservations.length === KEEP_OBSERVATIONS.length && <button className="primary-button lens-complete-button" type="button" onClick={() => { setStage("keep-complete"); playTone("open", sound); }}><span>Reveal the honest map</span><b>→</b></button>}
          </aside>
        </div>
      </section>}

      {stage === "keep-complete" && <section className="keep-complete-screen">
        <div className="keep-complete-map">
          <GembaLensMap lensActive discovered={KEEP_OBSERVATIONS.map(({ id }) => id)} currentId="map" complete />
          <div className="keep-map-hud"><span>THE ACTUAL PATH</span><b>ALL CHAMBERS OBSERVED</b></div>
          <div className="keep-complete-sigils" aria-label="All six observations mapped">{KEEP_OBSERVATIONS.map((observation) => <span key={observation.id}>{observation.glyph}</span>)}</div>
        </div>
        <div className="keep-complete-story">
          <div className="quest-kicker">CURRENT CONDITION · REVEALED</div>
          <h1>Territory<br /><em>revealed.</em></h1>
          <p className="keep-completion-lead">The approved map showed a straight road. Your lens revealed six steps, three handoffs, two queues, one rework loop—and the traveler&apos;s own voice.</p>
          <div className="keep-truth-table">
            <span>THE OBSERVED JOURNEY</span>
            <ol>{KEEP_OBSERVATIONS.map((observation) => <li key={observation.id}><i>{observation.glyph}</i><div><b>{observation.name}</b><p>{observation.mapFact}</p></div></li>)}</ol>
          </div>
          <blockquote>&quot;The map is useful. The territory is true.&quot;</blockquote>
          <div className="keep-weapon-card">
            <div className="pixel-lantern" aria-hidden="true"><i /><b /><em /><span /></div>
            <span>LEGENDARY TOOL ACQUIRED</span>
            <h2><small>THE</small> LANTERN OF GEMBA</h2>
            <p>Its light cannot reveal what should happen, why it happens, or how to fix it. It illuminates only what is actually there.</p>
          </div>
          <div className="keep-complete-actions">
            <button className="primary-button" type="button" onClick={() => { resetKeep(); setStage("keep-intro"); playTone("start", sound); }}><span>Walk the Keep again</span><b>↻</b></button>
            <button className="map-return-button" type="button" onClick={returnHome}>Return to the nine chambers</button>
          </div>
        </div>
      </section>}

      {stage === "forge-intro" && <section className="forge-intro-screen">
        <div className="forge-intro-art">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="a3/box-1.jpg" alt="A handcrafted care roundtable surrounded by the evidence of a problem" width="3840" height="2160" />
          <div className="forge-vignette" aria-hidden="true" />
          <div className="forge-embers" aria-hidden="true">{Array.from({ length: 18 }, (_, index) => <i key={index} />)}</div>
          <div className="forge-art-caption"><span>BOX I</span><b>REASON FOR ACTION</b></div>
        </div>
        <div className="forge-intro-copy">
          <div className="quest-kicker">THE NINE CHAMBERS · BOX I</div>
          <div className="chamber-tag">The summons has failed</div>
          <h1>The Herald&apos;s<br /><em>Forge</em></h1>
          <div className="forge-prologue">
            <p>The proclamation reached every corner of the clinic:</p>
            <blockquote>&quot;Access is terrible. We need more clinics.&quot;</blockquote>
            <p>No one rallied. The patient heard a complaint. The physician heard blame. The steward heard an expensive solution searching for a problem.</p>
            <p>At the old forge wait four seals. Shape the evidence into a case for action that a stranger can understand—and a system can act upon.</p>
          </div>
          <div className="forge-seal-preview" aria-label="The four seals of Box 1">{FORGE_SEALS.map((seal, index) => <span key={seal.id}><i>{seal.glyph}</i><b>{String(index + 1).padStart(2, "0")}</b><em className="seal-name">{seal.name}</em></span>)}</div>
          <button className="primary-button" type="button" onClick={() => { setStage("forge-game"); playTone("step", sound); }}><span>Enter the forge</span><b>→</b></button>
        </div>
      </section>}

      {stage === "forge-game" && <section className="forge-game-screen">
        <div className="forge-workbench">
          <div className="forge-heading-row">
            <div><div className="quest-kicker">THE HERALD&apos;S FORGE</div><div className="chamber-tag">Seal {forgeIndex + 1} of {FORGE_SEALS.length}</div></div>
            <div className="forge-seal-meter" role="img" aria-label={`${forgedSeals.length} of ${FORGE_SEALS.length} seals forged`}>{FORGE_SEALS.map((seal, index) => <span key={seal.id} className={`${forgedSeals.includes(seal.id) ? "lit" : ""} ${index === forgeIndex ? "current" : ""}`}>{seal.glyph}</span>)}</div>
          </div>
          <h1><span>{forgeSeal.glyph}</span>{forgeSeal.name}</h1>
          <p className="forge-prompt">{forgeSeal.prompt}</p>
          <blockquote className="forge-coaching">Sensei asks: &quot;{forgeSeal.coaching}&quot;</blockquote>
          <div className="fragment-instruction"><span>DRAG</span> a fragment to the anvil—or tap it to strike.</div>
          <div className="fragment-rack" aria-label={`${forgeSeal.name} evidence fragments`}>
            {forgeSeal.fragments.map((fragment, index) => {
              const attempted = attemptedFragments.includes(fragment.id);
              const correctFragment = sealForged && fragment.id === forgeSeal.correctId;
              return <button
                type="button"
                draggable={!sealForged && !attempted}
                disabled={sealForged || attempted}
                className={`forge-fragment ${attempted ? "is-shattered" : ""} ${correctFragment ? "is-forged" : ""}`}
                key={fragment.id}
                data-fragment-id={fragment.id}
                onDragStart={(event) => event.dataTransfer.setData("text/plain", fragment.id)}
                onClick={() => attemptForge(fragment.id)}
              ><span>{String(index + 1).padStart(2, "0")}</span><b>{fragment.text}</b><i aria-hidden="true">◆</i></button>;
            })}
          </div>
        </div>
        <div className="forge-chamber">
          <div className="forge-heat" aria-hidden="true" />
          <div className="forge-sparks" aria-hidden="true">{Array.from({ length: 22 }, (_, index) => <i key={index} />)}</div>
          <div className="seal-orbit" aria-hidden="true">{FORGE_SEALS.map((seal, index) => <span key={seal.id} className={`${forgedSeals.includes(seal.id) ? "lit" : ""} ${index === forgeIndex ? "current" : ""}`} style={{ "--seal-angle": `${index * (360 / FORGE_SEALS.length)}deg` } as CSSProperties}><b>{seal.glyph}</b></span>)}</div>
          <div
            className={`forge-anvil ${sealForged ? "is-struck" : ""}`}
            role="region"
            aria-label="The evidence forge"
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => { event.preventDefault(); attemptForge(event.dataTransfer.getData("text/plain")); }}
          >
            <div className="anvil-mark" aria-hidden="true"><span /><b /><i /></div>
            <small>{sealForged ? "SEAL FORGED" : "EVIDENCE FORGE"}</small>
            <strong>{sealForged ? forgeSeal.name : "DROP FRAGMENT"}</strong>
          </div>
          <div className="forge-feedback-slot" aria-live="polite">
            {forgeFeedback && <div className={`forge-feedback ${forgeFeedback.kind}`}>
              <span>{forgeFeedback.kind === "correct" ? "THE SEAL HOLDS" : "THE METAL FRACTURES"}</span>
              <p>{forgeFeedback.text}</p>
              {forgeFeedback.kind === "correct" && <button type="button" onClick={advanceForge}>{forgeIndex === FORGE_SEALS.length - 1 ? "Sound the Herald's Horn" : "Strike the next seal"}<b>→</b></button>}
            </div>}
          </div>
        </div>
      </section>}

      {stage === "forge-complete" && <section className="forge-complete-screen">
        <div className="forge-complete-story">
          <div className="quest-kicker">THE STRANGER TEST · PASSED</div>
          <h1>The summons<br /><em>holds.</em></h1>
          <p className="forge-completion-lead">Four seals, one coherent case for action. The proclamation can now be repeated by someone who has never entered the clinic.</p>
          <div className="stranger-echo">
            <span>THE OUTSIDER ECHOES BACK</span>
            <dl>
              <div><dt>Where and whom?</dt><dd>Adult new-GI referrals at the East Bay clinic.</dd></div>
              <div><dt>How large?</dt><dd>Median 24 days; 42% wait beyond 30 days.</dd></div>
              <div><dt>Why now?</dt><dd>Three months above the threshold; complaints doubled.</dd></div>
              <div><dt>What counts as done?</dt><dd>14 days or less for eight weeks, with standard work and an owner.</dd></div>
            </dl>
          </div>
          <blockquote>&quot;A problem a stranger can repeat is ready to rally action.&quot;</blockquote>
          </div>
        <div className="forge-reward-column">
          <div className={`herald-horn-scene ${hornRevealed ? "is-revealed" : "is-sealed"}`}>
            {/* This six-second effect contains no speech or dialogue to caption. */}
            {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
            <audio ref={hornAudioRef} src="gjallarhorn-reveal.mp3" preload="auto" />
            {!hornRevealed && <button className="horn-reveal-button" type="button" onClick={revealHorn} aria-label="Awaken the secret legendary tool">
              <span aria-hidden="true">ᚷ</span><b>SEALED RELIC</b><small>AWAKEN</small>
            </button>}
            {hornRevealed && <>
              <div className="ornate-vault" aria-hidden="true"><i /><i /><i /><i /></div>
              <div className="bell-radiance" aria-hidden="true"><i /><i /><i /></div>
              <div className="realm-light" aria-hidden="true"><i /><i /><i /></div>
              <div className="golden-motes" aria-hidden="true">{Array.from({ length: 18 }, (_, index) => <i key={index} />)}</div>
              {/* The supplied transparent asset is preserved verbatim and staged with CSS lighting. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="gjallarhorn-art" src="heralds-horn.png" alt="An ornate gold-and-black legendary horn" width="1200" height="1361" />
              <div className="victory-seals" aria-label="All four Box 1 seals forged">{FORGE_SEALS.map((seal) => <span key={seal.id}>{seal.glyph}</span>)}</div>
            </>}
          </div>
          {hornRevealed ? <div className="forge-weapon-card">
            <span>LEGENDARY TOOL ACQUIRED</span>
            <h2><small>THE</small> HERALD&apos;S HORN</h2>
            <p>A case for action that is bounded, measurable, urgent, achievable—and human.</p>
            <p className="gjallarhorn-reference"><span>MYTHIC ECHO</span> A visual homage to <cite>Gjallarhorn</cite> from <cite>God of War Ragnarök</cite>.</p>
          </div> : <div className="sealed-reward-card"><span>LEGENDARY TOOL SEALED</span><b>???</b><p>The four seals have opened one final mystery.</p></div>}
          <div className="forged-charter">
            <span>THE FOUR-SEALED CHARTER</span>
            <ol>{FORGE_SEALS.map((seal) => <li key={seal.id}><b>{seal.name}</b><p>{seal.fragments.find(({ id }) => id === seal.correctId)?.text}</p></li>)}</ol>
          </div>
          <div className="forge-complete-actions">
            <button className="primary-button" type="button" onClick={() => { resetForge(); setStage("forge-intro"); playTone("start", sound); }}><span>Forge another summons</span><b>↻</b></button>
            <button className="map-return-button" type="button" onClick={returnHome}>Return to the nine chambers</button>
          </div>
        </div>
      </section>}

      {stage === "threshold" && <section className="threshold-screen">
        <div className="story-column"><div className="quest-kicker">THE NINE CHAMBERS · A CAREER-FAIR QUEST</div><div className="chamber-tag">Box IV · Gap Analysis</div><h1 className="chamber-title">The Door<br />of Whys</h1><div className="threshold-prose"><p>For the third week running, the morning medication cart reaches the ward late. Nurses scramble. Doses slip.</p><p>Tonight the old door sealed behind you, and words appeared in the wood:</p><blockquote>&quot;I open only for the root. I listen only to questions — but beware: some questions are solutions in disguise, and those bounce off me all the same.&quot;</blockquote><p>Somewhere above, a sensei&apos;s voice: <em>&quot;Most locks are five questions deep.&quot;</em></p></div><button className="primary-button" type="button" onClick={() => { setStage("questions"); playTone("step", sound); }}><span>Cross the threshold</span><b>→</b></button></div>
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
          <div className="completion-meta"><p>Rootfinder — the door barely resisted you</p><strong>This chamber is Box 4 of 9 — Gap Analysis.</strong><p>On an A3, masters of improvement spend most of the journey here, understanding the problem, before a single solution is drawn. Return to the map when you are ready to explore another chamber.</p><button className="primary-button" type="button" onClick={restart}><span>Enter again</span><b>↻</b></button></div>
        </div>
      </section>}
    </main>
  );
}

function RuneRail({ progress }: { progress: number }) {
  return <div className="rune-rail" role="img" aria-label={`${progress} of 5 runes lit`}>{["I", "II", "III", "IV", "V"].map((rune, index) => <span key={rune} className={index < progress ? "lit" : ""}>{rune}</span>)}</div>;
}

function roman(value: number) { return ["I", "II", "III", "IV", "V"][value - 1]; }

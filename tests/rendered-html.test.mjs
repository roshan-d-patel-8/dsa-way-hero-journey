import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the DSA Way quest", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  const html = await response.text();
  assert.match(html, /<title>The DSA Way: The Hero(?:&#x27;|')s Journey<\/title>/i);
  assert.match(html, /A DSA LEARNING QUEST/);
  assert.match(html, /The DSA Way:/);
  assert.match(html, /The Hero(?:&#x27;|')s Journey/);
  assert.match(html, /Reason for Action/);
  assert.match(html, /Current State/);
  assert.match(html, /Gap Analysis/);
  assert.match(html, /ENTER THE HERALD(?:&#x27;|')S FORGE/);
  assert.match(html, /ENTER THE CARTOGRAPHER(?:&#x27;|')S LIE/);
  assert.match(html, /ENTER THE NORTH STAR OBSERVATORY/);
  assert.match(html, /ENTER THE DOOR OF WHYS/);
  assert.match(html, /ENTER THE ARMORY OF MANY KEYS/);
  assert.match(html, /ENTER THE CLOCKWORK PDSA LABORATORY/);
  assert.match(html, /ENTER THE EXPEDITION LEDGER/);
  assert.match(html, /ENTER THE DRAGON(?:&#x27;|')S TRIBUNAL/);
  assert.match(html, /ENTER RETURN WITH THE ELIXIR/);
  assert.match(html, /All nine chambers are ready/);
  assert.equal((html.match(/PLAYABLE/g) ?? []).length, 9);
  assert.doesNotMatch(html, /Hover to reveal each chamber\. Select Box 4 to enter The Door of Whys\./);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton|Your site is taking shape/i);
});

test("all six new chambers contain four balanced, replayable learning trials", async () => {
  const [data, component, source, css] = await Promise.all([
    readFile(new URL("../app/remainingChambersData.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/RemainingChamberQuest.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/QuestExperience.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);
  for (const title of ["The North Star Observatory", "The Armory of Many Keys", "The Clockwork PDSA Laboratory", "The Expedition Ledger", "The Dragon's Tribunal", "Return with the Elixir"]) assert.match(data, new RegExp(title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  for (const label of ["Target State", "Solutions Approach", "Rapid Experiments", "Completion Plan", "Confirmed State", "Insights"]) assert.match(data, new RegExp(label));
  assert.equal((data.match(/correct:\s*[012],/g) ?? []).length, 24);
  const optionGroups = [...data.matchAll(/options:\s*\[\s*"([^"]+)",\s*"([^"]+)",\s*"([^"]+)",\s*\]/g)].map((match) => match.slice(1));
  assert.equal(optionGroups.length, 24);
  for (const [index, options] of optionGroups.entries()) {
    const wordCounts = options.map((option) => option.trim().split(/\s+/).length);
    assert.ok(Math.max(...wordCounts) - Math.min(...wordCounts) <= 8, `New chamber trial ${index + 1} reveals its answer by length`);
  }
  assert.match(source, /type Stage = [^;]+\| "remaining"/);
  assert.match(source, /isRemainingBoxNumber\(boxNumber\)/);
  assert.match(source, /<RemainingChamberQuest/);
  assert.match(component, /disabled=\{attempted \|\| \(correct && correctChoice\)\}/);
  assert.match(component, /Inspect another path, or continue when you are ready\./);
  assert.match(component, /playChamberSound/);
  assert.match(component, /AudioContext/);
  assert.match(component, /setAttemptedChoices\(\[\]\)/);
  assert.match(component, /setPhase\("intro"\)/);
  assert.match(component, /\[phase, trialIndex\]/);
  for (const box of [3, 5, 6, 7, 8, 9]) assert.match(css, new RegExp(`\\.rc-box-${box}`));
  assert.match(css, /@media \(max-width: 680px\)/);
});

test("includes the Herald's Forge and preserves the full Door of Whys experience", async () => {
  const [source, css, packageJson, layout, ogImage, hornImage, hornAudio] = await Promise.all([
    readFile(new URL("../app/QuestExperience.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    stat(new URL("../public/og.png", import.meta.url)),
    stat(new URL("../public/heralds-horn.png", import.meta.url)),
    stat(new URL("../public/gjallarhorn-reveal.mp3", import.meta.url)),
  ]);
  assert.match(source, /The medication cart leaves pharmacy late every morning\./);
  assert.match(source, /Who changed the paper — and did anyone check with pharmacy\?/);
  assert.match(source, /That question carried a solution in its sleeve\. Ask what is — not what to do\./);
  assert.match(source, /Inspect another path, or continue when you are ready\./);
  assert.match(source, /the rune remains lit/);
  assert.match(source, /curiosity with stamina/);
  assert.match(source, /ALL RUNES AWAKENED/);
  assert.match(source, /UnrealBloomPass/);
  assert.match(source, /runeStrokes/);
  assert.match(source, /import \* as THREE from "three"/);
  assert.match(source, /AudioContext/);
  assert.match(source, /Reason for Action/);
  assert.match(source, /Current State/);
  assert.match(source, /Target State/);
  assert.match(source, /Solutions Approach/);
  assert.match(source, /Rapid Experiments/);
  assert.match(source, /Completion Plan/);
  assert.match(source, /Confirmed State/);
  assert.match(source, /Insights/);
  assert.match(source, /boxNumber === 4/);
  assert.match(source, /boxNumber === 1/);
  assert.match(source, /boxNumber === 2/);
  assert.match(source, /setStage\("keep-intro"\)/);
  assert.match(source, /The Cartographer(?:&apos;|')s Lie/);
  assert.match(source, /LANTERN OF GEMBA/i);
  assert.match(source, /The map is not the territory/);
  assert.match(source, /ACTIVATE GEMBA LENS/);
  assert.match(source, /THE PROCESS AS PRACTICED/);
  assert.match(source, /THE MAP SAID/);
  assert.match(source, /GEMBA SHOWED/);
  assert.match(source, /Move the lens\. Inspect any rupture—or open the case file when the principle is clear/);
  assert.match(source, /GembaLensMap/);
  assert.match(source, /KEEP_LENS_FINDINGS/);
  assert.match(source, /KEEP_CASE_QUESTIONS/);
  assert.match(source, /SIMULATED CLINICAL CASE · SPECIALTY REFERRAL/);
  assert.match(source, /67-year-old patient with three weeks of worsening exertional shortness of breath/);
  const keepBriefBlock = source.slice(source.indexOf("const KEEP_CASE_BRIEF"), source.indexOf("const KEEP_LENS_FINDINGS"));
  assert.doesNotMatch(keepBriefBlock, /GASTROENTEROLOGY REFERRAL|GI REFERRAL|progressive dysphagia/i);
  const keepCaseData = source.slice(source.indexOf("const KEEP_OBSERVATIONS"), source.indexOf("const KEEP_LENS_FINDINGS"));
  assert.doesNotMatch(keepCaseData, /\bGI\b|gastroenterology|dysphagia/i);
  assert.match(source, /shadow this single referral end to end/);
  assert.match(source, /aria-label="Simulated clinical case briefing"/);
  const keepCaseBlock = source.slice(source.indexOf("const KEEP_CASE_QUESTIONS"), source.indexOf("const KEEP_LENS_FINDINGS"));
  const keepOptionGroups = [...keepCaseBlock.matchAll(/options:\s*\[\s*"([^"]+)",\s*"([^"]+)",\s*"([^"]+)",\s*\]/g)].map((match) => match.slice(1));
  assert.equal((keepCaseBlock.match(/correct:/g) ?? []).length, 4);
  assert.equal(keepOptionGroups.length, 4);
  for (const [index, options] of keepOptionGroups.entries()) {
    const wordCounts = options.map((option) => option.trim().split(/\s+/).length);
    assert.ok(Math.max(...wordCounts) - Math.min(...wordCounts) <= 8, `Box 2 clue ${index + 1} reveals its answer by length`);
  }
  assert.match(source, /The Vanishing Owner/);
  assert.match(source, /The Relay Route/);
  assert.match(source, /The Returning File/);
  assert.match(source, /The Evidence Warrant/);
  assert.match(source, /data-keep-choice=/);
  assert.match(source, /disabled=\{attempted \|\| correctChoice\}/);
  assert.match(source, /keepCaseCorrect && <button type="button" onClick=\{advanceKeepCase\}>/);
  assert.match(source, /Issue the evidence warrant/);
  assert.match(source, /2–3 minute field window/);
  assert.match(source, /What did you see enter the process—and at what exact time\?/);
  assert.match(source, /3 hours 35 minutes waiting/);
  assert.match(source, /coordinator to MA to physician to scheduler/);
  assert.match(source, /missing outside records send the referral back/);
  assert.match(source, /I called twice and still didn’t know whether you had received the referral/);
  assert.match(source, /6 process steps, 3 handoffs, 2 queues, 1 rework loop, at least 51 hours 35 minutes waiting/);
  assert.match(source, /KEEP_SOUND_CUES/);
  assert.match(source, /playKeepSound/);
  assert.match(source, /"footsteps" \| "stopwatch" \| "handoff" \| "rework" \| "voices" \| "parchment" \| "lantern"/);
  assert.match(source, /GEMBA LENS · LIVE/);
  assert.match(source, /APPROVED PROCESS MAP/);
  assert.match(source, /SHARED QUEUE/);
  assert.match(source, /RECORDS MISSING/);
  assert.match(source, /discoverKeep/);
  assert.match(source, /gembaLensActive/);
  assert.match(source, /scrollIntoView\(\{ block: "start", behavior: "auto" \}\)/);
  assert.match(source, /window\.matchMedia\("\(max-width: 900px\)"\)/);
  assert.match(source, /\}, \[inKeep, keepCaseIndex, stage\]\);/);
  assert.doesNotMatch(source, /\[inKeep, keepCaseIndex, keepIndex, stage\]/);
  assert.match(source, /Open the case file/);
  assert.match(source, /setStage\("keep-lens"\)/);
  assert.match(source, /setStage\("forge-intro"\)/);
  assert.match(source, /The Herald(?:&apos;|')s Forge/);
  assert.match(source, /className="seal-name"/);
  const forgeBlock = source.slice(source.indexOf("const FORGE_SEALS"), source.indexOf("const KEEP_OBSERVATIONS"));
  const forgeFragments = [...forgeBlock.matchAll(/\{ id: "[^"]+", text: "([^"]+)", rejection:/g)].map((match) => match[1]);
  assert.equal((forgeBlock.match(/correctId:/g) ?? []).length, 4);
  assert.equal(forgeFragments.length, 12);
  for (let index = 0; index < forgeFragments.length; index += 3) {
    const wordCounts = forgeFragments.slice(index, index + 3).map((fragment) => fragment.trim().split(/\s+/).length);
    assert.ok(Math.max(...wordCounts) - Math.min(...wordCounts) <= 7, `Forge seal ${index / 3 + 1} reveals its answer by length`);
  }
  assert.match(source, /Background/);
  assert.match(source, /Problem Statement/);
  assert.match(source, /Aim/);
  assert.match(source, /Trigger · Scope · Done/);
  assert.match(source, /The four seals of Box 1/);
  assert.match(source, /THE FOUR-SEALED CHARTER/);
  assert.doesNotMatch(forgeBlock, /id: "trigger"|id: "scope"|id: "done"/);
  assert.match(source, /index \* \(360 \/ FORGE_SEALS\.length\)/);
  assert.doesNotMatch(source, /index \* 60/);
  assert.match(source, /THE STRANGER TEST/);
  assert.match(source, /HERALD(?:&apos;|')S HORN/);
  assert.match(source, /heralds-horn\.png/);
  assert.match(source, /gjallarhorn-reveal\.mp3/);
  assert.match(source, /hornRevealed/);
  assert.match(source, /revealHorn/);
  assert.match(source, /const returnHome = \(\) =>/);
  assert.match(source, /hornAudioRef\.current\.pause\(\)/);
  assert.match(source, /hornAudioRef\.current\.currentTime = 0/);
  assert.match(source, /onClick=\{returnHome\}/);
  assert.match(source, /Awaken the secret legendary tool/);
  assert.match(source, /Gjallarhorn/);
  assert.match(source, /God of War Ragnarök/);
  assert.match(source, /draggable=/);
  assert.match(source, /onDrop=/);
  assert.match(source, /data-fragment-id=/);
  assert.match(source, /disabled=\{attempted \|\| correctFragment\}/);
  assert.match(source, /sealForged && <button type="button" onClick=\{advanceForge\}>/);
  assert.match(source, /the remaining fragments to learn why they fail—or continue when ready/);
  assert.doesNotMatch(source, /disabled=\{sealForged \|\| attempted\}/);
  assert.match(source, /setStage\("threshold"\)/);
  assert.match(source, /a3\/box-\$\{box\.number\}\.jpg/);
  assert.doesNotMatch(source, /Hover to reveal each chamber\. Select Box 4 to enter The Door of Whys\./);
  assert.match(packageJson, /"three":/);
  assert.match(packageJson, /"@fontsource\/press-start-2p":/);
  assert.match(css, /"Press Start 2P"/);
  assert.match(css, /ACHIEVEMENT UNLOCKED/);
  assert.match(css, /legendaryUnlock/);
  assert.match(css, /--paper: #050d14/);
  assert.match(css, /\.a3-box-1 \{ grid-column: 1; grid-row: 1; \}/);
  assert.match(css, /\.a3-box-4 \{ grid-column: 2; grid-row: 1; \}/);
  assert.match(css, /\.a3-box-7 \{ grid-column: 3; grid-row: 1; \}/);
  assert.match(css, /\.a3-grid \{[^}]*gap: 0;/);
  assert.match(css, /\.a3-tile \{[^}]*border: 0;/);
  assert.match(css, /\.a3-tile::before \{[^}]*box-shadow: inset 0 0 0 2px #000;/);
  assert.match(css, /radial-gradient\(circle at 100% 100%,transparent 0 17px,#000 17\.5px\)/);
  assert.match(css, /\.a3-tile-overlay small \{[^}]*color: #ffc45e;/);
  assert.match(css, /\.a3-tile-overlay small \{[^}]*"Press Start 2P"/);
  assert.match(css, /\.a3-tile-overlay small \{[^}]*clamp\(1\.08rem,1\.75vw,2rem\)/);
  assert.match(css, /:has\(\.a3-tile:is\(:hover,:focus-visible\)\)/);
  assert.match(css, /brightness\(\.27\)/);
  assert.match(css, /\.forge-intro-screen/);
  assert.match(css, /\.forge-seal-preview \{[^}]*grid-template-columns:repeat\(2,minmax\(0,1fr\)\)[^}]*grid-template-rows:repeat\(2,minmax\(84px,auto\)\)/);
  assert.match(css, /\.forge-seal-preview > span \{[^}]*clamp\(\.86rem,\.95vw,\.96rem\)/);
  assert.match(css, /\.forge-seal-preview i \{[^}]*font-size:\s*1\.6rem/);
  assert.match(css, /\.forge-seal-preview \.seal-name \{[^}]*min-height:2\.5em/);
  assert.match(css, /\.forge-seal-preview \.seal-name \{[^}]*overflow-wrap:normal;word-break:normal;hyphens:none/);
  assert.doesNotMatch(css, /\.forge-seal-preview \.seal-name \{[^}]*overflow-wrap:anywhere/);
  assert.match(css, /\.forge-game-screen/);
  assert.match(css, /\.forge-complete-screen/);
  assert.match(css, /\.keep-intro-screen/);
  assert.match(css, /\.gemba-lens-board/);
  assert.match(css, /\.official-atlas-layer/);
  assert.match(css, /\.observed-territory-layer/);
  assert.match(css, /\.gemba-lens-ring/);
  assert.match(css, /\.territory-hotspot/);
  assert.match(css, /\.keep-lens-game/);
  assert.match(css, /@keyframes referralTraverse/);
  assert.match(css, /@keyframes hotspotPulse/);
  assert.match(css, /\.keep-game-screen/);
  assert.match(css, /\.keep-complete-screen/);
  assert.match(css, /\.keep-complete-story h1 \{[^}]*max-width:100%[^}]*clamp\(2\.75rem,4\.5vw,5\.15rem\)/);
  assert.match(css, /\.keep-complete-story h1\{font-size:clamp\(2\.35rem,10vw,3\.6rem\)\}/);
  assert.match(css, /\.unmapped-keep-world/);
  assert.match(css, /\.unmapped-keep-stack/);
  assert.match(css, /\.keep-world-blueprint/);
  assert.match(css, /\.blueprint-patient/);
  assert.match(css, /\.keep-map-panel\.is-fractured/);
  assert.match(css, /\.keep-gemba-cue/);
  assert.match(css, /@keyframes mapFracture/);
  assert.match(css, /@keyframes lanternFloat/);
  assert.match(css, /@keyframes fieldNoteIn/);
  assert.match(css, /@keyframes emberRise/);
  assert.match(css, /@keyframes anvilStrike/);
  assert.match(css, /\.bell-radiance/);
  assert.match(css, /\.realm-light/);
  assert.match(css, /\.ornate-vault/);
  assert.match(css, /\.horn-reveal-button/);
  assert.match(css, /\.herald-horn-scene\.is-sealed/);
  assert.match(css, /@keyframes hornMaterialize/);
  assert.match(css, /@keyframes sealedOrbit/);
  assert.match(css, /@keyframes radianceWave/);
  assert.match(css, /@keyframes realmFlicker/);
  assert.doesNotMatch(source, /hero-footer/);
  assert.doesNotMatch(source, /cover-manifesto/);
  assert.match(layout, /openGraph:/);
  assert.match(layout, /twitter:/);
  assert.ok(ogImage.size > 100_000);
  assert.ok(hornImage.size > 1_000_000);
  assert.ok(hornAudio.size > 100_000);
  for (const color of ["#0069a7", "#30b5e6", "#8cc23d", "#f08f24", "#e7562f", "#981f59"]) {
    assert.match(css.toLowerCase(), new RegExp(color));
  }
});

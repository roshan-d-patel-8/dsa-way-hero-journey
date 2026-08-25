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
  assert.match(html, /ENTER THE UNMAPPED KEEP/);
  assert.match(html, /ENTER THE DOOR OF WHYS/);
  assert.doesNotMatch(html, /Hover to reveal each chamber\. Select Box 4 to enter The Door of Whys\./);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton|Your site is taking shape/i);
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
  assert.match(source, /The Unmapped Keep/);
  assert.match(source, /Lantern of Gemba/);
  assert.match(source, /The official map is immaculate—and wrong/);
  assert.match(source, /Assumptions build false corridors/);
  assert.match(source, /What did you see enter the process—and at what exact time\?/);
  assert.match(source, /3 hours 35 minutes waiting/);
  assert.match(source, /coordinator to MA to physician to scheduler/);
  assert.match(source, /missing outside records send the referral back/);
  assert.match(source, /I called twice and still didn’t know whether you had received the referral/);
  assert.match(source, /6 process steps, 3 handoffs, 2 queues, 1 rework loop, at least 51 hours 35 minutes waiting/);
  assert.match(source, /UnmappedKeepWorld/);
  assert.match(source, /KEEP_SOUND_CUES/);
  assert.match(source, /playKeepSound/);
  assert.match(source, /"footsteps" \| "stopwatch" \| "handoff" \| "rework" \| "voices" \| "parchment" \| "lantern"/);
  assert.match(source, /makePawn/);
  assert.match(source, /queuePawns/);
  assert.match(source, /patientPawn/);
  assert.match(source, /handoffCurve/);
  assert.match(source, /reworkCurve/);
  assert.match(source, /listeningHorn/);
  assert.match(source, /parchmentCanvas/);
  assert.match(source, /lanternVolume/);
  assert.match(source, /materializing/);
  assert.match(source, /OBSERVE AT GEMBA/);
  assert.match(source, /keepFeedback\?\.kind === "wrong"/);
  assert.match(source, /Inspect another corridor, or continue when you are ready\./);
  assert.match(source, /setStage\("forge-intro"\)/);
  assert.match(source, /The Herald(?:&apos;|')s Forge/);
  assert.match(source, /className="seal-name"/);
  assert.match(source, /Background/);
  assert.match(source, /Problem Statement/);
  assert.match(source, /Aim/);
  assert.match(source, /Trigger/);
  assert.match(source, /Scope/);
  assert.match(source, /Done/);
  assert.match(source, /THE STRANGER TEST/);
  assert.match(source, /HERALD(?:&apos;|')S HORN/);
  assert.match(source, /heralds-horn\.png/);
  assert.match(source, /gjallarhorn-reveal\.mp3/);
  assert.match(source, /hornRevealed/);
  assert.match(source, /revealHorn/);
  assert.match(source, /Awaken the secret legendary tool/);
  assert.match(source, /Gjallarhorn/);
  assert.match(source, /God of War Ragnarök/);
  assert.match(source, /draggable=/);
  assert.match(source, /onDrop=/);
  assert.match(source, /data-fragment-id=/);
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
  assert.match(css, /\.forge-seal-preview > span \{[^}]*clamp\(\.86rem,\.95vw,\.96rem\)/);
  assert.match(css, /\.forge-seal-preview i \{[^}]*font-size:\s*1\.6rem/);
  assert.match(css, /\.forge-seal-preview \.seal-name \{[^}]*min-height:2\.5em/);
  assert.match(css, /\.forge-seal-preview \.seal-name \{[^}]*overflow-wrap:normal;word-break:normal;hyphens:none/);
  assert.doesNotMatch(css, /\.forge-seal-preview \.seal-name \{[^}]*overflow-wrap:anywhere/);
  assert.match(css, /\.forge-game-screen/);
  assert.match(css, /\.forge-complete-screen/);
  assert.match(css, /\.keep-intro-screen/);
  assert.match(css, /\.keep-game-screen/);
  assert.match(css, /\.keep-complete-screen/);
  assert.match(css, /\.unmapped-keep-world/);
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

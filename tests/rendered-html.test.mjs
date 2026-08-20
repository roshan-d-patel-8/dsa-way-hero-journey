import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
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
  assert.match(html, /<title>The DSA Way: A Hero(?:&#x27;|')s Journey<\/title>/i);
  assert.match(html, /A DSA GI LEARNING QUEST/);
  assert.match(html, /Begin the journey/);
  assert.match(html, /Nine chambers\. One way forward\./);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton|Your site is taking shape/i);
});

test("preserves the full Door of Whys experience and requested capabilities", async () => {
  const [source, css, packageJson] = await Promise.all([
    readFile(new URL("../app/QuestExperience.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);
  assert.match(source, /The medication cart leaves pharmacy late every morning\./);
  assert.match(source, /Who changed the paper — and did anyone check with pharmacy\?/);
  assert.match(source, /That question carried a solution in its sleeve\. Ask what is — not what to do\./);
  assert.match(source, /The true weapon is a question, asked five times\./);
  assert.match(source, /import \* as THREE from "three"/);
  assert.match(source, /AudioContext/);
  assert.match(packageJson, /"three":/);
  for (const color of ["#0069a7", "#30b5e6", "#8cc23d", "#f08f24", "#e7562f", "#981f59"]) {
    assert.match(css.toLowerCase(), new RegExp(color));
  }
});

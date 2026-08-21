import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

test("GitHub Pages includes a visible startup shell and deployable assets", async () => {
  const html = await readFile(new URL("../dist-pages/index.html", import.meta.url), "utf8");

  assert.match(html, /Awakening the five runes and preparing your journey/);
  assert.match(html, /class="boot-screen"/);
  assert.match(html, /The DSA Way: A Hero's Journey/);

  const scriptPath = html.match(/src="(\/dsa-way-hero-journey\/assets\/[^"]+\.js)"/)?.[1];
  const stylePath = html.match(/href="(\/dsa-way-hero-journey\/assets\/[^"]+\.css)"/)?.[1];
  assert.ok(scriptPath, "expected a versioned JavaScript bundle");
  assert.ok(stylePath, "expected a versioned stylesheet");

  await access(new URL(`../dist-pages${scriptPath.replace("/dsa-way-hero-journey", "")}`, import.meta.url));
  await access(new URL(`../dist-pages${stylePath.replace("/dsa-way-hero-journey", "")}`, import.meta.url));
});

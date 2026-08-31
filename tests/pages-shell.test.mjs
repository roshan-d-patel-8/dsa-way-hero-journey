import assert from "node:assert/strict";
import { access, readFile, readdir, stat } from "node:fs/promises";
import test from "node:test";

test("GitHub Pages includes a visible startup shell and deployable assets", async () => {
  const html = await readFile(new URL("../dist-pages/index.html", import.meta.url), "utf8");

  assert.match(html, /Loading the cinematic gateway/);
  assert.match(html, /THE TEXT QUEST WILL OPEN FIRST/);
  assert.match(html, /class="boot-screen"/);
  assert.match(html, /The DSA Way: The Hero's Journey/);

  const scriptPath = html.match(/src="(\/dsa-way-hero-journey\/assets\/[^"]+\.js)"/)?.[1];
  const stylePath = html.match(/href="(\/dsa-way-hero-journey\/assets\/[^"]+\.css)"/)?.[1];
  assert.ok(scriptPath, "expected a versioned JavaScript bundle");
  assert.ok(stylePath, "expected a versioned stylesheet");

  await access(new URL(`../dist-pages${scriptPath.replace("/dsa-way-hero-journey", "")}`, import.meta.url));
  await access(new URL(`../dist-pages${stylePath.replace("/dsa-way-hero-journey", "")}`, import.meta.url));

  const entryPath = new URL(`../dist-pages${scriptPath.replace("/dsa-way-hero-journey", "")}`, import.meta.url);
  const entryStats = await stat(entryPath);
  assert.ok(entryStats.size < 300_000, "startup bundle should not contain the Three.js world");

  const assets = await readdir(new URL("../dist-pages/assets/", import.meta.url));
  assert.ok(assets.filter((file) => file.endsWith(".js")).length >= 2, "cinematic world should be code-split");

  const a3Images = (await readdir(new URL("../dist-pages/a3/", import.meta.url))).filter((file) => file.endsWith(".jpg"));
  assert.deepEqual(a3Images.sort(), Array.from({ length: 9 }, (_, index) => `box-${index + 1}.jpg`));
  for (const image of a3Images) {
    const imageStats = await stat(new URL(`../dist-pages/a3/${image}`, import.meta.url));
    assert.ok(imageStats.size > 500_000, `${image} should retain detailed 4K source imagery`);
  }

  const hornImage = await stat(new URL("../dist-pages/heralds-horn.png", import.meta.url));
  assert.ok(hornImage.size > 1_000_000, "the supplied ornate horn artwork should ship intact");
  const senseiImages = (await readdir(new URL("../dist-pages/sensei/", import.meta.url))).filter((file) => file.endsWith(".png"));
  assert.deepEqual(senseiImages.sort(), Array.from({ length: 9 }, (_, index) => `sensei-box-${index + 1}.png`));
  for (const image of senseiImages) {
    const imageStats = await stat(new URL(`../dist-pages/sensei/${image}`, import.meta.url));
    assert.ok(imageStats.size > 100_000, `${image} should retain detailed pixel artwork`);
  }
  const relicImages = (await readdir(new URL("../dist-pages/relics/", import.meta.url))).filter((file) => file.endsWith(".webp"));
  assert.deepEqual(relicImages.sort(), [
    "clockwork-learning-orb.webp",
    "commanders-war-map.webp",
    "elixir-of-hansei.webp",
    "five-whys.webp",
    "lantern-of-gemba.webp",
    "north-star-compass.webp",
    "quiver-of-countermeasures.webp",
    "truthful-mirror.webp",
  ]);
  for (const image of relicImages) {
    const imageStats = await stat(new URL(`../dist-pages/relics/${image}`, import.meta.url));
    assert.ok(imageStats.size > 100_000, `${image} should retain high-detail relic artwork`);
  }
  const hornAudio = await stat(new URL("../dist-pages/gjallarhorn-reveal.mp3", import.meta.url));
  assert.ok(hornAudio.size > 100_000, "the faded Gjallarhorn reveal clip should ship intact");
});

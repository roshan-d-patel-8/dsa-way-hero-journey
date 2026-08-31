"use client";

import type { CSSProperties } from "react";

type RelicArt = {
  image: string;
  alt: string;
  symbol: string;
};

export const RELIC_ART = {
  2: {
    image: "relics/lantern-of-gemba.webp",
    alt: "The Lantern of Gemba, an ornate black-and-gold legendary lantern with turquoise jewels",
    symbol: "◈",
  },
  3: {
    image: "relics/north-star-compass.webp",
    alt: "The North Star Compass, an ornate black-and-gold legendary compass with a midnight-blue face",
    symbol: "✦",
  },
  4: {
    image: "relics/five-whys.webp",
    alt: "The Five Whys, an ornate black-and-gold rootfinder blade set with five turquoise stones",
    symbol: "Ⅴ",
  },
  5: {
    image: "relics/quiver-of-countermeasures.webp",
    alt: "The Quiver of Countermeasures, an ornate black-and-gold legendary quiver filled with distinct arrows",
    symbol: "⚿",
  },
  6: {
    image: "relics/clockwork-learning-orb.webp",
    alt: "The Clockwork Learning Orb, an ornate gold armillary mechanism surrounding a luminous blue glass sphere",
    symbol: "↻",
  },
  7: {
    image: "relics/commanders-war-map.webp",
    alt: "The Commander's War Map, an ornate black-wood and gold campaign map with jeweled routes",
    symbol: "⚑",
  },
  8: {
    image: "relics/truthful-mirror.webp",
    alt: "The Threefold Mirror, an ornate black-and-gold legendary mirror with amethyst and turquoise jewels",
    symbol: "⚖",
  },
  9: {
    image: "relics/elixir-of-hansei.webp",
    alt: "The Elixir of Hansei, an ornate gold-caged decanter filled with luminous violet elixir",
    symbol: "◉",
  },
} as const satisfies Record<2 | 3 | 4 | 5 | 6 | 7 | 8 | 9, RelicArt>;

function playRelicRevealSound(enabled: boolean, boxNumber: keyof typeof RELIC_ART) {
  if (!enabled) return;
  const AudioContextClass = window.AudioContext ?? (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextClass) return;
  const context = new AudioContextClass();
  const now = context.currentTime;
  const root = 92 + boxNumber * 7;
  [root, root * 1.5, root * 2, root * 2.5].forEach((frequency, index) => {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = index === 0 ? "triangle" : "sine";
    oscillator.frequency.setValueAtTime(frequency, now + index * .11);
    gain.gain.setValueAtTime(0, now + index * .11);
    gain.gain.linearRampToValueAtTime(index === 0 ? .06 : .04, now + index * .11 + .04);
    gain.gain.exponentialRampToValueAtTime(.0001, now + index * .11 + .85);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start(now + index * .11);
    oscillator.stop(now + index * .11 + .9);
  });
  window.setTimeout(() => void context.close(), 1600);
}

export function RelicReveal({
  boxNumber,
  relicName,
  revealed,
  sound,
  accent,
  glow,
  onReveal,
}: {
  boxNumber: keyof typeof RELIC_ART;
  relicName: string;
  revealed: boolean;
  sound: boolean;
  accent: string;
  glow: string;
  onReveal: () => void;
}) {
  const art = RELIC_ART[boxNumber];
  const reveal = () => {
    if (revealed) return;
    onReveal();
    playRelicRevealSound(sound, boxNumber);
  };

  return <div
    className={`herald-horn-scene relic-reveal-stage ${revealed ? "is-revealed" : "is-sealed"}`}
    style={{ "--relic-accent": accent, "--relic-glow": glow } as CSSProperties}
    role="group"
    aria-label={revealed ? `${relicName} awakened` : `Sealed Box ${boxNumber} relic`}
  >
    {!revealed && <button className="horn-reveal-button relic-reveal-button" type="button" onClick={reveal} aria-label={`Awaken the sealed Box ${boxNumber} relic`}>
      <span aria-hidden="true">{art.symbol}</span><b>SEALED RELIC</b><small>AWAKEN</small>
    </button>}
    {revealed && <>
      <div className="ornate-vault relic-vault" aria-hidden="true"><i /><i /><i /><i /></div>
      <div className="relic-radiance" aria-hidden="true"><i /><i /><i /></div>
      <div className="golden-motes relic-motes" aria-hidden="true">{Array.from({ length: 18 }, (_, index) => <i key={index} />)}</div>
      {/* The white-background master is staged inside a feathered luminous portal. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className={`relic-art relic-art-${boxNumber}`} src={art.image} alt={art.alt} width="1672" height="941" />
    </>}
  </div>;
}

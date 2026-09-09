"use client";

import { useRef, type CSSProperties } from "react";

type RelicArt = {
  image: string;
  audio: string;
  alt: string;
  symbol: string;
};

export const RELIC_ART = {
  2: {
    image: "relics/lantern-of-gemba.webp",
    audio: "relic-audio/box-2-lantern-zelda-secret-discovered.mp3",
    alt: "The Lantern of Gemba, an ornate black-and-gold legendary lantern with turquoise jewels",
    symbol: "◈",
  },
  3: {
    image: "relics/north-star-compass.webp",
    audio: "relic-audio/box-3-compass-zelda-legendary-item.mp3",
    alt: "The North Star Compass, an ornate black-and-gold legendary compass with a midnight-blue face",
    symbol: "✦",
  },
  4: {
    image: "relics/five-whys.webp",
    audio: "relic-audio/box-4-five-whys-final-fantasy-fanfare.mp3",
    alt: "The Five Whys, an ornate black-and-gold rootfinder blade set with five turquoise stones",
    symbol: "Ⅴ",
  },
  5: {
    image: "relics/quiver-of-countermeasures.webp",
    audio: "relic-audio/box-5-quiver-cod-level-up.mp3",
    alt: "The Quiver of Countermeasures, an ornate black-and-gold legendary quiver filled with distinct arrows",
    symbol: "⚿",
  },
  6: {
    image: "relics/clockwork-learning-orb.webp",
    audio: "relic-audio/box-6-learning-orb-pokemon-gym-badge.mp3",
    alt: "The PDSA Orb, an ornate gold armillary mechanism surrounding a luminous blue glass sphere",
    symbol: "↻",
  },
  7: {
    image: "relics/commanders-war-map.webp",
    audio: "relic-audio/box-7-war-map-smash-character-unlocked.mp3",
    alt: "The Commander's War Map, an ornate black-wood and gold campaign map with jeweled routes",
    symbol: "⚑",
  },
  8: {
    image: "relics/truthful-mirror.webp",
    audio: "relic-audio/box-8-truthful-mirror-fortnite-victory.mp3",
    alt: "The Threefold Mirror, an ornate black-and-gold legendary mirror with amethyst and turquoise jewels",
    symbol: "⚖",
  },
  9: {
    image: "relics/elixir-of-hansei.webp",
    audio: "relic-audio/box-9-elixir-super-mario-trap-remix.mp3",
    alt: "The Elixir of Hansei, an ornate gold-caged decanter filled with luminous violet elixir",
    symbol: "◉",
  },
} as const satisfies Record<2 | 3 | 4 | 5 | 6 | 7 | 8 | 9, RelicArt>;

function playRelicRevealSound(enabled: boolean, audio: HTMLAudioElement | null) {
  if (!enabled || !audio) return;
  audio.currentTime = 0;
  audio.volume = 1;
  void audio.play().catch((error: unknown) => {
    console.warn("The relic-reveal audio could not play in this browser.", error);
  });
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
  const audioRef = useRef<HTMLAudioElement>(null);
  const reveal = () => {
    if (revealed) return;
    onReveal();
    playRelicRevealSound(sound, audioRef.current);
  };

  return <div
    className={`herald-horn-scene relic-reveal-stage ${revealed ? "is-revealed" : "is-sealed"}`}
    style={{ "--relic-accent": accent, "--relic-glow": glow } as CSSProperties}
    role="group"
    aria-label={revealed ? `${relicName} awakened` : `Sealed Box ${boxNumber} relic`}
  >
    {/* These short musical effects contain no speech or dialogue to caption. */}
    {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
    <audio ref={audioRef} src={art.audio} preload="auto" />
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

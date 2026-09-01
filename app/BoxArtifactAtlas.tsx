"use client";

import { useState, type CSSProperties } from "react";
import { BOOTH_ATLAS, type BoothAnnotation, type BoothBoxNumber } from "./boothAtlasData";

type BoxArtifactAtlasProps = {
  boxNumber: BoothBoxNumber;
  onBack: () => void;
  onChooseBox: (boxNumber: BoothBoxNumber) => void;
  onEnterQuest: (boxNumber: number) => void;
};

function Hotspot({ annotation, index, active, hovered, onActivate, onHover, onLeave }: {
  annotation: BoothAnnotation;
  index: number;
  active: boolean;
  hovered: boolean;
  onActivate: () => void;
  onHover: () => void;
  onLeave: () => void;
}) {
  const horizontal = annotation.x > 68 ? "opens-left" : annotation.x < 32 ? "opens-right" : "opens-center";
  const vertical = annotation.y > 58 ? "opens-up" : "opens-down";
  return <button
    className={`booth-hotspot ${active ? "is-active" : ""} ${hovered ? "is-hovered" : ""} ${horizontal} ${vertical}`}
    type="button"
    style={{ "--hotspot-x": `${annotation.x}%`, "--hotspot-y": `${annotation.y}%` } as CSSProperties}
    aria-label={`${annotation.label}. ${annotation.body}`}
    aria-pressed={active}
    onMouseEnter={() => {
      onActivate();
      onHover();
    }}
    onMouseLeave={onLeave}
    onFocus={onActivate}
    onClick={onActivate}
  >
    <span className="booth-hotspot-pulse" aria-hidden="true" />
    <b>{String(index + 1).padStart(2, "0")}</b>
    <span
      className="booth-hover-card"
      role="tooltip"
      style={hovered ? {
        opacity: 1,
        visibility: "visible",
        transform: horizontal === "opens-center" ? "translate(-50%, 0)" : "translateY(0)",
      } : undefined}
    >
      <small>ANNOTATION {String(index + 1).padStart(2, "0")}</small>
      <strong>{annotation.label}</strong>
      <em>{annotation.body}</em>
    </span>
  </button>;
}

export function BoxArtifactAtlas({ boxNumber, onBack, onChooseBox, onEnterQuest }: BoxArtifactAtlasProps) {
  const entry = BOOTH_ATLAS[boxNumber];
  const [activeId, setActiveId] = useState(entry.annotations[0].id);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const activeAnnotation = entry.annotations.find(({ id }) => id === activeId) ?? entry.annotations[0];
  const activeIndex = entry.annotations.findIndex(({ id }) => id === activeAnnotation.id);
  const previousBox = (boxNumber === 1 ? 9 : boxNumber - 1) as BoothBoxNumber;
  const nextBox = (boxNumber === 9 ? 1 : boxNumber + 1) as BoothBoxNumber;

  return <section
    className={`booth-atlas booth-atlas-${boxNumber}`}
    style={{ "--booth-accent": entry.accent } as CSSProperties}
    aria-labelledby="booth-atlas-title"
  >
    <div className="booth-atlas-aura" aria-hidden="true" />
    <header className="booth-atlas-heading">
      <button className="booth-atlas-back" type="button" onClick={onBack}><span>←</span> Nine-box gallery</button>
      <div>
        <p>THE BOOTH · INTERACTIVE ARTIFACT {String(boxNumber).padStart(2, "0")} / 09</p>
        <h1 id="booth-atlas-title">{entry.title}</h1>
        <div><span>BOX {String(boxNumber).padStart(2, "0")}</span><b>{entry.a3Label}</b></div>
      </div>
      <p className="booth-atlas-thesis">{entry.thesis}</p>
    </header>

    <div className="booth-atlas-workspace">
      <figure className="booth-artifact-frame">
        {/* The supplied source is intentionally rendered at its native 3840 × 2160 resolution. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={entry.image} alt={`${entry.title}, a handcrafted visual interpretation of A3 Box ${boxNumber}: ${entry.a3Label}`} width="3840" height="2160" decoding="async" />
        <div className="booth-artifact-vignette" aria-hidden="true" />
        <div className="booth-hotspot-layer" aria-label={`${entry.annotations.length} interactive annotations`}>{entry.annotations.map((annotation, index) => <Hotspot
          key={annotation.id}
          annotation={annotation}
          index={index}
          active={annotation.id === activeId}
          hovered={annotation.id === hoveredId}
          onActivate={() => setActiveId(annotation.id)}
          onHover={() => setHoveredId(annotation.id)}
          onLeave={() => setHoveredId(null)}
        />)}</div>
        <figcaption><span>NATIVE SOURCE · 3840 × 2160</span><a href={entry.image} target="_blank" rel="noreferrer">Open the 4K image ↗</a></figcaption>
      </figure>

      <aside className="booth-annotation-ledger" aria-label="Artifact annotation ledger">
        <div className="booth-ledger-heading"><span>FIELD NOTES</span><b>{String(entry.annotations.length).padStart(2, "0")} OBJECTS</b></div>
        <article className="booth-active-note" aria-live="polite">
          <small>ANNOTATION {String(activeIndex + 1).padStart(2, "0")}</small>
          <h2>{activeAnnotation.label}</h2>
          <p>{activeAnnotation.body}</p>
        </article>
        <ol>{entry.annotations.map((annotation, index) => <li key={annotation.id}>
          <button type="button" className={annotation.id === activeId ? "is-active" : ""} onMouseEnter={() => setActiveId(annotation.id)} onFocus={() => setActiveId(annotation.id)} onClick={() => setActiveId(annotation.id)}>
            <span>{String(index + 1).padStart(2, "0")}</span><b>{annotation.label}</b><i>LOCATE</i>
          </button>
        </li>)}</ol>
      </aside>
    </div>

    <footer className="booth-atlas-footer">
      <button type="button" onClick={() => onChooseBox(previousBox)}><span>←</span><small>PREVIOUS ARTIFACT</small><b>Box {String(previousBox).padStart(2, "0")}</b></button>
      <button className="booth-enter-quest" type="button" onClick={() => onEnterQuest(boxNumber)}><small>READY TO PRACTICE?</small><b>Enter the Box {String(boxNumber).padStart(2, "0")} quest</b><span>→</span></button>
      <button type="button" onClick={() => onChooseBox(nextBox)}><small>NEXT ARTIFACT</small><b>Box {String(nextBox).padStart(2, "0")}</b><span>→</span></button>
    </footer>
  </section>;
}

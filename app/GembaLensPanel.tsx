"use client";

import { useEffect, useRef, useState } from "react";
import "./gemba-lens-panel.css";

type Finding = { id: string; name: string; glyph: string };
type Instrument = {
  reveal: (active: boolean, replay?: boolean) => void;
  setConcept: (value: boolean) => void;
  setPaused: (value: boolean) => void;
  inspect: (index: number) => void;
  dispose: () => void;
};

export function GembaLensPanel({ lensActive, discovered, currentId, findings, onDiscover }: {
  lensActive: boolean;
  discovered: string[];
  currentId: string;
  findings: Finding[];
  onDiscover: (id: string) => void;
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const labelsRef = useRef<HTMLDivElement>(null);
  const fallbackRef = useRef<SVGSVGElement>(null);
  const instrumentRef = useRef<Instrument | null>(null);
  const progressRef = useRef<HTMLSpanElement>(null);
  const [concept, setConcept] = useState(false);
  const [paused, setPaused] = useState(false);
  const [rendererStatus, setRendererStatus] = useState("ILLUSTRATED VIEW");

  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setPaused(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  // Synchronize state independently of the lazy import so rapid navigation and
  // toggles never leave the renderer using stale props.
  const latest = useRef({ lensActive, concept, paused, currentId, findings });
  useEffect(() => {
    latest.current = { lensActive, concept, paused, currentId, findings };
    const instrument = instrumentRef.current;
    if (!instrument) return;
    instrument.setPaused(paused);
    instrument.setConcept(concept);
    instrument.inspect(findings.findIndex(({ id }) => id === currentId));
    instrument.reveal(lensActive);
  }, [lensActive, concept, paused, currentId, findings]);

  useEffect(() => {
    let cancelled = false;
    import("./gembaInstrument.js").then(({ createInstrument }) => {
      if (cancelled || !stageRef.current || !labelsRef.current || !fallbackRef.current) return;
      const instrument = createInstrument(stageRef.current, {
        labels: labelsRef.current,
        fallback: fallbackRef.current,
        paused: latest.current.paused,
        onProgress: (progress: number) => {
          rootRef.current?.style.setProperty("--glp-observed", String(Math.max(0, Math.min(1, (progress - .30) / .28))));
          rootRef.current?.style.setProperty("--glp-official", String(Math.max(0, 1 - progress * 4)));
          if (progressRef.current) progressRef.current.textContent = `LENS ${String(Math.round(progress * 100)).padStart(2, "0")}%`;
        },
        onRenderer: (status: string) => { if (!cancelled) setRendererStatus(status); },
      });
      instrumentRef.current = instrument;
      instrument.setConcept(latest.current.concept);
      instrument.inspect(latest.current.findings.findIndex(({ id }) => id === latest.current.currentId));
      instrument.reveal(latest.current.lensActive);
    }).catch(() => { if (!cancelled) setRendererStatus("ILLUSTRATED VIEW · GRAPHICS UNAVAILABLE"); });
    return () => { cancelled = true; instrumentRef.current?.dispose(); instrumentRef.current = null; };
  }, []);

  const selectConcept = (value: boolean) => {
    setConcept(value);
    instrumentRef.current?.setConcept(value);
    instrumentRef.current?.reveal(lensActive, true);
  };

  return <div ref={rootRef} className={`glp ${lensActive ? "is-active" : ""}`} data-gemba-renderer={rendererStatus}>
    <div className="glp-screen">
      <div className="glp-topline"><span>{lensActive ? concept ? "ILLUSTRATIVE BACKTRACKING · NOT CASE EVIDENCE" : "ONE REFERRAL · FOLLOWED END TO END" : "REFERRAL PATHWAY · REV 4.2"}</span><b>{lensActive ? concept ? "CONCEPT" : "OBSERVED" : "DOCUMENTED"}</b></div>
      <div className="glp-stage" ref={stageRef}>
        <svg className="fallback" ref={fallbackRef} viewBox="0 0 1000 650" preserveAspectRatio="none" aria-hidden="true">
          <path className="fallback-official" d="M140 320H500H860" fill="none" stroke="#75e2e6" strokeWidth="4" />
          <path className="fallback-observed" d="M140 340Q500 600 700 280T300 180 500 440 860 325" fill="none" stroke="#ffc45e" strokeWidth="5" />
        </svg>
        <div className="glp-node-labels" ref={labelsRef} aria-hidden="true" />
        <div className="glp-caption glp-official" aria-hidden={lensActive}><span>THE PROCESS AS DOCUMENTED</span><p>Beautiful. Orderly. Unobserved.</p></div>
        <div className="glp-caption glp-observed" aria-hidden={!lensActive}><span>{concept ? "BACKTRACKING · VISUAL CONCEPT ONLY" : "THE PROCESS AS PRACTICED"}</span><p>{concept ? "A pathway can double back on itself." : "The wait was hiding in the straight line."}</p></div>
        <div className="glp-annotation glp-wait glp-observed" aria-hidden={!lensActive}><b>7h 35m</b><span>WAITING, NOT EXTRA HANDOFFS</span></div>
        <div className="glp-annotation glp-voice glp-observed" aria-hidden={!lensActive}><span>PATIENT MESSAGE · 14:18</span><b>“Has anyone reviewed it yet?”</b></div>
        <span className="glp-coordinate" aria-hidden="true">THE MAP ≠ THE TERRITORY</span>
      </div>
      <div className="glp-bottomline"><span>{rendererStatus}</span><span ref={progressRef} aria-hidden="true">LENS 00%</span></div>
    </div>
    <div className="glp-controls"><button type="button" disabled={!lensActive} onClick={() => instrumentRef.current?.reveal(true, true)}>↺ Replay reveal</button><button type="button" aria-pressed={paused} onClick={() => setPaused(value => !value)}>{paused ? "Resume motion" : "Pause motion"}</button></div>
    <div className="glp-legend" aria-label="Map legend"><span><i />Referral movement</span><span><i />Time waiting</span><span><i />Patient follow-up</span>{concept && <span><i />Illustrative returns</span>}</div>
    <div className="glp-study" role="group" aria-label="Path study"><span>PATH STUDY</span><button type="button" disabled={!lensActive} aria-pressed={!concept} onClick={() => selectConcept(false)}>Observed case</button><button type="button" disabled={!lensActive} aria-pressed={concept} onClick={() => selectConcept(true)}>Backtracking concept</button></div>
    <p className="glp-scope">{concept ? "ILLUSTRATIVE ONLY: coral loops preview returns and rework. Those events were not observed in this referral; the case evidence is unchanged." : "The coils make elapsed waiting visible. They do not represent extra handoffs or repeated clinical work."}</p>
    <div className="glp-timeline" aria-label="Observed referral timeline"><span><b>08:07</b>Received</span><em>7h 35m waiting</em><span><b>15:42</b>First opened</span><em>3m review</em><span><b>15:45</b>Advanced</span></div>
    <div className="glp-evidence" aria-label="Evidence seals to inspect">{findings.map(finding => {
      const found = discovered.includes(finding.id);
      return <button type="button" className={`territory-evidence-seal ${found ? "is-found" : ""} ${currentId === finding.id ? "is-current" : ""}`} disabled={!lensActive} aria-label={`${found ? "Observed" : "Inspect"}: ${finding.name}`} key={finding.id} onClick={() => onDiscover(finding.id)}><i>{finding.glyph}</i><span>{finding.name}</span><small>{found ? "PINNED" : "INSPECT"}</small></button>;
    })}</div>
  </div>;
}

"use client";

import { useEffect, useRef } from "react";
import { REMAINING_CHAMBER_SPECS } from "./remainingChambersData";
import "./dimensional-instruments.css";

export type InstrumentBox = 3 | 5 | 8 | 9;
type Controller = ReturnType<typeof import("./instruments/createScene").createScene>;

export function DimensionalInstrument({ boxNumber, progress, current }: { boxNumber: InstrumentBox; progress: number; current: number }) {
  const mount = useRef<HTMLDivElement>(null);
  const controller = useRef<Controller | null>(null);
  const state = useRef({ progress, current });
  const spec = REMAINING_CHAMBER_SPECS[boxNumber];

  useEffect(() => {
    state.current = { progress, current };
    controller.current?.setState(progress, current);
  }, [progress, current]);

  useEffect(() => {
    const host = mount.current;
    const frame = host?.closest<HTMLElement>(".bespoke-scene");
    if (!host || !frame) return;
    let active = true;
    let requested = false;
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const onMotion = () => controller.current?.setPaused(motion.matches);
    motion.addEventListener("change", onMotion);
    const observer = new IntersectionObserver(entries => {
      if (requested || !entries.some(entry => entry.isIntersecting)) return;
      requested = true;
      observer.disconnect();
      import("./instruments/createScene").then(({ createScene }) => {
        if (!active) return;
        controller.current = createScene(host, {
          boxNumber, paused: motion.matches,
          onReady: () => { if (active) frame.dataset.instrument = "ready"; },
          onLost: () => { if (active) frame.dataset.instrument = "fallback"; },
        });
        controller.current.setState(state.current.progress, state.current.current);
      }).catch(() => { if (active) frame.dataset.instrument = "fallback"; });
    }, { rootMargin: "80px" });
    observer.observe(host);
    return () => {
      active = false;
      observer.disconnect();
      motion.removeEventListener("change", onMotion);
      controller.current?.dispose();
      controller.current = null;
      delete frame.dataset.instrument;
    };
  }, [boxNumber]);

  return <div className="dimensional-instrument" aria-hidden="true" data-box={boxNumber} data-progress={progress} data-current={current}>
    <div className="instrument-ruler"><span>INSTRUMENT / {String(boxNumber).padStart(2, "0")}</span><span>◆ LIVE</span></div>
    <div className="instrument-viewport" ref={mount} />
    <div className="instrument-telemetry">
      <div className="instrument-state"><span>{["I", "II", "III", "IV"].map((value, index) => <i key={value} className={index < progress ? "is-complete" : ""}>{value}</i>)}</span><b>{progress} / 4</b></div>
      <div className="instrument-channels">{spec.trials.map((trial, index) => <div key={trial.id} className={`${index < progress ? "is-complete" : ""} ${index === current ? "is-current" : ""}`}><span>{String(index + 1).padStart(2, "0")}</span><b>{trial.name}</b></div>)}</div>
    </div>
  </div>;
}

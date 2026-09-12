"use client";

import { useEffect, useRef } from "react";
import "./forge-instrument.css";

type Controller = ReturnType<typeof import("./forge/createForgeScene").createForgeScene>;

const SEALS = [
  ["01", "BACKGROUND"],
  ["02", "PROBLEM"],
  ["03", "AIM"],
  ["04", "SCOPE · DONE"],
] as const;

export function ForgeInstrument() {
  const mount = useRef<HTMLDivElement>(null);
  const controller = useRef<Controller | null>(null);

  useEffect(() => {
    const host = mount.current;
    const frame = host?.closest<HTMLElement>(".forge-intro-art");
    if (!host || !frame) return;

    let active = true;
    let requested = false;
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const onMotion = () => controller.current?.setPaused(motion.matches);
    motion.addEventListener("change", onMotion);

    const observer = new IntersectionObserver((entries) => {
      if (requested || !entries.some((entry) => entry.isIntersecting)) return;
      requested = true;
      observer.disconnect();
      import("./forge/createForgeScene").then(({ createForgeScene }) => {
        if (!active) return;
        controller.current = createForgeScene(host, {
          paused: motion.matches,
          onReady: () => { if (active) frame.dataset.forgeInstrument = "ready"; },
          onLost: () => { if (active) frame.dataset.forgeInstrument = "fallback"; },
        });
      }).catch(() => { if (active) frame.dataset.forgeInstrument = "fallback"; });
    }, { rootMargin: "80px" });

    observer.observe(host);
    return () => {
      active = false;
      observer.disconnect();
      motion.removeEventListener("change", onMotion);
      controller.current?.dispose();
      controller.current = null;
      delete frame.dataset.forgeInstrument;
    };
  }, []);

  return <div className="forge-dimensional-instrument" role="img" aria-label="A dimensional blacksmith's anvil, hammer, and four unstruck evidence seals in the Herald's Forge">
    <div className="forge-instrument-ruler"><span>FORGE INSTRUMENT / 01</span><span>◆ LIVE</span></div>
    <div className="forge-instrument-viewport" ref={mount} aria-hidden="true" />
    <div className="forge-instrument-telemetry" aria-hidden="true">
      <div className="forge-instrument-state"><span>SUMMONS</span><b>0 / 4 SEALED</b></div>
      <div className="forge-instrument-channels">{SEALS.map(([number, label]) => <div key={number}><span>{number}</span><b>{label}</b></div>)}</div>
    </div>
  </div>;
}

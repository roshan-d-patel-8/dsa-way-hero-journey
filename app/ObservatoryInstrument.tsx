"use client";

import { useEffect, useRef } from "react";
import "./observatory-instrument.css";

type Instrument = ReturnType<typeof import("./observatory/createInstrument").createInstrument>;

/** Only the physical telescope is replaced; the original game stage stays authoritative. */
export function ObservatoryInstrument({ progress }: { progress: number }) {
  const mount = useRef<HTMLDivElement>(null);
  const controller = useRef<Instrument | null>(null);
  const latestProgress = useRef(progress);

  useEffect(() => {
    latestProgress.current = progress;
    controller.current?.setProgress(progress);
  }, [progress]);

  useEffect(() => {
    const host = mount.current;
    const frame = host?.parentElement;
    if (!host || !frame) return;
    let active = true;
    let requested = false;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onMotion = () => controller.current?.setPaused(reduced.matches);
    reduced.addEventListener("change", onMotion);
    const observer = new IntersectionObserver((entries) => {
      if (requested || !entries.some((entry) => entry.isIntersecting)) return;
      requested = true;
      observer.disconnect();
      import("./observatory/createInstrument").then(({ createInstrument }) => {
        if (!active) return;
        controller.current = createInstrument(host, {
          paused: reduced.matches,
          onReady: () => { if (active) frame.dataset.rendering = "ready"; },
          onLost: () => { if (active) frame.dataset.rendering = "fallback"; },
        });
        controller.current.setProgress(latestProgress.current);
      }).catch(() => { if (active) frame.dataset.rendering = "fallback"; });
    }, { rootMargin: "100px" });
    observer.observe(host);
    return () => {
      active = false;
      observer.disconnect();
      reduced.removeEventListener("change", onMotion);
      controller.current?.dispose();
      controller.current = null;
    };
  }, []);

  return <div className="observatory-instrument">
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img src="observatory/telescope-fallback.svg" alt="" width="800" height="660" />
    <div className="observatory-instrument-canvas" ref={mount} />
  </div>;
}

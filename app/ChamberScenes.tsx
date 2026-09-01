"use client";

import type { CSSProperties, ReactNode } from "react";
import { REMAINING_CHAMBER_SPECS, type RemainingBoxNumber } from "./remainingChambersData";

type SceneProps = { boxNumber: RemainingBoxNumber; progress: number; current: number };

function SceneChrome({ boxNumber, progress, children }: SceneProps & { children: ReactNode }) {
  const spec = REMAINING_CHAMBER_SPECS[boxNumber];
  return <div className={`rc-scene bespoke-scene rc-box-${boxNumber}`} style={{ "--rc-accent": spec.accent, "--rc-glow": spec.glow, "--rc-secondary": spec.secondary, "--rc-deep": spec.deep } as CSSProperties} aria-label={`${spec.sceneLabel}, ${progress} of 4 trials complete`}>
    <div className="rc-particles" aria-hidden="true">{Array.from({ length: 18 }, (_, index) => <i key={index} style={{ "--i": index } as CSSProperties} />)}</div>
    <div className="rc-scene-label"><span>BOX {String(boxNumber).padStart(2, "0")} · LIVE TOOL</span><b>{spec.sceneLabel}</b></div>
    {children}
    <div className="rc-scene-floor" aria-hidden="true" />
  </div>;
}

function stateClass(index: number, progress: number, current: number) {
  return `${index < progress ? "is-lit" : ""} ${index === current ? "is-current" : ""}`;
}

function Observatory({ progress, current }: Omit<SceneProps, "boxNumber">) {
  const trials = REMAINING_CHAMBER_SPECS[3].trials;
  const points = [[88, 338], [224, 206], [382, 278], [512, 116]];
  return <SceneChrome boxNumber={3} progress={progress} current={current}>
    <div className="north-star-observatory" aria-hidden="true">
      <div className="observatory-dome"><i /><i /><i /><i /></div>
      <svg className="target-constellation" viewBox="0 0 600 430" role="presentation">
        <path className="star-route is-ghost" d="M88 338 L224 206 L382 278 L512 116" />
        {points.slice(0, -1).map((point, index) => <line key={index} className={index < progress ? "is-lit" : ""} x1={point[0]} y1={point[1]} x2={points[index + 1][0]} y2={points[index + 1][1]} />)}
        {points.map((point, index) => <g key={trials[index].id} className={stateClass(index, progress, current)} transform={`translate(${point[0]} ${point[1]})`}><circle r="19" /><circle r="6" /><text y="42">{trials[index].glyph} · {trials[index].name}</text></g>)}
      </svg>
      <div className="telescope"><span /><b /></div>
      <div className="observatory-readout"><span>COORDINATES FIXED</span><b>{progress}/4</b></div>
    </div>
  </SceneChrome>;
}

function KeyArmory({ progress, current }: Omit<SceneProps, "boxNumber">) {
  const trials = REMAINING_CHAMBER_SPECS[5].trials;
  return <SceneChrome boxNumber={5} progress={progress} current={current}>
    <div className="key-armory" aria-hidden="true">
      <div className={`root-lock ${progress === 4 ? "is-open" : ""}`}><div className="lock-roots"><i /><i /><i /><i /><i /></div><span>ROOT</span><b>{progress}/4</b></div>
      <div className="key-rack">{trials.map((trial, index) => <div key={trial.id} className={`countermeasure-key key-${index + 1} ${stateClass(index, progress, current)}`}><span className="key-bow">{trial.glyph}</span><i className="key-shaft" /><i className="key-bit" /><b>{trial.name}</b></div>)}</div>
      <div className="armory-plaque">ONLY ROOT-MATCHED KEYS TURN</div>
    </div>
  </SceneChrome>;
}

function PDSAApparatus({ progress, current }: Omit<SceneProps, "boxNumber">) {
  const trials = REMAINING_CHAMBER_SPECS[6].trials;
  return <SceneChrome boxNumber={6} progress={progress} current={current}>
    <div className="pdsa-apparatus" aria-hidden="true">
      <div className="learning-orb"><i className="orb-ring ring-one" /><i className="orb-ring ring-two" /><i className="orb-ring ring-three" /><span>{progress}/4</span><b>LEARN</b></div>
      <div className="experiment-belt">{trials.map((trial, index) => <div key={trial.id} className={`pdsa-station ${stateClass(index, progress, current)}`}><i>{["P", "D", "S", "A"][index]}</i><span>{trial.glyph}</span><b>{trial.name}</b></div>)}</div>
      <div className="energy-conduit"><span style={{ width: `${progress * 25}%` }} /></div>
      <div className="apparatus-note">TRY SMALL · LEARN HONESTLY · ADAPT DELIBERATELY</div>
    </div>
  </SceneChrome>;
}

function ExpeditionLedger({ progress, current }: Omit<SceneProps, "boxNumber">) {
  const trials = REMAINING_CHAMBER_SPECS[7].trials;
  const points = [[82, 334], [210, 246], [340, 292], [506, 112]];
  return <SceneChrome boxNumber={7} progress={progress} current={current}>
    <div className="expedition-ledger" aria-hidden="true">
      <div className="ledger-spine" />
      <div className="map-contours"><i /><i /><i /><i /></div>
      <svg className="expedition-route" viewBox="0 0 600 420" role="presentation">
        <path className="route-shadow" d="M82 334 C130 264 164 285 210 246 S292 331 340 292 S438 208 506 112" />
        <path className="route-progress" style={{ strokeDasharray: `${progress * 25} 100` }} pathLength="100" d="M82 334 C130 264 164 285 210 246 S292 331 340 292 S438 208 506 112" />
        {points.map((point, index) => <g key={trials[index].id} className={stateClass(index, progress, current)} transform={`translate(${point[0]} ${point[1]})`}><path d="M0 -18 L14 -4 L0 18 L-14 -4 Z" /><text y="42">{String(index + 1).padStart(2, "0")} · {trials[index].name}</text></g>)}
      </svg>
      <div className="map-compass"><i>N</i><b>✦</b></div>
      <div className="ledger-stamp">ROUTE<br />{progress === 4 ? "READY" : "DRAFT"}</div>
    </div>
  </SceneChrome>;
}

function EvidenceTribunal({ progress, current }: Omit<SceneProps, "boxNumber">) {
  const trials = REMAINING_CHAMBER_SPECS[8].trials;
  return <SceneChrome boxNumber={8} progress={progress} current={current}>
    <div className="evidence-tribunal" aria-hidden="true">
      <div className={`tribunal-scales progress-${progress}`}><div className="scale-crown">⚖</div><div className="scale-post" /><div className="scale-beam"><i className="pan-left" /><i className="pan-right" /></div></div>
      <div className="witness-dais">{trials.slice(0, 3).map((trial, index) => <div key={trial.id} className={`witness-card ${stateClass(index, progress, current)}`}><i>{trial.glyph}</i><b>{trial.name}</b><span>{index < progress ? "HEARD" : index === current ? "TESTIFYING" : "SEALED"}</span></div>)}</div>
      <div className={`verdict-seal ${stateClass(3, progress, current)}`}><i>?</i><div><span>FINAL VERDICT</span><b>{progress === 4 ? "EVIDENCE WEIGHED" : "AWAITING TESTIMONY"}</b></div></div>
    </div>
  </SceneChrome>;
}

function ElixirVessel({ progress, current }: Omit<SceneProps, "boxNumber">) {
  const trials = REMAINING_CHAMBER_SPECS[9].trials;
  return <SceneChrome boxNumber={9} progress={progress} current={current}>
    <div className="elixir-laboratory" aria-hidden="true">
      <div className="ingredient-shelf">{trials.map((trial, index) => <div key={trial.id} className={`ingredient-vial ${stateClass(index, progress, current)}`}><i>{trial.glyph}</i><span /><b>{trial.name}</b></div>)}</div>
      <div className="elixir-vessel"><div className="flask-neck" /><div className="flask-body"><span className="elixir-level" style={{ height: `${12 + progress * 18}%` }} /><i className="bubble b1" /><i className="bubble b2" /><i className="bubble b3" /><b>{progress}/4</b></div></div>
      <div className="vessel-spiral">↻</div>
      <div className="elixir-inscription">REFLECT · CHANGE · SHARE</div>
    </div>
  </SceneChrome>;
}

export function BespokeChamberScene(props: SceneProps) {
  switch (props.boxNumber) {
    case 3: return <Observatory progress={props.progress} current={props.current} />;
    case 5: return <KeyArmory progress={props.progress} current={props.current} />;
    case 6: return <PDSAApparatus progress={props.progress} current={props.current} />;
    case 7: return <ExpeditionLedger progress={props.progress} current={props.current} />;
    case 8: return <EvidenceTribunal progress={props.progress} current={props.current} />;
    case 9: return <ElixirVessel progress={props.progress} current={props.current} />;
  }
}

export function ChamberTrialPreview({ boxNumber }: { boxNumber: RemainingBoxNumber }) {
  const trials = REMAINING_CHAMBER_SPECS[boxNumber].trials;
  return <div className={`rc-trial-preview scene-preview-${boxNumber}`} aria-label={`The four trials of ${REMAINING_CHAMBER_SPECS[boxNumber].mythicTitle}`}>{trials.map((trial, index) => <span key={trial.id}><i>{boxNumber === 6 ? ["P", "D", "S", "A"][index] : trial.glyph}</i><b>{trial.name}</b></span>)}</div>;
}

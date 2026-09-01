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
      <div className="pdsa-gear-train">{trials.map((trial, index) => <div key={trial.id} className={`pdsa-gear-node gear-${index + 1} ${stateClass(index, progress, current)}`}>
        <div className="gear-wheel">
          <div className="gear-teeth">{Array.from({ length: 16 }, (_, tooth) => <i key={tooth} style={{ "--tooth": tooth } as CSSProperties} />)}</div>
          <span className="gear-hub">{["P", "D", "S", "A"][index]}</span>
          <i className="gear-pin" />
        </div>
        <div className="gear-label"><span>{["P", "D", "S", "A"][index]}</span><b>{trial.name}</b><em>{index < progress ? "ENGAGED" : index === current ? "ACTIVATING" : "LOCKED"}</em></div>
      </div>)}</div>
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
      <div className="paper-weathering" />
      <div className="ledger-spine" />
      <svg className="expedition-topography" viewBox="0 0 600 420" role="presentation">
        <defs>
          <filter id="expeditionPaperGrain" x="-15%" y="-15%" width="130%" height="130%">
            <feTurbulence type="fractalNoise" baseFrequency=".55" numOctaves="4" seed="17" />
            <feColorMatrix type="saturate" values="0" />
            <feComponentTransfer><feFuncA type="table" tableValues="0 .19" /></feComponentTransfer>
          </filter>
          <filter id="expeditionInkWobble" x="-5%" y="-5%" width="110%" height="110%">
            <feTurbulence type="fractalNoise" baseFrequency=".012" numOctaves="2" seed="8" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.7" />
          </filter>
        </defs>
        <rect className="paper-grain" x="0" y="0" width="600" height="420" filter="url(#expeditionPaperGrain)" />
        <g className="topographic-ridges" filter="url(#expeditionInkWobble)">
          <g className="ridge ridge-northwest">
            <path d="M-28 154 C18 102 37 49 106 38 C179 27 211 79 220 130 C228 174 174 196 108 193 C44 190 1 202 -28 154Z" />
            <path d="M-8 148 C33 110 49 68 109 57 C163 47 194 82 201 124 C208 157 166 177 108 174 C53 171 20 184 -8 148Z" />
            <path d="M16 143 C52 113 66 84 113 75 C153 68 177 93 181 121 C185 146 152 158 107 156 C65 154 38 168 16 143Z" />
            <path d="M47 137 C72 118 82 98 116 92 C144 88 159 104 160 121 C161 139 139 143 109 141 C80 139 61 151 47 137Z" />
          </g>
          <g className="ridge ridge-east">
            <path d="M386 108 C420 61 485 38 548 57 C611 76 632 138 603 195 C579 243 522 252 466 230 C411 208 352 156 386 108Z" />
            <path d="M405 113 C435 77 486 59 535 73 C582 86 603 133 580 181 C561 218 520 229 472 211 C428 194 377 148 405 113Z" />
            <path d="M428 116 C453 91 486 78 522 88 C556 98 578 128 561 166 C547 195 518 207 478 192 C444 179 407 143 428 116Z" />
            <path d="M453 121 C472 104 492 97 516 103 C539 109 552 130 542 154 C533 175 514 183 486 175 C463 167 438 139 453 121Z" />
          </g>
          <g className="ridge ridge-southwest">
            <path d="M-18 391 C29 338 77 300 140 304 C203 308 250 354 246 427" />
            <path d="M9 401 C48 356 83 325 137 327 C190 330 220 366 221 427" />
            <path d="M38 414 C70 378 96 349 138 351 C178 353 199 385 198 430" />
            <path d="M73 426 C91 396 111 375 140 376 C169 378 179 401 178 432" />
          </g>
        </g>
        <g className="terrain-hachures" filter="url(#expeditionInkWobble)">
          <path d="M82 91 l-15 25 M99 83 l-10 28 M121 80 l-5 29 M145 84 l5 27 M163 93 l12 22" />
          <path d="M468 120 l-13 27 M490 111 l-7 31 M516 113 l3 31 M536 124 l10 26" />
          <path d="M84 364 l-12 22 M108 351 l-7 24 M132 347 l1 25 M158 352 l9 24" />
        </g>
        <g className="expedition-river" filter="url(#expeditionInkWobble)">
          <path className="river-bank river-bank-west" d="M287 -14 C247 54 345 111 307 177 C270 241 335 266 297 321 C265 369 318 392 287 438" />
          <path className="river-water" d="M296 -14 C255 56 353 112 315 180 C279 243 344 269 305 325 C274 371 327 394 296 438" />
          <path className="river-bank river-bank-east" d="M305 -14 C264 58 362 114 324 183 C288 246 353 272 314 329 C283 374 336 397 305 438" />
          <text className="river-name" x="329" y="205" transform="rotate(68 329 205)">SILVERBEND RIVER</text>
        </g>
        <g className="terrain-icons" filter="url(#expeditionInkWobble)">
          <path className="mountains" d="M440 84 l17 -28 l13 20 l13 -33 l22 41 M51 279 l16 -25 l12 17 l17 -29 l20 37" />
          <path className="pine-grove" d="M521 252 l-9 18 h6 l-11 20 h11 v13 M546 267 l-8 16 h5 l-10 18 h10 v12 M568 244 l-10 20 h6 l-12 22 h12 v14" />
          <text className="terrain-name" x="431" y="98">WINDCUT BLUFF</text>
          <text className="terrain-name" x="469" y="326">PINE COUNTRY</text>
          <text className="terrain-name" x="70" y="219">OLD RIDGE</text>
        </g>
      </svg>
      <svg className="expedition-route" viewBox="0 0 600 420" role="presentation">
        <path className="route-shadow" d="M82 334 C130 264 164 285 210 246 S292 331 340 292 S438 208 506 112" />
        <path className="route-progress" style={{ strokeDasharray: `${progress * 25} 100` }} pathLength="100" d="M82 334 C130 264 164 285 210 246 S292 331 340 292 S438 208 506 112" />
        <g className="river-crossing" transform="translate(305 316) rotate(-16)">
          <path className="bridge-shadow" d="M-25 -9 H25 M-25 9 H25" />
          {[-20, -12, -4, 4, 12, 20].map((x) => <path key={x} className="bridge-plank" d={`M${x} -12 V12`} />)}
          <text x="0" y="30">RIVER FORD</text>
        </g>
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

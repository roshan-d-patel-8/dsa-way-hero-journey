"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { REMAINING_CHAMBER_SPECS, type RemainingBoxNumber } from "./remainingChambersData";
import { RelicReveal } from "./RelicReveal";
import { IncantationScroll, SenseiMessage } from "./StoryTreatments";
import { BespokeChamberScene, ChamberTrialPreview } from "./ChamberScenes";

type Feedback = { kind: "correct" | "wrong"; text: string } | null;
type ChamberSound = "start" | "step" | "correct" | "wrong" | "complete";

function playChamberSound(kind: ChamberSound, box: RemainingBoxNumber, enabled: boolean) {
  if (!enabled) return;
  const AudioContextClass = window.AudioContext ?? (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextClass) return;
  const context = new AudioContextClass();
  const now = context.currentTime;
  const tones = kind === "wrong" ? [92, 78] : kind === "complete" ? [174, 261, 349, 523] : kind === "correct" ? [196, 294, 392] : [110 + box * 8, 165 + box * 7];
  tones.forEach((frequency, index) => {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = kind === "wrong" ? "sawtooth" : box === 6 ? "square" : "sine";
    oscillator.frequency.setValueAtTime(frequency, now + index * .08);
    gain.gain.setValueAtTime(0, now + index * .08);
    gain.gain.linearRampToValueAtTime(kind === "complete" ? .07 : .045, now + index * .08 + .025);
    gain.gain.exponentialRampToValueAtTime(.0001, now + index * .08 + .38);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start(now + index * .08);
    oscillator.stop(now + index * .08 + .42);
  });
  window.setTimeout(() => void context.close(), 900);
}

export function RemainingChamberQuest({ boxNumber, sound, onExit }: { boxNumber: RemainingBoxNumber; sound: boolean; onExit: () => void }) {
  const spec = REMAINING_CHAMBER_SPECS[boxNumber];
  const [phase, setPhase] = useState<"intro" | "trial" | "complete">("intro");
  const [trialIndex, setTrialIndex] = useState(0);
  const [correct, setCorrect] = useState(false);
  const [attemptedChoices, setAttemptedChoices] = useState<number[]>([]);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [relicRevealed, setRelicRevealed] = useState(false);
  const trial = spec.trials[trialIndex];
  const progress = phase === "complete" ? 4 : trialIndex + (correct ? 1 : 0);

  const reset = () => {
    setPhase("intro");
    setTrialIndex(0);
    setCorrect(false);
    setAttemptedChoices([]);
    setFeedback(null);
    setRelicRevealed(false);
  };

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "auto" }));
    return () => window.cancelAnimationFrame(frame);
  }, [phase, trialIndex]);

  const choose = (choiceIndex: number) => {
    if (attemptedChoices.includes(choiceIndex) || (correct && choiceIndex === trial.correct)) return;
    if (choiceIndex === trial.correct) {
      setCorrect(true);
      setFeedback({ kind: "correct", text: trial.answer });
      playChamberSound("correct", boxNumber, sound);
      return;
    }
    setAttemptedChoices((values) => [...values, choiceIndex]);
    setFeedback({ kind: "wrong", text: trial.wrong[choiceIndex] });
    playChamberSound("wrong", boxNumber, sound);
  };

  const advance = () => {
    if (!correct) return;
    if (trialIndex === spec.trials.length - 1) {
      setPhase("complete");
      playChamberSound("complete", boxNumber, sound);
      return;
    }
    setTrialIndex((value) => value + 1);
    setCorrect(false);
    setAttemptedChoices([]);
    setFeedback(null);
    playChamberSound("step", boxNumber, sound);
  };

  if (phase === "intro") return <section className={`rc-shell rc-intro rc-box-${boxNumber}`} style={{ "--rc-accent": spec.accent, "--rc-glow": spec.glow, "--rc-secondary": spec.secondary, "--rc-deep": spec.deep } as CSSProperties}>
    <div className="rc-intro-art">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`a3/box-${boxNumber}.jpg`} alt="" width="3840" height="2160" />
      <BespokeChamberScene boxNumber={boxNumber} progress={0} current={0} />
    </div>
    <div className="rc-intro-copy">
      <div className="quest-kicker">THE NINE CHAMBERS · BOX {String(boxNumber).padStart(2, "0")}</div>
      <div className="chamber-tag">{spec.wisdom}</div>
      <h1>{spec.mythicTitle}</h1>
      <div className="rc-prologue">{spec.prologue.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
      <SenseiMessage boxNumber={boxNumber}>{spec.senseiBrief}</SenseiMessage>
      <IncantationScroll label="CHAMBER INCANTATION">{spec.incantation}</IncantationScroll>
      <ChamberTrialPreview boxNumber={boxNumber} />
      <button className="primary-button" type="button" onClick={() => { setPhase("trial"); playChamberSound("start", boxNumber, sound); }}><span>Enter {spec.concept}</span><b>→</b></button>
    </div>
  </section>;

  if (phase === "complete") return <section className={`rc-shell rc-complete rc-box-${boxNumber}`} style={{ "--rc-accent": spec.accent, "--rc-glow": spec.glow, "--rc-secondary": spec.secondary, "--rc-deep": spec.deep } as CSSProperties}>
    <div className="rc-complete-copy">
      <div className="quest-kicker">BOX {String(boxNumber).padStart(2, "0")} · ACHIEVEMENT UNLOCKED</div>
      <h1>{spec.completionTitle}</h1>
      <p>{spec.completionLead}</p>
    </div>
    <div className="forge-reward-column relic-reward-column">
      <RelicReveal boxNumber={boxNumber} relicName={spec.weapon} revealed={relicRevealed} sound={sound} accent={spec.accent} glow={spec.glow} onReveal={() => setRelicRevealed(true)} />
      {relicRevealed ? <div className="forge-weapon-card relic-card-awakened"><span>{spec.weaponKicker}</span><h2><small>THE</small>{spec.weapon.replace(/^The\s+/i, "")}</h2><p>{spec.weaponDescription}</p></div> : <div className="sealed-reward-card"><span>LEGENDARY TOOL SEALED</span><b>???</b><p>The four trials have opened one final mystery.</p></div>}
      <div className="rc-complete-actions"><button className="primary-button" type="button" onClick={() => { reset(); playChamberSound("start", boxNumber, sound); }}><span>Play this chamber again</span><b>↻</b></button><button className="map-return-button" type="button" onClick={onExit}>Return to the nine chambers</button></div>
    </div>
  </section>;

  return <section className={`rc-shell rc-game rc-box-${boxNumber}`} style={{ "--rc-accent": spec.accent, "--rc-glow": spec.glow, "--rc-secondary": spec.secondary, "--rc-deep": spec.deep } as CSSProperties}>
    <div className="rc-question-panel">
      <div className="rc-heading-row"><div><div className="quest-kicker">BOX {String(boxNumber).padStart(2, "0")} · TRIAL {String(trialIndex + 1).padStart(2, "0")} / 04</div><div className="chamber-tag">{trial.clue}</div></div><div className="rc-progress">{spec.trials.map((item, index) => <span key={item.id} className={`${index < progress ? "is-lit" : ""} ${index === trialIndex ? "is-current" : ""}`}>{item.glyph}</span>)}</div></div>
      <h1>{trial.name}</h1>
      <p className="rc-prompt">{trial.prompt}</p>
      <SenseiMessage boxNumber={boxNumber}>{trial.coaching}</SenseiMessage>
      <div className="rc-choice-list">{trial.options.map((option, choiceIndex) => {
        const attempted = attemptedChoices.includes(choiceIndex);
        const correctChoice = choiceIndex === trial.correct;
        return <button type="button" key={option} data-rc-choice={choiceIndex} className={`${attempted ? "is-wrong" : ""} ${correct && correctChoice ? "is-correct" : ""}`} disabled={attempted || (correct && correctChoice)} onClick={() => choose(choiceIndex)}><span>{String.fromCharCode(65 + choiceIndex)}</span><b>{option}</b><i>{attempted ? "×" : correct && correctChoice ? "✓" : "◇"}</i></button>;
      })}</div>
      <div className={`rc-feedback ${feedback ? `is-${feedback.kind}` : ""}`} aria-live="polite">{feedback ? <><span>{feedback.kind === "correct" ? "TRIAL CLEARED" : "PATH INSPECTED"}</span><p>{feedback.text}</p></> : <p>Choose the evidence path that best serves patients, people, and the process.</p>}</div>
      {correct && <div className="rc-advance"><p>Inspect another path, or continue when you are ready.</p><button className="primary-button" type="button" onClick={advance}><span>{trialIndex === 3 ? "Claim the chamber tool" : "Continue to the next trial"}</span><b>→</b></button></div>}
    </div>
    <div className="rc-game-world"><BespokeChamberScene boxNumber={boxNumber} progress={progress} current={trialIndex} /><div className="rc-dossier"><span>FIELD DOSSIER</span><b>{spec.a3Label}</b><p>{trial.clue}. The chamber records each inspected path; progress is never lost.</p></div></div>
  </section>;
}

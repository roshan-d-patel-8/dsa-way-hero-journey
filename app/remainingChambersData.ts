export type RemainingBoxNumber = 3 | 5 | 6 | 7 | 8 | 9;

export type ChamberTrial = {
  id: string;
  glyph: string;
  name: string;
  clue: string;
  prompt: string;
  coaching: string;
  options: [string, string, string];
  correct: number;
  answer: string;
  wrong: Record<number, string>;
};

export type RemainingChamberSpec = {
  box: RemainingBoxNumber;
  a3Label: string;
  concept: string;
  concepts: readonly [string, string, string];
  mythicTitle: string;
  wisdom: string;
  prologue: string[];
  senseiBrief: string;
  sceneLabel: string;
  sceneSymbol: string;
  accent: string;
  glow: string;
  secondary: string;
  deep: string;
  weapon: string;
  weaponKicker: string;
  weaponDescription: string;
  completionTitle: string;
  completionLead: string;
  incantation: string;
  trials: [ChamberTrial, ChamberTrial, ChamberTrial, ChamberTrial];
};

export const REMAINING_CHAMBER_CONCEPTS = {
  3: ["The North Star Observatory", "The Archer's Fog", "The Blueprint of Tomorrow"],
  5: ["The Armory of Many Keys", "The Countermeasure Kitchen", "The PICK Forge"],
  6: ["The Clockwork PDSA Laboratory", "The One-Patient Gauntlet", "The Experiment Ramp"],
  7: ["The Expedition Ledger", "The Orchestra of Ownership", "The Gantt Bridge"],
  8: ["The Dragon's Tribunal", "The Mirror of Results", "The Trial of Three Signals"],
  9: ["Return with the Elixir", "The Campfire of Lessons", "The Infinite Spiral"],
} as const satisfies Record<RemainingBoxNumber, readonly [string, string, string]>;

export const REMAINING_CHAMBER_SPECS: Record<RemainingBoxNumber, RemainingChamberSpec> = {
  3: {
    box: 3,
    a3Label: "Target State",
    concept: REMAINING_CHAMBER_CONCEPTS[3][0],
    concepts: REMAINING_CHAMBER_CONCEPTS[3],
    mythicTitle: "The North Star Observatory",
    wisdom: "Better is not a destination. Draw a future condition the team can recognize, measure, and reach by a date.",
    prologue: [
      "Monday begins with a warning from the endoscopy team: only 58% of next week’s patients have completed their bowel-prep readiness checklist. Seventeen procedures were cancelled late last month, and nurses are making rescue calls after hours.",
      "The observatory needs a true destination—not the vague wish to “improve preparation.” Fix four coordinates so everyone can recognize arrival during an ordinary clinic week.",
    ],
    senseiBrief: "Set the magnitude, the date, the visible future work, and the guardrail that prevents improvement from creating new burden.",
    sceneLabel: "TARGET CONSTELLATION",
    sceneSymbol: "✦",
    accent: "#ffd65a",
    glow: "#f08f24",
    secondary: "#75e2e6",
    deep: "#07141d",
    weapon: "The North Star Compass",
    weaponKicker: "TARGET CONDITION LOCKED",
    weaponDescription: "It points only toward a future condition with magnitude, time, observable work, and protection against shifted burden.",
    completionTitle: "Destination drawn.",
    completionLead: "The fog lifts. Everyone can now describe what good looks like—and know whether the expedition has arrived.",
    incantation: "Name how much. Name by when. Show what good looks like. Protect what must not worsen.",
    trials: [
      {
        id: "magnitude",
        glyph: "◎",
        name: "Magnitude & Date",
        clue: "Baseline readiness 58% · late cancellations 17/month",
        prompt: "Which inscription creates a measurable destination rather than a hopeful direction?",
        coaching: "How much improvement—and by exactly when?",
        options: [
          "Improve bowel-prep readiness and reduce avoidable cancellations during the coming quarter.",
          "By December 15, raise five-day readiness from 58 to at least 90 percent.",
          "Launch reminder texts and a nursing dashboard by December 15 for every patient.",
        ],
        correct: 1,
        answer: "STAR FIXED: the target names baseline, threshold, and date without prescribing the countermeasure.",
        wrong: {
          0: "The telescope finds aspiration but no finish line. “Improve” cannot confirm arrival.",
          2: "That inscription names projects, not the condition they must create. The destination should survive if the route changes.",
        },
      },
      {
        id: "condition",
        glyph: "◇",
        name: "Future Condition",
        clue: "The future condition must be visible during a real clinic week",
        prompt: "What should an observer actually see when the new condition exists?",
        coaching: "Can the future process be rehearsed and recognized—not merely admired?",
        options: [
          "Five days before procedures, at least 90 percent of patients show a completed readiness checklist.",
          "Staff communicate more effectively and help patients feel increasingly prepared before procedures.",
          "A preparation nurse calls every patient and personally resolves all remaining readiness problems.",
        ],
        correct: 0,
        answer: "STAR FIXED: the future work is observable, time-bounded, and independent of one preselected staffing design.",
        wrong: {
          1: "The words sound good but remain invisible. An observer cannot reliably recognize 'more effectively' on the gemba.",
          2: "A named role and method have replaced the target condition. Describe what good looks like before choosing the route.",
        },
      },
      {
        id: "balance",
        glyph: "⚖",
        name: "Dual Value",
        clue: "Speed must not purchase hidden harm elsewhere",
        prompt: "Which guardrail protects the target from shifting burden?",
        coaching: "What must not worsen while the primary measure improves?",
        options: [
          "Reach the readiness target without increasing nursing after-hours work or confusing patient messages.",
          "Reach the readiness target even if nurses require overtime throughout the first month.",
          "Measure only checklist completion because additional indicators make the target unnecessarily complicated.",
        ],
        correct: 0,
        answer: "STAR FIXED: patient readiness, staff workload, and message clarity must improve as one designed condition.",
        wrong: {
          1: "The target purchases speed with staff burden. A future condition is not good if it exports the pain.",
          2: "One bright metric can conceal a darker system. Balancing measures reveal where improvement has merely moved the problem.",
        },
      },
      {
        id: "acceptance",
        glyph: "✦",
        name: "Arrival Test",
        clue: "A target must distinguish a stable condition from one lucky week",
        prompt: "Which signal proves the team has reached the intended plateau?",
        coaching: "How long must the condition hold—and what else must be true?",
        options: [
          "The target is met after one unusually quiet week reaches 90 percent readiness.",
          "For eight weeks, readiness is at least 90%, cancellations are five or fewer, and after-hours work is unchanged.",
          "Reminder texts are installed, staff are trained, and leaders agree the rollout performed well.",
        ],
        correct: 1,
        answer: "CONSTELLATION COMPLETE: sustained outcome, process reliability, and balancing protection define recognizable arrival.",
        wrong: {
          0: "One favorable week may be noise. A target condition is a stable plateau, not a single bright point.",
          2: "Implementation activities are not outcomes. Training can finish while the original condition remains unchanged.",
        },
      },
    ],
  },
  5: {
    box: 5,
    a3Label: "Solutions Approach",
    concept: REMAINING_CHAMBER_CONCEPTS[5][0],
    concepts: REMAINING_CHAMBER_CONCEPTS[5],
    mythicTitle: "The Armory of Many Keys",
    wisdom: "Countermeasures earn their place by matching a verified root cause—not by looking impressive on the wall.",
    prologue: [
      "Forty-two pathology results waited more than three days last month. A gemba walk found that every result reached the correct Health Connect inbox, but the inbox flags only what is new—not what is becoming old. Staff manually sort the list when someone remembers.",
      "The armory offers staffing, software, reminders, and redesigned work. Choose the smallest keys that fit this verified cause and can be tested without placing patient follow-up at risk.",
    ],
    senseiBrief: "The brightest solution is not automatically the best one. Start with the verified cause, preserve options, and earn confidence through testing.",
    sceneLabel: "ROOT-SHAPED LOCK",
    sceneSymbol: "⚿",
    accent: "#f6a43c",
    glow: "#e75657",
    secondary: "#d7ff76",
    deep: "#160d0a",
    weapon: "The Quiver of Countermeasures",
    weaponKicker: "SET-BASED THINKING UNLOCKED",
    weaponDescription: "It carries several root-matched, testable responses—because humility keeps more than one arrow ready.",
    completionTitle: "Keys forged.",
    completionLead: "The armory grows quieter. The chosen set is modest, reversible, and ready to generate information rather than applause.",
    incantation: "Match the root. Preserve options. Prefer learning. Check what else the change might touch.",
    trials: [
      {
        id: "root-fit",
        glyph: "⚿",
        name: "Root-Cause Fit",
        clue: "Verified cause: the inbox shows new work but not aging work",
        prompt: "Which key is cut directly from the verified root cause?",
        coaching: "If the cause is true, why should this countermeasure change the condition?",
        options: [
          "Add two coordinators to reduce the pathology inbox during the morning period of peak volume.",
          "Add an aging indicator and a pull rule that brings the oldest result forward.",
          "Send weekly reminders asking staff to sort the pathology inbox more frequently during each shift.",
        ],
        correct: 1,
        answer: "KEY FORGED: the aging signal and pull rule directly address invisible old work without assuming that more people are the answer.",
        wrong: {
          0: "Capacity may help a symptom, but the verified cause was not a shortage of coordinators. More people can still overlook invisible aging.",
          2: "A reminder asks humans to compensate for missing system design. The lock remains the same shape.",
        },
      },
      {
        id: "set",
        glyph: "➹",
        name: "Countermeasure Set",
        clue: "Toyota humility: preserve alternatives long enough to learn",
        prompt: "Which approach creates options instead of making one expensive bet?",
        coaching: "What three responses could be tested without welding them together?",
        options: [
          "Test an aging flag, oldest-first sort, and midday sweep as separate small countermeasures.",
          "Choose the automated flag immediately because technology is more reliable than manual work.",
          "Combine every promising idea into one redesign and launch across all pathology teams.",
        ],
        correct: 0,
        answer: "KEY FORGED: three separable candidates preserve learning about which mechanism actually changes the work.",
        wrong: {
          1: "The brightest key has been selected before touching the lock. Technology can automate the same batch pattern without creating flow.",
          2: "When every idea moves together, no one can tell which mechanism helped—or which created harm.",
        },
      },
      {
        id: "pick",
        glyph: "◫",
        name: "Impact & Effort",
        clue: "Creativity before capital · high root fit · reversible first",
        prompt: "Which candidate belongs at the testing threshold?",
        coaching: "What can produce meaningful learning with the least irreversible commitment?",
        options: [
          "Pilot oldest-first sorting with one team: high root fit, low cost, reversible in one shift.",
          "Purchase enterprise pathology software: high visibility, high cost, and months before usable learning.",
          "Add an approval checkpoint: low cost, but it creates another queue before follow-up.",
        ],
        correct: 0,
        answer: "KEY FORGED: a small, root-matched, reversible countermeasure reaches the experiment chamber first.",
        wrong: {
          1: "Capital has arrived before evidence. A long procurement cycle delays learning and may automate waste.",
          2: "Low effort is not enough. A countermeasure that adds waiting has poor impact even when it is cheap.",
        },
      },
      {
        id: "guardrails",
        glyph: "∆",
        name: "Ripple Guard",
        clue: "Do not break law · harm people · or degrade quality",
        prompt: "What must be watched when the first key turns?",
        coaching: "Where could this improvement create a new problem?",
        options: [
          "Proceed because faster review is the only outcome that matters during a short experimental pilot.",
          "Check review speed, missed results, staff workload, and whether urgent findings remain prioritized.",
          "Delay testing until the team can guarantee the countermeasure will create no unintended consequences.",
        ],
        correct: 1,
        answer: "ARMORY UNLOCKED: the candidate enters testing with outcome, process, safety, and workload guardrails visible.",
        wrong: {
          0: "A narrow success measure can hide shifted harm. Fast assignment is not improvement if quality or priority logic deteriorates.",
          2: "Learning cannot begin after certainty; certainty is what the small, guarded test is designed to build.",
        },
      },
    ],
  },
  6: {
    box: 6,
    a3Label: "Rapid Experiments",
    concept: REMAINING_CHAMBER_CONCEPTS[6][0],
    concepts: REMAINING_CHAMBER_CONCEPTS[6],
    mythicTitle: "The Clockwork PDSA Laboratory",
    wisdom: "A small test is built to learn, not to prove the team was right. Prediction turns action into science.",
    prologue: [
      "A chart review shows that 31% of patients leave GI consultations without a printed next-step summary. The team proposes a room-closing prompt, but nobody knows whether it will help—or slow the visit.",
      "The PDSA apparatus can test the idea with one physician, one medical assistant, one half-day, and ten visits. Make a prediction, study the work, and choose the next turn.",
    ],
    senseiBrief: "Keep the test small enough to repeat tomorrow and real enough to teach us something today.",
    sceneLabel: "PDSA LEARNING ENGINE",
    sceneSymbol: "↻",
    accent: "#75e2e6",
    glow: "#30b5e6",
    secondary: "#ffc45e",
    deep: "#05151b",
    weapon: "The PDSA Orb",
    weaponKicker: "ACTION NOW PRODUCES INFORMATION",
    weaponDescription: "It remembers every prediction, deviation, surprise, and decision—turning small action into the next better theory.",
    completionTitle: "Cycle awakened.",
    completionLead: "The machine does not declare victory. It produces something more useful: evidence for the next turn.",
    incantation: "Predict. Test small. Record what happened. Study the difference. Choose the next cycle.",
    trials: [
      {
        id: "plan",
        glyph: "P",
        name: "Plan Small",
        clue: "One physician · one medical assistant · one half-day · ten visits",
        prompt: "Which plan creates the fastest safe learning cycle?",
        coaching: "How small can the test be while still teaching us something real?",
        options: [
          "Test the room-closing prompt with one physician, one assistant, and Tuesday morning’s ten visits.",
          "Deploy the new prompt to every GI clinic for one month and compare averages.",
          "Discuss the prompt at committee and ask whether staff believe it could work.",
        ],
        correct: 0,
        answer: "GEAR ENGAGED: the test is bounded, real, safe, and small enough to learn again tomorrow.",
        wrong: {
          1: "That is implementation disguised as a test. Failure would disrupt every clinic and reveal too many variables at once.",
          2: "Opinion can refine a plan, but only action in real work produces evidence about the mechanism.",
        },
      },
      {
        id: "predict",
        glyph: "→",
        name: "Prediction",
        clue: "If we change X, then measure Y by time Z",
        prompt: "Which statement makes the team’s theory testable?",
        coaching: "What exactly do you expect to happen before you run the test?",
        options: [
          "If the prompt works, staff should feel that visit closure is more organized and reliable.",
          "If used, at least nine of ten patients will leave with summaries and closure adds under two minutes.",
          "If successful, the missing-summary problem should be solved without requiring another test cycle.",
        ],
        correct: 1,
        answer: "GEAR ENGAGED: the prediction names the population, outcome threshold, and workload guardrail before the test begins.",
        wrong: {
          0: "Perception matters, but “feel organized” cannot test whether patients actually received the summary.",
          2: "One cycle cannot prove permanent resolution. The prediction has promised more than the test can know.",
        },
      },
      {
        id: "study",
        glyph: "S",
        name: "Study the Truth",
        clue: "Expected and unexpected observations both belong in the record",
        prompt: "What evidence should the team collect during the test?",
        coaching: "What happened—not only what supports the prediction?",
        options: [
          "Record summary delivery, closure time, missed visits, interruptions, and workarounds for all ten encounters.",
          "Count only visits with summaries so the team can quickly determine whether the pilot passed.",
          "Ask participants for general impressions afterward instead of collecting visit-level observations during work.",
        ],
        correct: 0,
        answer: "GEAR ENGAGED: the study record can compare predicted and actual work without hiding surprises.",
        wrong: {
          1: "Evidence has been filtered toward success. The referrals that miss the target may carry the most useful learning.",
          2: "Memory and impressions blur the mechanism. Collection must be designed before the test begins.",
        },
      },
      {
        id: "act",
        glyph: "A",
        name: "Choose the Turn",
        clue: "Prediction 9/10 · actual 8/10 · closure +1.4 min · two break-coverage misses",
        prompt: "What is the scientifically honest next action?",
        coaching: "Adopt, adapt, or abandon—and what did the difference teach us?",
        options: [
          "Adopt across all sites because performance improved and visit closure stayed under two minutes.",
          "Adapt break coverage, then repeat another ten-visit test during tomorrow’s morning clinic.",
          "Abandon the prompt because the first test missed the nine-of-ten prediction by one patient.",
        ],
        correct: 1,
        answer: "CYCLE COMPLETE: partial success plus a specific deviation calls for adaptation and another rapid turn.",
        wrong: {
          0: "Promising is not proven. Scaling now would carry an observed break-coverage defect into every site.",
          2: "The theory produced improvement and exposed one repairable condition. Missing the prediction is information, not disgrace.",
        },
      },
    ],
  },
  7: {
    box: 7,
    a3Label: "Completion Plan",
    concept: REMAINING_CHAMBER_CONCEPTS[7][0],
    concepts: REMAINING_CHAMBER_CONCEPTS[7],
    mythicTitle: "The Expedition Ledger",
    wisdom: "A plan without named owners, dates, dependencies, and sustainment is a wish wearing armor.",
    prologue: [
      "A redesigned bowel-prep instruction checklist has completed three safe tests at one endoscopy center: 28 of 30 patients arrived ready, and nursing call time fell. Four centers now want to adopt it over four weeks.",
      "The expedition begins here. Turn a promising local result into a route with named owners, dates, dependencies, escalation, and sustainment.",
    ],
    senseiBrief: "A useful plan answers five questions at a glance: who, what, when, what comes first, and who keeps it working.",
    sceneLabel: "FOUR-WEEK EXPEDITION",
    sceneSymbol: "⚑",
    accent: "#8cc23d",
    glow: "#d7ff76",
    secondary: "#75e2e6",
    deep: "#09150d",
    weapon: "The Commander's War Map",
    weaponKicker: "WHO · WHAT · WHEN · SUSTAIN",
    weaponDescription: "Every mark binds a concrete deliverable to one owner, one due date, its dependencies, and the cadence that keeps it alive.",
    completionTitle: "Road provisioned.",
    completionLead: "The caravan can now move without guessing who carries each task or when the next bridge must be ready.",
    incantation: "Name the deliverable. Name one owner. Mark the date. Expose dependencies. Patrol the standard.",
    trials: [
      {
        id: "ownership",
        glyph: "01",
        name: "Owner & Date",
        clue: "Concrete deliverable · one accountable name · visible deadline",
        prompt: "Which ledger entry can survive the first river crossing?",
        coaching: "Who produces exactly what—and by when?",
        options: [
          "Operations will finalize the prep checklist soon and distribute it when every center is ready.",
          "Maya finalizes the prep checklist Friday; Luis validates language access and exceptions Monday.",
          "The project team shares responsibility for completing preparation materials during the planned rollout.",
        ],
        correct: 1,
        answer: "ROUTE MARKED: two deliverables, two accountable owners, and two dates make execution inspectable.",
        wrong: {
          0: "A department and 'soon' cannot be held accountable. The wagon carries no visible finish line.",
          2: "Shared responsibility often means invisible responsibility. Each deliverable needs one person answerable for completion.",
        },
      },
      {
        id: "sequence",
        glyph: "02",
        name: "Dependencies",
        clue: "Finalize → translate → validate → train → staged rollout",
        prompt: "Which sequence prevents downstream work from outrunning its prerequisites?",
        coaching: "What must be true before the next task can begin?",
        options: [
          "Train all staff immediately while translations, exceptions, and printing workflows remain under development.",
          "Sequence final checklist, translations, patient validation, staff training, and then staged rollout.",
          "Let each center choose its own sequence so local teams can move at their preferred pace.",
        ],
        correct: 1,
        answer: "ROUTE MARKED: the path exposes prerequisite work instead of discovering dependencies through delay.",
        wrong: {
          0: "Training unfinished work creates confusion and rework. The expedition has departed before its bridge is built.",
          2: "Local adaptation matters, but incompatible sequences can strand shared technology, standards, and support.",
        },
      },
      {
        id: "control",
        glyph: "03",
        name: "Control Cadence",
        clue: "Blockers visible within days—not discovered after four weeks",
        prompt: "Which control system keeps the implementation plan alive?",
        coaching: "When and where will blocked work become impossible to hide?",
        options: [
          "Review blockers in twice-weekly huddles; named owners escalate overdue dependencies within one working day.",
          "Ask team members to email the project lead whenever they believe a task may become delayed.",
          "Wait until the four-week rollout ends, then review which planned milestones were missed and why.",
        ],
        correct: 0,
        answer: "ROUTE MARKED: a fixed cadence and escalation rule transform the plan from a document into a control system.",
        wrong: {
          1: "Optional email depends on individual judgment and courage. Blockers need a routine place to surface.",
          2: "A retrospective cannot rescue an implementation that was allowed to drift for four weeks.",
        },
      },
      {
        id: "sustain",
        glyph: "04",
        name: "Sustainment Patrol",
        clue: "The project ends · ownership of the standard does not",
        prompt: "Which final entry prevents the completed road from disappearing?",
        coaching: "Who owns the standard after the project team leaves?",
        options: [
          "Mark implementation complete once training attendance reaches 100 percent across every participating center.",
          "Assign a monthly audit owner, publish readiness reliability, and define a response below 90 percent.",
          "Keep the project team active indefinitely so original members can personally prevent checklist drift.",
        ],
        correct: 1,
        answer: "EXPEDITION READY: operational ownership, audit cadence, measure, and response survive the temporary project team.",
        wrong: {
          0: "Attendance measures exposure to training, not whether the new process continues to work.",
          2: "A permanent project team is not standard work. Sustainment must belong to the operating system.",
        },
      },
    ],
  },
  8: {
    box: 8,
    a3Label: "Confirmed State",
    concept: REMAINING_CHAMBER_CONCEPTS[8][0],
    concepts: REMAINING_CHAMBER_CONCEPTS[8],
    mythicTitle: "The Dragon's Tribunal",
    wisdom: "Implementation is not victory. Outcome, mechanism, and balancing measures must all testify before the state is confirmed.",
    prologue: [
      "Eight weeks ago, one endoscopy center launched text reminders linked to a five-day bowel-prep readiness check. Late cancellations fell from 17 to 6 per month, and checklist completion reached 92%.",
      "There is a complication: inbound patient messages rose 22%. Hear the outcome, mechanism, and balancing witnesses before the tribunal decides whether the new state is truly confirmed.",
    ],
    senseiBrief: "Implementation tells us what we did. These three measures tell us whether the system actually improved.",
    sceneLabel: "THREE-MEASURE TRIBUNAL",
    sceneSymbol: "⚖",
    accent: "#f276ad",
    glow: "#981f59",
    secondary: "#75e2e6",
    deep: "#160813",
    weapon: "The Threefold Mirror",
    weaponKicker: "PREDICTED ≠ ACTUAL UNTIL MEASURED",
    weaponDescription: "It reflects outcome, process, and balancing evidence together—never implementation activity dressed as success.",
    completionTitle: "Verdict rendered.",
    completionLead: "The tribunal refuses both celebration and despair. One mechanism worked; one balancing harm demands another bounded cycle.",
    incantation: "Compare target to actual. Test the mechanism. Look for harm. Then sustain, adapt, or reopen the theory.",
    trials: [
      {
        id: "outcome",
        glyph: "★",
        name: "Outcome Testimony",
        clue: "Late-cancellation target ≤7/month for 8 weeks · actual 6/month for 8 weeks",
        prompt: "What does the primary outcome evidence permit the team to say?",
        coaching: "Did the actual result meet the stated target—yes or no?",
        options: [
          "Yes—the outcome met target: late cancellations remained at six per month for eight weeks.",
          "No—the result cannot count until every scheduled patient arrives fully prepared for endoscopy.",
          "Yes—the rollout succeeded because staff completed training and the reminder texts launched.",
        ],
        correct: 0,
        answer: "TESTIMONY ACCEPTED: the primary outcome met its magnitude and duration criteria.",
        wrong: {
          1: "The target was a monthly threshold, not perfection for every patient. Change the verdict only if the target changes.",
          2: "Training and launch are implementation activities. They cannot testify about the patient-facing result.",
        },
      },
      {
        id: "process",
        glyph: "⚙",
        name: "Mechanism Testimony",
        clue: "Five-day readiness checklist: target ≥90% · actual 92%",
        prompt: "What does the process evidence say about the countermeasure’s mechanism?",
        coaching: "Did the changed work behave as the theory predicted?",
        options: [
          "The mechanism is supported: 92 percent completed the five-day readiness check against the 90 percent threshold.",
          "The mechanism is proven because cancellations fell after the reminder texts were launched.",
          "The mechanism failed because eight percent of patients still missed the readiness threshold during audits.",
        ],
        correct: 0,
        answer: "TESTIMONY ACCEPTED: the process measure crossed its predefined reliability threshold without claiming perfection.",
        wrong: {
          1: "Timing alone cannot prove mechanism. The process measure is what tests whether the changed work actually occurred.",
          2: "The standard was 90 percent, not 100. A threshold should not be rewritten after seeing the data.",
        },
      },
      {
        id: "balance",
        glyph: "♥",
        name: "Balancing Testimony",
        clue: "Inbound patient messages: baseline 100/week · actual 122/week",
        prompt: "How must the balancing result affect the confirmed-state verdict?",
        coaching: "What became worse while the headline measure improved?",
        options: [
          "The result remains confirmed because cancellation reduction matters more than additional patient-message volume.",
          "The confirmed state is incomplete: messages rose 22 percent, revealing a workload and clarity concern.",
          "Ignore message volume until next quarter because balancing measures often lag behind primary outcomes.",
        ],
        correct: 1,
        answer: "TESTIMONY ACCEPTED: the reminder may have shifted burden into questions, so the full target condition is not yet confirmed.",
        wrong: {
          0: "Different measures cannot be traded casually. The team must understand whether message volume signals confusion or needed support.",
          2: "The harm is already visible. Waiting longer does not make current evidence disappear.",
        },
      },
      {
        id: "verdict",
        glyph: "?",
        name: "The Verdict",
        clue: "Outcome yes · mechanism yes · balancing protection no",
        prompt: "Which decision respects all three witnesses?",
        coaching: "Sustain, adapt, or reopen—and which part of the theory should remain?",
        options: [
          "Standardize the full workflow now because the outcome and process measures both passed their targets.",
          "Simplify the message, run another bounded cycle, and preserve the five-day readiness check that worked.",
          "Restart the entire A3 because any balancing-measure miss proves the original problem was chosen incorrectly.",
        ],
        correct: 1,
        answer: "TRIBUNAL COMPLETE: preserve the supported mechanism, repair the balancing harm, and test the revised system again.",
        wrong: {
          0: "Two green measures cannot overrule one explicit harm. Standardizing now would institutionalize rework.",
          2: "The cancellation problem and readiness mechanism remain supported. The evidence calls for adaptation, not total restart.",
        },
      },
    ],
  },
  9: {
    box: 9,
    a3Label: "Insights",
    concept: REMAINING_CHAMBER_CONCEPTS[9][0],
    concepts: REMAINING_CHAMBER_CONCEPTS[9],
    mythicTitle: "Return with the Elixir",
    wisdom: "The enduring transformation is not merely the changed process—it is the more capable problem-solver who returns.",
    prologue: [
      "A four-week post-procedure follow-up pilot is ending. Portal questions fell 34%, yet the most surprising finding came from patient interviews: a clear name and callback path mattered more than receiving an additional routine phone call.",
      "One week also collapsed when the designated nurse was away. Distill the success, surprise, and vulnerability into learning another team can test—not a polished victory story.",
    ],
    senseiBrief: "Do not polish the story. Name what surprised us, what we will do differently, and what another team needs to know.",
    sceneLabel: "HANSEI SUMMIT",
    sceneSymbol: "◉",
    accent: "#b996ff",
    glow: "#7e57c2",
    secondary: "#ffc45e",
    deep: "#100b1c",
    weapon: "The Elixir of Hansei",
    weaponKicker: "REFLECTION BECOMES CAPABILITY",
    weaponDescription: "It preserves success, failure, surprise, emotion, and changed thinking—then carries them outward through yokoten.",
    completionTitle: "Wisdom returned.",
    completionLead: "One mountain is complete. The horizon is larger, the next ascent is visible, and the climbers are more capable together.",
    incantation: "Tell what changed your mind. Name what you felt. Change the next approach. Share the whole learning.",
    trials: [
      {
        id: "learning",
        glyph: "01",
        name: "Evidence Changed Us",
        clue: "Questions fell 34% · patients valued a clear callback path · single-role coverage failed",
        prompt: "Which reflection preserves the most useful learning from the journey?",
        coaching: "What did the evidence teach—not what story makes the project look best?",
        options: [
          "The project succeeded because the team selected a strong solution and executed the pilot efficiently.",
          "We learned that a clear callback path reduced uncertainty, while single-role coverage made it fragile.",
          "The main lesson is that nurses need clearer accountability whenever follow-up work is introduced.",
        ],
        correct: 1,
        answer: "ELIXIR DISTILLED: the reflection names the supported mechanism and the newly exposed vulnerability without polishing either away.",
        wrong: {
          0: "A victory story erases the balancing harm and the humility of countermeasure thinking.",
          2: "Accountability is an interpretation broad enough to become blame. The actual learning was more specific.",
        },
      },
      {
        id: "emotion",
        glyph: "02",
        name: "The Human Lesson",
        clue: "Hansei includes how uncertainty changed the team’s behavior",
        prompt: "Which reflection turns discomfort into problem-solving capability?",
        coaching: "How did the journey change the way the team responded to not knowing?",
        options: [
          "Uncertainty during early tests helped us ask better questions instead of defending our first design.",
          "The team should avoid discussing emotions because reflection must remain objective and evidence-based.",
          "Frustration showed that resistant staff should receive additional training before future workflow changes.",
        ],
        correct: 0,
        answer: "ELIXIR DISTILLED: uncertainty becomes a cue for inquiry rather than certainty, concealment, or blame.",
        wrong: {
          1: "Emotions influence behavior whether named or not. Hansei studies the problem-solver as part of the system.",
          2: "Frustration has been converted into a diagnosis of other people. Reflection begins with our own thinking and actions.",
        },
      },
      {
        id: "next-time",
        glyph: "03",
        name: "The Next Ascent",
        clue: "Insight must change the next cycle before it becomes wisdom",
        prompt: "Which commitment demonstrates that learning will alter future practice?",
        coaching: "What will you do differently next time—before the first experiment?",
        options: [
          "Next time, test absence coverage early and invite patients to shape the first prototype.",
          "Next time, develop a complete rollout plan before exposing staff to unfinished experimental work.",
          "Next time, begin with the countermeasure leaders believe has the highest probability of success.",
        ],
        correct: 0,
        answer: "ELIXIR DISTILLED: the lesson changes measurement and collaboration at the start of the next cycle.",
        wrong: {
          1: "A complete rollout before experimentation repeats the big-bang trap. Unfinished learning is the purpose of a safe test.",
          2: "Leadership confidence cannot replace root-cause fit or small-scale evidence.",
        },
      },
      {
        id: "yokoten",
        glyph: "04",
        name: "Carry It Outward",
        clue: "Yokoten shares learning horizontally without forcing untested copying",
        prompt: "How should the team offer its elixir to another clinic?",
        coaching: "What must travel with the result so others can learn rather than merely comply?",
        options: [
          "Send the finished workflow to every clinic and require adoption so others benefit immediately.",
          "Share the A3, assumptions, failures, and guardrails; let another clinic run its own small test.",
          "Present only the final results and successful countermeasure so the story remains concise and persuasive.",
        ],
        correct: 1,
        answer: "RETURN COMPLETE: the whole learning travels, while the receiving team retains responsibility to test in its own context.",
        wrong: {
          0: "Forced copying mistakes standardization for learning. Local context still deserves a small test.",
          2: "A polished success story withholds the assumptions and failures another team needs most.",
        },
      },
    ],
  },
};

export function isRemainingBoxNumber(value: number): value is RemainingBoxNumber {
  return value === 3 || value === 5 || value === 6 || value === 7 || value === 8 || value === 9;
}

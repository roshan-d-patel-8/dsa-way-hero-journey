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
      "The referral team agrees that access should be faster. But “faster” gives no one a finish line.",
      "Your mission is to build a target the team could recognize during a real clinic day—and confirm with data.",
    ],
    senseiBrief: "Set four coordinates: how much, by when, what the future work will look like, and what must not get worse.",
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
        clue: "Baseline: median referral-to-disposition time 24 days · standard: 14 days",
        prompt: "Which inscription creates a measurable destination rather than a hopeful direction?",
        coaching: "How much improvement—and by exactly when?",
        options: [
          "Improve referral access and reduce delays as much as possible during the coming quarter.",
          "By November 30, reduce median referral-to-disposition time from 24 to 14 days or less.",
          "Launch a centralized queue and new dashboard by November 30 to accelerate referral review.",
        ],
        correct: 1,
        answer: "STAR FIXED: the target names baseline, magnitude, threshold, and date without prescribing the route.",
        wrong: {
          0: "The telescope finds aspiration but no finish line. 'Improve' and 'as much as possible' cannot confirm arrival.",
          2: "That inscription names projects, not the condition they must create. The destination should survive even if the route changes.",
        },
      },
      {
        id: "condition",
        glyph: "◇",
        name: "Future Condition",
        clue: "The target must be visible during a future gemba walk",
        prompt: "What should an observer actually see when the new condition exists?",
        coaching: "Can the future process be rehearsed and recognized—not merely admired?",
        options: [
          "At each weekday check, at least 90 percent of routine referrals have entered active review within four working hours.",
          "Staff collaborate more effectively and communicate clearly about referrals throughout each working day.",
          "A referral coordinator calls every patient and personally manages all outstanding work to completion.",
        ],
        correct: 0,
        answer: "STAR FIXED: the desired work is observable, time-bounded, and independent of one preselected staffing design.",
        wrong: {
          1: "The words sound good but remain invisible. An observer cannot reliably recognize 'more effectively' on the gemba.",
          2: "A named role and method have replaced the target condition. Box 3 describes what good looks like, not the chosen countermeasure.",
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
          "Reach the access target without increasing clinician after-hours review or rejected incomplete referrals.",
          "Reach the access target even if staff require temporary overtime throughout the first month.",
          "Measure only median disposition time because additional indicators make the target unnecessarily complicated.",
        ],
        correct: 0,
        answer: "STAR FIXED: patient flow, staff workload, and referral quality must improve as one designed condition.",
        wrong: {
          1: "The target purchases speed with staff burden. A future condition is not good if it exports the pain.",
          2: "One bright metric can conceal a darker system. Balancing measures reveal where improvement has merely moved the problem.",
        },
      },
      {
        id: "acceptance",
        glyph: "✦",
        name: "Arrival Test",
        clue: "A target must distinguish a stable condition from a lucky week",
        prompt: "Which signal proves the team has reached the intended plateau?",
        coaching: "How long must the condition hold—and what else must be true?",
        options: [
          "The target is met after one unusually quiet week records a median below fourteen days.",
          "For eight weeks, median disposition is ≤14 days, 90% enter active review within four hours, and after-hours work is unchanged.",
          "The workflow is installed, staff are trained, and leaders agree the rollout performed well.",
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
      "The team has verified the gap: the referral pool is covered, but new work waits between two scheduled review windows.",
      "The armory offers staffing, software, reminders, and redesigned rules. Your mission is to choose small countermeasures that match the cause and can be tested safely.",
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
        clue: "Verified cause: no pull signal between scheduled review windows",
        prompt: "Which key is cut directly from the verified root cause?",
        coaching: "If the cause is true, why should this countermeasure change the condition?",
        options: [
          "Add two coordinators to reduce the shared queue during the morning period of peak volume.",
          "Create a visible pull signal that prompts the covering reviewer to take the oldest waiting referral.",
          "Send weekly reminders asking reviewers to inspect the shared queue more frequently during each shift.",
        ],
        correct: 1,
        answer: "KEY FORGED: the pull signal directly addresses waiting between review windows without assuming that more people or reminders are the answer.",
        wrong: {
          0: "Capacity may help a symptom, but the verified cause was not a shortage of coordinators. More people can still work around the same batch schedule.",
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
          "Test a pull signal, an aging indicator, and a midday queue sweep as separate small countermeasures.",
          "Choose the automated flag immediately because technology is more reliable than a manual process change.",
          "Combine every promising idea into one comprehensive redesign and launch it across all participating sites.",
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
          "Pilot the visible pull rule with one team: high root fit, low cost, reversible within one shift.",
          "Purchase enterprise referral software: high visibility, high cost, and several months before usable learning.",
          "Add an approval checkpoint: low cost, but it creates another queue before clinical review.",
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
          "Proceed because faster assignment is the only outcome that matters during a short experimental pilot.",
          "Check assignment speed, incomplete-referral defects, staff workload, and whether urgent referrals remain prioritized.",
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
      "The team is ready to try an oldest-first pull signal. A region-wide rollout would create activity; one morning can create learning.",
      "Your mission is to make a prediction, test safely, study what actually happened, and choose the next cycle.",
    ],
    senseiBrief: "Keep the test small enough to repeat tomorrow and real enough to teach us something today.",
    sceneLabel: "PDSA LEARNING ENGINE",
    sceneSymbol: "↻",
    accent: "#75e2e6",
    glow: "#30b5e6",
    secondary: "#ffc45e",
    deep: "#05151b",
    weapon: "The Clockwork Learning Orb",
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
        clue: "One coordinator · one reviewer · one morning · ten referrals",
        prompt: "Which plan creates the fastest safe learning cycle?",
        coaching: "How small can the test be while still teaching us something real?",
        options: [
          "Pilot the oldest-first pull rule with one coordinator, one reviewer, and Tuesday morning's first ten referrals.",
          "Deploy the new rule to every specialty clinic for one month and compare the monthly averages.",
          "Discuss the rule at the next committee meeting and ask whether staff believe it could work.",
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
          "If the pull signal works, staff should feel that the shared queue is more organized and fair.",
          "If the signal is used, median receipt-to-active-review time for ten referrals will fall below four hours.",
          "If the rule succeeds, the referral problem should be solved without requiring another test cycle.",
        ],
        correct: 1,
        answer: "GEAR ENGAGED: the prediction names the mechanism, population, measure, and expected threshold.",
        wrong: {
          0: "Perception matters, but 'feel organized' cannot test whether receipt-to-review time actually changed.",
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
          "Record assignment time, deviations, urgent-case handling, and unexpected workarounds for every test referral.",
          "Count only referrals meeting the target so the team can quickly determine whether the pilot passed.",
          "Ask participants for general impressions after the pilot instead of interrupting work with detailed data collection.",
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
        clue: "Prediction <4h · actual 4.5h · urgent handling safe · one break-coverage miss",
        prompt: "What is the scientifically honest next action?",
        coaching: "Adopt, adapt, or abandon—and what did the difference teach us?",
        options: [
          "Adopt across all sites because performance improved and no patient-safety event occurred during the test.",
          "Adapt the break-coverage rule, then repeat another ten-referral test during tomorrow's morning shift.",
          "Abandon oldest-first because the first test missed the four-hour prediction by thirty minutes.",
        ],
        correct: 1,
        answer: "CYCLE COMPLETE: partial success plus a specific deviation calls for adaptation and another rapid turn.",
        wrong: {
          0: "Promising is not proven. Scaling now would carry an observed coverage defect into every site.",
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
      "Three rapid cycles have produced a reliable referral-pull rule on one team. Now four clinics need to adopt it over four weeks.",
      "Your mission is to turn the result into a plan with named owners, dates, dependencies, escalation, and sustainment.",
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
          "Operations will finalize the referral-pull standard soon and distribute it when every participant is ready.",
          "Maya drafts the referral-pull standard by Friday; Luis validates urgent-referral exceptions on Monday.",
          "The project team shares responsibility for completing the referral standard during the planned rollout.",
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
        clue: "Standard → build → validate → train → staged rollout",
        prompt: "Which sequence prevents downstream work from outrunning its prerequisites?",
        coaching: "What must be true before the next task can begin?",
        options: [
          "Train all staff immediately while IT, escalation rules, and coverage schedules remain under development.",
          "Sequence pull standard, aging signal, exception validation, staff training, and then staged rollout.",
          "Let each clinic choose its own sequence so local teams can move at their preferred pace.",
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
          "Mark implementation complete once training attendance reaches 100 percent across every participating clinic.",
          "Assign a monthly audit owner, publish four-hour reliability, and define a response when performance falls below 90 percent.",
          "Keep the project team active indefinitely so original members can personally prevent the process from drifting.",
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
      "Eight weeks after rollout, the headline result is good: median referral-to-disposition time is down from 24 to 13 days.",
      "But incomplete referrals are being returned more often. Your mission is to hear all three witnesses—outcome, process, and balancing measures—before declaring victory.",
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
        clue: "Referral-to-disposition target ≤14 days for 8 weeks · actual 13 days for 8 weeks",
        prompt: "What does the primary outcome evidence permit the team to say?",
        coaching: "Did the actual result meet the Box 3 target—yes or no?",
        options: [
          "Yes—the outcome met target: median referral-to-disposition time remained 13 days for eight consecutive weeks.",
          "No—the result cannot count until every referral is reviewed in exactly fourteen days.",
          "Yes—the rollout succeeded because staff completed training and the pull signal launched.",
        ],
        correct: 0,
        answer: "TESTIMONY ACCEPTED: the primary outcome met its magnitude and duration criteria.",
        wrong: {
          1: "The target was a median threshold, not perfection for every referral. Change the verdict only if the target itself changes.",
          2: "Training and launch are implementation activities. They cannot testify about the patient-facing result.",
        },
      },
      {
        id: "process",
        glyph: "⚙",
        name: "Mechanism Testimony",
        clue: "Active review within 4 working hours: target ≥90% · actual 94%",
        prompt: "What does the process evidence say about the countermeasure’s mechanism?",
        coaching: "Did the changed work behave as the theory predicted?",
        options: [
          "The mechanism is supported: 94 percent entered active review within four working hours against the 90 percent threshold.",
          "The mechanism is proven because disposition time improved after the pull signal was launched.",
          "The mechanism failed because six percent of referrals still missed the four-hour threshold during audits.",
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
        clue: "Incomplete-referral returns: baseline 8% · actual 15%",
        prompt: "How must the balancing result affect the confirmed-state verdict?",
        coaching: "What became worse while the headline measure improved?",
        options: [
          "The result remains confirmed because disposition time improved more than incomplete-return volume worsened.",
          "The confirmed state is incomplete: returns rose from 8 to 15 percent, revealing a balancing-measure harm.",
          "Ignore incomplete returns until next quarter because balancing measures often lag behind primary outcomes.",
        ],
        correct: 1,
        answer: "TESTIMONY ACCEPTED: faster review shifted burden into rework, so the full target condition is not yet confirmed.",
        wrong: {
          0: "Different measures cannot be traded casually. The target explicitly protected referral quality from degradation.",
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
          "Adapt completeness checks, run another bounded cycle, and preserve the pull signal that worked.",
          "Return to Box 1 because any balancing-measure miss proves the original problem was incorrectly chosen.",
        ],
        correct: 1,
        answer: "TRIBUNAL COMPLETE: preserve the supported mechanism, repair the balancing harm, and test the revised system again.",
        wrong: {
          0: "Two green measures cannot overrule one explicit harm. Standardizing now would institutionalize rework.",
          2: "The original access problem and pull mechanism remain supported. The evidence calls for adaptation, not total restart.",
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
      "The referral project is closing. Review time improved, and the team also discovered that one change shifted work into rework.",
      "Your final mission is to preserve what changed the team’s thinking—and share the whole learning so another clinic can test it in its own setting.",
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
        clue: "Ownership improved flow · weak completeness checks shifted delay into rework",
        prompt: "Which reflection preserves the most useful learning from the journey?",
        coaching: "What did the evidence teach—not what story makes the project look best?",
        options: [
          "The project succeeded because the team selected a strong solution and executed the rollout efficiently.",
          "We learned the pull signal shortened waiting, while weak completeness checks shifted delay into rework.",
          "The main lesson is that staff need clearer accountability whenever a new workflow is introduced.",
        ],
        correct: 1,
        answer: "ELIXIR DISTILLED: the reflection links evidence to both the supported mechanism and the newly exposed weakness.",
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
          "Next time, define balancing measures before the first test and invite downstream staff into planning.",
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

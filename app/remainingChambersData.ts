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
    wisdom: "Better is not a destination. Describe what should improve, by how much, by when, and how the work should happen.",
    prologue: [
      "Monday begins with a warning from Radiology: only 58% of next week’s scheduled MRI scans have a completed preparation-readiness review. The review checks whether appointment instructions were received and preparation questions were addressed. Seventeen scans were cancelled late last month, and the scheduling team is making rescue calls after hours.",
      "The observatory needs a true destination—not the vague wish to “improve preparation.” Fix four coordinates so everyone can recognize arrival during an ordinary clinic week.",
    ],
    senseiBrief: "Set the amount of improvement, the date, and what people should see happening. Agree on limits for extra work or unintended harm.",
    sceneLabel: "TARGET CONSTELLATION",
    sceneSymbol: "✦",
    accent: "#ffd65a",
    glow: "#f08f24",
    secondary: "#75e2e6",
    deep: "#07141d",
    weapon: "The North Star Compass",
    weaponKicker: "DEFINITION OF SUCCESS LOCKED",
    weaponDescription: "It points toward a clear goal: how much, by when, what people should see, and what must not get worse.",
    completionTitle: "Destination drawn.",
    completionLead: "The fog lifts. Everyone can now describe what good looks like—and know whether the expedition has arrived.",
    incantation: "Name how much. Name by when. Show what good looks like. Protect what must not worsen.",
    trials: [
      {
        id: "magnitude",
        glyph: "◎",
        name: "How Much & By When?",
        clue: "Starting readiness 58% · late cancellations 17/month",
        prompt: "Which inscription creates a measurable destination rather than a hopeful direction?",
        coaching: "How much improvement—and by exactly when?",
        options: [
          "Improve MRI preparation readiness and reduce avoidable cancellations during the coming quarter.",
          "By December 15, raise MRI readiness-review completion two working days before scans from 58 to at least 90 percent.",
          "Launch reminder texts and a Radiology scheduling dashboard by December 15 for every patient.",
        ],
        correct: 1,
        answer: "STAR FIXED: the goal names the starting level, required result, and date while leaving the choice of change open.",
        wrong: {
          0: "The telescope finds aspiration but no finish line. “Improve” cannot confirm arrival.",
          2: "That inscription names projects, not the condition they must create. The destination should survive if the route changes.",
        },
      },
      {
        id: "condition",
        glyph: "◇",
        name: "What Should Happen?",
        clue: "Describe what an observer should see during a real clinic week",
        prompt: "What should an observer see when the improved process is working?",
        coaching: "Could someone walk through these steps and recognize success?",
        options: [
          "Two working days before MRI scans, at least 90 percent of patients have a documented readiness review.",
          "Staff communicate more effectively and help patients feel increasingly prepared for MRI scans.",
          "An MRI coordinator calls every patient and personally resolves all remaining readiness questions.",
        ],
        correct: 0,
        answer: "STAR FIXED: an observer can see whether the readiness review is complete on time. The team can still choose how to achieve that.",
        wrong: {
          1: "The words sound good but remain vague. An observer watching the work cannot reliably judge 'more effectively'.",
          2: "A named role and method have replaced the goal. Describe what good looks like before choosing the route.",
        },
      },
      {
        id: "balance",
        glyph: "⚖",
        name: "Patients & the Team",
        clue: "Speed must not purchase hidden harm elsewhere",
        prompt: "Which limit protects patients and staff while readiness improves?",
        coaching: "What must not worsen while more patients become ready?",
        options: [
          "Reach the readiness target without increasing scheduling staff’s after-hours work or confusing patient messages.",
          "Reach the readiness target even if scheduling staff require overtime throughout the first month.",
          "Measure only readiness-review completion because additional indicators make the target unnecessarily complicated.",
        ],
        correct: 0,
        answer: "STAR FIXED: the goal includes patient readiness, clear messages, and limits on extra staff work.",
        wrong: {
          1: "The target purchases speed with staff burden. A future condition is not good if it exports the pain.",
          2: "One good result can hide a new problem. Balancing measures check whether a change adds workload or causes problems elsewhere.",
        },
      },
      {
        id: "acceptance",
        glyph: "✦",
        name: "Arrival Test",
        clue: "Local arrival test: readiness ≥90% · late cancellations ≤5/month · unchanged after-hours work · sustained for 8 weeks",
        prompt: "Which evidence shows that the team has met the full goal over time?",
        coaching: "How long must the condition hold—and what else must be true?",
        options: [
          "The target is met after one unusually quiet week reaches 90 percent readiness.",
          "Across eight weeks, readiness stays at least 90%, monthly cancellations stay at five or fewer, and after-hours work is unchanged.",
          "Reminder texts are installed, staff are trained, and leaders agree the rollout performed well.",
        ],
        correct: 1,
        answer: "CONSTELLATION COMPLETE: fewer cancellations, consistent readiness reviews, and unchanged after-hours work show the full goal is being met.",
        wrong: {
          0: "One favorable week may reflect ordinary ups and downs. Look for results that stay near the improved level over time.",
          2: "Training and installing reminders show that tasks were completed. Check whether patients are actually better prepared.",
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
    wisdom: "A change earns its place by addressing the cause the team identified. An impressive idea still needs testing.",
    prologue: [
      "At a Dermatology clinic, 42 finalized skin-biopsy reports waited more than three working days for clinician review and patient communication last month. Every report reached the correct Health Connect results inbox, but the inbox flags only what is new—not what is becoming old. The clinic team manually sorts the list when someone remembers; existing urgent-result alerts remain in place.",
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
    weaponKicker: "SEVERAL OPTIONS READY TO TEST",
    weaponDescription: "It carries several changes to test against the identified cause. These are countermeasures: useful ideas whose effects we still need to learn.",
    completionTitle: "Keys forged.",
    completionLead: "The armory grows quieter. The chosen set is modest, reversible, and ready to generate information rather than applause.",
    incantation: "Match the root. Preserve options. Prefer learning. Check what else the change might touch.",
    trials: [
      {
        id: "root-fit",
        glyph: "⚿",
        name: "Does It Address the Cause?",
        clue: "Identified cause: the inbox shows new results but not how long others have waited",
        prompt: "Which change directly addresses the cause the team identified?",
        coaching: "If this is the cause, how would the proposed change help?",
        options: [
          "Add two coordinators to reduce the Dermatology results inbox during the morning period of peak volume.",
          "Show how long each result has waited and bring the oldest forward for review.",
          "Send weekly reminders asking staff to sort the Dermatology results inbox more frequently during each shift.",
        ],
        correct: 1,
        answer: "KEY FORGED: making waiting time visible and bringing older results forward addresses overlooked work. Extra staffing alone would not do that.",
        wrong: {
          0: "More staff may reduce the backlog, but the identified cause was overlooked waiting time. More people can still miss older results.",
          2: "A reminder asks humans to compensate for missing system design. The lock remains the same shape.",
        },
      },
      {
        id: "set",
        glyph: "➹",
        name: "Several Changes to Test",
        clue: "Keep several options open long enough to learn from them",
        prompt: "Which approach creates options instead of making one expensive bet?",
        coaching: "What three responses could be tested without welding them together?",
        options: [
          "Test a waiting-time flag, oldest-first sorting, and a midday review as three separate small changes.",
          "Choose the automated flag immediately because technology is more reliable than manual work.",
          "Combine every promising idea into one redesign and launch across all Dermatology clinic teams.",
        ],
        correct: 0,
        answer: "KEY FORGED: testing the three ideas separately helps reveal which change helps and how.",
        wrong: {
          1: "The brightest key has been selected before touching the lock. Technology can keep work waiting for the same scheduled review times.",
          2: "When every idea moves together, no one can tell which change helped—or which created harm.",
        },
      },
      {
        id: "pick",
        glyph: "◫",
        name: "Impact & Effort",
        clue: "Try a low-cost change that addresses the cause and is easy to undo",
        prompt: "Which change should the team test first?",
        coaching: "What can teach us something useful with the least cost and difficulty undoing it?",
        options: [
          "Test oldest-first sorting with one team: addresses overlooked older results, costs little, and can be undone in one shift.",
          "Purchase enterprise results-management software: high visibility, high cost, and months before usable learning.",
          "Add an approval checkpoint: low cost, but it creates another queue before follow-up.",
        ],
        correct: 0,
        answer: "KEY FORGED: this small change addresses the cause, costs little, and can be undone easily.",
        wrong: {
          1: "Purchasing has arrived before evidence. A long buying process delays learning and may preserve the same unnecessary work.",
          2: "Low effort is not enough. A change that adds waiting has poor impact even when it is cheap.",
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
          "Delay testing until the team can guarantee the change will create no unintended consequences.",
        ],
        correct: 1,
        answer: "ARMORY UNLOCKED: the test will check review speed, missed results, urgent-result priority, and staff workload.",
        wrong: {
          0: "A narrow success measure can hide shifted harm. Faster review must still protect quality and give urgent findings priority.",
          2: "A small test with safety limits builds understanding. Use what it reveals to revise the idea; certainty is not guaranteed.",
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
      "A chart review at an Adult and Family Medicine (AFM) clinic shows that 31% of patients leave follow-up visits without a printed next-step summary. The team proposes one end-of-visit checklist reminder in Health Connect: “Summary printed and handed to patient?” Nobody knows whether it will help—or slow checkout.",
      "The Plan–Do–Study–Act (PDSA) apparatus can test the idea with one physician, one medical assistant, one half-day, and ten visits. Make a prediction, study the work, and choose the next turn.",
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
    weaponDescription: "It remembers each prediction, actual result, surprise, and decision through Plan–Do–Study–Act: plan a test, try it, study the results, and decide what to try next.",
    completionTitle: "Cycle awakened.",
    completionLead: "The machine does not declare victory. It produces something more useful: evidence for the next turn.",
    incantation: "Predict. Test small. Record what happened. Study the difference. Choose the next cycle.",
    trials: [
      {
        id: "plan",
        glyph: "P",
        name: "Plan: Predict & Prepare",
        clue: "One physician · one medical assistant · one half-day · ten visits",
        prompt: "Which plan states a small test and a prediction the team can check?",
        coaching: "Who will try it, when, and what do you expect to happen?",
        options: [
          "Test ten visits Tuesday; predict nine patients receive summaries and added checkout time averages under two minutes.",
          "Introduce the reminder at every AFM clinic for a month; predict staff will generally feel checkout works better.",
          "Discuss the reminder at committee for one month; predict the missing-summary problem will be solved without testing.",
        ],
        correct: 0,
        answer: "PLAN READY: the team has chosen a small test, predicted a result, and set a limit on added checkout time.",
        wrong: {
          1: "That changes every clinic at once and leaves the expected result vague. Start with a test small enough to repeat safely.",
          2: "Discussion can improve the plan, but trying the reminder in real visits is how the team learns whether it helps.",
        },
      },
      {
        id: "do",
        glyph: "D",
        name: "Do: Try & Record",
        clue: "Prediction: at least 9 of 10 receive summaries · average added checkout time under 2 minutes",
        prompt: "How should the team carry out the planned test?",
        coaching: "Try it in real visits and record what happens, including missed summaries and interruptions.",
        options: [
          "Count only visits where patients receive summaries so the team can quickly report whether the reminder succeeded.",
          "Try the reminder in all ten visits; record summary delivery, added checkout time, interruptions, and workarounds.",
          "Ask staff for general impressions after clinic instead of recording each visit while the test is happening.",
        ],
        correct: 1,
        answer: "DO COMPLETE: the team tried the reminder and recorded every visit, including surprises and missed summaries.",
        wrong: {
          0: "Leaving out missed summaries hides the information that may help most. Record all ten visits.",
          2: "General impressions can help, but memory can miss when and why the process broke down. Record observations during the test.",
        },
      },
      {
        id: "study",
        glyph: "S",
        name: "Study: Compare & Learn",
        clue: "Predicted 9/10 · actual 8/10 · average checkout +1.4 min · both misses during break coverage",
        prompt: "What do these results tell the team?",
        coaching: "Compare the prediction with what happened. What worked, and what needs closer attention?",
        options: [
          "Summary delivery missed the prediction by one; added time stayed within the limit, and both misses involved break coverage.",
          "The reminder met every goal because eight patients received summaries and added checkout time stayed below two minutes.",
          "The reminder has no value because one fewer patient received a summary than the team predicted before the test.",
        ],
        correct: 0,
        answer: "STUDY COMPLETE: the result is promising, the time limit was met, and the missed summaries point to break coverage as the next issue to test.",
        wrong: {
          1: "Checkout time met its limit, but summary delivery fell short of nine in ten. Keep both findings visible.",
          2: "A missed prediction gives the team something to learn. Both missed summaries occurred during break coverage, suggesting a specific next test.",
        },
      },
      {
        id: "act",
        glyph: "A",
        name: "Act: Choose the Next Test",
        clue: "8 of 10 received summaries · average checkout +1.4 min · two break-coverage misses",
        prompt: "What should the team do with what it learned?",
        coaching: "Keep the change, revise and retest it, or stop testing it. Which choice does the evidence support?",
        options: [
          "Use the reminder across all sites because performance improved and added checkout time stayed under two minutes.",
          "Revise break coverage, then repeat another ten-visit test during tomorrow’s morning clinic.",
          "Stop testing the reminder because the first test missed the nine-of-ten prediction by one patient.",
        ],
        correct: 1,
        answer: "ACT READY: revise break coverage and try another small test. This is adaptation: changing the idea in response to what happened.",
        wrong: {
          0: "Expanding now could repeat the break-coverage problem at every site. Test that issue before expanding.",
          2: "The test exposed a specific problem the team can try to fix. Missing the prediction is useful information.",
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
    wisdom: "A plan needs named people, due dates, the right order of tasks, and a way to keep the improvement working.",
    prologue: [
      "A redesigned asthma inhaler-teaching checklist has completed three safe tests at one pediatric clinic: 28 of 30 families demonstrated correct technique before leaving, and follow-up calls fell. Four pediatric clinics now want to adopt it over four weeks.",
      "The expedition begins here. Turn a promising local result into a route: who does what, by when, what must happen first, and who helps when work is blocked.",
    ],
    senseiBrief: "A useful plan answers five questions at a glance: who, what, when, what comes first, and who keeps it working.",
    sceneLabel: "FOUR-WEEK EXPEDITION",
    sceneSymbol: "⚑",
    accent: "#8cc23d",
    glow: "#d7ff76",
    secondary: "#75e2e6",
    deep: "#09150d",
    weapon: "The Commander's War Map",
    weaponKicker: "WHO · WHAT · WHEN · KEEP IT WORKING",
    weaponDescription: "Every mark links a specific task to one person, a due date, the work that must happen first, and regular progress checks.",
    completionTitle: "Road provisioned.",
    completionLead: "The caravan can now move without guessing who carries each task or when the next bridge must be ready.",
    incantation: "Name the task. Name one owner. Mark the date. Show what must happen first. Keep the routine working.",
    trials: [
      {
        id: "ownership",
        glyph: "01",
        name: "Owner & Date",
        clue: "Specific task · one accountable person · clear deadline",
        prompt: "Which ledger entry can survive the first river crossing?",
        coaching: "Who produces exactly what—and by when?",
        options: [
          "Operations will finalize the inhaler-teaching checklist soon and distribute it when every clinic is ready.",
          "Maya finalizes the inhaler-teaching checklist Friday; Luis validates language access and device exceptions Monday.",
          "The project team shares responsibility for completing teaching materials during the planned rollout.",
        ],
        correct: 1,
        answer: "ROUTE MARKED: two tasks, two accountable people, and two dates make progress easy to check.",
        wrong: {
          0: "A department and 'soon' cannot be held accountable. The wagon carries no visible finish line.",
          2: "Shared responsibility often means invisible responsibility. Each task needs one person answerable for completion.",
        },
      },
      {
        id: "sequence",
        glyph: "02",
        name: "What Comes First?",
        clue: "Finalize → translate → check with families → train → introduce in stages",
        prompt: "Which order ensures the team finishes each necessary step before starting the next?",
        coaching: "What must be true before the next task can begin?",
        options: [
          "Train all staff immediately while translations, device exceptions, and teaching materials remain under development.",
          "Finalize the checklist, translate it, check it with families, train staff, then introduce it in stages.",
          "Let each pediatric clinic choose its own sequence so local teams can move at their preferred pace.",
        ],
        correct: 1,
        answer: "ROUTE MARKED: the plan shows what must be finished before each next step can begin.",
        wrong: {
          0: "Training unfinished work creates confusion and rework. The expedition has departed before its bridge is built.",
          2: "Local adaptation matters, but incompatible sequences can strand shared technology, standards, and support.",
        },
      },
      {
        id: "control",
        glyph: "03",
        name: "Regular Progress Checks",
        clue: "Spot obstacles within days, while there is still time to respond",
        prompt: "Which routine helps the team track progress and respond to delays?",
        coaching: "How often will the team check progress, and who will help with obstacles?",
        options: [
          "Meet twice weekly to review obstacles; task owners alert the project lead within one working day of a delay.",
          "Ask team members to email the project lead whenever they believe a task may become delayed.",
          "Wait until the four-week rollout ends, then review which planned milestones were missed and why.",
        ],
        correct: 0,
        answer: "ROUTE MARKED: scheduled checks and a clear rule for asking for help keep the plan moving.",
        wrong: {
          1: "Optional email depends on individual judgment and courage. Obstacles need a regular time and place to be discussed.",
          2: "A review after four weeks comes too late to address delays as they happen.",
        },
      },
      {
        id: "sustain",
        glyph: "04",
        name: "Sustainment Patrol",
        clue: "The project ends · someone remains responsible for keeping the routine working",
        prompt: "Which final entry prevents the completed road from disappearing?",
        coaching: "Who checks that the routine still works after the project team leaves?",
        options: [
          "Mark implementation complete once training attendance reaches 100 percent across every participating clinic.",
          "Assign monthly checks of correct inhaler use, share the percentage, and agree what to do below 90 percent.",
          "Keep the project team active indefinitely so original members can personally prevent checklist drift.",
        ],
        correct: 1,
        answer: "EXPEDITION READY: routine staff have responsibility, a monthly check, a measure, and a response when results fall below the agreed level.",
        wrong: {
          0: "Attendance measures exposure to training, not whether the new process continues to work.",
          2: "The routine needs documented steps and ongoing staff responsibility so it can keep working after the project team leaves.",
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
    wisdom: "Before declaring success, check the result, whether the new steps happened, and whether the change created problems elsewhere.",
    prologue: [
      "An Emergency Medicine team tested a discharge-follow-up process for patients referred to a clinic. The process documents the follow-up plan and hands the booking request to the receiving clinic before discharge. For each of eight weeks, 82% completed their visit within the timeframe in their individual discharge plan, compared with 58% before the test. The documented handoff was completed for 92% of eligible discharges.",
      "There is a complication: patient callback requests to the discharge-follow-up team rose from 100 to 122 per week. Hear the witnesses for completed visits, use of the new handoff, and possible unintended effects before deciding whether the full improvement is confirmed.",
    ],
    senseiBrief: "Check three things: Did the result improve? Did the team follow the new steps? Did the change create problems elsewhere?",
    sceneLabel: "THREE-MEASURE TRIBUNAL",
    sceneSymbol: "⚖",
    accent: "#f276ad",
    glow: "#981f59",
    secondary: "#75e2e6",
    deep: "#160813",
    weapon: "The Threefold Mirror",
    weaponKicker: "PREDICTED ≠ ACTUAL UNTIL MEASURED",
    weaponDescription: "It reflects three views: results (outcome measures), use of the new steps (process measures), and possible problems elsewhere (balancing measures).",
    completionTitle: "Verdict rendered.",
    completionLead: "Follow-up visit completion and documented handoffs met their local goals. More callback requests need investigation before the team can judge the full improvement.",
    incantation: "Compare the goal with the result. Check the new steps. Investigate possible problems. Decide what to keep, revise, or test next.",
    trials: [
      {
        id: "outcome",
        glyph: "★",
        name: "Results: Outcome Testimony",
        clue: "Local follow-up completion target ≥80% each week for 8 weeks · actual 82% each week",
        prompt: "What do the follow-up visit results allow the team to say?",
        coaching: "Did the actual result meet the stated target—yes or no?",
        options: [
          "Yes—the outcome met target: 82 percent completed follow-up within their planned timeframe each week for eight weeks.",
          "No—the result cannot count until every discharged patient completes every recommended follow-up visit.",
          "Yes—the outcome met target because staff completed training and the new booking handoff launched.",
        ],
        correct: 0,
        answer: "TESTIMONY ACCEPTED: follow-up visit completion met the agreed goal in each of the eight weeks.",
        wrong: {
          1: "The local target was at least 80 percent among patients referred for follow-up, not perfection for every discharged patient.",
          2: "Training and launch are implementation activities. They cannot testify about the patient-facing result.",
        },
      },
      {
        id: "process",
        glyph: "⚙",
        name: "New Steps: Process Testimony",
        clue: "Documented plan and booking handoff before discharge: local target ≥90% · actual 92%",
        prompt: "Does the handoff evidence show that the new steps happened as planned?",
        coaching: "How consistently were the follow-up plan and booking handoff documented before discharge?",
        options: [
          "The new steps met their goal: the handoff was documented for 92 percent of eligible discharges, above the 90 percent target.",
          "The handoff is proven to cause more completed visits because follow-up completion rose after it launched.",
          "The new steps failed because eight percent of eligible discharges lacked a documented handoff.",
        ],
        correct: 0,
        answer: "TESTIMONY ACCEPTED: handoff documentation exceeded the 90 percent goal agreed before the test. It does not prove what caused more patients to complete follow-up.",
        wrong: {
          1: "A result improving after a change does not by itself prove cause. Handoff documentation tells us whether the new steps happened.",
          2: "The local test target was 90 percent, not 100. A threshold should not be rewritten after seeing the data.",
        },
      },
      {
        id: "balance",
        glyph: "♥",
        name: "Other Effects: Balancing Testimony",
        clue: "Patient callback requests: baseline 100/week · actual 122/week",
        prompt: "What does the rise in callback requests mean for the decision about success?",
        coaching: "Why did callback requests increase, and what does that mean for patients and staff?",
        options: [
          "The result remains confirmed because more completed follow-up visits matter more than additional callback requests.",
          "Full success is not yet confirmed: investigate whether 22 percent more callback requests reflect confusion, useful support, or extra workload.",
          "Ignore the extra callback requests until next quarter because other effects often appear later than the main result.",
        ],
        correct: 1,
        answer: "TESTIMONY ACCEPTED: the increase needs investigation. Request counts alone do not establish confusion, harm, or unacceptable staff workload.",
        wrong: {
          0: "Different measures cannot be traded casually. The team must understand whether callback volume signals confusion or needed support.",
          2: "The increase is already visible. Investigate its causes and effects now, while the team can respond.",
        },
      },
      {
        id: "verdict",
        glyph: "?",
        name: "The Verdict",
        clue: "Results met goal · new steps met goal · effects of extra callbacks still uncertain",
        prompt: "Which decision respects all three witnesses?",
        coaching: "What can the team keep, and what needs more investigation or testing?",
        options: [
          "Make the full workflow routine now because follow-up completion and documented handoffs both met their targets.",
          "Investigate the extra callback requests and workload, then test any needed changes while continuing the discharge handoff.",
          "Restart the entire improvement project because any increase in callback requests proves the original problem was chosen incorrectly.",
        ],
        correct: 1,
        answer: "TRIBUNAL COMPLETE: continue the handoff that met its goal. Learn why callback requests increased, assess workload, and test any needed changes.",
        wrong: {
          0: "Two successful measures leave an unanswered question: are the extra callbacks helpful, confusing, or adding unacceptable work? Investigate before making the full process routine.",
          2: "Missed follow-up still matters, and handoffs met their goal. Investigate the extra callbacks before deciding what needs to change.",
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
      "An OB/GYN clinic is finishing a four-week postpartum follow-up pilot. It adds a named contact and clear callback instructions to the existing follow-up plan. Portal questions about whom to contact fell 34%, yet patient interviews revealed something more useful: knowing whom to reach mattered more than receiving an additional routine phone call.",
      "During one week, the new callback process broke down when the designated nurse was away and no backup was assigned. Share what helped, what surprised you, and what failed so another team can test the idea in its own clinic.",
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
    weaponDescription: "Hansei means reflecting honestly so future work improves. This elixir carries successes, failures, surprises, and changed thinking to other teams.",
    completionTitle: "Wisdom returned.",
    completionLead: "One mountain is complete. The horizon is larger, the next ascent is visible, and the climbers are more capable together.",
    incantation: "Tell what changed your mind. Name what you felt. Change the next approach. Share the whole learning.",
    trials: [
      {
        id: "learning",
        glyph: "01",
        name: "Evidence Changed Us",
        clue: "Contact-related questions fell 34% · postpartum patients valued a clear callback path · the nurse had no backup",
        prompt: "Which reflection preserves the most useful learning from the journey?",
        coaching: "What did the evidence teach—not what story makes the project look best?",
        options: [
          "The project succeeded because the team selected a strong solution and executed the pilot efficiently.",
          "We learned that a clear callback path reduced uncertainty, while relying on one nurse made it fragile.",
          "The main lesson is that nurses need clearer accountability whenever follow-up work is introduced.",
        ],
        correct: 1,
        answer: "ELIXIR DISTILLED: the reflection describes what seemed to help and where the process broke down.",
        wrong: {
          0: "A victory story leaves out the failed absence coverage and what the team still needs to learn.",
          2: "Accountability is an interpretation broad enough to become blame. The actual learning was more specific.",
        },
      },
      {
        id: "emotion",
        glyph: "02",
        name: "The Human Lesson",
        clue: "Honest reflection includes how uncertainty changed the team’s behavior",
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
          1: "Emotions influence behavior whether named or not. Reflection includes how our own thinking and actions influenced the work.",
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
          "Next time, begin with the change leaders believe has the highest probability of success.",
        ],
        correct: 0,
        answer: "ELIXIR DISTILLED: the lesson changes measurement and collaboration at the start of the next cycle.",
        wrong: {
          1: "Introducing a change everywhere before testing it skips a chance to learn safely. Start small enough to adjust.",
          2: "Leadership confidence still needs evidence that the change addresses the cause and helps in a small test.",
        },
      },
      {
        id: "yokoten",
        glyph: "04",
        name: "Carry It Outward",
        clue: "Share the learning so other teams can test it in their own setting",
        prompt: "How should the team offer its elixir to another clinic?",
        coaching: "What must travel with the result so others can learn rather than merely comply?",
        options: [
          "Send the finished workflow to every clinic and require adoption so others benefit immediately.",
          "Share the one-page improvement story (A3), assumptions, failures, and safety limits; let another clinic run its own small test.",
          "Present only the final results and successful change so the story remains concise and persuasive.",
        ],
        correct: 1,
        answer: "RETURN COMPLETE: the whole learning travels, while the receiving team retains responsibility to test in its own context.",
        wrong: {
          0: "Requiring the same process everywhere skips local learning. Another clinic should test how it works for its patients and team.",
          2: "A polished success story withholds the assumptions and failures another team needs most.",
        },
      },
    ],
  },
};

export function isRemainingBoxNumber(value: number): value is RemainingBoxNumber {
  return value === 3 || value === 5 || value === 6 || value === 7 || value === 8 || value === 9;
}

export type BoothBoxNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export type BoothAnnotation = {
  id: string;
  label: string;
  body: string;
  x: number;
  y: number;
};

export type BoothAtlasEntry = {
  box: BoothBoxNumber;
  a3Label: string;
  title: string;
  thesis: string;
  accent: string;
  image: string;
  annotations: BoothAnnotation[];
};

export const BOOTH_ATLAS: Record<BoothBoxNumber, BoothAtlasEntry> = {
  1: {
    box: 1,
    a3Label: "Reason for Action",
    title: "The Care Roundtable",
    thesis: "A complete case for action is bounded, measurable, urgent, achievable, and anchored in human value.",
    accent: "#ffc45e",
    image: "a3/box-1.jpg",
    annotations: [
      { id: "gap", label: "Current → gap → desired", body: "The red, cream, and green figures turn the performance gap into something visible: where the system is now, the measurable distance between states, and the condition the team intends to reach.", x: 48, y: 89 },
      { id: "evidence", label: "Quantified baseline", body: "The chart establishes the baseline and recurring pattern. Box 1 begins with evidence strong enough to show that the problem is more than an isolated story.", x: 49, y: 25 },
      { id: "clock", label: "Time anchor", body: "The clock gives the case a time boundary. It helps answer when the pattern began, how long it has persisted, and by when the aim should be reached.", x: 31, y: 24 },
      { id: "aim", label: "Measurable aim", body: "The bullseye represents an outcome with magnitude and time. It defines arrival without prematurely prescribing the route.", x: 70, y: 23 },
      { id: "urgency", label: "Why act now?", body: "The red current-condition figures act as the warning signal: the recurring gap has crossed the threshold for action and can no longer remain background noise.", x: 25, y: 89 },
      { id: "scope", label: "Scope boundary", body: "The enclosing booth edges act like a rope or fence. They remind the team to state what work is inside the charter—and what is deliberately outside it.", x: 50, y: 4 },
      { id: "handoff", label: "Definition of done", body: "The clipboard and document stack represent completion criteria, standard work, ownership, and the handoff that keeps the gain alive after the project ends.", x: 88, y: 79 },
      { id: "dual-value", label: "Patient and staff together", body: "Patients, clinicians, and operational partners sit around the same evidence. The problem and aim must create value for the patient without exporting burden to the people doing the work.", x: 26, y: 51 },
      { id: "heart", label: "The deeper human why", body: "The illuminated golden heart occupies the center because every Box 1 decision should trace back to patient value and staff or system value. It is the reason the numbers matter.", x: 47, y: 48 },
    ],
  },
  2: {
    box: 2,
    a3Label: "Current State",
    title: "The Observation Tower & Map Room",
    thesis: "Describe the work as it actually moves—without explaining causes or designing the future too soon.",
    accent: "#75e2e6",
    image: "a3/box-2.jpg",
    annotations: [
      { id: "observer", label: "Go to the gemba", body: "The clipboard-bearing observer stands at the edge of the work, watching directly instead of relying on the approved process description.", x: 10, y: 59 },
      { id: "time", label: "Time the work", body: "The stopwatch captures waiting time, touch time, cycle time, delay, and temporal variation. Current state separates elapsed time from active work.", x: 18, y: 49 },
      { id: "performance", label: "Measured performance", body: "The jagged chart records present performance and variation. It is evidence of today’s condition—not an improvement trajectory.", x: 84, y: 86 },
      { id: "volume", label: "Cases and cohorts", body: "The colored counters translate observation into counts: patients, cases, process stages, cohorts, or volumes moving through the system.", x: 35, y: 84 },
      { id: "voice", label: "Voice of the customer", body: "The brass listening horn makes patient and customer testimony part of the current-state evidence rather than an anecdote added later.", x: 87, y: 20 },
      { id: "movement", label: "Actual paths", body: "Rope paths show the real sequence and movement of people, information, and responsibility across the process.", x: 47, y: 31 },
      { id: "rework", label: "Rework loop", body: "The red looping arrow marks returns, duplication, correction, and backward movement that a tidy process map often hides.", x: 63, y: 43 },
      { id: "handoffs", label: "Queues and handoffs", body: "Separated stations and pawns reveal where patients, information, or ownership wait and transfer between people or systems.", x: 74, y: 30 },
      { id: "boundary", label: "Observed-process boundary", body: "The rope boundary separates the process under study from unrelated environmental noise, keeping the observation focused and repeatable.", x: 28, y: 22 },
      { id: "experience", label: "What the work feels like", body: "The expressions of patients and staff preserve the lived consequences of waiting, travel, fragmentation, and unclear handoffs.", x: 91, y: 47 },
      { id: "no-future", label: "Notice what is absent", body: "There are no targets, repairs, or future-state tools here. Box 2 makes the route explicit; it does not yet explain why it is complicated or redesign it.", x: 51, y: 9 },
    ],
  },
  3: {
    box: 3,
    a3Label: "Target State",
    title: "The Target-State Stage",
    thesis: "A strong target condition can be rehearsed mentally, recognized visually, and confirmed with balanced measures.",
    accent: "#ffd65a",
    image: "a3/box-3.jpg",
    annotations: [
      { id: "patient-value", label: "Patient value", body: "The pink heart makes patient experience an explicit dimension of the future condition—not a vague aspiration outside the measurement system.", x: 27, y: 86 },
      { id: "staff", label: "Staff experience", body: "The teal people represent teamwork, relational coordination, and a future state that improves the work for staff as well as patients.", x: 36, y: 86 },
      { id: "quality", label: "Quality and safety", body: "The blue shield protects reliability, quality, and safety while the system pursues speed or access.", x: 46, y: 86 },
      { id: "flow", label: "Timely flow", body: "The purple clock represents predictable access and timely flow. A future condition should specify when good work happens, not simply that it happens.", x: 56, y: 86 },
      { id: "stewardship", label: "Stewardship and balance", body: "The golden scales hold capacity, workload, and resource stewardship alongside the headline outcome.", x: 66, y: 86 },
      { id: "magnitude", label: "Magnitude of improvement", body: "The green-banded gauge gives the target a measurable threshold. ‘Better’ becomes a recognizable amount of change.", x: 12, y: 86 },
      { id: "acceptance", label: "Observable acceptance criteria", body: "The checklist and green status marks define what an observer should see when all required conditions—not merely one metric—are satisfied.", x: 71, y: 86 },
      { id: "deadline", label: "Date of arrival", body: "The clock and calendar specify when the target condition should exist and prevent the destination from drifting indefinitely.", x: 88, y: 86 },
      { id: "scope", label: "Defined scope", body: "The rope boundary shows which process and population the target applies to, protecting the team from an unbounded promise.", x: 49, y: 52 },
      { id: "visible-work", label: "Rehearsable future work", body: "The stage shows patients arriving, staff communicating, handoffs occurring, and care progressing calmly. Everyone can picture what good looks like on a future gemba walk.", x: 50, y: 34 },
      { id: "no-tools", label: "Condition before construction", body: "The stage describes the desired behavior and results without introducing construction or implementation tools. Box 3 names the destination before choosing the route.", x: 93, y: 15 },
    ],
  },
  4: {
    box: 4,
    a3Label: "Gap Analysis",
    title: "The Dragon’s Root Lair",
    thesis: "Keep investigating past easy explanations, convenient blame, and attractive fixes until the system condition is visible.",
    accent: "#f08f24",
    image: "a3/box-4.jpg",
    annotations: [
      { id: "gap", label: "The gap to cross", body: "The red dragon and distant green pawn hold the current and target conditions apart. The obstruction between them is the gap Box 4 must explain.", x: 54, y: 30 },
      { id: "whys", label: "Successive why questions", body: "The stacked question-mark stones force the investigation downward, one verified layer at a time.", x: 46, y: 66 },
      { id: "branches", label: "Branching cause paths", body: "The roots and ropes branch into multiple contributing paths so the team does not force a complex system into one convenient explanation.", x: 50, y: 72 },
      { id: "evidence", label: "Verify every link", body: "Blue check tokens mean that each causal link must be supported by observation or data—not confidence, hierarchy, or repetition.", x: 39, y: 69 },
      { id: "clusters", label: "Cause clusters", body: "Colored groups organize recurring patterns and thematic cause categories without treating any individual as the problem.", x: 28, y: 77 },
      { id: "therefore", label: "The therefore test", body: "The connected, two-way causal network should reconstruct the symptom in reverse: if this cause is true, therefore the observed problem should follow.", x: 61, y: 66 },
      { id: "vital-few", label: "Evidence-backed vital few", body: "The starred coin stacks rank the small number of verified causes with the greatest impact and influence.", x: 86, y: 76 },
      { id: "investigators", label: "Cross-functional investigators", body: "Clinicians and operational partners investigate together. Root-cause analysis belongs to the system, not to one department.", x: 18, y: 28 },
      { id: "dragon", label: "A systemic dragon", body: "The dragon is not a villainous person. It embodies an entrenched rule, missing feedback loop, fragmented ownership, or another system condition maintaining the gap.", x: 51, y: 24 },
      { id: "no-blame", label: "Observe before combat", body: "The team enters to understand, not accuse or repair. Box 4 identifies and prioritizes causes before countermeasures are allowed into the story.", x: 18, y: 74 },
    ],
  },
  5: {
    box: 5,
    a3Label: "Solutions Approach",
    title: "The Countermeasure Kitchen",
    thesis: "Create several root-matched candidates, compare them honestly, and send only a modest testable choice forward.",
    accent: "#d7ff76",
    image: "a3/box-5.jpg",
    annotations: [
      { id: "root-fit", label: "Root-matched branches", body: "Checked branches connect each candidate countermeasure to a verified root cause. A bright idea does not earn a place unless it fits the lock.", x: 20, y: 19 },
      { id: "set", label: "Preserve multiple candidates", body: "Several recipes remain visible at once, preserving the humility of countermeasure thinking instead of declaring a permanent solution too early.", x: 43, y: 58 },
      { id: "impact", label: "Compare impact and effort", body: "Colored weights compare expected impact with effort, cost, and reversibility before a candidate reaches testing.", x: 18, y: 85 },
      { id: "learning", label: "Failure produces information", body: "The collapsed purple prototype is not hidden or blamed. It produces a glowing blue learning orb that improves the next design.", x: 40, y: 84 },
      { id: "guardrails", label: "Three guardrail doors", body: "The three doors test legality, safety, and preservation of quality. A countermeasure cannot pass by improving one result while violating a non-negotiable condition.", x: 80, y: 34 },
      { id: "ripples", label: "Unintended consequences", body: "The ripple pool exposes where a local improvement might create a new burden elsewhere in the system.", x: 61, y: 81 },
      { id: "target", label: "Keep the target visible", body: "The green candidate keeps the target condition in view so selection remains tied to the desired outcome rather than enthusiasm for a tool.", x: 46, y: 58 },
      { id: "machine", label: "Creativity before capital", body: "The oversized machine represents a costly option that may be less useful than a simple handmade countermeasure capable of producing fast learning.", x: 64, y: 34 },
      { id: "threshold", label: "Ready to test—not scale", body: "Only one modest sample reaches the testing cloche. Box 5 selects a candidate; Box 6 will determine whether it works.", x: 87, y: 75 },
    ],
  },
  6: {
    box: 6,
    a3Label: "Rapid Experiments",
    title: "The Clockwork PDSA Laboratory",
    thesis: "A bounded experiment turns a prediction into evidence and uses every result to choose the next cycle.",
    accent: "#75e2e6",
    image: "a3/box-6.jpg",
    annotations: [
      { id: "prediction", label: "Change → predicted result", body: "The paired red and green measures with the gold arrow state the theory before testing: if we make this change, then we predict this result.", x: 50, y: 20 },
      { id: "bounded", label: "Bounded test period", body: "Clocks, circular tracks, and gates establish a limited test window. The cycle is small enough to repeat and safe enough to stop.", x: 50, y: 40 },
      { id: "team", label: "Only the necessary participants", body: "The small group at the workbench prevents a learning cycle from becoming a disguised system-wide rollout.", x: 39, y: 70 },
      { id: "evidence", label: "Baseline, target, actual", body: "Colored beads and gauges compare the baseline, prediction, and observed result without rewriting the expectation after the test.", x: 81, y: 22 },
      { id: "study", label: "Study the mechanism", body: "The magnifying glass represents direct study of what happened—including deviations, workarounds, timing, and effects the team did not expect.", x: 75, y: 26 },
      { id: "surprise", label: "Unexpected learning", body: "The glowing blue orb makes surprise as valuable as the intended outcome. A test can miss its prediction and still improve the team’s theory.", x: 82, y: 69 },
      { id: "decision", label: "Adopt, adapt, or abandon", body: "The green check, amber loop, and red cross complete the cycle with an explicit decision. None of the doors implies that success was guaranteed.", x: 82, y: 89 },
      { id: "no-scale", label: "Prevent premature scaling", body: "Closed tracks and larger gated platforms keep a promising first result from spreading before the mechanism and guardrails are understood.", x: 60, y: 48 },
    ],
  },
  7: {
    box: 7,
    a3Label: "Completion Plan",
    title: "The Orchestra of Ownership",
    thesis: "Implementation becomes executable when every deliverable has an owner, date, dependency, escalation path, and sustainment cadence.",
    accent: "#ffc45e",
    image: "a3/box-7.jpg",
    annotations: [
      { id: "ownership", label: "Visible individual ownership", body: "Colored musicians correspond to matching tasks. The conductor coordinates the system but does not absorb accountability for each deliverable.", x: 41, y: 38 },
      { id: "timeline", label: "Near-term implementation window", body: "The moon phases and musical measures divide the rollout into visible time intervals, showing when each contribution must enter.", x: 49, y: 14 },
      { id: "deliverables", label: "Concrete deliverables", body: "Physical objects and task cards stand in for actual outputs. The plan names what will exist—not merely what someone will ‘work on.’", x: 44, y: 57 },
      { id: "dependencies", label: "Dependencies and handoffs", body: "Cords, tracks, and instrument sequencing expose what must happen first and where one owner depends on another.", x: 61, y: 88 },
      { id: "blockers", label: "Escalate blocked work", body: "The amber bell and signal flags make blocked work visible early enough for help, instead of discovering it after the rollout date.", x: 90, y: 23 },
      { id: "standard", label: "Standard work", body: "The score, scroll, and books preserve the agreed method so implementation does not depend on memory or oral tradition.", x: 35, y: 88 },
      { id: "resources", label: "Resources and support", body: "Toolbox icons represent the training, materials, technology, and practical support required to complete the work.", x: 26, y: 57 },
      { id: "control", label: "Recurring control huddles", body: "The small circle around the blue orb creates a regular place to review progress, dependencies, and emerging blockers.", x: 68, y: 89 },
      { id: "sustain", label: "Cadence and sustainment", body: "The conductor, metronomic score, and inspection rhythm keep the standard alive after initial implementation is complete.", x: 48, y: 70 },
      { id: "gate", label: "The measurement gate", body: "The striped blue gate leads to Box 8 and remains closed. Coordinated implementation is complete, but results have not yet been confirmed.", x: 91, y: 84 },
    ],
  },
  8: {
    box: 8,
    a3Label: "Confirmed State",
    title: "The Dragon’s Confirmed State",
    thesis: "Implementation is not victory: outcome, mechanism, balancing effects, and sustained performance must all testify.",
    accent: "#f276ad",
    image: "a3/box-8.jpg",
    annotations: [
      { id: "dragon", label: "The original performance gap", body: "The dragon returns because implementation does not automatically defeat the stubborn condition the A3 set out to change.", x: 20, y: 31 },
      { id: "series", label: "Baseline, target, and actual", body: "Red beads hold the original baseline, green marks the target, and blue shows actual observed performance after the change.", x: 54, y: 20 },
      { id: "sustain", label: "More than one good result", body: "Multiple consecutive beads prevent one favorable observation from being mistaken for a sustained new condition.", x: 65, y: 19 },
      { id: "missing", label: "Missing data stays visible", body: "Empty or unfinished positions make future and missing observations explicit instead of silently treating them as success.", x: 77, y: 19 },
      { id: "outcome", label: "Outcome measure", body: "The gold star asks whether the desired result actually occurred at the promised magnitude and duration.", x: 27, y: 75 },
      { id: "process", label: "Process reliability", body: "The interlocking gears ask whether the countermeasure worked through the mechanism the team predicted.", x: 49, y: 77 },
      { id: "balance", label: "Balancing measure", body: "The heart shield checks whether the change caused harm, confusion, workload, or another unintended effect elsewhere.", x: 68, y: 75 },
      { id: "gemba", label: "Direct verification", body: "Magnifying glasses return the investigators to the gemba so the verdict reflects the working system, not just a dashboard.", x: 77, y: 30 },
      { id: "decisions", label: "Three evidence-based decisions", body: "The green loop sustains and audits; the amber vessel runs another bounded experiment; the plum question mark reopens the problem or causal theory.", x: 91, y: 54 },
      { id: "peaceful", label: "Measure before declaring victory", body: "The knight remains peaceful while the investigators measure. The decision depends on evidence, not the emotional satisfaction of having implemented something.", x: 72, y: 53 },
    ],
  },
  9: {
    box: 9,
    a3Label: "Insights",
    title: "The Infinite Clinical A3",
    thesis: "The achievement is not merely that the mountain was climbed, but that the climbers became more capable together.",
    accent: "#b996ff",
    image: "a3/box-9.jpg",
    annotations: [
      { id: "reflection", label: "A common reflection table", body: "Physicians, nurses, administrators, and operational partners sit as equals around the evidence of the journey.", x: 33, y: 47 },
      { id: "elixir", label: "Insight distilled from experience", body: "The glowing vessel represents the wisdom extracted from action—not a polished victory story, but what the team now understands differently.", x: 31, y: 59 },
      { id: "whole-story", label: "Successes, failures, surprises, emotions", body: "The surrounding stones hold the complete project experience. Hansei preserves what worked, what failed, what surprised the team, and how the journey changed them.", x: 43, y: 67 },
      { id: "yokoten", label: "Carry learning outward", body: "The bridge represents yokoten: sharing usable learning so another team can benefit without repeating the same climb alone.", x: 73, y: 43 },
      { id: "compounding", label: "Learning compounds", body: "The widening illuminated path evokes a Fibonacci spiral. Each completed cycle expands perspective and raises the point from which the next journey begins.", x: 82, y: 64 },
      { id: "next-mountain", label: "The next challenge appears", body: "The distant mountain is the essential final image. Reaching one summit reveals problems that could not be seen from below.", x: 87, y: 26 },
      { id: "capability", label: "More capable climbers", body: "Box 9 ends with humility rather than finality: the team shares what it learned, changes how it will work next time, and begins the next ascent together.", x: 69, y: 30 },
    ],
  },
};

export function isBoothBoxNumber(value: number): value is BoothBoxNumber {
  return Number.isInteger(value) && value >= 1 && value <= 9;
}

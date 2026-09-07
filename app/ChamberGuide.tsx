export const CHAMBER_SUBTITLES: Record<number, string> = {
  1: "Why this needs attention now",
  2: "What happens today",
  3: "What should improve, by how much, and by when?",
  4: "Why the gap exists",
  5: "Choosing what to test",
  6: "Small tests of change",
  7: "Who does what, by when—and how do we keep it working?",
  8: "Did the improvement work and last?",
  9: "What we learned and will do differently",
};

const CHAMBER_HELP: Record<number, string> = {
  1: "The A3 is a one-page improvement story. Begin with the problem, who it affects, and a measurable goal. Median describes the middle of the waiting times when ordered from shortest to longest.",
  2: "Gemba means the place where work happens. Use the Gemba Lens to see the work directly: where the referral goes, who is responsible, and how long it waits.",
  3: "A target state describes both the result you want and how the work should happen. A guardrail is an agreed limit on unwanted effects; a balancing measure checks for problems the change might cause elsewhere.",
  4: "The Five Whys follows each answer with another question about the work. Trace the underlying causes using evidence. In practice, five questions are a guide, and more than one cause may matter.",
  5: "A countermeasure is a change aimed at an identified cause. Keep several options open, test them on a small scale, and check for effects on patients and staff.",
  6: "PDSA means Plan–Do–Study–Act. Plan the test and predict the result. Do the test and record what happens. Study the difference. Act on what you learn.",
  7: "Plan the work in order, assign each task to one person, and agree when to check progress. Sustainment means keeping the improvement working after the project ends.",
  8: "Outcome measures track the result. Process measures check whether the new steps happened. Balancing measures look for problems the change might cause elsewhere, such as extra work or poorer access.",
  9: "Hansei means honest reflection that improves future practice. Ask what helped, what remains uncertain, and what you will do differently. Share the full learning so another team can test it locally.",
};

export const CHAMBER_DEPARTMENTS: Record<number, string> = {
  1: "Gastroenterology",
  2: "Adult and Family Medicine → Cardiology",
  3: "Radiology",
  4: "Surgery",
  5: "Dermatology",
  6: "Adult and Family Medicine",
  7: "Pediatrics",
  8: "Emergency Medicine",
  9: "OB/GYN",
};

export function ChamberGuide({ boxNumber }: { boxNumber: number }) {
  return <aside className="chamber-plain-guide" aria-label="Your mission in plain language">
    <strong>{CHAMBER_SUBTITLES[boxNumber]}</strong>
    <p>{CHAMBER_HELP[boxNumber]}</p>
    <p data-case-department={boxNumber}>Fictional case · {CHAMBER_DEPARTMENTS[boxNumber]}. Numbers and targets are illustrative local examples, not clinical standards.</p>
  </aside>;
}

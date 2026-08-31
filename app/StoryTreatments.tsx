import type { ReactNode } from "react";

const SENSEI_ROLES: Record<number, string> = {
  1: "ACCESS SPECIALIST",
  2: "PHYSICIAN GUIDE",
  3: "QUALITY ANALYST",
  4: "IMPROVEMENT COACH",
  5: "NURSE LEADER",
  6: "PHYSICIAN SCIENTIST",
  7: "OPERATIONS LEAD",
  8: "PATIENT PARTNER",
  9: "PHYSICIAN MENTOR",
};

export function SenseiMessage({ children, boxNumber, label = "THE SENSEI" }: { children: ReactNode; boxNumber: number; label?: string }) {
  const role = SENSEI_ROLES[boxNumber] ?? "GUIDE";
  return <aside className="sensei-message" aria-label={`${label} says`}>
    <div className="sensei-portrait" aria-hidden="true">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`sensei/sensei-box-${boxNumber}.png`} alt="" width="1254" height="1254" />
      <span>GUIDE</span>
    </div>
    <div className="sensei-bubble">
      <span>{label} · {role}</span>
      <p>{children}</p>
    </div>
  </aside>;
}

export function IncantationScroll({ children, label = "INSCRIPTION" }: { children: ReactNode; label?: string }) {
  return <div className="incantation-scroll" role="note" aria-label={label}>
    <i aria-hidden="true" />
    <div>
      <span>{label}</span>
      <p>{children}</p>
    </div>
    <i aria-hidden="true" />
  </div>;
}

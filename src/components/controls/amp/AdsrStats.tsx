import type { ADSR } from "./types";
import { getCurve } from "./curve";
import "./AdsrStats.css";

interface AdsrStatsProps {
  amp: ADSR;
}

export function AdsrStats({ amp }: AdsrStatsProps) {
  const stages = [
    { label: "attack", value: amp.attack, curve: amp.attackCurve },
    { label: "decay", value: amp.decay, curve: amp.decayCurve },
    { label: "sustain", value: amp.sustain, curve: amp.sustainWidth },
    { label: "release", value: amp.release, curve: amp.releaseCurve },
  ];

  return (
    <div className="h-[15px] shrink-0 flex justify-around bg-stone-300 border-t border-stone-400">
      {stages.map(({ label, value, curve }) => (
        <span
          key={label}
          className="stat-val inline-flex items-center font-xs text-stone-800 leading-none"
        >
          <span className="mr-2">{Math.round(value * 100)}%</span>
          <span>{getCurve(curve)}</span>
        </span>
      ))}
    </div>
  );
}

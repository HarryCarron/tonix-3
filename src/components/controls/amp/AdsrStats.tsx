import type { ADSR } from "./types";
import { getCurve } from "./curve";

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
    <div className="h-[20px] shrink-0 flex justify-around">
      {stages.map(({ label, value, curve }) => (
        <span
          key={label}
          className="inline-flex items-center bg-stone-300 text-stone-700 rounded-md px-2 leading-none font-bold"
        >
          <span className="mr-2">{Math.round(value * 100)}%</span>
          <span>{getCurve(curve)}</span>
        </span>
      ))}
    </div>
  );
}

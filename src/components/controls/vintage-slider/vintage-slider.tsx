import { useState } from "react";
import "./vintage-slider.css";

export interface VintageSliderConfig<T> {
  value: T;
  label: string;
}

export interface VintageSliderProps<T = unknown> {
  config: {
    true: VintageSliderConfig<T>;
    false: VintageSliderConfig<T>;
  };
}

export function VintageSlider<T = unknown>(props: VintageSliderProps<T>) {
  const [isTrue, setIsTrue] = useState<boolean>();

  return (
    <span
      onClick={() => setIsTrue((v) => !v)}
      className="vintage-slider cursor-pointer rounded-md overflow-hidden"
    >
      <span className={"option " + (isTrue ? "selected rounded-md" : "")}>
        {props.config.true.label}
      </span>
      <span className={"option " + (!isTrue ? "selected rounded-md" : "")}>
        {props.config.false.label}
      </span>
    </span>
  );
}

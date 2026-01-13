import { ENV } from "./../../../env";

export function WorkspaceBg() {
  return (
    <svg
      width={ENV.worldDims + "px"}
      height={ENV.worldDims + "px"}
      className="inset-0 pointer-events-none"
    >
      <pattern
        id="pattern-circles"
        x="0"
        y="0"
        width="50"
        height="50"
        patternUnits="userSpaceOnUse"
        patternContentUnits="userSpaceOnUse"
      >
        <circle
          id="pattern-circle"
          cx="10"
          cy="10"
          r="1.6257413380501518"
          fill="#cbcbcbff"
        ></circle>
      </pattern>

      <rect
        id="rect"
        x="0"
        y="0"
        width="100%"
        height="100%"
        fill="url(#pattern-circles)"
      ></rect>
    </svg>
  );
}

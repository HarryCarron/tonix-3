import colors from "tailwindcss/colors";

interface WorldBackgroundProps {
  width?: string;
  height?: string;
  className?: string;
}

// the dot-grid backdrop behind World's nodes - factored out so it can also
// back a Storybook harness canvas without duplicating the pattern markup.
// The pattern tiles via patternUnits="userSpaceOnUse" so it works at any
// width/height, not just World's fixed ENV.worldDims square.
export function WorldBackground({
  width = "100%",
  height = "100%",
  className,
}: WorldBackgroundProps) {
  return (
    <svg
      width={width}
      height={height}
      className={`absolute inset-0 pointer-events-none ${className ?? ""}`}
    >
      <pattern
        id="pattern-circles"
        x="0"
        y="0"
        width="30"
        height="30"
        patternUnits="userSpaceOnUse"
        patternContentUnits="userSpaceOnUse"
      >
        <circle
          id="pattern-circle"
          cx="10"
          cy="10"
          r="1.6257413380501518"
          fill={colors.stone[200]}
        ></circle>
      </pattern>

      <rect x="0" y="0" width={width} height={height} fill={colors.stone[50]}></rect>

      <rect
        id="rect"
        x="0"
        y="0"
        width={width}
        height={height}
        fill="url(#pattern-circles)"
      ></rect>
    </svg>
  );
}

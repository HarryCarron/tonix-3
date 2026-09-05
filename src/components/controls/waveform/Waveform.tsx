const WAVEFORM_VIEWBOX_WIDTH = 300;
const WAVEFORM_VIEWBOX_HEIGHT = 160;
const WAVEFORM_CYCLES = 3;
const WAVEFORM_SAMPLES = 100;

function describeSineWave(width: number, height: number, cycles: number) {
  const midY = height / 2;
  const amplitude = height / 3;

  const points = Array.from({ length: WAVEFORM_SAMPLES + 1 }, (_, i) => {
    const t = i / WAVEFORM_SAMPLES;
    const x = t * width;
    const y = midY - Math.sin(t * cycles * Math.PI * 2) * amplitude;

    return `${i === 0 ? "M" : "L"} ${x} ${y}`;
  });

  return points.join(" ");
}

export function Waveform() {
  return (
    <svg
      viewBox={`0 0 ${WAVEFORM_VIEWBOX_WIDTH} ${WAVEFORM_VIEWBOX_HEIGHT}`}
      preserveAspectRatio="none"
      className="w-full h-full"
    >
      <path
        fill="none"
        stroke="white"
        strokeWidth="2"
        d={describeSineWave(
          WAVEFORM_VIEWBOX_WIDTH,
          WAVEFORM_VIEWBOX_HEIGHT,
          WAVEFORM_CYCLES,
        )}
      />
    </svg>
  );
}

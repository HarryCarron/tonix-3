export const OSC_WAVES = ["sine", "sawtooth", "square", "additive"] as const;
export type OscWave = (typeof OSC_WAVES)[number];

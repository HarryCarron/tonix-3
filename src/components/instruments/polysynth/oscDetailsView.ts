export const OSC_DETAILS_VIEWS = ["wave", "envelope", "additive"] as const;
export type OscDetailsView = (typeof OSC_DETAILS_VIEWS)[number];

export type FilterType = "LP" | "HP" | "BP";

export interface FilterValue {
  freq: number;
  q: number;
  type: FilterType;
}

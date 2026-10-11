export type DurationUnit = "days" | "months";

const DAYS_PER_MONTH = 30;

export function toDays(value: number, unit: DurationUnit) {
  return unit === "months" ? value * DAYS_PER_MONTH : value;
}

export function splitDuration(days: number): {
  value: number;
  unit: DurationUnit;
} {
  if (days >= 60 && days % DAYS_PER_MONTH === 0) {
    return { value: days / DAYS_PER_MONTH, unit: "months" };
  }
  return { value: days, unit: "days" };
}

export function formatDuration(days: number) {
  const { value, unit } = splitDuration(days);
  if (unit === "months") return `${value} months`;
  return `${value} ${value === 1 ? "day" : "days"}`;
}

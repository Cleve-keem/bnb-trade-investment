export function formatChartDate(isoDate: string) {
  const [, month, day] = isoDate.split("-").map(Number);
  return new Date(Date.UTC(2000, month - 1, day)).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

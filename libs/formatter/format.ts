const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

export const formatPlanAmount = (amount: number) => money.format(amount);

export const capitalize = (text: string) =>
  text.charAt(0).toUpperCase() + text.slice(1);

export const getInitials = (name: string) =>
  name
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();
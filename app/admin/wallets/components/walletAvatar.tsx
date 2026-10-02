export default function WalletAvatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f0b90b]/10 text-xs font-bold text-[#f0b90b]">
      {initials || "?"}
    </div>
  );
}

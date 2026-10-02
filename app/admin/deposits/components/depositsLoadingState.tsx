export default function DepositsLoadingState() {
  return (
    <div className="space-y-3 p-5">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-14 animate-pulse rounded-xl bg-white/4" />
      ))}
    </div>
  );
}

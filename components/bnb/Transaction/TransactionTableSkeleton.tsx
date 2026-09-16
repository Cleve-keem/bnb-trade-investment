export default function TransactionTableSkeleton() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, index) => (
        <tr key={index} className="border-b border-white/4 last:border-0">
          <td className="px-5 py-5">
            <div className="h-4 w-40 animate-pulse rounded bg-white/5" />
            <div className="mt-2 h-2.5 w-24 animate-pulse rounded bg-white/5" />
          </td>
          <td className="px-5 py-5">
            <div className="h-3 w-14 animate-pulse rounded bg-white/5" />
          </td>
          <td className="px-5 py-5">
            <div className="ml-auto h-4 w-20 animate-pulse rounded bg-white/5" />
          </td>
          <td className="px-5 py-5">
            <div className="h-3 w-24 animate-pulse rounded bg-white/5" />
          </td>
        </tr>
      ))}
    </>
  );
}

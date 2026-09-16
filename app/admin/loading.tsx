import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <div className="flex items-center gap-3 text-gray-400">
        <Loader2 className="h-5 w-5 animate-spin text-[#f0b90b]" />
        Loading ...
      </div>
    </div>
  );
}

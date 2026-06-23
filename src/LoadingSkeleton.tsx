

export default function LoadingSkeleton() {
  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 animate-pulse">
      <div className="h-14 bg-zinc-800/80 rounded-xl border border-zinc-700/50 w-full" />
      <div className="p-6 bg-zinc-900/60 rounded-xl border border-zinc-800/50 space-y-4">
        <div className="h-4 bg-zinc-800 rounded w-1/4" />
        <div className="flex gap-4">
          <div className="h-10 bg-zinc-800 rounded flex-1" />
          <div className="h-10 bg-zinc-800 rounded flex-1" />
          <div className="h-10 bg-zinc-800 rounded flex-1" />
          <div className="h-10 bg-zinc-800 rounded flex-1" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="h-64 bg-zinc-900/60 rounded-xl border border-zinc-800/50" />
          <div className="h-64 bg-zinc-900/60 rounded-xl border border-zinc-800/50" />
          <div className="h-64 bg-zinc-900/60 rounded-xl border border-zinc-800/50" />
        </div>
        <div className="space-y-6">
          <div className="h-96 bg-zinc-900/60 rounded-xl border border-zinc-800/50" />
          <div className="h-64 bg-zinc-900/60 rounded-xl border border-zinc-800/50" />
        </div>
      </div>
    </div>
  );
}

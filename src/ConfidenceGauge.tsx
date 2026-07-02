

interface ConfidenceGaugeProps {
  score: number; // 0 to 100
}

export default function ConfidenceGauge({ score }: ConfidenceGaugeProps) {
  const clampedScore = Math.max(0, Math.min(100, score));
  const radius = 50;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clampedScore / 100) * circumference;

  let strokeColor = 'stroke-amber-500';
  if (clampedScore >= 80) strokeColor = 'stroke-emerald-500';
  if (clampedScore < 50) strokeColor = 'stroke-rose-500';

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-slate-900 rounded-xl border border-slate-700 shadow-[0_12px_40px_rgba(2,6,23,0.45)]">
      <div className="relative w-36 h-36">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
          <circle
            cx="60"
            cy="60"
            r={radius}
            className="stroke-slate-700 fill-none"
            strokeWidth={strokeWidth}
          />
          <circle
            cx="60"
            cy="60"
            r={radius}
            className={`${strokeColor} fill-none transition-all duration-1000 ease-out`}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-3xl font-extrabold text-slate-100">{clampedScore}%</span>
          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">Confidence</span>
        </div>
      </div>
    </div>
  );
}

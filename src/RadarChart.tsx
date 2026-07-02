

interface RadarChartProps {
  scores: {
    growth: number;
    profitability: number;
    stability: number;
    innovation: number;
    marketPosition: number;
  };
}

export default function RadarChart({ scores }: RadarChartProps) {
  const categories = [
    { label: 'Growth', key: 'growth' as const },
    { label: 'Profitability', key: 'profitability' as const },
    { label: 'Stability', key: 'stability' as const },
    { label: 'Innovation', key: 'innovation' as const },
    { label: 'Market Position', key: 'marketPosition' as const },
  ];

  const size = 300;
  const center = size / 2;
  const rMax = 100;

  const getCoordinates = (index: number, value: number) => {
    const angle = (Math.PI * 2 * index) / categories.length - Math.PI / 2;
    const r = (value / 100) * rMax;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y };
  };

  const gridRings = [25, 50, 75, 100];

  const points = categories.map((cat, i) => {
    const coord = getCoordinates(i, scores[cat.key]);
    return `${coord.x},${coord.y}`;
  }).join(' ');

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-slate-900 rounded-3xl border border-slate-700 shadow-sm">
      <h4 className="text-xs font-bold text-slate-400 mb-4 tracking-wide uppercase">Financial Score Matrix</h4>
      <div className="relative w-[300px] h-[300px]">
        <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full">
          {gridRings.map((r, ri) => (
            <circle
              key={ri}
              cx={center}
              cy={center}
              r={r}
              className="fill-none stroke-slate-200"
              strokeWidth="1"
            />
          ))}

          {categories.map((_, i) => {
            const edge = getCoordinates(i, 100);
            return (
              <line
                key={i}
                x1={center}
                y1={center}
                x2={edge.x}
                y2={edge.y}
                className="stroke-slate-200"
                strokeWidth="1"
              />
            );
          })}

          <polygon
            points={points}
            className="fill-blue-500/10 stroke-blue-500"
            strokeWidth="2.5"
          />

          {categories.map((cat, i) => {
            const coord = getCoordinates(i, scores[cat.key]);
            return (
              <circle
                key={i}
                cx={coord.x}
                cy={coord.y}
                r="4.5"
                className="fill-blue-600 stroke-white"
                strokeWidth="1.5"
              />
            );
          })}

          {categories.map((cat, i) => {
            const labelCoord = getCoordinates(i, 120);
            let textAnchor: 'start' | 'middle' | 'end' = 'middle';
            if (labelCoord.x > center + 10) textAnchor = 'start';
            if (labelCoord.x < center - 10) textAnchor = 'end';

            return (
              <text
                key={i}
                x={labelCoord.x}
                y={labelCoord.y + 4}
                fill="#475569"
                fontSize="9"
                fontWeight="700"
                textAnchor={textAnchor}
                className="font-mono tracking-wide"
              >
                {cat.label} ({scores[cat.key]})
              </text>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

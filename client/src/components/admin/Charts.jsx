import { useState } from 'react';
import { formatCount } from '../../utils/format.js';

const W = 640;
const H = 220;
const PAD = { l: 40, r: 12, t: 12, b: 28 };

const dayLabel = (iso) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });

// data: [{ date: 'YYYY-MM-DD', value: number }]
export function LineChart({ data, noun, label }) {
  const [hover, setHover] = useState(null);
  const n = data.length;
  if (n === 0) return null;

  const peak = Math.max(...data.map((d) => d.value), 0);
  const max = Math.max(4, Math.ceil(peak / 4) * 4); // always divisible by 4 so tick labels are whole numbers
  const innerW = W - PAD.l - PAD.r;
  const innerH = H - PAD.t - PAD.b;
  const x = (i) => PAD.l + (n === 1 ? innerW / 2 : (i * innerW) / (n - 1));
  const y = (v) => PAD.t + innerH * (1 - v / max);

  const line = data.map((d, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(d.value).toFixed(1)}`).join(' ');
  const area = `${line} L${x(n - 1).toFixed(1)},${PAD.t + innerH} L${x(0).toFixed(1)},${PAD.t + innerH} Z`;
  const ticks = [0, 1, 2, 3, 4].map((i) => (max * i) / 4);
  const step = Math.max(1, Math.ceil(n / 6));
  const bandW = innerW / n;
  const hovered = hover !== null ? data[hover] : null;

  return (
    <figure>
      <p className="mb-2 h-5 text-sm text-ink-600 dark:text-ink-300" aria-live="polite">
        {hovered ? `${dayLabel(hovered.date)}: ${hovered.value.toLocaleString()} ${noun}` : 'Hover or tap the chart for daily values'}
      </p>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={label} onMouseLeave={() => setHover(null)}>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={PAD.l} x2={W - PAD.r} y1={y(t)} y2={y(t)} className="stroke-ink-200 dark:stroke-ink-800" strokeWidth="1" />
            <text x={PAD.l - 8} y={y(t) + 4} textAnchor="end" className="fill-ink-500" fontSize="11">{formatCount(t)}</text>
          </g>
        ))}

        <path d={area} className="fill-brand-600/10" />
        <path d={line} fill="none" className="stroke-brand-600 dark:stroke-brand-400" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />

        {data.map((d, i) =>
          i % step === 0 || i === n - 1 ? (
            <text key={d.date} x={x(i)} y={H - 8} textAnchor={i === 0 ? 'start' : i === n - 1 ? 'end' : 'middle'} className="fill-ink-500" fontSize="11">
              {dayLabel(d.date)}
            </text>
          ) : null
        )}

        {hover !== null && (
          <g>
            <line x1={x(hover)} x2={x(hover)} y1={PAD.t} y2={PAD.t + innerH} className="stroke-ink-300 dark:stroke-ink-600" strokeDasharray="3 3" />
            <circle cx={x(hover)} cy={y(data[hover].value)} r="4.5" className="fill-brand-600 stroke-white dark:stroke-ink-900" strokeWidth="2" />
          </g>
        )}

        {data.map((d, i) => (
          <rect
            key={d.date}
            x={x(i) - bandW / 2}
            y={PAD.t}
            width={bandW}
            height={innerH}
            fill="transparent"
            onMouseEnter={() => setHover(i)}
            onClick={() => setHover(i)}
          />
        ))}
      </svg>
    </figure>
  );
}

// items: [{ name, posts, views }]
export function BarList({ items }) {
  const max = Math.max(1, ...items.map((i) => i.posts));
  return (
    <ul className="space-y-4">
      {items.map((i) => (
        <li key={i.name}>
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="truncate font-medium text-ink-900 dark:text-white">{i.name}</span>
            <span className="shrink-0 text-xs text-ink-500">
              {i.posts} {i.posts === 1 ? 'post' : 'posts'}, {formatCount(i.views)} views
            </span>
          </div>
          <div className="mt-1.5 h-2 rounded-full bg-ink-100 dark:bg-ink-800">
            <div className="h-2 rounded-full bg-brand-600" style={{ width: `${(i.posts / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}
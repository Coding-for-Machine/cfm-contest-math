import React, { useMemo, useState } from 'react';
import { Mafs, Coordinates, Plot, Point, Vector, Line, Circle, Polygon, Text } from 'mafs';
import { compile } from 'mathjs';
import { Copy, Check } from 'lucide-react';

type V2 = [number, number];

type Item =
  | { type: 'function'; expr: string; color?: string; domain?: V2 }
  | { type: 'point'; x: number; y: number; color?: string; label?: string }
  | { type: 'vector'; from?: V2; to: V2; color?: string }
  | { type: 'segment'; a: V2; b: V2; color?: string }
  | { type: 'circle'; center: V2; r: number; color?: string }
  | { type: 'polygon'; points: V2[]; color?: string }
  | { type: 'text'; x: number; y: number; text: string };

interface Spec {
  x?: V2;
  y?: V2;
  height?: number;
  grid?: boolean;
  items: Item[];
}

const DEFAULT_COLOR = '#2563eb';

/** mathjs orqali xavfsiz hisoblash (eval ishlatilmaydi) */
function makeFn(expr: string): (x: number) => number {
  if (expr.length > 200) return () => NaN;
  try {
    const code = compile(expr);
    return (x) => {
      try {
        const v = code.evaluate({ x });
        return typeof v === 'number' && Number.isFinite(v) ? v : NaN;
      } catch {
        return NaN;
      }
    };
  } catch {
    return () => NaN;
  }
}

function FunctionPlot({ item }: { item: Extract<Item, { type: 'function' }> }) {
  const fn = useMemo(() => makeFn(item.expr), [item.expr]);
  return (
    <Plot.OfX
      y={fn}
      color={item.color ?? DEFAULT_COLOR}
      domain={item.domain}
    />
  );
}

export default function MathGraph({ source }: { source: string }) {
  const [copied, setCopied] = useState(false);

  const parsed = useMemo(() => {
    try {
      const cleanSource = source.trim();
      const spec = JSON.parse(cleanSource) as Spec;
      if (!Array.isArray(spec.items)) throw new Error("items massiv bo'lishi kerak");
      return { spec, error: null as string | null };
    } catch (e) {
      return { spec: null, error: e instanceof Error ? e.message : 'JSON xato' };
    }
  }, [source]);

  const handleCopy = () => {
    navigator.clipboard?.writeText(source);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!parsed.spec) {
    return (
      <div className="my-5 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 font-mono">
        Grafik JSON xato: {parsed.error}
      </div>
    );
  }

  const { x = [-5, 5], y = [-5, 5], height = 320, grid = true, items } = parsed.spec;

  return (
    <div className="my-6 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm relative group">
      {/* Top action bar with Copy button */}
      <div className="absolute top-2 right-2 z-10 opacity-80 group-hover:opacity-100 transition-opacity">
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/90 dark:bg-slate-800/90 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200 dark:border-slate-700 shadow-sm transition-colors"
          title="Mafs JSON kodini nusxalash"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
          <span>{copied ? 'Nusxalandi' : 'Nusxalash'}</span>
        </button>
      </div>

      <Mafs viewBox={{ x, y }} height={height} preserveAspectRatio={false}>
        {grid && <Coordinates.Cartesian />}

        {items.map((item, i) => {
          const color = 'color' in item ? item.color ?? DEFAULT_COLOR : DEFAULT_COLOR;
          switch (item.type) {
            case 'function':
              return <FunctionPlot key={i} item={item} />;
            case 'point':
              return (
                <g key={i}>
                  <Point x={item.x} y={item.y} color={color} />
                  {item.label && (
                    <Text x={item.x} y={item.y} attach="ne" attachDistance={12}>
                      {item.label}
                    </Text>
                  )}
                </g>
              );
            case 'vector':
              return <Vector key={i} tail={item.from ?? [0, 0]} tip={item.to} color={color} />;
            case 'segment':
              return <Line.Segment key={i} point1={item.a} point2={item.b} color={color} />;
            case 'circle':
              return <Circle key={i} center={item.center} radius={item.r} color={color} />;
            case 'polygon':
              return <Polygon key={i} points={item.points} color={color} />;
            case 'text':
              return (
                <Text key={i} x={item.x} y={item.y}>
                  {item.text}
                </Text>
              );
            default:
              return null;
          }
        })}
      </Mafs>
    </div>
  );
}

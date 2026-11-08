import React, { useState, useMemo } from 'react';
import MathGraph from './MathGraph';
import {
  Plus,
  Trash2,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  TrendingUp,
  CircleDot,
  ArrowRight,
  Minus,
  Circle as CircleIcon,
  Shapes,
  Type,
  ChevronDown,
  Layers,
  ArrowUpRight,
} from 'lucide-react';

export type V2 = [number, number];

export type MafsItem =
  | { id: string; type: 'function'; expr: string; color: string; hasDomain?: boolean; domain?: V2 }
  | { id: string; type: 'point'; x: number; y: number; color: string; label: string }
  | { id: string; type: 'vector'; from: V2; to: V2; color: string }
  | { id: string; type: 'segment'; a: V2; b: V2; color: string }
  | { id: string; type: 'circle'; center: V2; r: number; color: string }
  | { id: string; type: 'polygon'; points: V2[]; color: string }
  | { id: string; type: 'text'; x: number; y: number; text: string; color?: string };

const PRESET_COLORS = [
  { name: "Ko'k", value: '#2563eb' },
  { name: 'Qizil', value: '#ef4444' },
  { name: 'Yashil', value: '#10b981' },
  { name: "To'q sariq", value: '#f59e0b' },
  { name: 'Binafsha', value: '#8b5cf6' },
  { name: 'Pushti', value: '#ec4899' },
  { name: 'Feruza', value: '#06b6d4' },
];

const PRESETS = [
  {
    name: 'Kvadrat Parabola (y = x² - 2x - 3)',
    desc: 'Uchi, ildizlari va urinma vektori bilan',
    x: [-4, 6] as V2,
    y: [-5, 8] as V2,
    height: 340,
    items: [
      { id: '1', type: 'function' as const, expr: 'x^2 - 2*x - 3', color: '#2563eb' },
      { id: '2', type: 'point' as const, x: 1, y: -4, color: '#ef4444', label: 'Uchi (1, -4)' },
      { id: '3', type: 'point' as const, x: 3, y: 0, color: '#10b981', label: 'x₁ = 3' },
      { id: '4', type: 'point' as const, x: -1, y: 0, color: '#10b981', label: 'x₂ = -1' },
      { id: '5', type: 'vector' as const, from: [1, -4] as V2, to: [3, 0] as V2, color: '#f59e0b' },
    ],
  },
  {
    name: 'Oddiy Parabola (y = x²)',
    desc: 'Nuqta va vektorli klassik parabola',
    x: [-5, 5] as V2,
    y: [-2, 10] as V2,
    height: 320,
    items: [
      { id: '1', type: 'function' as const, expr: 'x^2', color: '#2563eb' },
      { id: '2', type: 'point' as const, x: 2, y: 4, color: '#10b981', label: '(2, 4)' },
      { id: '3', type: 'vector' as const, from: [0, 0] as V2, to: [3, 9] as V2, color: '#ef4444' },
      { id: '4', type: 'text' as const, x: -3.5, y: 7, text: 'y = x²' },
    ],
  },
  {
    name: 'Trigonometriya (Sinus va Kosinus)',
    desc: 'To‘lqinlar va kesishish nuqtasi',
    x: [-6.5, 6.5] as V2,
    y: [-2.5, 2.5] as V2,
    height: 320,
    items: [
      { id: '1', type: 'function' as const, expr: 'sin(x)', color: '#2563eb' },
      { id: '2', type: 'function' as const, expr: 'cos(x)', color: '#8b5cf6' },
      { id: '3', type: 'point' as const, x: 0, y: 0, color: '#10b981', label: '(0, 0)' },
      { id: '4', type: 'point' as const, x: 0, y: 1, color: '#ef4444', label: '(0, 1)' },
    ],
  },
  {
    name: 'Birlik Aylana va Radius-Vektor',
    desc: 'R=3 aylana, markaz va radius',
    x: [-4, 4] as V2,
    y: [-4, 4] as V2,
    height: 320,
    items: [
      { id: '1', type: 'circle' as const, center: [0, 0] as V2, r: 3, color: '#2563eb' },
      { id: '2', type: 'point' as const, x: 0, y: 0, color: '#ef4444', label: 'O(0, 0)' },
      { id: '3', type: 'vector' as const, from: [0, 0] as V2, to: [2.12, 2.12] as V2, color: '#10b981' },
      { id: '4', type: 'text' as const, x: 1.5, y: 0.8, text: 'R = 3' },
    ],
  },
];

interface VisualMafsBuilderProps {
  onInsertToLesson?: (markdownSnippet: string) => void;
}

export function VisualMafsBuilder({ onInsertToLesson }: VisualMafsBuilderProps) {
  const [xMin, setXMin] = useState<number>(-4);
  const [xMax, setXMax] = useState<number>(6);
  const [yMin, setYMin] = useState<number>(-5);
  const [yMax, setYMax] = useState<number>(8);
  const [height, setHeight] = useState<number>(340);
  const [grid, setGrid] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);
  const [inserted, setInserted] = useState<boolean>(false);

  const [items, setItems] = useState<MafsItem[]>([
    { id: '1', type: 'function', expr: 'x^2 - 2*x - 3', color: '#2563eb' },
    { id: '2', type: 'point', x: 1, y: -4, color: '#ef4444', label: 'Uchi (1, -4)' },
    { id: '3', type: 'point', x: 3, y: 0, color: '#10b981', label: 'x₁ = 3' },
    { id: '4', type: 'point', x: -1, y: 0, color: '#10b981', label: 'x₂ = -1' },
    { id: '5', type: 'vector', from: [1, -4], to: [3, 0], color: '#f59e0b' },
  ]);

  // Clean JSON spec object for Mafs
  const generatedSpec = useMemo(() => {
    const cleanItems = items.map((item) => {
      switch (item.type) {
        case 'function':
          return {
            type: 'function',
            expr: item.expr,
            color: item.color,
            ...(item.hasDomain && item.domain ? { domain: item.domain } : {}),
          };
        case 'point':
          return {
            type: 'point',
            x: item.x,
            y: item.y,
            color: item.color,
            ...(item.label ? { label: item.label } : {}),
          };
        case 'vector':
          return {
            type: 'vector',
            from: item.from,
            to: item.to,
            color: item.color,
          };
        case 'segment':
          return {
            type: 'segment',
            a: item.a,
            b: item.b,
            color: item.color,
          };
        case 'circle':
          return {
            type: 'circle',
            center: item.center,
            r: item.r,
            color: item.color,
          };
        case 'polygon':
          return {
            type: 'polygon',
            points: item.points,
            color: item.color,
          };
        case 'text':
          return {
            type: 'text',
            x: item.x,
            y: item.y,
            text: item.text,
          };
      }
    });

    return {
      x: [xMin, xMax] as V2,
      y: [yMin, yMax] as V2,
      height,
      grid,
      items: cleanItems,
    };
  }, [xMin, xMax, yMin, yMax, height, grid, items]);

  const jsonString = useMemo(() => {
    return JSON.stringify(generatedSpec, null, 2);
  }, [generatedSpec]);

  const fullMarkdownBlock = useMemo(() => {
    return `\`\`\`mafs\n${jsonString}\n\`\`\``;
  }, [jsonString]);

  const handleCopyMarkdown = () => {
    navigator.clipboard?.writeText(fullMarkdownBlock);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInsert = () => {
    if (onInsertToLesson) {
      onInsertToLesson(`\n\n${fullMarkdownBlock}\n\n`);
      setInserted(true);
      setTimeout(() => setInserted(false), 2000);
    }
  };

  const loadPreset = (preset: (typeof PRESETS)[0]) => {
    setXMin(preset.x[0]);
    setXMax(preset.x[1]);
    setYMin(preset.y[0]);
    setYMax(preset.y[1]);
    setHeight(preset.height);
    setItems(preset.items);
  };

  // Add Item Handlers
  const addFunction = () => {
    setItems((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).substring(2, 9),
        type: 'function',
        expr: '2*x + 1',
        color: '#2563eb',
      },
    ]);
  };

  const addPoint = () => {
    setItems((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).substring(2, 9),
        type: 'point',
        x: 0,
        y: 0,
        color: '#ef4444',
        label: 'A(0, 0)',
      },
    ]);
  };

  const addVector = () => {
    setItems((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).substring(2, 9),
        type: 'vector',
        from: [0, 0],
        to: [2, 2],
        color: '#10b981',
      },
    ]);
  };

  const addSegment = () => {
    setItems((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).substring(2, 9),
        type: 'segment',
        a: [-2, -2],
        b: [2, 2],
        color: '#8b5cf6',
      },
    ]);
  };

  const addCircle = () => {
    setItems((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).substring(2, 9),
        type: 'circle',
        center: [0, 0],
        r: 2,
        color: '#ec4899',
      },
    ]);
  };

  const addText = () => {
    setItems((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).substring(2, 9),
        type: 'text',
        x: 1,
        y: 2,
        text: 'Izoh matni',
      },
    ]);
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

  const updateItem = (id: string, updates: Partial<MafsItem>) => {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? ({ ...it, ...updates } as MafsItem) : it))
    );
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Top Action Bar & Presets */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-3 sm:p-4 rounded-2xl">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 mr-1 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Tayyor Andozalar:
          </span>
          {PRESETS.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => loadPreset(preset)}
              className="px-2.5 py-1 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors border border-slate-700/60"
            >
              {preset.name}
            </button>
          ))}
        </div>

        {/* Global Export Buttons */}
        <div className="flex items-center gap-2">
          {onInsertToLesson && (
            <button
              type="button"
              onClick={handleInsert}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shadow-sm ${
                inserted
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-indigo-500/30'
              }`}
            >
              {inserted ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
              <span>{inserted ? "Qo'shildi!" : "Darslikka qo'shish"}</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleCopyMarkdown}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-md ${
              copied
                ? 'bg-emerald-600 text-white shadow-emerald-500/20'
                : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-indigo-500/20'
            }`}
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Nusxalandi!' : 'Django formatida nusxalash'}</span>
          </button>
        </div>
      </div>

      {/* Main Two-Column Layout: Controls on Left, Live View on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Visual Controls (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-5">
          {/* Viewport & Axes Settings */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              Koordinata O‘qlari va O‘lchamlar
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">X Min</label>
                <input
                  type="number"
                  value={xMin}
                  onChange={(e) => setXMin(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">X Max</label>
                <input
                  type="number"
                  value={xMax}
                  onChange={(e) => setXMax(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Y Min</label>
                <input
                  type="number"
                  value={yMin}
                  onChange={(e) => setYMin(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Y Max</label>
                <input
                  type="number"
                  value={yMax}
                  onChange={(e) => setYMax(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-[11px] text-slate-400 mb-1">Balandlik</label>
                <input
                  type="number"
                  value={height}
                  step={20}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-800/80">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={grid}
                  onChange={(e) => setGrid(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-0"
                />
                Kataklar to‘rini ko‘rsatish (Cartesian Grid)
              </label>
              <span className="text-[11px] text-slate-500 font-mono">
                [{xMin}, {xMax}] × [{yMin}, {yMax}]
              </span>
            </div>
          </div>

          {/* Quick Add Elements Palette */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Plus className="w-3.5 h-3.5 text-indigo-400" />
                Grafikka Yangi Element Qo‘shish
              </h3>
              <span className="text-[11px] text-slate-500">{items.length} ta element mavjud</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={addFunction}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-xs font-medium text-slate-200 hover:text-white transition-all text-left"
              >
                <TrendingUp className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>+ Funksiya f(x)</span>
              </button>

              <button
                type="button"
                onClick={addPoint}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-xs font-medium text-slate-200 hover:text-white transition-all text-left"
              >
                <CircleDot className="w-4 h-4 text-rose-400 shrink-0" />
                <span>+ Nuqta (x, y)</span>
              </button>

              <button
                type="button"
                onClick={addVector}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-xs font-medium text-slate-200 hover:text-white transition-all text-left"
              >
                <ArrowRight className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>+ Vektor</span>
              </button>

              <button
                type="button"
                onClick={addSegment}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-xs font-medium text-slate-200 hover:text-white transition-all text-left"
              >
                <Minus className="w-4 h-4 text-purple-400 shrink-0" />
                <span>+ Kesma (Segment)</span>
              </button>

              <button
                type="button"
                onClick={addCircle}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-xs font-medium text-slate-200 hover:text-white transition-all text-left"
              >
                <CircleIcon className="w-4 h-4 text-pink-400 shrink-0" />
                <span>+ Aylana (Circle)</span>
              </button>

              <button
                type="button"
                onClick={addText}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-xs font-medium text-slate-200 hover:text-white transition-all text-left"
              >
                <Type className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>+ Matn / Izoh</span>
              </button>
            </div>
          </div>

          {/* List of Configured Items */}
          <div className="flex flex-col gap-3">
            {items.map((item, idx) => (
              <div
                key={item.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 transition-all shadow-sm"
              >
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-[11px] font-mono font-bold text-slate-400 flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-bold text-slate-200 capitalize">
                      {item.type === 'function' && 'Funksiya f(x)'}
                      {item.type === 'point' && 'Nuqta'}
                      {item.type === 'vector' && 'Vektor (Yo‘naltirilgan kesma)'}
                      {item.type === 'segment' && 'Kesma'}
                      {item.type === 'circle' && 'Aylana'}
                      {item.type === 'polygon' && 'Ko‘pburchak'}
                      {item.type === 'text' && 'Yozuv / Izoh'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Color Presets */}
                    <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
                      {PRESET_COLORS.map((c) => (
                        <button
                          key={c.value}
                          type="button"
                          onClick={() => updateItem(item.id, { color: c.value })}
                          className={`w-4 h-4 rounded-full transition-transform ${
                            'color' in item && item.color === c.value
                              ? 'scale-125 ring-2 ring-white/50'
                              : 'opacity-70 hover:opacity-100'
                          }`}
                          style={{ backgroundColor: c.value }}
                          title={c.name}
                        />
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="O‘chirish"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Specific Editor per Item Type */}
                {item.type === 'function' && (
                  <div className="space-y-2">
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">
                        Funksiya ifodasi (masalan: x^2 - 2*x - 3, sin(x), sqrt(x), 1/x)
                      </label>
                      <input
                        type="text"
                        value={item.expr}
                        onChange={(e) => updateItem(item.id, { expr: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 font-mono text-xs text-white focus:outline-none focus:border-indigo-500"
                        placeholder="x^2 - 2*x - 3"
                      />
                    </div>
                    {/* Quick formula tokens */}
                    <div className="flex flex-wrap items-center gap-1 text-[10px]">
                      <span className="text-slate-500 mr-1">Shablon:</span>
                      {['x^2', '2*x + 1', 'sin(x)', 'cos(x)', 'sqrt(x)', '1/x', 'abs(x)', 'x^3'].map(
                        (f) => (
                          <button
                            key={f}
                            type="button"
                            onClick={() => updateItem(item.id, { expr: f })}
                            className="px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300 font-mono hover:border-slate-600"
                          >
                            {f}
                          </button>
                        )
                      )}
                    </div>
                  </div>
                )}

                {item.type === 'point' && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">X Koordinata</label>
                      <input
                        type="number"
                        step="any"
                        value={item.x}
                        onChange={(e) => updateItem(item.id, { x: Number(e.target.value) })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Y Koordinata</label>
                      <input
                        type="number"
                        step="any"
                        value={item.y}
                        onChange={(e) => updateItem(item.id, { y: Number(e.target.value) })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Yorliq (Label)</label>
                      <input
                        type="text"
                        value={item.label}
                        onChange={(e) => updateItem(item.id, { label: e.target.value })}
                        placeholder="masalan: A(1, 2)"
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                )}

                {item.type === 'vector' && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Boshlanish X₁</label>
                      <input
                        type="number"
                        step="any"
                        value={item.from[0]}
                        onChange={(e) =>
                          updateItem(item.id, { from: [Number(e.target.value), item.from[1]] })
                        }
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Boshlanish Y₁</label>
                      <input
                        type="number"
                        step="any"
                        value={item.from[1]}
                        onChange={(e) =>
                          updateItem(item.id, { from: [item.from[0], Number(e.target.value)] })
                        }
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Tugash X₂</label>
                      <input
                        type="number"
                        step="any"
                        value={item.to[0]}
                        onChange={(e) =>
                          updateItem(item.id, { to: [Number(e.target.value), item.to[1]] })
                        }
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Tugash Y₂</label>
                      <input
                        type="number"
                        step="any"
                        value={item.to[1]}
                        onChange={(e) =>
                          updateItem(item.id, { to: [item.to[0], Number(e.target.value)] })
                        }
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs text-white"
                      />
                    </div>
                  </div>
                )}

                {item.type === 'segment' && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Nuqta A (x)</label>
                      <input
                        type="number"
                        step="any"
                        value={item.a[0]}
                        onChange={(e) =>
                          updateItem(item.id, { a: [Number(e.target.value), item.a[1]] })
                        }
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Nuqta A (y)</label>
                      <input
                        type="number"
                        step="any"
                        value={item.a[1]}
                        onChange={(e) =>
                          updateItem(item.id, { a: [item.a[0], Number(e.target.value)] })
                        }
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Nuqta B (x)</label>
                      <input
                        type="number"
                        step="any"
                        value={item.b[0]}
                        onChange={(e) =>
                          updateItem(item.id, { b: [Number(e.target.value), item.b[1]] })
                        }
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Nuqta B (y)</label>
                      <input
                        type="number"
                        step="any"
                        value={item.b[1]}
                        onChange={(e) =>
                          updateItem(item.id, { b: [item.b[0], Number(e.target.value)] })
                        }
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs text-white"
                      />
                    </div>
                  </div>
                )}

                {item.type === 'circle' && (
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Markaz X</label>
                      <input
                        type="number"
                        step="any"
                        value={item.center[0]}
                        onChange={(e) =>
                          updateItem(item.id, { center: [Number(e.target.value), item.center[1]] })
                        }
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Markaz Y</label>
                      <input
                        type="number"
                        step="any"
                        value={item.center[1]}
                        onChange={(e) =>
                          updateItem(item.id, { center: [item.center[0], Number(e.target.value)] })
                        }
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Radius (r)</label>
                      <input
                        type="number"
                        min="0.1"
                        step="any"
                        value={item.r}
                        onChange={(e) =>
                          updateItem(item.id, { r: Math.max(0.1, Number(e.target.value)) })
                        }
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs text-white"
                      />
                    </div>
                  </div>
                )}

                {item.type === 'text' && (
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">X Koordinata</label>
                      <input
                        type="number"
                        step="any"
                        value={item.x}
                        onChange={(e) => updateItem(item.id, { x: Number(e.target.value) })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Y Koordinata</label>
                      <input
                        type="number"
                        step="any"
                        value={item.y}
                        onChange={(e) => updateItem(item.id, { y: Number(e.target.value) })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Matn</label>
                      <input
                        type="text"
                        value={item.text}
                        onChange={(e) => updateItem(item.id, { text: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs text-white"
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Live Interactive Preview & Generated Django Code (5 cols) */}
        <div className="lg:col-span-5 sticky top-20 flex flex-col gap-4">
          {/* Live Render Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 sm:p-4 shadow-xl">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-xs">
              <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                Jonli Grafik Natijasi (Mafs)
              </span>
              <span className="text-[11px] text-slate-400 font-mono">{items.length} ta obyekt</span>
            </div>

            {/* Mafs graph preview component */}
            <div className="rounded-xl overflow-hidden bg-white">
              <MathGraph source={jsonString} />
            </div>
          </div>

          {/* Generated Django Code Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 sm:p-4 shadow-xl">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-xs">
              <span className="font-semibold text-slate-200">
                Django uchun avtomatik yaratilgan kod:
              </span>
              <button
                type="button"
                onClick={handleCopyMarkdown}
                className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 font-medium"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Nusxalandi' : 'Kodni nusxalash'}</span>
              </button>
            </div>

            <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-indigo-300 overflow-x-auto max-h-56 leading-relaxed">
              {fullMarkdownBlock}
            </pre>
            <p className="text-[11px] text-slate-500 mt-2">
              Ustoz va adminlar hech qanday JSON yozishi shart emas. Yuqoridagi tugmani bosish orqali
              ushbu toza kodni to‘g‘ridan-to‘g‘ri Django TextField maydoniga qo‘yishlari mumkin.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

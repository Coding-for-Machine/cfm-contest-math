import React, { useState } from 'react';
import MathGraph from './MathGraph';
import { X, Plus, Trash2, Check, Copy, ArrowRight, Eye } from 'lucide-react';

interface MafsVisualBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertToEditor: (codeBlock: string) => void;
}

interface BuilderItem {
  id: string;
  type: 'function' | 'point' | 'vector' | 'circle' | 'segment' | 'text';
  // function
  expr?: string;
  // point / text
  x?: number;
  y?: number;
  label?: string;
  text?: string;
  // vector
  fromX?: number;
  fromY?: number;
  toX?: number;
  toY?: number;
  // circle
  r?: number;
  // segment
  aX?: number;
  aY?: number;
  bX?: number;
  bY?: number;
  color?: string;
}

export const MafsVisualBuilderModal: React.FC<MafsVisualBuilderModalProps> = ({
  isOpen,
  onClose,
  onInsertToEditor,
}) => {
  const [xMin, setXMin] = useState(-5);
  const [xMax, setXMax] = useState(5);
  const [yMin, setYMin] = useState(-2);
  const [yMax, setYMax] = useState(10);
  const [height, setHeight] = useState(320);

  const [items, setItems] = useState<BuilderItem[]>([
    { id: '1', type: 'function', expr: 'x^2', color: '#2563eb' },
    { id: '2', type: 'point', x: 2, y: 4, color: '#10b981', label: '(2, 4)' },
    { id: '3', type: 'vector', fromX: 2, fromY: 4, toX: 4, toY: 8, color: '#ef4444' },
    { id: '4', type: 'text', x: -4, y: 8, text: 'y = x^2' },
  ]);

  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Convert builder state to standard Mafs JSON spec
  const buildJsonSpec = () => {
    const specItems = items.map((item) => {
      if (item.type === 'function') {
        return { type: 'function', expr: item.expr || 'x', color: item.color || '#2563eb' };
      }
      if (item.type === 'point') {
        return {
          type: 'point',
          x: item.x ?? 0,
          y: item.y ?? 0,
          color: item.color || '#10b981',
          label: item.label || undefined,
        };
      }
      if (item.type === 'vector') {
        return {
          type: 'vector',
          from: [item.fromX ?? 0, item.fromY ?? 0],
          to: [item.toX ?? 1, item.toY ?? 1],
          color: item.color || '#ef4444',
        };
      }
      if (item.type === 'circle') {
        return {
          type: 'circle',
          center: [item.x ?? 0, item.y ?? 0],
          r: item.r ?? 2,
          color: item.color || '#8b5cf6',
        };
      }
      if (item.type === 'segment') {
        return {
          type: 'segment',
          a: [item.aX ?? 0, item.aY ?? 0],
          b: [item.bX ?? 1, item.bY ?? 1],
          color: item.color || '#f59e0b',
        };
      }
      if (item.type === 'text') {
        return {
          type: 'text',
          x: item.x ?? 0,
          y: item.y ?? 0,
          text: item.text || '',
        };
      }
      return null;
    }).filter(Boolean);

    return JSON.stringify(
      {
        x: [xMin, xMax],
        y: [yMin, yMax],
        height,
        items: specItems,
      },
      null,
      2
    );
  };

  const jsonOutput = buildJsonSpec();
  const fencedMarkdownBlock = `\`\`\`mafs\n${jsonOutput}\n\`\`\``;

  const handleCopy = () => {
    navigator.clipboard?.writeText(fencedMarkdownBlock);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const addItem = (type: BuilderItem['type']) => {
    const id = Date.now().toString();
    if (type === 'function') {
      setItems((prev) => [...prev, { id, type, expr: 'sin(x)', color: '#10b981' }]);
    } else if (type === 'point') {
      setItems((prev) => [...prev, { id, type, x: 0, y: 0, color: '#f59e0b', label: '(0, 0)' }]);
    } else if (type === 'vector') {
      setItems((prev) => [...prev, { id, type, fromX: 0, fromY: 0, toX: 2, toY: 2, color: '#ec4899' }]);
    } else if (type === 'circle') {
      setItems((prev) => [...prev, { id, type, x: 0, y: 0, r: 3, color: '#8b5cf6' }]);
    } else if (type === 'segment') {
      setItems((prev) => [...prev, { id, type, aX: -2, aY: 0, bX: 2, bY: 0, color: '#06b6d4' }]);
    } else if (type === 'text') {
      setItems((prev) => [...prev, { id, type, x: 1, y: 1, text: 'Matn' }]);
    }
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-slate-800 bg-slate-950/80">
          <div>
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
              Mafs Vizual Konstruktor (Django Markdown Uchun)
            </h3>
            <p className="text-xs text-slate-400">
              Elementlarni sozlang, real vaqtda ko'ring va Django text field'ga tashlang
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Controls Column */}
          <div className="space-y-4">
            {/* Viewport Bounds */}
            <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
              <span className="text-xs font-bold text-slate-300 block mb-2">Koordinata chegaralari:</span>
              <div className="grid grid-cols-4 gap-2 text-xs">
                <div>
                  <label className="text-[10px] text-slate-400 block">X min</label>
                  <input
                    type="number"
                    value={xMin}
                    onChange={(e) => setXMin(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 font-mono text-center text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block">X max</label>
                  <input
                    type="number"
                    value={xMax}
                    onChange={(e) => setXMax(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 font-mono text-center text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block">Y min</label>
                  <input
                    type="number"
                    value={yMin}
                    onChange={(e) => setYMin(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 font-mono text-center text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block">Y max</label>
                  <input
                    type="number"
                    value={yMax}
                    onChange={(e) => setYMax(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 font-mono text-center text-white"
                  />
                </div>
              </div>
            </div>

            {/* Add Items Toolbar */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-300">Grafik elementlari:</span>
                <div className="flex items-center gap-1 flex-wrap">
                  <button
                    type="button"
                    onClick={() => addItem('function')}
                    className="px-2 py-0.5 rounded-lg bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 text-[11px] hover:bg-indigo-600/50"
                  >
                    + Funksiya
                  </button>
                  <button
                    type="button"
                    onClick={() => addItem('point')}
                    className="px-2 py-0.5 rounded-lg bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-[11px] hover:bg-emerald-600/50"
                  >
                    + Nuqta
                  </button>
                  <button
                    type="button"
                    onClick={() => addItem('vector')}
                    className="px-2 py-0.5 rounded-lg bg-rose-600/30 text-rose-300 border border-rose-500/40 text-[11px] hover:bg-rose-600/50"
                  >
                    + Vektor
                  </button>
                  <button
                    type="button"
                    onClick={() => addItem('circle')}
                    className="px-2 py-0.5 rounded-lg bg-purple-600/30 text-purple-300 border border-purple-500/40 text-[11px] hover:bg-purple-600/50"
                  >
                    + Aylana
                  </button>
                  <button
                    type="button"
                    onClick={() => addItem('text')}
                    className="px-2 py-0.5 rounded-lg bg-amber-600/30 text-amber-300 border border-amber-500/40 text-[11px] hover:bg-amber-600/50"
                  >
                    + Matn
                  </button>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {items.map((item, idx) => (
                  <div
                    key={item.id}
                    className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2 text-xs"
                  >
                    <span className="font-mono text-slate-500 text-[10px] w-4">{idx + 1}</span>
                    <span className="font-bold text-slate-300 text-[11px] uppercase w-16">
                      {item.type}
                    </span>

                    {/* Specific inputs */}
                    {item.type === 'function' && (
                      <input
                        type="text"
                        value={item.expr || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setItems((prev) =>
                            prev.map((i) => (i.id === item.id ? { ...i, expr: val } : i))
                          );
                        }}
                        placeholder="masalan: x^2 - 4"
                        className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 font-mono text-white text-xs"
                      />
                    )}

                    {item.type === 'point' && (
                      <div className="flex-1 flex items-center gap-1">
                        <span className="text-[10px] text-slate-400">x:</span>
                        <input
                          type="number"
                          value={item.x ?? 0}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setItems((prev) =>
                              prev.map((i) => (i.id === item.id ? { ...i, x: val } : i))
                            );
                          }}
                          className="w-12 bg-slate-900 border border-slate-700 rounded-lg px-1 py-1 font-mono text-center text-white"
                        />
                        <span className="text-[10px] text-slate-400">y:</span>
                        <input
                          type="number"
                          value={item.y ?? 0}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setItems((prev) =>
                              prev.map((i) => (i.id === item.id ? { ...i, y: val } : i))
                            );
                          }}
                          className="w-12 bg-slate-900 border border-slate-700 rounded-lg px-1 py-1 font-mono text-center text-white"
                        />
                        <input
                          type="text"
                          value={item.label || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setItems((prev) =>
                              prev.map((i) => (i.id === item.id ? { ...i, label: val } : i))
                            );
                          }}
                          placeholder="label"
                          className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-1.5 py-1 text-white text-xs"
                        />
                      </div>
                    )}

                    {item.type === 'vector' && (
                      <div className="flex-1 flex items-center gap-1 font-mono text-[10px]">
                        <span>to:</span>
                        <input
                          type="number"
                          value={item.toX ?? 0}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setItems((prev) =>
                              prev.map((i) => (i.id === item.id ? { ...i, toX: val } : i))
                            );
                          }}
                          className="w-10 bg-slate-900 border border-slate-700 rounded px-1 py-0.5 text-center text-white"
                        />
                        <input
                          type="number"
                          value={item.toY ?? 0}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setItems((prev) =>
                              prev.map((i) => (i.id === item.id ? { ...i, toY: val } : i))
                            );
                          }}
                          className="w-10 bg-slate-900 border border-slate-700 rounded px-1 py-0.5 text-center text-white"
                        />
                      </div>
                    )}

                    {item.type === 'circle' && (
                      <div className="flex-1 flex items-center gap-1 font-mono text-[10px]">
                        <span>r:</span>
                        <input
                          type="number"
                          value={item.r ?? 2}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setItems((prev) =>
                              prev.map((i) => (i.id === item.id ? { ...i, r: val } : i))
                            );
                          }}
                          className="w-12 bg-slate-900 border border-slate-700 rounded px-1 py-0.5 text-center text-white"
                        />
                      </div>
                    )}

                    {item.type === 'text' && (
                      <input
                        type="text"
                        value={item.text || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setItems((prev) =>
                            prev.map((i) => (i.id === item.id ? { ...i, text: val } : i))
                          );
                        }}
                        placeholder="Matn"
                        className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-white text-xs"
                      />
                    )}

                    {/* Color picker */}
                    <input
                      type="color"
                      value={item.color || '#2563eb'}
                      onChange={(e) => {
                        const val = e.target.value;
                        setItems((prev) =>
                          prev.map((i) => (i.id === item.id ? { ...i, color: val } : i))
                        );
                      }}
                      className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                      title="Rangni tanlang"
                    />

                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="text-slate-500 hover:text-rose-400 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Live Preview Column */}
          <div className="flex flex-col space-y-3">
            <span className="text-xs font-bold text-slate-300">Jonli Mafs Ko'rinishi:</span>
            <div className="flex-1 min-h-[280px]">
              <MathGraph source={jsonOutput} />
            </div>

            {/* Generated JSON / Fenced Block */}
            <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 text-xs font-mono">
              <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-800 text-slate-400">
                <span className="text-[11px]">Django uchun Fenced Code:</span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Nusxalandi' : 'Nusxalash'}</span>
                </button>
              </div>
              <pre className="text-slate-300 overflow-x-auto max-h-28 text-[11px]">{fencedMarkdownBlock}</pre>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-t border-slate-800 bg-slate-950/80">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs"
          >
            Bekor qilish
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
            >
              <Copy className="w-4 h-4 text-slate-400" />
              <span>Nusxalash</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onInsertToEditor(`\n${fencedMarkdownBlock}\n`);
                onClose();
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30"
            >
              <span>Darslikka Qo'shish</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

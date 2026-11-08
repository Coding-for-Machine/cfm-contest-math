import React, { useState } from 'react';
import JSXGraphPlot from './JSXGraphPlot';
import {
  Sparkles,
  Copy,
  Check,
  Plus,
  Compass,
  Layers,
  RotateCcw,
} from 'lucide-react';

interface GeometryPreset {
  name: string;
  desc: string;
  code: string;
}

const GEOMETRY_PRESETS: GeometryPreset[] = [
  {
    name: 'Uchburchak va Tashqi Aylana',
    desc: '3 ta nuqta, uchburchak va tashqi chizilgan aylana',
    code: `const p1 = board.create('point', [-3, -1], { name: 'A', color: '#2563eb', size: 4 });
const p2 = board.create('point', [3, -1], { name: 'B', color: '#2563eb', size: 4 });
const p3 = board.create('point', [0, 3], { name: 'C', color: '#2563eb', size: 4 });

board.create('polygon', [p1, p2, p3], { fillColor: '#2563eb', fillOpacity: 0.15 });
const circle = board.create('circumcircle', [p1, p2, p3], { strokeColor: '#ef4444', strokeWidth: 2 });
board.create('point', [() => circle.center.X(), () => circle.center.Y()], { name: 'O', color: '#10b981', size: 3 });`,
  },
  {
    name: 'Uchburchak va Ichki Aylana (Incircle)',
    desc: 'Bissektrisalar kesishmasi va ichki chizilgan aylana',
    code: `const p1 = board.create('point', [-4, -2], { name: 'A', color: '#2563eb', size: 4 });
const p2 = board.create('point', [4, -2], { name: 'B', color: '#2563eb', size: 4 });
const p3 = board.create('point', [1, 4], { name: 'C', color: '#2563eb', size: 4 });

board.create('polygon', [p1, p2, p3], { fillColor: '#10b981', fillOpacity: 0.12 });
board.create('incircle', [p1, p2, p3], { strokeColor: '#10b981', strokeWidth: 2 });`,
  },
  {
    name: 'Funksiya va Urinma Chiziq (Tangent)',
    desc: 'Parabola va slayder bilan siljiydigan urinma',
    code: `const f = board.create('functiongraph', [(x) => 0.25 * x * x - 2], { strokeColor: '#2563eb', strokeWidth: 2 });
const p = board.create('glider', [2, -1, f], { name: 'M', color: '#ef4444', size: 4 });
board.create('tangent', [p], { strokeColor: '#f59e0b', strokeWidth: 2, dash: 2 });`,
  },
  {
    name: 'Vektorlar Yig‘indisi (Parallelogramm)',
    desc: 'a va b vektorlari va ularning yig‘indisi a+b',
    code: `const O = board.create('point', [0, 0], { name: 'O', fixed: true, size: 2, color: '#64748b' });
const A = board.create('point', [3, 1], { name: 'a', color: '#2563eb', size: 4 });
const B = board.create('point', [1, 3], { name: 'b', color: '#10b981', size: 4 });

const v1 = board.create('arrow', [O, A], { strokeColor: '#2563eb', strokeWidth: 3 });
const v2 = board.create('arrow', [O, B], { strokeColor: '#10b981', strokeWidth: 3 });

const C = board.create('point', [() => A.X() + B.X(), () => A.Y() + B.Y()], { name: 'a+b', color: '#ef4444', size: 4 });
board.create('arrow', [O, C], { strokeColor: '#ef4444', strokeWidth: 3 });
board.create('segment', [A, C], { strokeColor: '#94a3b8', strokeWidth: 1, dash: 2 });
board.create('segment', [B, C], { strokeColor: '#94a3b8', strokeWidth: 1, dash: 2 });`,
  },
  {
    name: 'Burchak va Uning Bissektrisasi',
    desc: 'Ixtiyoriy burchak va bissektrisa chizig‘i',
    code: `const B = board.create('point', [0, 0], { name: 'B', color: '#ef4444', size: 4 });
const A = board.create('point', [4, 0], { name: 'A', color: '#2563eb', size: 4 });
const C = board.create('point', [3, 4], { name: 'C', color: '#2563eb', size: 4 });

board.create('angle', [A, B, C], { radius: 1, fillColor: '#f59e0b', fillOpacity: 0.2 });
board.create('segment', [B, A], { strokeColor: '#2563eb' });
board.create('segment', [B, C], { strokeColor: '#2563eb' });
board.create('bisector', [A, B, C], { strokeColor: '#10b981', strokeWidth: 2, dash: 2 });`,
  },
];

interface VisualJSXGraphBuilderProps {
  onInsertToLesson?: (markdownSnippet: string) => void;
}

export function VisualJSXGraphBuilder({ onInsertToLesson }: VisualJSXGraphBuilderProps) {
  const [selectedPreset, setSelectedPreset] = useState<number>(0);
  const [code, setCode] = useState<string>(GEOMETRY_PRESETS[0].code);
  const [copied, setCopied] = useState(false);
  const [inserted, setInserted] = useState(false);

  const fullMarkdownBlock = `\`\`\`jsxgraph\n${code.trim()}\n\`\`\``;

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

  const selectPreset = (index: number) => {
    setSelectedPreset(index);
    setCode(GEOMETRY_PRESETS[index].code);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Top Presets bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-3 sm:p-4 rounded-2xl">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 mr-1 flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-teal-400" />
            Geometriya Andozalari:
          </span>
          {GEOMETRY_PRESETS.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => selectPreset(idx)}
              className={`px-2.5 py-1 text-xs rounded-lg transition-colors border ${
                selectedPreset === idx
                  ? 'bg-teal-600/20 text-teal-300 border-teal-500/40 font-medium'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700/60'
              }`}
            >
              {p.name}
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
                  : 'bg-slate-800 hover:bg-slate-700 text-teal-300 border border-teal-500/30'
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
                : 'bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white shadow-teal-500/20'
            }`}
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Nusxalandi!' : 'Django formatida nusxalash'}</span>
          </button>
        </div>
      </div>

      {/* Two Column Layout: Editor/Code & Interactive Board */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Interactive board (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-xs">
              <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-teal-400"></span>
                Interaktiv Geometriya Doskasi (Nuqtalarni sichqoncha bilan siljiting)
              </span>
              <span className="text-[11px] text-teal-400 font-medium">Drag & Drop faol</span>
            </div>

            {/* JSXGraph Plot component */}
            <JSXGraphPlot source={code} height={380} />

            <div className="mt-3 p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                <strong>Maslahat:</strong> A, B yoki C nuqtalarini qo‘lingiz bilan surib ko‘ring. Barcha
                aylanalar va hisob-kitoblar real vaqt rejimida avtomatik o‘zgaradi!
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Code & Markdown Output (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4 sticky top-20">
          {/* Quick Script Editor */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-xs text-slate-400">
              <span className="font-semibold text-slate-200">JSXGraph Kodini Sozlash:</span>
              <button
                type="button"
                onClick={() => setCode(GEOMETRY_PRESETS[selectedPreset].code)}
                className="text-[11px] text-slate-500 hover:text-slate-300 flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                Tiklash
              </button>
            </div>

            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full h-44 bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-xs text-slate-200 focus:outline-none focus:border-teal-500 resize-none leading-relaxed"
            />
          </div>

          {/* Generated Markdown Preview */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-xs">
              <span className="font-semibold text-slate-200">Django uchun nusxalanadigan blok:</span>
              <button
                type="button"
                onClick={handleCopyMarkdown}
                className="flex items-center gap-1 text-[11px] text-teal-400 hover:text-teal-300 font-medium"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Nusxalandi' : 'Nusxalash'}</span>
              </button>
            </div>

            <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-teal-300 overflow-x-auto max-h-48 leading-relaxed">
              {fullMarkdownBlock}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { MarkdownMathRenderer } from './MarkdownMathRenderer';
import { MafsVisualBuilderModal } from './MafsVisualBuilderModal';
import { JSXGraphVisualBuilderModal } from './JSXGraphVisualBuilderModal';
import {
  Copy,
  Check,
  Sparkles,
  BookOpen,
  Eye,
  Edit3,
  RotateCcw,
  Sliders,
  Compass,
  FileText,
  HelpCircle,
  Share2,
} from 'lucide-react';

const PRESET_LESSONS = {
  mafs_parabola: `Quyidagi grafikda $y = x^2$ parabola va urinma vektor tasvirlangan:

\`\`\`mafs
{
  "x": [-5, 5],
  "y": [-2, 10],
  "height": 320,
  "items": [
    { "type": "function", "expr": "x^2", "color": "#2563eb" },
    { "type": "point", "x": 2, "y": 4, "color": "#10b981", "label": "(2, 4)" },
    { "type": "vector", "from": [2, 4], "to": [4, 8], "color": "#ef4444" },
    { "type": "text", "x": -4, "y": 8, "text": "y = x^2" }
  ]
}
\`\`\`

Ushbu egri chiziqning uchi koordinata boshida $(0, 0)$ bo'lib, $x = 2$ nuqtadagi qiymati $y = 4$ ga teng. Hosilasi $y' = 2x$ bo'lgani uchun, $(2, 4)$ nuqtadagi urinma burchak koeffitsiyenti $k = 4$.`,

  jsxgraph_geometry: `# 8-Sinf: Uchburchak Medianalari va Og'irlik Markazi

Quyidagi interaktiv chizmada uchburchak uchlarini ($A, B, C$) barmoq bilan ushlab harakatlantirishingiz mumkin. Medianalar va ularning kesishish nuqtasi $G$ avtomatik ravishda qayta hisoblanadi:

\`\`\`jsxgraph
const A = board.create('point', [-3, -2], { name: 'A', size: 4, color: '#6366f1' });
const B = board.create('point', [3, -2], { name: 'B', size: 4, color: '#6366f1' });
const C = board.create('point', [0, 3], { name: 'C', size: 4, color: '#6366f1' });

const poly = board.create('polygon', [A, B, C], {
  fillColor: '#6366f1',
  fillOpacity: 0.15,
  borders: { strokeColor: '#818cf8', strokeWidth: 2 }
});

// Medianalar
const M_AB = board.create('midpoint', [A, B], { name: 'M_c', size: 2, color: '#10b981' });
const M_BC = board.create('midpoint', [B, C], { name: 'M_a', size: 2, color: '#10b981' });
const M_CA = board.create('midpoint', [C, A], { name: 'M_b', size: 2, color: '#10b981' });

board.create('segment', [C, M_AB], { strokeColor: '#10b981', dash: 2 });
board.create('segment', [A, M_BC], { strokeColor: '#10b981', dash: 2 });
board.create('segment', [B, M_CA], { strokeColor: '#10b981', dash: 2 });

// Og'irlik markazi (Centroid)
const G = board.create('intersection', [
  board.create('line', [C, M_AB], { visible: false }),
  board.create('line', [A, M_BC], { visible: false })
], { name: 'G (Markaz)', size: 4, color: '#f59e0b' });
\`\`\`

> **Teorema:** Uchburchakning uchala medianasi bitta nuqtada kesishadi va bu kesishish nuqtasi har bir medianani cho'qqidan boshlab hisoblaganda $2 : 1$ nisbatda bo'ladi!`,

  calculus_lesson: `## 11-Sinf: Funksiya Hosilasi va Egri Chiziqqa Urinma

Funksiya: $f(x) = x^3 - 3x$. Hosila formulasiga ko'ra:

$$f'(x) = 3x^2 - 3$$

Quyidagi grafikda funksiya grafigi va uning $x = 1$ nuqtadagi gorizontal urinmasi tasvirlangan:

\`\`\`mafs
{
  "x": [-3, 3],
  "y": [-4, 4],
  "height": 300,
  "items": [
    { "type": "function", "expr": "x^3 - 3*x", "color": "#6366f1" },
    { "type": "point", "x": 1, "y": -2, "color": "#ef4444", "label": "Min (1, -2)" },
    { "type": "point", "x": -1, "y": 2, "color": "#10b981", "label": "Max (-1, 2)" },
    { "type": "segment", "a": [-2, -2], "b": [2, -2], "color": "#f59e0b" }
  ]
}
\`\`\`

Statsionar nuqtalar: $f'(x) = 0 \\implies 3x^2 - 3 = 0 \\implies x = \\pm 1$. Demak, $x = 1$ nuqtada lokal minimum, $x = -1$ nuqtada lokal maksimum mavjud.`,
};

export const LessonStudioTab: React.FC = () => {
  const [markdown, setMarkdown] = useState<string>(PRESET_LESSONS.mafs_parabola);
  const [copied, setCopied] = useState(false);
  const [activeMobileView, setActiveMobileView] = useState<'both' | 'editor' | 'preview'>('both');

  const [showMafsBuilder, setShowMafsBuilder] = useState(false);
  const [showJSXGraphBuilder, setShowJSXGraphBuilder] = useState(false);

  const handleCopy = () => {
    navigator.clipboard?.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const insertSnippet = (snippet: string) => {
    setMarkdown((prev) => prev + snippet);
  };

  return (
    <div className="max-w-6xl mx-auto px-2 sm:px-4 py-2 pb-24">
      {/* Top Banner & Presets */}
      <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-3xl p-3 sm:p-4 shadow-xl mb-3">
        <div className="flex items-center justify-between flex-wrap gap-2 pb-2 mb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs sm:text-sm font-bold text-slate-100">
                Ustozlar & Admin Matematika Konstruktori
              </h2>
              <p className="text-[10px] text-slate-400">
                Grafik va formulalarni vizual yasang, Django TextField uchun nusxalang
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => setShowMafsBuilder(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>+ Mafs Grafik</span>
            </button>
            <button
              type="button"
              onClick={() => setShowJSXGraphBuilder(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold shadow-md shadow-teal-600/20 transition-all"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>+ JSXGraph Geometriya</span>
            </button>

            <button
              type="button"
              onClick={handleCopy}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-lg ${
                copied
                  ? 'bg-emerald-600 text-white shadow-emerald-500/30'
                  : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-500/30'
              }`}
              title="Django admin TextField uchun to'liq darslikni nusxalash"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Django uchun Nusxalandi!' : 'Django Uchun Nusxalash'}</span>
            </button>
          </div>
        </div>

        {/* Quick Lesson Presets */}
        <div className="flex items-center justify-between flex-wrap gap-2 pt-1 text-xs">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            <span className="text-[11px] text-slate-400 font-medium whitespace-nowrap">Dars namunalari:</span>
            <button
              type="button"
              onClick={() => setMarkdown(PRESET_LESSONS.mafs_parabola)}
              className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 text-xs font-semibold whitespace-nowrap"
            >
              9-Sinf Parabola
            </button>
            <button
              type="button"
              onClick={() => setMarkdown(PRESET_LESSONS.jsxgraph_geometry)}
              className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-300 text-xs font-semibold whitespace-nowrap"
            >
              8-Sinf Medianalar
            </button>
            <button
              type="button"
              onClick={() => setMarkdown(PRESET_LESSONS.calculus_lesson)}
              className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-purple-300 text-xs font-semibold whitespace-nowrap"
            >
              11-Sinf Hosila & Integral
            </button>
          </div>
        </div>

        {/* Quick KaTeX Formula Snippet Toolbar */}
        <div className="flex items-center gap-1 overflow-x-auto pt-2 mt-2 border-t border-slate-800/80 text-xs">
          <span className="text-[11px] text-slate-500 whitespace-nowrap mr-1">Tezkor formulalar:</span>
          {[
            { label: '$x^2$', code: ' $x^2$ ' },
            { label: '$\\frac{a}{b}$', code: ' $\\frac{a}{b}$ ' },
            { label: '$\\sqrt{x}$', code: ' $\\sqrt{x}$ ' },
            { label: '$\\int_{a}^{b}$', code: ' $\\int_{a}^{b} f(x)dx$ ' },
            { label: '$\\sum$', code: ' $\\sum_{i=1}^{n} x_i$ ' },
            { label: '$\\lim$', code: ' $\\lim_{x \\to 0} \\frac{\\sin x}{x} = 1$ ' },
            { label: 'Blok $$...$$', code: '\n\n$$\ny = ax^2 + bx + c\n$$\n\n' },
          ].map((item, i) => (
            <button
              key={i}
              type="button"
              onClick={() => insertSnippet(item.code)}
              className="px-2 py-0.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 text-indigo-300 font-mono text-[11px] whitespace-nowrap"
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* View Toggle on Mobile */}
        <div className="sm:hidden flex items-center justify-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 mt-2">
          <button
            type="button"
            onClick={() => setActiveMobileView('editor')}
            className={`flex-1 py-1 rounded-lg text-xs font-medium ${
              activeMobileView === 'editor' ? 'bg-indigo-600 text-white' : 'text-slate-400'
            }`}
          >
            Tahrirlash (Kod)
          </button>
          <button
            type="button"
            onClick={() => setActiveMobileView('preview')}
            className={`flex-1 py-1 rounded-lg text-xs font-medium ${
              activeMobileView === 'preview' ? 'bg-indigo-600 text-white' : 'text-slate-400'
            }`}
          >
            O'quvchi Ko'rinishi
          </button>
          <button
            type="button"
            onClick={() => setActiveMobileView('both')}
            className={`flex-1 py-1 rounded-lg text-xs font-medium ${
              activeMobileView === 'both' ? 'bg-indigo-600 text-white' : 'text-slate-400'
            }`}
          >
            Ikkisi
          </button>
        </div>
      </div>

      {/* Editor & Preview Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Left: Markdown Editor */}
        {(activeMobileView === 'editor' || activeMobileView === 'both') && (
          <div className="flex flex-col bg-slate-900/90 border border-slate-800 rounded-3xl p-3 sm:p-4 shadow-xl min-h-[460px]">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-xs">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Edit3 className="w-3.5 h-3.5 text-indigo-400" />
                Django Markdown Maydoni (KaTeX + ```mafs + ```jsxgraph)
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-500 font-mono">
                  {markdown.length} belgi, {markdown.split('\n').length} qator
                </span>
                <button
                  type="button"
                  onClick={() => setMarkdown('')}
                  className="text-slate-500 hover:text-rose-400 text-[11px]"
                >
                  Tozalash
                </button>
              </div>
            </div>
            <textarea
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              placeholder="Django TextField uchun markdown matnini yozing yoki konstruktor tugmalarini bosing..."
              className="flex-1 w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-xs sm:text-sm font-mono text-slate-100 placeholder-slate-600 focus:border-indigo-500 focus:outline-none resize-none leading-relaxed min-h-[420px]"
            />
          </div>
        )}

        {/* Right: Live Visual Renderer */}
        {(activeMobileView === 'preview' || activeMobileView === 'both') && (
          <div className="flex flex-col bg-slate-900/90 border border-slate-800 rounded-3xl p-3 sm:p-4 shadow-xl min-h-[460px]">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-xs">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-teal-400" />
                O'quvchi Ko'rinishi (Interaktiv Natija)
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Nusxalandi' : 'Nusxalash'}</span>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto pr-1">
              {markdown.trim() ? (
                <MarkdownMathRenderer content={markdown} />
              ) : (
                <div className="h-full flex items-center justify-center text-slate-600 text-xs py-12">
                  Matn kiritilmagan. Yuqoridagi "+ Mafs Grafik" yoki "+ JSXGraph" tugmasini bosing!
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Visual Builder Modals */}
      <MafsVisualBuilderModal
        isOpen={showMafsBuilder}
        onClose={() => setShowMafsBuilder(false)}
        onInsertToEditor={(block) => insertSnippet(block)}
      />

      <JSXGraphVisualBuilderModal
        isOpen={showJSXGraphBuilder}
        onClose={() => setShowJSXGraphBuilder(false)}
        onInsertToEditor={(block) => insertSnippet(block)}
      />
    </div>
  );
};

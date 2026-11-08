import React, { useState } from 'react';
import { VisualMafsBuilder } from './components/VisualMafsBuilder';
import { VisualJSXGraphBuilder } from './components/VisualJSXGraphBuilder';
import { VisualFormulaBuilder } from './components/VisualFormulaBuilder';
import { MarkdownMathRenderer } from './components/MarkdownMathRenderer';
import { NextJsIntegrationGuide } from './components/NextJsIntegrationGuide';
import {
  Copy,
  Check,
  Code2,
  Eye,
  Columns,
  Layers,
  Compass,
  BookOpen,
  Sparkles,
  FileText,
  TrendingUp,
} from 'lucide-react';

const INITIAL_LESSON = `# 9-Sinf Matematika: Kvadrat Funksiya va Grafik

Ushbu mavzuda biz kvadrat funksiyaning xossalari, uning grafigi (parabola) va uchi koordinatasini topishni o‘rganamiz.

Kvadrat funksiyaning umumiy ko‘rinishi:

$$f(x) = ax^2 + bx + c$$

Masalan, quyidagi funksiyani ko‘rib chiqaylik:

$$f(x) = x^2 - 2x - 3$$

Diskriminantini hisoblaymiz:
$D = b^2 - 4ac = (-2)^2 - 4(1)(-3) = 16 > 0$

Ildizlari (x o‘qi bilan kesishish nuqtalari):
$$x_1 = 3, \\quad x_2 = -1$$

Parabola uchi koordinatasi:
$$x_0 = -\\frac{b}{2a} = 1, \\quad y_0 = f(1) = -4$$

Quyidagi grafikda funksiya to‘liq tasvirlangan:

\`\`\`mafs
{
  "x": [-4, 6],
  "y": [-5, 8],
  "height": 340,
  "grid": true,
  "items": [
    { "type": "function", "expr": "x^2 - 2*x - 3", "color": "#2563eb" },
    { "type": "point", "x": 1, "y": -4, "color": "#ef4444", "label": "Uchi (1, -4)" },
    { "type": "point", "x": 3, "y": 0, "color": "#10b981", "label": "x₁ = 3" },
    { "type": "point", "x": -1, "y": 0, "color": "#10b981", "label": "x₂ = -1" },
    { "type": "vector", "from": [1, -4], "to": [3, 0], "color": "#f59e0b" }
  ]
}
\`\`\`

---

## Interaktiv Geometriya Namunasi

Quyidagi JSXGraph doskasida ixtiyoriy uchburchak va unga tashqi chizilgan aylanani ko‘rishingiz mumkin (nuqtalarni surib ko‘ring):

\`\`\`jsxgraph
const p1 = board.create('point', [-3, -1], { name: 'A', color: '#2563eb', size: 4 });
const p2 = board.create('point', [3, -1], { name: 'B', color: '#2563eb', size: 4 });
const p3 = board.create('point', [0, 3], { name: 'C', color: '#2563eb', size: 4 });

board.create('polygon', [p1, p2, p3], { fillColor: '#2563eb', fillOpacity: 0.15 });
const circle = board.create('circumcircle', [p1, p2, p3], { strokeColor: '#ef4444', strokeWidth: 2 });
board.create('point', [() => circle.center.X(), () => circle.center.Y()], { name: 'O', color: '#10b981', size: 3 });
\`\`\`

> **Xulosa:** Parabola $x$ o‘qini $(-1, 0)$ va $(3, 0)$ nuqtalarda, $y$ o‘qini esa $(0, -3)$ nuqtada kesib o‘tadi.
`;

type TabType = 'mafs_builder' | 'jsxgraph_builder' | 'formula_builder' | 'lesson_composer' | 'nextjs_guide';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('mafs_builder');
  const [markdownLesson, setMarkdownLesson] = useState<string>(INITIAL_LESSON);
  const [viewMode, setViewMode] = useState<'split' | 'editor' | 'preview'>('split');
  const [copiedAll, setCopiedAll] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCopyFullLesson = () => {
    navigator.clipboard?.writeText(markdownLesson);
    setCopiedAll(true);
    showToast('To‘liq darslik Django TextField uchun nusxalandi!');
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const handleInsertSnippetToLesson = (snippet: string) => {
    setMarkdownLesson((prev) => prev + snippet);
    showToast("Blok darslik matniga qo'shildi! «To'liq Darslik» bo'limida ko'rishingiz mumkin.");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Header Navbar */}
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800 px-3 sm:px-6 py-2.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Logo & Brand Zone */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-teal-400 flex items-center justify-center font-mono font-bold text-white shadow-md shadow-indigo-500/20 text-sm">
              ∫
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm sm:text-base text-white tracking-tight">
                  Math & Graph Studio
                </span>
                <span className="text-[11px] text-indigo-400 hidden sm:inline">
                  · Django TextField Uchun
                </span>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <nav className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-2xl overflow-x-auto text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('mafs_builder')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all whitespace-nowrap font-medium ${
                activeTab === 'mafs_builder'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5 text-indigo-300" />
              <span>Mafs Grafik Konstruktori</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('jsxgraph_builder')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all whitespace-nowrap font-medium ${
                activeTab === 'jsxgraph_builder'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Compass className="w-3.5 h-3.5 text-teal-300" />
              <span>JSXGraph Geometriya</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('formula_builder')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all whitespace-nowrap font-medium ${
                activeTab === 'formula_builder'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-purple-300" />
              <span>Formula Yaratuvchi</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('lesson_composer')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all whitespace-nowrap font-medium ${
                activeTab === 'lesson_composer'
                  ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-amber-400" />
              <span>To‘liq Darslik Maydoni</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('nextjs_guide')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all whitespace-nowrap font-medium ${
                activeTab === 'nextjs_guide'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Code2 className="w-3.5 h-3.5 text-blue-300" />
              <span>Next.js Integratsiya (Kod)</span>
            </button>
          </nav>

          {/* Primary Action Button */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleCopyFullLesson}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-md ${
                copiedAll
                  ? 'bg-emerald-600 text-white shadow-emerald-500/20'
                  : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-indigo-500/20'
              }`}
              title="To'liq darslik markdownini Django TextField uchun nusxalash"
            >
              {copiedAll ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{copiedAll ? 'Nusxalandi!' : 'Django uchun nusxalash'}</span>
              <span className="sm:hidden">{copiedAll ? 'Nusxalandi' : 'Nusxalash'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Floating notification toast */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 border border-indigo-500/50 text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-medium animate-fade-in">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6">
        {/* TAB 1: Visual Mafs Graph Builder */}
        {activeTab === 'mafs_builder' && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-indigo-400" />
                  Mafs Grafik Vizual Konstruktori
                </h2>
                <p className="text-xs text-slate-400">
                  Ustoz va adminlar hech qanday JSON yozmasdan funksiya, nuqta, vektor va aylanalar
                  qo‘shadi. Natija avtomatik ravishda Django formatiga o‘giriladi.
                </p>
              </div>
            </div>

            <VisualMafsBuilder onInsertToLesson={handleInsertSnippetToLesson} />
          </div>
        )}

        {/* TAB 2: Visual JSXGraph Builder */}
        {activeTab === 'jsxgraph_builder' && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                  <Compass className="w-5 h-5 text-teal-400" />
                  JSXGraph Interaktiv Geometriya Konstruktori
                </h2>
                <p className="text-xs text-slate-400">
                  Uchburchaklar, tashqi va ichki aylanalar, bissektrisalar va urinma chiziqlar.
                  Nuqtalarni qo‘l bilan surish mumkin!
                </p>
              </div>
            </div>

            <VisualJSXGraphBuilder onInsertToLesson={handleInsertSnippetToLesson} />
          </div>
        )}

        {/* TAB 3: Visual LaTeX Formula Builder */}
        {activeTab === 'formula_builder' && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-purple-400" />
                  Vizual Matematik Formula Yaratuvchi (LaTeX / KaTeX)
                </h2>
                <p className="text-xs text-slate-400">
                  Kasrlar, ildizlar, kvadrat tenglamalar, integrallar va qisqa ko‘paytirish
                  formulalarini tugmalar yordamida tezda yig‘ing va nusxalang.
                </p>
              </div>
            </div>

            <VisualFormulaBuilder onInsertToLesson={handleInsertSnippetToLesson} />
          </div>
        )}

        {/* TAB 4: Complete Lesson Editor & Student Reader View */}
        {activeTab === 'lesson_composer' && (
          <div className="flex flex-col gap-4">
            {/* Header toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-800">
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                  <FileText className="w-5 h-5 text-amber-400" />
                  To‘liq Darslik & Maqola Maydoni (Django TextField)
                </h2>
                <p className="text-xs text-slate-400">
                  Matn, formulalar ($...$), Mafs va JSXGraph grafiklarini bitta darslikda jamlang va
                  to‘liq nusxalang.
                </p>
              </div>

              {/* View mode toggle */}
              <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-xl text-xs">
                <button
                  type="button"
                  onClick={() => setViewMode('editor')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all ${
                    viewMode === 'editor'
                      ? 'bg-indigo-600 text-white font-medium'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Faqat tahrirlash"
                >
                  <Code2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Tahrirlash</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('preview')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all ${
                    viewMode === 'preview'
                      ? 'bg-indigo-600 text-white font-medium'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Faqat natija"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Natija</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('split')}
                  className={`hidden md:flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all ${
                    viewMode === 'split'
                      ? 'bg-indigo-600 text-white font-medium'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Yonma-yon ko'rish"
                >
                  <Columns className="w-3.5 h-3.5" />
                  <span>Yonma-yon</span>
                </button>
              </div>
            </div>

            {/* Quick Insert Snippet Buttons */}
            <div className="flex flex-wrap items-center gap-1.5 p-2 bg-slate-900/60 border border-slate-800 rounded-xl text-xs">
              <span className="text-slate-400 text-[11px] font-medium mr-1">Tezkor qo‘shish:</span>
              <button
                type="button"
                onClick={() =>
                  setMarkdownLesson(
                    (p) =>
                      p +
                      '\n\n```mafs\n{\n  "x": [-5, 5],\n  "y": [-5, 5],\n  "items": [\n    { "type": "function", "expr": "sin(x)", "color": "#2563eb" },\n    { "type": "point", "x": 0, "y": 0, "label": "(0, 0)" }\n  ]\n}\n```\n\n'
                  )
                }
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-300 font-mono text-[11px] border border-slate-700"
              >
                + ```mafs
              </button>
              <button
                type="button"
                onClick={() =>
                  setMarkdownLesson(
                    (p) =>
                      p +
                      '\n\n```jsxgraph\nconst p1 = board.create("point", [-2, 1], { name: "A", color: "#2563eb" });\nconst p2 = board.create("point", [2, 1], { name: "B", color: "#10b981" });\nboard.create("line", [p1, p2]);\n```\n\n'
                  )
                }
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-teal-300 font-mono text-[11px] border border-slate-700"
              >
                + ```jsxgraph
              </button>
              <button
                type="button"
                onClick={() => setMarkdownLesson((p) => p + ' $f(x) = x^2$ ')}
                className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-[11px] border border-slate-700"
              >
                +$...$
              </button>
              <button
                type="button"
                onClick={() =>
                  setMarkdownLesson((p) => p + '\n\n$$\ny = ax^2 + bx + c\n$$\n\n')
                }
                className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-[11px] border border-slate-700"
              >
                +$$...$$
              </button>
              <button
                type="button"
                onClick={() => setMarkdownLesson(INITIAL_LESSON)}
                className="ml-auto text-slate-500 hover:text-slate-300 text-[11px]"
              >
                Namunani qayta yuklash
              </button>
            </div>

            {/* Split Workspace */}
            <div
              className={`grid gap-4 flex-1 ${
                viewMode === 'split' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'
              }`}
            >
              {/* Editor */}
              {(viewMode === 'editor' || viewMode === 'split') && (
                <div className="flex flex-col bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl min-h-[540px]">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-xs text-slate-400">
                    <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                      <Code2 className="w-3.5 h-3.5 text-indigo-400" />
                      Django Markdown Matni
                    </span>
                    <span className="text-[11px] font-mono text-slate-500">
                      {markdownLesson.length} belgi
                    </span>
                  </div>

                  <textarea
                    value={markdownLesson}
                    onChange={(e) => setMarkdownLesson(e.target.value)}
                    placeholder="Darslik matnini bu yerga yozing..."
                    className="flex-1 w-full bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs sm:text-sm text-slate-100 placeholder-slate-600 focus:border-indigo-500 focus:outline-none resize-none leading-relaxed min-h-[480px]"
                  />
                </div>
              )}

              {/* Live Preview */}
              {(viewMode === 'preview' || viewMode === 'split') && (
                <div className="flex flex-col bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl min-h-[540px]">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-xs text-slate-400">
                    <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5 text-teal-400" />
                      O‘quvchi Ko‘radigan Jonli Natija
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyFullLesson}
                      className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 font-medium"
                    >
                      {copiedAll ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedAll ? 'Nusxalandi' : 'Darslikni nusxalash'}</span>
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto pr-1">
                    {markdownLesson.trim() ? (
                      <MarkdownMathRenderer content={markdownLesson} />
                    ) : (
                      <div className="h-full flex items-center justify-center text-slate-600 text-xs py-16">
                        Matn kiritilmagan.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 5: Next.js Integration Guide & Drop-in Code */}
        {activeTab === 'nextjs_guide' && (
          <NextJsIntegrationGuide />
        )}
      </main>
    </div>
  );
}

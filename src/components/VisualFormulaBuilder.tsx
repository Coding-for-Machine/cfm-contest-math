import React, { useState } from 'react';
import { MathView } from './MathView';
import {
  Sparkles,
  Copy,
  Check,
  Plus,
  RotateCcw,
  BookOpen,
} from 'lucide-react';

interface FormulaSnippet {
  label: string;
  latex: string;
  preview?: string;
}

interface Category {
  id: string;
  name: string;
  snippets: FormulaSnippet[];
}

const CATEGORIES: Category[] = [
  {
    id: 'basic',
    name: 'Asosiy & Algebra',
    snippets: [
      { label: 'Kasr', latex: '\\frac{a}{b}' },
      { label: 'Kvadrat ildiz', latex: '\\sqrt{x}' },
      { label: 'N-darajali ildiz', latex: '\\sqrt[n]{x}' },
      { label: 'Daraja', latex: 'x^{2}' },
      { label: 'Pastki indeks', latex: 'x_{1}' },
      { label: 'Qavs ichida kasr', latex: '\\left(\\frac{a}{b}\\right)' },
      { label: 'Plyus-minus', latex: '\\pm' },
      { label: 'Ko‘paytirish', latex: '\\cdot' },
      { label: 'Bo‘lish', latex: '\\div' },
      { label: 'Teng emas', latex: '\\ne' },
      { label: 'Kichik yoki teng', latex: '\\le' },
      { label: 'Katta yoki teng', latex: '\\ge' },
    ],
  },
  {
    id: 'equations',
    name: 'Tenglamalar & Formulalar',
    snippets: [
      {
        label: 'Kvadrat tenglama',
        latex: 'ax^2 + bx + c = 0',
      },
      {
        label: 'Diskriminant',
        latex: 'D = b^2 - 4ac',
      },
      {
        label: 'Ildizlar formulasi',
        latex: 'x_{1,2} = \\frac{-b \\pm \\sqrt{D}}{2a}',
      },
      {
        label: 'Viyet teoremasi',
        latex: 'x_1 + x_2 = -\\frac{b}{a}, \\quad x_1 \\cdot x_2 = \\frac{c}{a}',
      },
      {
        label: 'Tenglamalar sistemasi',
        latex: '\\begin{cases} 2x + y = 5 \\\\ x - y = 1 \\end{cases}',
      },
      {
        label: 'Qisqa ko‘paytirish',
        latex: '(a + b)^2 = a^2 + 2ab + b^2',
      },
    ],
  },
  {
    id: 'calculus',
    name: 'Oliy Matematika',
    snippets: [
      { label: 'Aniq integral', latex: '\\int_{a}^{b} f(x)\\,dx' },
      { label: 'Aniqmas integral', latex: '\\int f(x)\\,dx' },
      { label: 'Hosil', latex: "f'(x) = \\lim_{\\Delta x \\to 0} \\frac{f(x+\\Delta x) - f(x)}{\\Delta x}" },
      { label: 'Yig‘indi', latex: '\\sum_{i=1}^{n} a_i' },
      { label: 'Limit', latex: '\\lim_{x \\to \\infty} f(x)' },
      { label: 'Cheksizlik', latex: '\\infty' },
      { label: 'Xususiy hosila', latex: '\\frac{\\partial f}{\\partial x}' },
    ],
  },
  {
    id: 'trig',
    name: 'Trigonometriya',
    snippets: [
      { label: 'Asosiy ayniyat', latex: '\\sin^2(x) + \\cos^2(x) = 1' },
      { label: 'Sinus', latex: '\\sin(x)' },
      { label: 'Kosinus', latex: '\\cos(x)' },
      { label: 'Tangens', latex: '\\tan(x)' },
      { label: 'Kotangens', latex: '\\cot(x)' },
      { label: 'Pi soni', latex: '\\pi' },
      { label: 'Ikki hissa burchak', latex: '\\sin(2x) = 2\\sin(x)\\cos(x)' },
      { label: 'Grek alfa', latex: '\\alpha' },
      { label: 'Grek beta', latex: '\\beta' },
      { label: 'Grek gamma', latex: '\\gamma' },
      { label: 'Grek teta', latex: '\\theta' },
    ],
  },
  {
    id: 'sets_matrices',
    name: 'To‘plam & Matritsa',
    snippets: [
      { label: 'Tegishli', latex: 'x \\in A' },
      { label: 'Birlashma', latex: 'A \\cup B' },
      { label: 'Kesishma', latex: 'A \\cap B' },
      { label: 'Qism to‘plam', latex: 'A \\subset B' },
      { label: 'Bo‘sh to‘plam', latex: '\\emptyset' },
      { label: 'Vektor', latex: '\\vec{v} = (v_x, v_y)' },
      { label: 'Modul / Uzunlik', latex: '|\\vec{v}| = \\sqrt{v_x^2 + v_y^2}' },
      {
        label: '2x2 Matritsa',
        latex: '\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}',
      },
    ],
  },
];

interface VisualFormulaBuilderProps {
  onInsertToLesson?: (markdownSnippet: string) => void;
}

export function VisualFormulaBuilder({ onInsertToLesson }: VisualFormulaBuilderProps) {
  const [latex, setLatex] = useState<string>('x_{1,2} = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}');
  const [activeCategory, setActiveCategory] = useState<string>('equations');
  const [copiedInline, setCopiedInline] = useState<boolean>(false);
  const [copiedBlock, setCopiedBlock] = useState<boolean>(false);
  const [inserted, setInserted] = useState<boolean>(false);

  const insertSnippet = (snip: string) => {
    setLatex((prev) => (prev ? `${prev} ${snip}` : snip));
  };

  const handleCopyInline = () => {
    navigator.clipboard?.writeText(`$${latex}$`);
    setCopiedInline(true);
    setTimeout(() => setCopiedInline(false), 2000);
  };

  const handleCopyBlock = () => {
    navigator.clipboard?.writeText(`$$\n${latex}\n$$`);
    setCopiedBlock(true);
    setTimeout(() => setCopiedBlock(false), 2000);
  };

  const handleInsert = (asBlock: boolean) => {
    if (onInsertToLesson) {
      const snip = asBlock ? `\n\n$$\n${latex}\n$$\n\n` : ` $${latex}$ `;
      onInsertToLesson(snip);
      setInserted(true);
      setTimeout(() => setInserted(false), 2000);
    }
  };

  const currentCategory = CATEGORIES.find((c) => c.id === activeCategory) || CATEGORIES[0];

  return (
    <div className="flex flex-col gap-6">
      {/* Top action header */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-3 sm:p-4 rounded-2xl">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
            Matematik Formula Vizual Konstruktori (LaTeX / KaTeX)
          </span>
        </div>

        {/* Global Export Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {onInsertToLesson && (
            <button
              type="button"
              onClick={() => handleInsert(true)}
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
            onClick={handleCopyInline}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              copiedInline
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
            }`}
            title="Qator ichi formati: $...$"
          >
            {copiedInline ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedInline ? 'Nusxalandi' : 'Qator ichida ($...$)'}</span>
          </button>

          <button
            type="button"
            onClick={handleCopyBlock}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-md ${
              copiedBlock
                ? 'bg-emerald-600 text-white shadow-emerald-500/20'
                : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-indigo-500/20'
            }`}
            title="Alohida blok: $$...$$"
          >
            {copiedBlock ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedBlock ? 'Nusxalandi!' : 'Blok formulani nusxalash ($$...$$)'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Controls & Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Category Palette & Snippets (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-2xl overflow-x-auto">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                  activeCategory === cat.id
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Snippets Palette */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
              Tayyor Matematik Belgilar va Formulalar (Bosganda qo‘shiladi):
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {currentCategory.snippets.map((snip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => insertSnippet(snip.latex)}
                  className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-950/80 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/50 text-slate-200 transition-all group"
                >
                  <div className="text-sm text-indigo-300 group-hover:text-white font-mono py-1 pointer-events-none">
                    <MathView math={snip.latex} block={false} />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 truncate max-w-full">
                    {snip.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* LaTeX Input Code */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-xs text-slate-400">
              <span className="font-semibold text-slate-200">LaTeX Kodingiz:</span>
              <button
                type="button"
                onClick={() => setLatex('')}
                className="text-[11px] text-slate-500 hover:text-rose-400"
              >
                Tozalash
              </button>
            </div>

            <textarea
              value={latex}
              onChange={(e) => setLatex(e.target.value)}
              className="w-full h-28 bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-xs text-indigo-200 focus:outline-none focus:border-indigo-500 resize-none leading-relaxed"
              placeholder="LaTeX ifodasini kiriting..."
            />
          </div>
        </div>

        {/* Right Column: Live KaTeX Rendering & Copy Card (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4 sticky top-20">
          {/* Live Render Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800 text-xs">
              <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                Jonli Matematik Natija (KaTeX)
              </span>
            </div>

            <div className="p-6 rounded-xl bg-slate-950 border border-slate-800/90 flex items-center justify-center min-h-[140px] text-xl text-white">
              {latex.trim() ? (
                <MathView math={latex} block={true} />
              ) : (
                <span className="text-xs text-slate-600">Formula kiritilmagan</span>
              )}
            </div>
          </div>

          {/* Django Output Snippet */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-xs">
              <span className="font-semibold text-slate-200">Django TextField uchun natija:</span>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-[11px] text-slate-400 block mb-1">
                  Alohida blok sifatida (markazda):
                </span>
                <pre className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-indigo-300 overflow-x-auto">
                  {`$$\n${latex}\n$$`}
                </pre>
              </div>

              <div>
                <span className="text-[11px] text-slate-400 block mb-1">
                  Matn ichida (Inline):
                </span>
                <pre className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto">
                  {`$${latex}$`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

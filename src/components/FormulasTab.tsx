import React, { useState, useMemo } from 'react';
import { MathView } from './MathView';
import { Search, Calculator, Sparkles, BookOpen, ChevronRight, Check } from 'lucide-react';

interface FormulaItem {
  id: string;
  category: 'algebra' | 'trig' | 'geometry' | 'calculus' | 'stats';
  title: string;
  latex: string;
  description: string;
  calc?: {
    inputs: { name: string; key: string; defaultValue: number }[];
    compute: (vals: Record<string, number>) => string;
  };
}

export const FormulasTab: React.FC = () => {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<
    'all' | 'algebra' | 'trig' | 'geometry' | 'calculus' | 'stats'
  >('all');
  const [selectedFormulaId, setSelectedFormulaId] = useState<string | null>('geom-pythagoras');
  const [calcValues, setCalcValues] = useState<Record<string, number>>({ a: 3, b: 4 });

  const formulas: FormulaItem[] = useMemo(
    () => [
      // Algebra
      {
        id: 'alg-diff-squares',
        category: 'algebra',
        title: "Kvadratlar ayirmasi",
        latex: "a^2 - b^2 = (a - b)(a + b)",
        description: "Ikki son kvadratlari ayirmasini ko'paytuvchilarga ajratish formulasi.",
      },
      {
        id: 'alg-sum-square',
        category: 'algebra',
        title: "Yig'indining kvadrati",
        latex: "(a + b)^2 = a^2 + 2ab + b^2",
        description: "Ikki son yig'indisining kvadrati formulasi.",
      },
      {
        id: 'alg-diff-cube',
        category: 'algebra',
        title: "Kublar ayirmasi",
        latex: "a^3 - b^3 = (a - b)(a^2 + ab + b^2)",
        description: "Kublar ayirmasini to'liqsiz kvadrat orqali ko'paytuvchilarga ajratish.",
      },
      {
        id: 'alg-log-props',
        category: 'algebra',
        title: "Logarifm xossalari",
        latex: "\\log_a(x \\cdot y) = \\log_a x + \\log_a y, \\quad \\log_a(x^k) = k \\log_a x",
        description: "Ko'paytma va daraja logarifmi qoidalari.",
      },
      {
        id: 'alg-prog-arithmetic',
        category: 'algebra',
        title: "Arifmetik progressiya n-hadi",
        latex: "a_n = a_1 + (n - 1)d, \\quad S_n = \\frac{a_1 + a_n}{2} \\cdot n",
        description: "n-had va dastlabki n ta had yig'indisi.",
        calc: {
          inputs: [
            { name: 'Birinchi had (a₁)', key: 'a1', defaultValue: 2 },
            { name: 'Ayirma (d)', key: 'd', defaultValue: 3 },
            { name: 'Had tartibi (n)', key: 'n', defaultValue: 10 },
          ],
          compute: (v) => {
            const an = v.a1 + (v.n - 1) * v.d;
            const sn = ((v.a1 + an) / 2) * v.n;
            return `a_${v.n} = ${an}, \\quad S_${v.n} = ${sn}`;
          },
        },
      },

      // Trigonometry
      {
        id: 'trig-fundamental',
        category: 'trig',
        title: "Asosiy trigonometrik ayniyat",
        latex: "\\sin^2\\alpha + \\cos^2\\alpha = 1, \\quad \\text{tg}\\alpha \\cdot \\text{ctg}\\alpha = 1",
        description: "Barcha trigonometrik hisoblashlarning poydevori bo'lgan ayniyat.",
      },
      {
        id: 'trig-double-angle',
        category: 'trig',
        title: "Ikkilangan burchak formulalari",
        latex: "\\sin(2\\alpha) = 2\\sin\\alpha\\cos\\alpha, \\quad \\cos(2\\alpha) = \\cos^2\\alpha - \\sin^2\\alpha",
        description: "2α burchak trigonometrik funksiyalari.",
      },
      {
        id: 'trig-sum-to-product',
        category: 'trig',
        title: "Sinuslar yig'indisi",
        latex: "\\sin\\alpha + \\sin\\beta = 2\\sin\\frac{\\alpha + \\beta}{2}\\cos\\frac{\\alpha - \\beta}{2}",
        description: "Yig'indini ko'paytmaga aylantirish qoidasi.",
      },

      // Geometry
      {
        id: 'geom-pythagoras',
        category: 'geometry',
        title: "Pifagor teoremasi",
        latex: "a^2 + b^2 = c^2 \\implies c = \\sqrt{a^2 + b^2}",
        description: "To'g'ri burchakli uchburchak katetlari va gipotenuzasi munosabati.",
        calc: {
          inputs: [
            { name: 'Katet a', key: 'a', defaultValue: 3 },
            { name: 'Katet b', key: 'b', defaultValue: 4 },
          ],
          compute: (v) => {
            const c = Math.sqrt(v.a * v.a + v.b * v.b);
            return `c = \\sqrt{${v.a}^2 + ${v.b}^2} = \\sqrt{${v.a * v.a + v.b * v.b}} = ${Number(c.toFixed(4))}`;
          },
        },
      },
      {
        id: 'geom-heron',
        category: 'geometry',
        title: "Geron formulasi (Uchburchak yuzi)",
        latex: "S = \\sqrt{p(p - a)(p - b)(p - c)}, \\quad p = \\frac{a+b+c}{2}",
        description: "Uch tomoni ma'lum ixtiyoriy uchburchak yuzini hisoblash.",
      },
      {
        id: 'geom-circle',
        category: 'geometry',
        title: "Doira yuzi va aylana uzunligi",
        latex: "S = \\pi r^2, \\quad C = 2\\pi r",
        description: "Radius r bo'yicha doira yuzi va perimetri.",
        calc: {
          inputs: [{ name: 'Radius r', key: 'r', defaultValue: 5 }],
          compute: (v) => {
            const s = Math.PI * v.r * v.r;
            const c = 2 * Math.PI * v.r;
            return `S \\approx ${s.toFixed(2)}, \\quad C \\approx ${c.toFixed(2)}`;
          },
        },
      },
      {
        id: 'geom-sphere',
        category: 'geometry',
        title: "Sfera yuzi va shar hajmi",
        latex: "V = \\frac{4}{3}\\pi r^3, \\quad S = 4\\pi r^2",
        description: "Shar hajmi va sfera sirtining to'liq yuzi.",
        calc: {
          inputs: [{ name: 'Radius r', key: 'r', defaultValue: 3 }],
          compute: (v) => {
            const vol = (4 / 3) * Math.PI * Math.pow(v.r, 3);
            const surf = 4 * Math.PI * Math.pow(v.r, 2);
            return `V \\approx ${vol.toFixed(2)}, \\quad S \\approx ${surf.toFixed(2)}`;
          },
        },
      },

      // Calculus
      {
        id: 'calc-power-rule',
        category: 'calculus',
        title: "Darajali funksiya hosilasi",
        latex: "\\frac{d}{dx}[x^n] = n \\cdot x^{n-1}, \\quad \\int x^n dx = \\frac{x^{n+1}}{n+1} + C",
        description: "Analizning asosiy darajali hosila va integrallari.",
      },
      {
        id: 'calc-chain-rule',
        category: 'calculus',
        title: "Murakkab funksiya hosilasi (Chain rule)",
        latex: "\\frac{d}{dx}[f(g(x))] = f'(g(x)) \\cdot g'(x)",
        description: "Murakkab bog'langan funksiyalarni differensiallash qoidasi.",
      },
      {
        id: 'calc-trig-derivatives',
        category: 'calculus',
        title: "Trigonometrik funksiyalar hosilasi",
        latex: "(\\sin x)' = \\cos x, \\quad (\\cos x)' = -\\sin x, \\quad (\\text{tg } x)' = \\frac{1}{\\cos^2 x}",
        description: "Asosiy trigonometrik jadval hosilalari.",
      },
      {
        id: 'calc-limits',
        category: 'calculus',
        title: "Birinchi va ikkinchi ajoyib limit",
        latex: "\\lim_{x \\to 0}\\frac{\\sin x}{x} = 1, \\quad \\lim_{x \\to \\infty}\\left(1 + \\frac{1}{x}\\right)^x = e",
        description: "Matematik analizdagi fundamental limitlar.",
      },

      // Statistics
      {
        id: 'stat-mean-var',
        category: 'stats',
        title: "O'rtacha qiymat va Dispersiya",
        latex: "\\mu = \\frac{1}{N}\\sum_{i=1}^N x_i, \\quad \\sigma^2 = \\frac{1}{N}\\sum_{i=1}^N (x_i - \\mu)^2",
        description: "Bosh to'plam arifmetik o'rtachasi va dispersiyasi.",
      },
    ],
    []
  );

  const filteredFormulas = useMemo(() => {
    return formulas.filter((f) => {
      const matchCat = activeCategory === 'all' || f.category === activeCategory;
      const matchSearch =
        f.title.toLowerCase().includes(search.toLowerCase()) ||
        f.description.toLowerCase().includes(search.toLowerCase()) ||
        f.latex.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [formulas, activeCategory, search]);

  const selectedFormula = useMemo(() => {
    return formulas.find((f) => f.id === selectedFormulaId) || formulas[0];
  }, [formulas, selectedFormulaId]);

  return (
    <div className="max-w-4xl mx-auto px-2 sm:px-4 py-2 pb-24">
      {/* Search and Filters */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-3 sm:p-4 shadow-xl mb-4">
        <div className="relative mb-3">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Formulalarni qidirish (Pifagor, hosila, logarifm, doira)..."
            className="w-full bg-slate-950 border border-slate-700/80 rounded-2xl pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {[
            { id: 'all', label: 'Barchasi' },
            { id: 'algebra', label: 'Algebra' },
            { id: 'trig', label: 'Trigonometriya' },
            { id: 'geometry', label: 'Geometriya' },
            { id: 'calculus', label: 'Analiz & Integral' },
            { id: 'stats', label: 'Statistika' },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id as any)}
              className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-all ${
                activeCategory === cat.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Selected Formula Interactive Sandbox if available */}
      {selectedFormula && selectedFormula.calc && (
        <div className="bg-gradient-to-br from-indigo-950/60 to-slate-900 border border-indigo-500/40 rounded-3xl p-4 sm:p-5 shadow-2xl mb-4">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-indigo-500/20">
            <div className="flex items-center gap-2">
              <Calculator className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">
                Interaktiv hisoblagich: {selectedFormula.title}
              </span>
            </div>
          </div>

          <div className="my-2 py-1 text-center bg-slate-950/60 rounded-xl border border-indigo-500/20">
            <MathView math={selectedFormula.latex} block />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 my-3">
            {selectedFormula.calc.inputs.map((inp) => (
              <div key={inp.key}>
                <label className="text-[11px] text-slate-300 block mb-1">{inp.name}</label>
                <input
                  type="number"
                  value={calcValues[inp.key] ?? inp.defaultValue}
                  onChange={(e) =>
                    setCalcValues((prev) => ({
                      ...prev,
                      [inp.key]: Number(e.target.value),
                    }))
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-white font-mono text-xs focus:border-indigo-400 focus:outline-none"
                />
              </div>
            ))}
          </div>

          <div className="p-3 rounded-xl bg-indigo-900/40 border border-indigo-500/30 text-center">
            <span className="text-[11px] text-indigo-300 block mb-1">Natija:</span>
            <div className="text-lg sm:text-xl font-bold font-mono text-white">
              <MathView
                math={selectedFormula.calc.compute({
                  ...Object.fromEntries(
                    selectedFormula.calc.inputs.map((i) => [i.key, i.defaultValue])
                  ),
                  ...calcValues,
                })}
              />
            </div>
          </div>
        </div>
      )}

      {/* Formulas List */}
      <div className="space-y-3">
        {filteredFormulas.map((item) => (
          <div
            key={item.id}
            onClick={() => {
              setSelectedFormulaId(item.id);
              if (item.calc) {
                const initial: Record<string, number> = {};
                item.calc.inputs.forEach((i) => (initial[i.key] = i.defaultValue));
                setCalcValues(initial);
              }
            }}
            className={`p-4 rounded-3xl bg-slate-900/90 border transition-all cursor-pointer ${
              selectedFormulaId === item.id
                ? 'border-indigo-500 shadow-lg shadow-indigo-500/10'
                : 'border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-2">
                {item.title}
                {item.calc && (
                  <span className="bg-indigo-500/20 text-indigo-300 text-[10px] px-2 py-0.5 rounded-full font-semibold border border-indigo-500/30">
                    Interaktiv
                  </span>
                )}
              </span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-400">
                {item.category}
              </span>
            </div>

            <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800/80 my-2 text-center overflow-x-auto">
              <MathView math={item.latex} block />
            </div>

            <p className="text-xs text-slate-400 mt-1">{item.description}</p>
          </div>
        ))}

        {filteredFormulas.length === 0 && (
          <div className="text-center py-12 text-slate-500 text-sm">
            Mos keluvchi formula topilmadi
          </div>
        )}
      </div>
    </div>
  );
};

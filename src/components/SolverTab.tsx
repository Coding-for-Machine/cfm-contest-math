import React, { useState } from 'react';
import * as math from 'mathjs';
import { MathView } from './MathView';
import {
  solveQuadratic,
  solveLinear,
  solveSystem2x2,
  integrateSimpsons,
  derivativeAt,
  formatNumber,
} from '../utils/mathEngine';
import { CheckCircle2, ChevronRight, HelpCircle, Sparkles, BookOpen, Calculator } from 'lucide-react';

export const SolverTab: React.FC = () => {
  const [solverType, setSolverType] = useState<
    'quadratic' | 'linear' | 'system2' | 'calculus' | 'simplify'
  >('quadratic');

  // Quadratic inputs: ax^2 + bx + c = 0
  const [quadA, setQuadA] = useState<number>(1);
  const [quadB, setQuadB] = useState<number>(-5);
  const [quadC, setQuadC] = useState<number>(6);

  // Linear inputs: ax + b = c
  const [linA, setLinA] = useState<number>(3);
  const [linB, setLinB] = useState<number>(7);
  const [linC, setLinC] = useState<number>(22);

  // System 2x2:
  // a1*x + b1*y = c1
  // a2*x + b2*y = c2
  const [sysA1, setSysA1] = useState<number>(2);
  const [sysB1, setSysB1] = useState<number>(1);
  const [sysC1, setSysC1] = useState<number>(8);
  const [sysA2, setSysA2] = useState<number>(3);
  const [sysB2, setSysB2] = useState<number>(-2);
  const [sysC2, setSysC2] = useState<number>(5);

  // Calculus
  const [calcExpr, setCalcExpr] = useState<string>('x^3 - 3*x^2 + 2');
  const [calcXVal, setCalcXVal] = useState<number>(2);
  const [intA, setIntA] = useState<number>(0);
  const [intB, setIntB] = useState<number>(2);

  // Simplify
  const [simplifyExpr, setSimplifyExpr] = useState<string>('2*x + 3*x - 4*(x - 2)');

  // Solve results
  const renderQuadraticSolution = () => {
    try {
      const res = solveQuadratic(quadA, quadB, quadC);
      return (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30">
            <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider block mb-1">
              Yakuniy Javob
            </span>
            <div className="text-xl sm:text-2xl font-bold text-white flex items-center flex-wrap gap-4">
              <MathView math={`x_1 = ${res.roots.r1}`} />
              {res.roots.r1 !== res.roots.r2 && <MathView math={`x_2 = ${res.roots.r2}`} />}
            </div>
            <p className="text-xs text-indigo-300 mt-2">
              Parabola uchi: ({formatNumber(res.vertex.x)}, {formatNumber(res.vertex.y)}), Diskriminant D = {res.discriminant}
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-bold text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Qadamma-qadam batafsil tushuntirish:
            </h4>
            {res.steps.map((st, i) => (
              <div
                key={i}
                className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center gap-2 mb-1.5 text-xs font-semibold text-teal-400">
                  <span className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-300 flex items-center justify-center text-[11px]">
                    {i + 1}
                  </span>
                  <span>{st.title}</span>
                </div>
                <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800/80 my-1.5 text-center">
                  <MathView math={st.latex} block />
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{st.explanation}</p>
              </div>
            ))}
          </div>
        </div>
      );
    } catch (err: unknown) {
      return (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm">
          {err instanceof Error ? err.message : 'Xatolik yuz berdi'}
        </div>
      );
    }
  };

  const renderLinearSolution = () => {
    const res = solveLinear(linA, linB, linC);
    return (
      <div className="space-y-4">
        <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30">
          <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider block mb-1">
            Yakuniy Javob
          </span>
          <div className="text-2xl font-bold text-white">
            {res.infiniteRoots ? (
              <span>Cheksiz ko'p yechim</span>
            ) : res.noRoots ? (
              <span>Yechim mavjud emas (∅)</span>
            ) : (
              <MathView math={`x = ${formatNumber(res.x ?? 0)}`} />
            )}
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-bold text-slate-300 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-400" />
            Batafsil yechish bosqichlari:
          </h4>
          {res.steps.map((st, i) => (
            <div key={i} className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
              <div className="text-xs font-semibold text-teal-400 mb-1.5">{st.title}</div>
              <div className="bg-slate-950/70 p-2 rounded-lg border border-slate-800 my-1 text-center">
                <MathView math={st.latex} block />
              </div>
              <p className="text-xs text-slate-400">{st.explanation}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderSystemSolution = () => {
    const res = solveSystem2x2(sysA1, sysB1, sysC1, sysA2, sysB2, sysC2);
    return (
      <div className="space-y-4">
        <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30">
          <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider block mb-1">
            Yakuniy Javob
          </span>
          {res.status === 'unique' ? (
            <div className="text-xl sm:text-2xl font-bold text-white flex items-center gap-4">
              <MathView math={`x = ${formatNumber(res.x ?? 0)}`} />
              <MathView math={`y = ${formatNumber(res.y ?? 0)}`} />
            </div>
          ) : (
            <div className="text-lg font-bold text-amber-300">
              {res.status === 'infinite' ? "Cheksiz ko'p yechim" : 'Sistema yechimga ega emas'}
            </div>
          )}
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-bold text-slate-300 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-400" />
            Kramer usuli bosqichlari:
          </h4>
          {res.steps.map((st, i) => (
            <div key={i} className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
              <div className="text-xs font-semibold text-teal-400 mb-1.5">{st.title}</div>
              <div className="bg-slate-950/70 p-2 rounded-lg border border-slate-800 my-1 text-center">
                <MathView math={st.latex} block />
              </div>
              <p className="text-xs text-slate-400">{st.explanation}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderCalculusSolution = () => {
    try {
      // Symbolic derivative
      const node = math.parse(calcExpr);
      const derivative = math.derivative(node, 'x');
      const compiledFn = node.compile();
      const compiledDeriv = derivative.compile();

      const valAtX = compiledFn.evaluate({ x: calcXVal });
      const derivValAtX = compiledDeriv.evaluate({ x: calcXVal });

      // Definite integral
      const numIntegral = integrateSimpsons((x) => {
        try {
          return compiledFn.evaluate({ x });
        } catch {
          return 0;
        }
      }, intA, intB);

      return (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30">
            <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider block mb-1">
              Hosilaning analitik ko'rinishi:
            </span>
            <div className="text-xl sm:text-2xl font-bold text-white py-1">
              <MathView math={`f'(x) = \\frac{d}{dx}\\left(${calcExpr}\\right) = ${derivative.toTex()}`} />
            </div>
            <div className="mt-2 text-xs text-indigo-300 flex items-center gap-4 flex-wrap">
              <span>x = {calcXVal} da: f({calcXVal}) = {formatNumber(valAtX)}</span>
              <span>f'({calcXVal}) = {formatNumber(derivValAtX)}</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <span className="text-xs font-semibold text-teal-400 uppercase tracking-wider block mb-1">
              Aniq Integral (Simpson qoidasi):
            </span>
            <div className="text-lg sm:text-xl font-bold text-white py-1">
              <MathView
                math={`\\int_{${intA}}^{${intB}} \\left(${calcExpr}\\right) dx \\approx ${formatNumber(numIntegral, 5)}`}
              />
            </div>
            <p className="text-xs text-slate-400 mt-1">
              [{intA}, {intB}] oraliqdagi egri chiziqli trapetsiya yuzi.
            </p>
          </div>
        </div>
      );
    } catch (err: unknown) {
      return (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm">
          {err instanceof Error ? err.message : 'Funksiyani tahlil qilishda xatolik'}
        </div>
      );
    }
  };

  const renderSimplifySolution = () => {
    try {
      const simplified = math.simplify(simplifyExpr);
      const rationalized = math.rationalize(simplifyExpr);

      return (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30">
            <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider block mb-1">
              Soddalashtirilgan Ifoda:
            </span>
            <div className="text-2xl font-bold text-white py-1">
              <MathView math={simplified.toTex()} />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <span className="text-xs font-semibold text-teal-400 uppercase tracking-wider block mb-1">
              Kasr-ratsional shakli:
            </span>
            <div className="text-lg font-bold text-slate-200 py-1">
              <MathView math={rationalized.toTex()} />
            </div>
          </div>
        </div>
      );
    } catch (err: unknown) {
      return (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm">
          {err instanceof Error ? err.message : 'Soddalashtirishda xatolik'}
        </div>
      );
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-2 sm:px-4 py-2 pb-24">
      {/* Category selector */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 p-1.5 bg-slate-900/90 border border-slate-800 rounded-2xl mb-4">
        <button
          type="button"
          onClick={() => setSolverType('quadratic')}
          className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            solverType === 'quadratic'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Kvadrat ax²+bx+c
        </button>
        <button
          type="button"
          onClick={() => setSolverType('linear')}
          className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            solverType === 'linear'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Chiziqli ax+b=c
        </button>
        <button
          type="button"
          onClick={() => setSolverType('system2')}
          className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            solverType === 'system2'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Sistema 2x2
        </button>
        <button
          type="button"
          onClick={() => setSolverType('calculus')}
          className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            solverType === 'calculus'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Hosila & Integral
        </button>
        <button
          type="button"
          onClick={() => setSolverType('simplify')}
          className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all col-span-2 sm:col-span-1 ${
            solverType === 'simplify'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Soddalashtirish
        </button>
      </div>

      {/* Input controls based on type */}
      <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xl mb-4">
        {solverType === 'quadratic' && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold text-slate-200">Kvadrat tenglama koeffitsiyentlari:</span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => { setQuadA(1); setQuadB(-5); setQuadC(6); }}
                  className="px-2 py-0.5 text-[11px] rounded bg-slate-800 hover:bg-slate-700 text-indigo-300"
                >
                  Misol 1
                </button>
                <button
                  type="button"
                  onClick={() => { setQuadA(2); setQuadB(4); setQuadC(-6); }}
                  className="px-2 py-0.5 text-[11px] rounded bg-slate-800 hover:bg-slate-700 text-indigo-300"
                >
                  Misol 2
                </button>
                <button
                  type="button"
                  onClick={() => { setQuadA(1); setQuadB(2); setQuadC(5); }}
                  className="px-2 py-0.5 text-[11px] rounded bg-slate-800 hover:bg-slate-700 text-indigo-300"
                >
                  Kompleks
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:gap-4">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">a koeffitsiyent</label>
                <input
                  type="number"
                  value={quadA}
                  onChange={(e) => setQuadA(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-center focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">b koeffitsiyent</label>
                <input
                  type="number"
                  value={quadB}
                  onChange={(e) => setQuadB(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-center focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">c ozod had</label>
                <input
                  type="number"
                  value={quadC}
                  onChange={(e) => setQuadC(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-center focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="mt-3 text-center text-sm font-mono text-indigo-300">
              <MathView math={`${quadA}x^2 ${quadB >= 0 ? `+ ${quadB}` : `- ${Math.abs(quadB)}`}x ${quadC >= 0 ? `+ ${quadC}` : `- ${Math.abs(quadC)}`} = 0`} />
            </div>
          </div>
        )}

        {solverType === 'linear' && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold text-slate-200">Chiziqli tenglama: ax + b = c</span>
              <button
                type="button"
                onClick={() => { setLinA(4); setLinB(-8); setLinC(16); }}
                className="px-2 py-0.5 text-[11px] rounded bg-slate-800 hover:bg-slate-700 text-indigo-300"
              >
                Misol
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2 sm:gap-4">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">a koeffitsiyent</label>
                <input
                  type="number"
                  value={linA}
                  onChange={(e) => setLinA(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-center focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">b qo'shiluvchi</label>
                <input
                  type="number"
                  value={linB}
                  onChange={(e) => setLinB(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-center focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">c o'ng tomon</label>
                <input
                  type="number"
                  value={linC}
                  onChange={(e) => setLinC(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-center focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {solverType === 'system2' && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold text-slate-200">2 ta noma'lumli sistema:</span>
              <button
                type="button"
                onClick={() => { setSysA1(2); setSysB1(1); setSysC1(8); setSysA2(3); setSysB2(-2); setSysC2(5); }}
                className="px-2 py-0.5 text-[11px] rounded bg-slate-800 hover:bg-slate-700 text-indigo-300"
              >
                Misol
              </button>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-slate-400 w-6">1:</span>
                <input
                  type="number"
                  value={sysA1}
                  onChange={(e) => setSysA1(Number(e.target.value))}
                  className="w-16 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-center text-sm"
                />
                <span className="text-xs text-slate-400">x +</span>
                <input
                  type="number"
                  value={sysB1}
                  onChange={(e) => setSysB1(Number(e.target.value))}
                  className="w-16 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-center text-sm"
                />
                <span className="text-xs text-slate-400">y =</span>
                <input
                  type="number"
                  value={sysC1}
                  onChange={(e) => setSysC1(Number(e.target.value))}
                  className="w-16 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-center text-sm"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-slate-400 w-6">2:</span>
                <input
                  type="number"
                  value={sysA2}
                  onChange={(e) => setSysA2(Number(e.target.value))}
                  className="w-16 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-center text-sm"
                />
                <span className="text-xs text-slate-400">x +</span>
                <input
                  type="number"
                  value={sysB2}
                  onChange={(e) => setSysB2(Number(e.target.value))}
                  className="w-16 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-center text-sm"
                />
                <span className="text-xs text-slate-400">y =</span>
                <input
                  type="number"
                  value={sysC2}
                  onChange={(e) => setSysC2(Number(e.target.value))}
                  className="w-16 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-center text-sm"
                />
              </div>
            </div>
          </div>
        )}

        {solverType === 'calculus' && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold text-slate-200">Funksiya f(x):</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setCalcExpr('x^3 - 3*x^2 + 2')}
                  className="px-2 py-0.5 text-[11px] rounded bg-slate-800 text-indigo-300"
                >
                  Ko'phad
                </button>
                <button
                  type="button"
                  onClick={() => setCalcExpr('sin(x) * x')}
                  className="px-2 py-0.5 text-[11px] rounded bg-slate-800 text-indigo-300"
                >
                  Trig
                </button>
                <button
                  type="button"
                  onClick={() => setCalcExpr('e^(2*x)')}
                  className="px-2 py-0.5 text-[11px] rounded bg-slate-800 text-indigo-300"
                >
                  Eksponenta
                </button>
              </div>
            </div>
            <input
              type="text"
              value={calcExpr}
              onChange={(e) => setCalcExpr(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono mb-3"
            />
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[11px] text-slate-400 block">Hosila nuqtasi (x)</label>
                <input
                  type="number"
                  value={calcXVal}
                  onChange={(e) => setCalcXVal(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-sm font-mono text-center"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block">Integral pastki chegara (a)</label>
                <input
                  type="number"
                  value={intA}
                  onChange={(e) => setIntA(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-sm font-mono text-center"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block">Integral yuqori chegara (b)</label>
                <input
                  type="number"
                  value={intB}
                  onChange={(e) => setIntB(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-sm font-mono text-center"
                />
              </div>
            </div>
          </div>
        )}

        {solverType === 'simplify' && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold text-slate-200">Algebraik ifodani kiriting:</span>
              <button
                type="button"
                onClick={() => setSimplifyExpr('(x^2 - 4) / (x - 2)')}
                className="px-2 py-0.5 text-[11px] rounded bg-slate-800 text-indigo-300"
              >
                Kasr misoli
              </button>
            </div>
            <input
              type="text"
              value={simplifyExpr}
              onChange={(e) => setSimplifyExpr(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
            />
          </div>
        )}
      </div>

      {/* Render Solution Card */}
      {solverType === 'quadratic' && renderQuadraticSolution()}
      {solverType === 'linear' && renderLinearSolution()}
      {solverType === 'system2' && renderSystemSolution()}
      {solverType === 'calculus' && renderCalculusSolution()}
      {solverType === 'simplify' && renderSimplifySolution()}
    </div>
  );
};

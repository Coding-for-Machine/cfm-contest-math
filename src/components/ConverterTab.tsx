import React, { useState } from 'react';
import { solveTriangle, convertAngle, convertBase, formatNumber } from '../utils/mathEngine';
import { MathView } from './MathView';
import { Compass, Binary, Ruler, Sparkles } from 'lucide-react';

export const ConverterTab: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'triangle' | 'angle' | 'base'>('triangle');

  // Triangle solver state
  const [sideA, setSideA] = useState<number>(3);
  const [sideB, setSideB] = useState<number>(4);
  const [sideC, setSideC] = useState<number>(5);

  // Angle converter state
  const [angleVal, setAngleVal] = useState<number>(45);
  const [angleUnit, setAngleUnit] = useState<'deg' | 'rad' | 'grad'>('deg');

  // Base converter state
  const [baseVal, setBaseVal] = useState<string>('255');
  const [baseFrom, setBaseFrom] = useState<number>(10);

  // Calculate triangle
  const triangleData = React.useMemo(() => {
    try {
      return { result: solveTriangle(sideA, sideB, sideC), error: null };
    } catch (err) {
      return { result: null, error: err instanceof Error ? err.message : 'Xatolik' };
    }
  }, [sideA, sideB, sideC]);

  return (
    <div className="max-w-4xl mx-auto px-2 sm:px-4 py-2 pb-24">
      {/* Subtab selection */}
      <div className="grid grid-cols-3 gap-1.5 p-1.5 bg-slate-900 border border-slate-800 rounded-2xl mb-4 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveSubTab('triangle')}
          className={`py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
            activeSubTab === 'triangle'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>Uchburchak</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('angle')}
          className={`py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
            activeSubTab === 'angle'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Ruler className="w-3.5 h-3.5" />
          <span>Burchaklar</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('base')}
          className={`py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
            activeSubTab === 'base'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Binary className="w-3.5 h-3.5" />
          <span>Sanoq Sistemasi</span>
        </button>
      </div>

      {/* Triangle Solver View */}
      {activeSubTab === 'triangle' && (
        <div className="space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-200">Uchburchak tomonlari (a, b, c):</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => { setSideA(3); setSideB(4); setSideC(5); }}
                  className="px-2 py-0.5 rounded bg-slate-800 text-[11px] text-indigo-300"
                >
                  3-4-5
                </button>
                <button
                  type="button"
                  onClick={() => { setSideA(5); setSideB(5); setSideC(5); }}
                  className="px-2 py-0.5 rounded bg-slate-800 text-[11px] text-indigo-300"
                >
                  Teng tomonli
                </button>
                <button
                  type="button"
                  onClick={() => { setSideA(5); setSideB(5); setSideC(8); }}
                  className="px-2 py-0.5 rounded bg-slate-800 text-[11px] text-indigo-300"
                >
                  Teng yonli
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">a tomon</label>
                <input
                  type="number"
                  value={sideA}
                  onChange={(e) => setSideA(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-center font-mono text-sm text-white"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">b tomon</label>
                <input
                  type="number"
                  value={sideB}
                  onChange={(e) => setSideB(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-center font-mono text-sm text-white"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">c tomon</label>
                <input
                  type="number"
                  value={sideC}
                  onChange={(e) => setSideC(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-center font-mono text-sm text-white"
                />
              </div>
            </div>
          </div>

          {triangleData.error ? (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              ⚠️ {triangleData.error}
            </div>
          ) : triangleData.result ? (
            <div className="space-y-3">
              <div className="p-4 rounded-3xl bg-indigo-950/40 border border-indigo-500/30">
                <span className="text-xs font-semibold text-indigo-400 block mb-1">Uchburchak turi:</span>
                <div className="text-lg font-bold text-white mb-2">{triangleData.result.type}</div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                  <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Yuzi (S):</span>
                    <strong className="text-emerald-400 font-mono text-sm">
                      {formatNumber(triangleData.result.area, 3)}
                    </strong>
                  </div>
                  <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Perimetri (P):</span>
                    <strong className="text-teal-400 font-mono text-sm">
                      {formatNumber(triangleData.result.perimeter, 2)}
                    </strong>
                  </div>
                  <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Ichki radius (r):</span>
                    <strong className="text-indigo-400 font-mono text-sm">
                      {formatNumber(triangleData.result.inradius, 3)}
                    </strong>
                  </div>
                  <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Tashqi radius (R):</span>
                    <strong className="text-purple-400 font-mono text-sm">
                      {formatNumber(triangleData.result.circumradius, 3)}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Angles breakdown */}
              <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800">
                <span className="text-xs font-semibold text-slate-300 block mb-2">Burchaklar:</span>
                <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
                  <div className="p-2 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">∠A:</span>
                    <strong className="text-amber-400">
                      {formatNumber(triangleData.result.anglesDeg.A, 2)}°
                    </strong>
                  </div>
                  <div className="p-2 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">∠B:</span>
                    <strong className="text-amber-400">
                      {formatNumber(triangleData.result.anglesDeg.B, 2)}°
                    </strong>
                  </div>
                  <div className="p-2 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">∠C:</span>
                    <strong className="text-amber-400">
                      {formatNumber(triangleData.result.anglesDeg.C, 2)}°
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* Angle Converter View */}
      {activeSubTab === 'angle' && (
        <div className="space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 shadow-xl">
            <span className="text-xs font-bold text-slate-200 block mb-2">
              Burchak qiymatini kiriting:
            </span>
            <div className="flex gap-2 mb-3">
              <input
                type="number"
                value={angleVal}
                onChange={(e) => setAngleVal(Number(e.target.value))}
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-base"
              />
              <select
                value={angleUnit}
                onChange={(e) => setAngleUnit(e.target.value as any)}
                className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs font-semibold"
              >
                <option value="deg">Gradus (°)</option>
                <option value="rad">Radian (rad)</option>
                <option value="grad">Grad (grad)</option>
              </select>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs mt-3">
              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Gradus (°):</span>
                <strong className="text-indigo-400 font-mono text-sm">
                  {formatNumber(convertAngle(angleVal, angleUnit, 'deg'), 4)}°
                </strong>
              </div>
              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Radian (rad):</span>
                <strong className="text-teal-400 font-mono text-sm">
                  {formatNumber(convertAngle(angleVal, angleUnit, 'rad'), 5)}
                </strong>
              </div>
              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Grad:</span>
                <strong className="text-amber-400 font-mono text-sm">
                  {formatNumber(convertAngle(angleVal, angleUnit, 'grad'), 4)}
                </strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Base Converter View */}
      {activeSubTab === 'base' && (
        <div className="space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 shadow-xl">
            <span className="text-xs font-bold text-slate-200 block mb-2">
              Sanoq sistemasini o'zgartirish:
            </span>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={baseVal}
                onChange={(e) => setBaseVal(e.target.value)}
                placeholder="Qiymat..."
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-base"
              />
              <select
                value={baseFrom}
                onChange={(e) => setBaseFrom(Number(e.target.value))}
                className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs font-semibold"
              >
                <option value={10}>10-lik (Dec)</option>
                <option value={2}>2-lik (Bin)</option>
                <option value={16}>16-lik (Hex)</option>
                <option value={8}>8-lik (Oct)</option>
              </select>
            </div>

            <div className="space-y-2 mt-4 text-xs font-mono">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400">10-lik (Decimal):</span>
                <strong className="text-indigo-400 text-sm">{convertBase(baseVal, baseFrom, 10)}</strong>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400">2-lik (Binary):</span>
                <strong className="text-teal-400 text-sm truncate max-w-[200px]">
                  {convertBase(baseVal, baseFrom, 2)}
                </strong>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400">16-lik (Hexadecimal):</span>
                <strong className="text-amber-400 text-sm">{convertBase(baseVal, baseFrom, 16)}</strong>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400">8-lik (Octal):</span>
                <strong className="text-purple-400 text-sm">{convertBase(baseVal, baseFrom, 8)}</strong>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

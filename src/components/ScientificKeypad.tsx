import React, { useState } from 'react';
import { Delete, RotateCcw, Sparkles } from 'lucide-react';

interface KeypadProps {
  onInsert: (value: string) => void;
  onClear: () => void;
  onBackspace: () => void;
  onEvaluate: () => void;
  isRad: boolean;
  onToggleAngle: () => void;
  onAns?: () => void;
}

export const ScientificKeypad: React.FC<KeypadProps> = ({
  onInsert,
  onClear,
  onBackspace,
  onEvaluate,
  isRad,
  onToggleAngle,
  onAns,
}) => {
  const [isSecond, setIsSecond] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'scientific' | 'calculus'>('basic');

  return (
    <div className="w-full bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-2xl p-2 sm:p-3 shadow-xl select-none">
      {/* Mobile Mode Switcher */}
      <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-800/80 text-xs sm:text-sm">
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab('basic')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === 'basic'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Asosiy
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('scientific')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === 'scientific'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Ilmiy (Trig/Log)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('calculus')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === 'calculus'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Analiz (d/dx, ∫)
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onToggleAngle}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all border ${
              isRad
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
            }`}
            title="Burchak o'lchov birligini almashtirish"
          >
            {isRad ? 'RAD' : 'DEG'}
          </button>
          <button
            type="button"
            onClick={() => setIsSecond(!isSecond)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all border ${
              isSecond
                ? 'bg-purple-600 text-white border-purple-500 shadow-sm'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            2nd
          </button>
        </div>
      </div>

      {/* Scientific Functions Tab (Trigonometry & Logarithms) */}
      {activeTab === 'scientific' && (
        <div className="grid grid-cols-5 gap-1.5 mb-2 pb-2 border-b border-slate-800">
          <button
            type="button"
            onClick={() => onInsert(isSecond ? 'asin(' : 'sin(')}
            className="h-10 bg-slate-800/80 hover:bg-slate-700 active:scale-95 text-indigo-300 font-medium text-xs sm:text-sm rounded-xl border border-slate-700/60"
          >
            {isSecond ? 'sin⁻¹' : 'sin'}
          </button>
          <button
            type="button"
            onClick={() => onInsert(isSecond ? 'acos(' : 'cos(')}
            className="h-10 bg-slate-800/80 hover:bg-slate-700 active:scale-95 text-indigo-300 font-medium text-xs sm:text-sm rounded-xl border border-slate-700/60"
          >
            {isSecond ? 'cos⁻¹' : 'cos'}
          </button>
          <button
            type="button"
            onClick={() => onInsert(isSecond ? 'atan(' : 'tan(')}
            className="h-10 bg-slate-800/80 hover:bg-slate-700 active:scale-95 text-indigo-300 font-medium text-xs sm:text-sm rounded-xl border border-slate-700/60"
          >
            {isSecond ? 'tan⁻¹' : 'tan'}
          </button>
          <button
            type="button"
            onClick={() => onInsert(isSecond ? '10^(' : 'log10(')}
            className="h-10 bg-slate-800/80 hover:bg-slate-700 active:scale-95 text-cyan-300 font-medium text-xs sm:text-sm rounded-xl border border-slate-700/60"
          >
            {isSecond ? '10ˣ' : 'lg'}
          </button>
          <button
            type="button"
            onClick={() => onInsert(isSecond ? 'e^(' : 'log(')}
            className="h-10 bg-slate-800/80 hover:bg-slate-700 active:scale-95 text-cyan-300 font-medium text-xs sm:text-sm rounded-xl border border-slate-700/60"
          >
            {isSecond ? 'eˣ' : 'ln'}
          </button>

          <button
            type="button"
            onClick={() => onInsert('sinh(')}
            className="h-10 bg-slate-800/80 hover:bg-slate-700 active:scale-95 text-slate-300 font-medium text-xs rounded-xl border border-slate-700/60"
          >
            sinh
          </button>
          <button
            type="button"
            onClick={() => onInsert('cosh(')}
            className="h-10 bg-slate-800/80 hover:bg-slate-700 active:scale-95 text-slate-300 font-medium text-xs rounded-xl border border-slate-700/60"
          >
            cosh
          </button>
          <button
            type="button"
            onClick={() => onInsert('tanh(')}
            className="h-10 bg-slate-800/80 hover:bg-slate-700 active:scale-95 text-slate-300 font-medium text-xs rounded-xl border border-slate-700/60"
          >
            tanh
          </button>
          <button
            type="button"
            onClick={() => onInsert('pi')}
            className="h-10 bg-slate-800/80 hover:bg-slate-700 active:scale-95 text-amber-300 font-medium text-sm rounded-xl border border-slate-700/60"
          >
            π
          </button>
          <button
            type="button"
            onClick={() => onInsert('e')}
            className="h-10 bg-slate-800/80 hover:bg-slate-700 active:scale-95 text-amber-300 font-medium text-sm rounded-xl border border-slate-700/60"
          >
            e
          </button>
        </div>
      )}

      {/* Calculus & Advanced Tab */}
      {activeTab === 'calculus' && (
        <div className="grid grid-cols-5 gap-1.5 mb-2 pb-2 border-b border-slate-800">
          <button
            type="button"
            onClick={() => onInsert('sqrt(')}
            className="h-10 bg-slate-800/80 hover:bg-slate-700 active:scale-95 text-indigo-300 font-medium text-xs sm:text-sm rounded-xl border border-slate-700/60"
          >
            √x
          </button>
          <button
            type="button"
            onClick={() => onInsert('cbrt(')}
            className="h-10 bg-slate-800/80 hover:bg-slate-700 active:scale-95 text-indigo-300 font-medium text-xs sm:text-sm rounded-xl border border-slate-700/60"
          >
            ∛x
          </button>
          <button
            type="button"
            onClick={() => onInsert('^2')}
            className="h-10 bg-slate-800/80 hover:bg-slate-700 active:scale-95 text-indigo-300 font-medium text-xs sm:text-sm rounded-xl border border-slate-700/60"
          >
            x²
          </button>
          <button
            type="button"
            onClick={() => onInsert('^')}
            className="h-10 bg-slate-800/80 hover:bg-slate-700 active:scale-95 text-indigo-300 font-medium text-xs sm:text-sm rounded-xl border border-slate-700/60"
          >
            xʸ
          </button>
          <button
            type="button"
            onClick={() => onInsert('!')}
            className="h-10 bg-slate-800/80 hover:bg-slate-700 active:scale-95 text-indigo-300 font-medium text-xs sm:text-sm rounded-xl border border-slate-700/60"
          >
            n!
          </button>

          <button
            type="button"
            onClick={() => onInsert('abs(')}
            className="h-10 bg-slate-800/80 hover:bg-slate-700 active:scale-95 text-teal-300 font-medium text-xs rounded-xl border border-slate-700/60"
          >
            |x|
          </button>
          <button
            type="button"
            onClick={() => onInsert('mod')}
            className="h-10 bg-slate-800/80 hover:bg-slate-700 active:scale-95 text-teal-300 font-medium text-xs rounded-xl border border-slate-700/60"
          >
            mod
          </button>
          <button
            type="button"
            onClick={() => onInsert('x')}
            className="h-10 bg-slate-800/80 hover:bg-slate-700 active:scale-95 text-emerald-300 font-bold text-sm rounded-xl border border-slate-700/60"
          >
            x
          </button>
          <button
            type="button"
            onClick={() => onInsert('i')}
            className="h-10 bg-slate-800/80 hover:bg-slate-700 active:scale-95 text-purple-300 font-medium text-sm rounded-xl border border-slate-700/60"
          >
            i
          </button>
          <button
            type="button"
            onClick={() => onInsert('%')}
            className="h-10 bg-slate-800/80 hover:bg-slate-700 active:scale-95 text-teal-300 font-medium text-sm rounded-xl border border-slate-700/60"
          >
            %
          </button>
        </div>
      )}

      {/* Main Keypad Grid - Perfect 4 columns on mobile, 5 columns on sm/desktop */}
      <div className="grid grid-cols-4 sm:grid-cols-5 gap-1.5">
        {/* Row 1 */}
        <button
          type="button"
          onClick={onClear}
          className="h-11 sm:h-12 bg-rose-600/20 hover:bg-rose-600/30 active:scale-95 text-rose-400 font-bold text-sm sm:text-base rounded-xl border border-rose-500/30 transition-all"
        >
          AC
        </button>
        <button
          type="button"
          onClick={() => onInsert('(')}
          className="h-11 sm:h-12 bg-slate-800/70 hover:bg-slate-700 active:scale-95 text-slate-300 font-medium text-base rounded-xl border border-slate-700/60"
        >
          (
        </button>
        <button
          type="button"
          onClick={() => onInsert(')')}
          className="h-11 sm:h-12 bg-slate-800/70 hover:bg-slate-700 active:scale-95 text-slate-300 font-medium text-base rounded-xl border border-slate-700/60"
        >
          )
        </button>
        <button
          type="button"
          onClick={onBackspace}
          aria-label="O'chirish"
          className="h-11 sm:h-12 bg-slate-800/70 hover:bg-slate-700 active:scale-95 text-slate-300 flex items-center justify-center rounded-xl border border-slate-700/60"
        >
          <Delete className="w-5 h-5 text-rose-300" />
        </button>
        <button
          type="button"
          onClick={() => onInsert('sqrt(')}
          className="h-11 sm:h-12 bg-slate-800/60 hover:bg-slate-700 active:scale-95 text-cyan-300 font-medium text-sm rounded-xl border border-slate-700 hidden sm:block"
        >
          √
        </button>

        {/* Row 2: 7, 8, 9, ÷ */}
        <button
          type="button"
          onClick={() => onInsert('7')}
          className="h-11 sm:h-12 bg-slate-800/90 hover:bg-slate-700 active:scale-95 text-white font-semibold text-lg rounded-xl border border-slate-700"
        >
          7
        </button>
        <button
          type="button"
          onClick={() => onInsert('8')}
          className="h-11 sm:h-12 bg-slate-800/90 hover:bg-slate-700 active:scale-95 text-white font-semibold text-lg rounded-xl border border-slate-700"
        >
          8
        </button>
        <button
          type="button"
          onClick={() => onInsert('9')}
          className="h-11 sm:h-12 bg-slate-800/90 hover:bg-slate-700 active:scale-95 text-white font-semibold text-lg rounded-xl border border-slate-700"
        >
          9
        </button>
        <button
          type="button"
          onClick={() => onInsert('/')}
          className="h-11 sm:h-12 bg-indigo-600/20 hover:bg-indigo-600/30 active:scale-95 text-indigo-300 font-bold text-lg rounded-xl border border-indigo-500/30"
        >
          ÷
        </button>
        <button
          type="button"
          onClick={() => onInsert('^')}
          className="h-11 sm:h-12 bg-slate-800/60 hover:bg-slate-700 active:scale-95 text-cyan-300 font-medium text-sm rounded-xl border border-slate-700 hidden sm:block"
        >
          ^
        </button>

        {/* Row 3: 4, 5, 6, × */}
        <button
          type="button"
          onClick={() => onInsert('4')}
          className="h-11 sm:h-12 bg-slate-800/90 hover:bg-slate-700 active:scale-95 text-white font-semibold text-lg rounded-xl border border-slate-700"
        >
          4
        </button>
        <button
          type="button"
          onClick={() => onInsert('5')}
          className="h-11 sm:h-12 bg-slate-800/90 hover:bg-slate-700 active:scale-95 text-white font-semibold text-lg rounded-xl border border-slate-700"
        >
          5
        </button>
        <button
          type="button"
          onClick={() => onInsert('6')}
          className="h-11 sm:h-12 bg-slate-800/90 hover:bg-slate-700 active:scale-95 text-white font-semibold text-lg rounded-xl border border-slate-700"
        >
          6
        </button>
        <button
          type="button"
          onClick={() => onInsert('*')}
          className="h-11 sm:h-12 bg-indigo-600/20 hover:bg-indigo-600/30 active:scale-95 text-indigo-300 font-bold text-lg rounded-xl border border-indigo-500/30"
        >
          ×
        </button>
        <button
          type="button"
          onClick={() => onInsert('pi')}
          className="h-11 sm:h-12 bg-slate-800/60 hover:bg-slate-700 active:scale-95 text-amber-300 font-medium text-sm rounded-xl border border-slate-700 hidden sm:block"
        >
          π
        </button>

        {/* Row 4: 1, 2, 3, − */}
        <button
          type="button"
          onClick={() => onInsert('1')}
          className="h-11 sm:h-12 bg-slate-800/90 hover:bg-slate-700 active:scale-95 text-white font-semibold text-lg rounded-xl border border-slate-700"
        >
          1
        </button>
        <button
          type="button"
          onClick={() => onInsert('2')}
          className="h-11 sm:h-12 bg-slate-800/90 hover:bg-slate-700 active:scale-95 text-white font-semibold text-lg rounded-xl border border-slate-700"
        >
          2
        </button>
        <button
          type="button"
          onClick={() => onInsert('3')}
          className="h-11 sm:h-12 bg-slate-800/90 hover:bg-slate-700 active:scale-95 text-white font-semibold text-lg rounded-xl border border-slate-700"
        >
          3
        </button>
        <button
          type="button"
          onClick={() => onInsert('-')}
          className="h-11 sm:h-12 bg-indigo-600/20 hover:bg-indigo-600/30 active:scale-95 text-indigo-300 font-bold text-lg rounded-xl border border-indigo-500/30"
        >
          −
        </button>
        <button
          type="button"
          onClick={() => onInsert('e')}
          className="h-11 sm:h-12 bg-slate-800/60 hover:bg-slate-700 active:scale-95 text-amber-300 font-medium text-sm rounded-xl border border-slate-700 hidden sm:block"
        >
          e
        </button>

        {/* Row 5: 0, ., +, = on mobile, or 0, ., Ans, +, = */}
        <button
          type="button"
          onClick={() => onInsert('0')}
          className="h-11 sm:h-12 bg-slate-800/90 hover:bg-slate-700 active:scale-95 text-white font-semibold text-lg rounded-xl border border-slate-700"
        >
          0
        </button>
        <button
          type="button"
          onClick={() => onInsert('.')}
          className="h-11 sm:h-12 bg-slate-800/90 hover:bg-slate-700 active:scale-95 text-white font-bold text-lg rounded-xl border border-slate-700"
        >
          .
        </button>
        <button
          type="button"
          onClick={() => onInsert('+')}
          className="h-11 sm:h-12 bg-indigo-600/20 hover:bg-indigo-600/30 active:scale-95 text-indigo-300 font-bold text-lg rounded-xl border border-indigo-500/30"
        >
          +
        </button>
        {onAns ? (
          <button
            type="button"
            onClick={onAns}
            className="h-11 sm:h-12 bg-slate-800/80 hover:bg-slate-700 active:scale-95 text-emerald-300 font-semibold text-xs sm:text-sm rounded-xl border border-slate-700 hidden sm:block"
          >
            Ans
          </button>
        ) : null}
        <button
          type="button"
          onClick={onEvaluate}
          className="h-11 sm:h-12 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 active:scale-95 text-white font-bold text-xl rounded-xl shadow-lg shadow-indigo-500/25 transition-all"
        >
          =
        </button>
      </div>
    </div>
  );
};

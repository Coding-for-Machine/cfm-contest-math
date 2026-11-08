import React, { useState, useRef, useEffect } from 'react';
import * as math from 'mathjs';
import { MathView } from './MathView';
import { ScientificKeypad } from './ScientificKeypad';
import { History, Copy, Check, Trash2, ArrowRight, BookOpen, Layers } from 'lucide-react';

interface HistoryItem {
  id: string;
  expression: string;
  result: string;
  latex?: string;
  timestamp: string;
}

export const CalculatorTab: React.FC = () => {
  const [expression, setExpression] = useState('');
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isRad, setIsRad] = useState(false);
  const [lastAns, setLastAns] = useState<string>('0');
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('mathpro_calc_history');
      return saved ? JSON.parse(saved) : [
        { id: '1', expression: '2 * sin(30) + sqrt(16)', result: '5', timestamp: '10:00' },
        { id: '2', expression: 'e^(pi * i) + 1', result: '0', timestamp: '09:55' },
      ];
    } catch {
      return [];
    }
  });
  const [showHistory, setShowHistory] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showConstants, setShowConstants] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      localStorage.setItem('mathpro_calc_history', JSON.stringify(history.slice(0, 30)));
    } catch {
      // ignore
    }
  }, [history]);

  // Convert raw expression for Degree mode if applicable
  const preprocessExpression = (expr: string, rad: boolean) => {
    let processed = expr
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/−/g, '-');

    if (!rad) {
      // In degree mode, replace sin(x) with sin(x deg), cos(x) with cos(x deg), tan(x) with tan(x deg)
      // mathjs supports units like sin(30 deg)
      processed = processed.replace(/(sin|cos|tan)\(([^)]+)\)/g, (match, fn, arg) => {
        // If already has deg or rad, leave it
        if (arg.includes('deg') || arg.includes('rad')) return match;
        return `${fn}((${arg}) deg)`;
      });
    }

    return processed;
  };

  const evaluateExpression = () => {
    if (!expression.trim()) return;
    setError(null);

    try {
      const sanitized = preprocessExpression(expression, isRad);
      const evalResult = math.evaluate(sanitized, { Ans: Number(lastAns) || 0 });
      let formatted: string;

      if (typeof evalResult === 'number') {
        formatted = math.format(evalResult, { precision: 10 });
      } else if (typeof evalResult === 'object' && evalResult !== null) {
        formatted = evalResult.toString();
      } else {
        formatted = String(evalResult);
      }

      setResult(formatted);
      setLastAns(formatted);

      const newItem: HistoryItem = {
        id: Date.now().toString(),
        expression,
        result: formatted,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setHistory((prev) => [newItem, ...prev.filter((h) => h.expression !== expression)]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Hisoblashda xatolik';
      setError(msg);
      setResult('');
    }
  };

  const handleInsert = (str: string) => {
    setExpression((prev) => prev + str);
    setError(null);
  };

  const handleBackspace = () => {
    setExpression((prev) => prev.slice(0, -1));
    setError(null);
  };

  const handleClear = () => {
    setExpression('');
    setResult('');
    setError(null);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const constants = [
    { name: 'π (Pi)', sym: 'pi', val: '3.14159265' },
    { name: 'e (Eyler soni)', sym: 'e', val: '2.71828182' },
    { name: 'φ (Oltin kesim)', sym: '((1+sqrt(5))/2)', val: '1.61803398' },
    { name: 'c (Yorug\'lik tezligi)', sym: '299792458', val: '2.9979×10⁸ m/s' },
    { name: 'G (Gravitatsiya)', sym: '6.6743e-11', val: '6.674×10⁻¹¹' },
    { name: 'h (Plank doimiysi)', sym: '6.62607e-34', val: '6.626×10⁻³⁴' },
  ];

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto px-2 sm:px-4 py-2">
      {/* Top Display & Expression Monitor */}
      <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-2xl mb-3 flex flex-col justify-between min-h-[160px] sm:min-h-[180px] relative overflow-hidden">
        {/* Top toolbar */}
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700/60 font-mono text-[11px] text-indigo-300">
              {isRad ? 'RADIAN' : 'DEGREE'}
            </span>
            <button
              type="button"
              onClick={() => setShowConstants(!showConstants)}
              className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/60 transition-colors"
            >
              <BookOpen className="w-3 h-3 text-amber-400" />
              <span>O'zgarmaslar</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/60 transition-colors"
            aria-label="Tarix"
          >
            <History className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Tarix</span>
            <span className="bg-indigo-500/20 text-indigo-300 text-[10px] px-1.5 rounded-full font-bold">
              {history.length}
            </span>
          </button>
        </div>

        {/* Input formula input / editor */}
        <div className="my-auto">
          <input
            ref={inputRef}
            type="text"
            value={expression}
            onChange={(e) => {
              setExpression(e.target.value);
              setError(null);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') evaluateExpression();
            }}
            placeholder="Misol: 2*sin(30) + sqrt(16) yoki 5^3"
            className="w-full bg-transparent text-right text-xl sm:text-3xl font-mono text-slate-100 placeholder-slate-600 focus:outline-none tracking-wide"
          />

          {/* Live KaTeX visual preview */}
          {expression && (
            <div className="text-right text-slate-400 text-sm overflow-x-auto py-1">
              <MathView math={expression.replace(/\*/g, ' \\cdot ').replace(/\//g, ' \\div ')} />
            </div>
          )}
        </div>

        {/* Result row */}
        <div className="flex items-end justify-between pt-2 border-t border-slate-800/80">
          <div className="text-xs text-rose-400 max-w-[50%] truncate font-mono">
            {error && <span>⚠️ {error}</span>}
          </div>
          <div className="flex items-center gap-2">
            {result && (
              <button
                type="button"
                onClick={() => handleCopy(result, 'res')}
                className="p-1 rounded-md text-slate-400 hover:text-slate-200 transition-colors"
                title="Natijani nusxalash"
              >
                {copiedId === 'res' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            )}
            <div className="text-right">
              <span className="text-2xl sm:text-4xl font-bold font-mono text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-teal-300 to-emerald-400">
                {result ? `= ${result}` : ''}
              </span>
            </div>
          </div>
        </div>

        {/* Constants Quick Bar Dropdown */}
        {showConstants && (
          <div className="absolute top-10 left-3 right-3 bg-slate-900 border border-slate-700/80 rounded-2xl p-3 shadow-2xl z-20 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
              <span className="text-xs font-semibold text-slate-300">Matematik va Fizik Doimiylar:</span>
              <button
                type="button"
                onClick={() => setShowConstants(false)}
                className="text-xs text-slate-400 hover:text-white"
              >
                ✕ Yopish
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {constants.map((c) => (
                <button
                  key={c.sym}
                  type="button"
                  onClick={() => {
                    handleInsert(c.sym);
                    setShowConstants(false);
                  }}
                  className="p-2 rounded-xl bg-slate-800/80 hover:bg-indigo-600/30 border border-slate-700 text-left transition-colors"
                >
                  <div className="text-xs font-bold text-indigo-300">{c.name}</div>
                  <div className="text-[11px] text-slate-400 font-mono truncate">{c.val}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* History Modal / Drawer */}
        {showHistory && (
          <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md z-30 p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-indigo-400" />
                <span className="font-semibold text-sm text-slate-200">Hisoblashlar Tarixi</span>
              </div>
              <div className="flex items-center gap-2">
                {history.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setHistory([])}
                    className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    Tozalash
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowHistory(false)}
                  className="px-2 py-1 bg-slate-800 rounded-lg text-xs text-slate-300 hover:text-white"
                >
                  Yopish
                </button>
              </div>
            </div>

            <div className="overflow-y-auto flex-1 my-2 space-y-2 pr-1">
              {history.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs">
                  <p>Hozircha hisoblashlar tarixi bo'sh</p>
                </div>
              ) : (
                history.map((item) => (
                  <div
                    key={item.id}
                    className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 flex items-center justify-between gap-2"
                  >
                    <div
                      className="cursor-pointer flex-1 min-w-0"
                      onClick={() => {
                        setExpression(item.expression);
                        setResult(item.result);
                        setShowHistory(false);
                      }}
                    >
                      <div className="font-mono text-xs text-slate-300 truncate">{item.expression}</div>
                      <div className="font-mono text-sm font-bold text-teal-400 truncate">= {item.result}</div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleCopy(item.result, item.id)}
                        className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                        title="Natijani nusxalash"
                      >
                        {copiedId === item.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Scientific Keypad */}
      <div className="flex-1 flex flex-col justify-end">
        <ScientificKeypad
          onInsert={handleInsert}
          onClear={handleClear}
          onBackspace={handleBackspace}
          onEvaluate={evaluateExpression}
          isRad={isRad}
          onToggleAngle={() => setIsRad(!isRad)}
          onAns={() => handleInsert(lastAns)}
        />
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { MathView } from './MathView';
import {
  matrixDet2x2,
  matrixDet3x3,
  matrixInverse2x2,
  matrixTranspose,
  matrixMultiply,
  matrixAdd,
  matrixToLatex,
  formatNumber,
} from '../utils/mathEngine';
import { Sparkles, ArrowRightLeft, Plus, RefreshCw } from 'lucide-react';

export const MatrixTab: React.FC = () => {
  const [size, setSize] = useState<2 | 3>(2);

  const [matrixA, setMatrixA] = useState<number[][]>([
    [2, 3],
    [1, 4],
  ]);

  const [matrixB, setMatrixB] = useState<number[][]>([
    [1, 0],
    [2, 5],
  ]);

  const [scalarK, setScalarK] = useState<number>(3);
  const [activeOp, setActiveOp] = useState<
    'det' | 'inverse' | 'transpose' | 'multiply' | 'add' | 'subtract' | 'scalar'
  >('det');

  const updateCellA = (r: number, c: number, val: number) => {
    setMatrixA((prev) => {
      const copy = prev.map((row) => [...row]);
      copy[r][c] = val;
      return copy;
    });
  };

  const updateCellB = (r: number, c: number, val: number) => {
    setMatrixB((prev) => {
      const copy = prev.map((row) => [...row]);
      copy[r][c] = val;
      return copy;
    });
  };

  const setDimensions = (newSize: 2 | 3) => {
    setSize(newSize);
    if (newSize === 2) {
      setMatrixA([
        [2, 3],
        [1, 4],
      ]);
      setMatrixB([
        [1, 0],
        [2, 5],
      ]);
    } else {
      setMatrixA([
        [1, 2, 3],
        [0, 1, 4],
        [5, 6, 0],
      ]);
      setMatrixB([
        [2, 0, -1],
        [1, 3, 2],
        [0, -2, 1],
      ]);
    }
  };

  const renderCalculation = () => {
    try {
      if (activeOp === 'det') {
        const detA = size === 2 ? matrixDet2x2(matrixA) : matrixDet3x3(matrixA);
        const detB = size === 2 ? matrixDet2x2(matrixB) : matrixDet3x3(matrixB);

        return (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30">
              <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider block mb-1">
                Determinantlar:
              </span>
              <div className="text-xl sm:text-2xl font-bold text-white flex items-center gap-6 flex-wrap">
                <MathView math={`\\det(A) = |A| = ${formatNumber(detA)}`} />
                <MathView math={`\\det(B) = |B| = ${formatNumber(detB)}`} />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <h4 className="text-xs font-semibold text-teal-400 uppercase mb-2">
                A matritsa determinanti yoyilmasi:
              </h4>
              {size === 2 ? (
                <div className="text-center py-1">
                  <MathView
                    math={`|A| = (${matrixA[0][0]}) \\cdot (${matrixA[1][1]}) - (${matrixA[0][1]}) \\cdot (${matrixA[1][0]}) = ${detA}`}
                    block
                  />
                </div>
              ) : (
                <div className="text-center py-1">
                  <MathView
                    math={`|A| = ${matrixA[0][0]} \\begin{vmatrix} ${matrixA[1][1]} & ${matrixA[1][2]} \\\\ ${matrixA[2][1]} & ${matrixA[2][2]} \\end{vmatrix} - ${matrixA[0][1]} \\begin{vmatrix} ${matrixA[1][0]} & ${matrixA[1][2]} \\\\ ${matrixA[2][0]} & ${matrixA[2][2]} \\end{vmatrix} + ${matrixA[0][2]} \\begin{vmatrix} ${matrixA[1][0]} & ${matrixA[1][1]} \\\\ ${matrixA[2][0]} & ${matrixA[2][1]} \\end{vmatrix} = ${detA}`}
                    block
                  />
                </div>
              )}
            </div>
          </div>
        );
      }

      if (activeOp === 'inverse') {
        if (size === 2) {
          const inv = matrixInverse2x2(matrixA);
          if (!inv) {
            return (
              <div className="p-4 rounded-2xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-sm">
                A matritsaning determinanti 0 ga teng, shuning uchun teskari matritsa mavjud emas (maxsus matritsa).
              </div>
            );
          }
          return (
            <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30">
              <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider block mb-1">
                Teskari Matritsa A⁻¹:
              </span>
              <div className="text-center py-2">
                <MathView math={`A^{-1} = ${matrixToLatex(inv)}`} block />
              </div>
            </div>
          );
        } else {
          return (
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-sm text-slate-300">
              3x3 matritsaning teskari matritsasi algebraik to'ldiruvchilar matritsasi yordamida:
              <div className="py-2 text-center">
                <MathView math={`A^{-1} = \\frac{1}{\\det(A)} \\cdot \\text{adj}(A)`} block />
              </div>
            </div>
          );
        }
      }

      if (activeOp === 'transpose') {
        const transA = matrixTranspose(matrixA);
        const transB = matrixTranspose(matrixB);
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30">
              <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider block mb-1">
                A Transponirlangan (Aᵀ):
              </span>
              <div className="text-center py-2">
                <MathView math={`A^T = ${matrixToLatex(transA)}`} block />
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-xs font-semibold text-teal-400 uppercase tracking-wider block mb-1">
                B Transponirlangan (Bᵀ):
              </span>
              <div className="text-center py-2">
                <MathView math={`B^T = ${matrixToLatex(transB)}`} block />
              </div>
            </div>
          </div>
        );
      }

      if (activeOp === 'multiply') {
        const prod = matrixMultiply(matrixA, matrixB);
        return (
          <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30">
            <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider block mb-1">
              Matritsalar Ko'paytmasi (A × B):
            </span>
            <div className="text-center py-2">
              <MathView
                math={`${matrixToLatex(matrixA)} \\times ${matrixToLatex(matrixB)} = ${matrixToLatex(prod)}`}
                block
              />
            </div>
          </div>
        );
      }

      if (activeOp === 'add' || activeOp === 'subtract') {
        const isSub = activeOp === 'subtract';
        const res = matrixAdd(matrixA, matrixB, isSub);
        return (
          <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30">
            <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider block mb-1">
              {isSub ? 'Matritsalar Ayirmasi (A - B):' : 'Matritsalar Yig\'indisi (A + B):'}
            </span>
            <div className="text-center py-2">
              <MathView
                math={`${matrixToLatex(matrixA)} ${isSub ? '-' : '+'} ${matrixToLatex(matrixB)} = ${matrixToLatex(res)}`}
                block
              />
            </div>
          </div>
        );
      }

      if (activeOp === 'scalar') {
        const res = matrixA.map((row) => row.map((v) => v * scalarK));
        return (
          <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30">
            <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider block mb-1">
              Skalyar ko'paytirish ({scalarK} · A):
            </span>
            <div className="text-center py-2">
              <MathView math={`${scalarK} \\cdot ${matrixToLatex(matrixA)} = ${matrixToLatex(res)}`} block />
            </div>
          </div>
        );
      }

      return null;
    } catch (err: unknown) {
      return (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm">
          {err instanceof Error ? err.message : 'Hisoblashda xatolik'}
        </div>
      );
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-2 sm:px-4 py-2 pb-24">
      {/* Top Header & Dimension switcher */}
      <div className="flex items-center justify-between bg-slate-900/90 border border-slate-800 rounded-2xl p-2.5 mb-3">
        <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
          Chiziqli Algebra & Matritsalar
        </span>
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => setDimensions(2)}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              size === 2 ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            2 × 2
          </button>
          <button
            type="button"
            onClick={() => setDimensions(3)}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              size === 3 ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            3 × 3
          </button>
        </div>
      </div>

      {/* Matrix Inputs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
        {/* Matrix A */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-indigo-400">A Matritsa ({size}×{size}):</span>
            <button
              type="button"
              onClick={() => {
                setMatrixA(
                  size === 2
                    ? [
                        [1, 0],
                        [0, 1],
                      ]
                    : [
                        [1, 0, 0],
                        [0, 1, 0],
                        [0, 0, 1],
                      ]
                );
              }}
              className="text-[11px] text-slate-400 hover:text-indigo-300"
            >
              Birlik (E)
            </button>
          </div>
          <div className={`grid gap-2 ${size === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
            {matrixA.map((row, r) =>
              row.map((val, c) => (
                <input
                  key={`a-${r}-${c}`}
                  type="number"
                  value={val}
                  onChange={(e) => updateCellA(r, c, Number(e.target.value))}
                  className="bg-slate-950 border border-slate-700/80 rounded-xl py-2 px-1 text-center font-mono text-sm text-white focus:border-indigo-500 focus:outline-none"
                />
              ))
            )}
          </div>
        </div>

        {/* Matrix B */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-teal-400">B Matritsa ({size}×{size}):</span>
            <button
              type="button"
              onClick={() => {
                setMatrixB(
                  size === 2
                    ? [
                        [2, 1],
                        [1, 2],
                      ]
                    : [
                        [1, 2, 3],
                        [3, 2, 1],
                        [1, 1, 1],
                      ]
                );
              }}
              className="text-[11px] text-slate-400 hover:text-teal-300"
            >
              Standart
            </button>
          </div>
          <div className={`grid gap-2 ${size === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
            {matrixB.map((row, r) =>
              row.map((val, c) => (
                <input
                  key={`b-${r}-${c}`}
                  type="number"
                  value={val}
                  onChange={(e) => updateCellB(r, c, Number(e.target.value))}
                  className="bg-slate-950 border border-slate-700/80 rounded-xl py-2 px-1 text-center font-mono text-sm text-white focus:border-teal-500 focus:outline-none"
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Operations Selector */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 p-1.5 bg-slate-900 border border-slate-800 rounded-2xl mb-4 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveOp('det')}
          className={`py-2 rounded-xl transition-all ${
            activeOp === 'det' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          det(A)
        </button>
        <button
          type="button"
          onClick={() => setActiveOp('multiply')}
          className={`py-2 rounded-xl transition-all ${
            activeOp === 'multiply' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          A × B
        </button>
        <button
          type="button"
          onClick={() => setActiveOp('add')}
          className={`py-2 rounded-xl transition-all ${
            activeOp === 'add' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          A + B
        </button>
        <button
          type="button"
          onClick={() => setActiveOp('transpose')}
          className={`py-2 rounded-xl transition-all ${
            activeOp === 'transpose' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          Aᵀ
        </button>
        <button
          type="button"
          onClick={() => setActiveOp('inverse')}
          className={`py-2 rounded-xl transition-all ${
            activeOp === 'inverse' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          A⁻¹
        </button>
        <button
          type="button"
          onClick={() => setActiveOp('scalar')}
          className={`py-2 rounded-xl transition-all ${
            activeOp === 'scalar' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          k · A
        </button>
      </div>

      {/* Scalar value input if scalar operation selected */}
      {activeOp === 'scalar' && (
        <div className="flex items-center gap-2 mb-3 bg-slate-900 p-3 rounded-2xl border border-slate-800">
          <span className="text-xs text-slate-300 font-semibold">k skalyar qiymati:</span>
          <input
            type="number"
            value={scalarK}
            onChange={(e) => setScalarK(Number(e.target.value))}
            className="w-20 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-center text-sm font-mono"
          />
        </div>
      )}

      {/* Render Result Card */}
      {renderCalculation()}
    </div>
  );
};

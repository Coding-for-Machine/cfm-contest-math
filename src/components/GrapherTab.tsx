import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as math from 'mathjs';
import { ZoomIn, ZoomOut, RefreshCw, Eye, EyeOff, Plus, Trash2 } from 'lucide-react';
import { MathView } from './MathView';
import { formatNumber } from '../utils/mathEngine';

interface GraphFunction {
  id: string;
  expr: string;
  color: string;
  visible: boolean;
}

export const GrapherTab: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [functions, setFunctions] = useState<GraphFunction[]>([
    { id: '1', expr: 'x^2 - 4', color: '#6366f1', visible: true },
    { id: '2', expr: 'sin(x)', color: '#10b981', visible: true },
  ]);

  // View bounds
  const [view, setView] = useState({
    xMin: -10,
    xMax: 10,
    yMin: -6,
    yMax: 6,
  });

  const [hoverCoord, setHoverCoord] = useState<{ x: number; y: number } | null>(null);
  const [showTable, setShowTable] = useState(false);
  const [tableRange, setTableRange] = useState({ start: -3, end: 3, step: 1 });

  const isDraggingRef = useRef(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Compile functions
  const compiledFns = React.useMemo(() => {
    return functions.map((fn) => {
      try {
        if (!fn.expr.trim() || !fn.visible) return null;
        const compiled = math.compile(fn.expr);
        return { ...fn, compiled };
      } catch {
        return null;
      }
    });
  }, [functions]);

  // Draw graph
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
      canvas.width = width * dpr;
      canvas.height = height * dpr;
    }

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    // Coordinate conversions
    const toScreenX = (x: number) => ((x - view.xMin) / (view.xMax - view.xMin)) * width;
    const toScreenY = (y: number) => height - ((y - view.yMin) / (view.yMax - view.yMin)) * height;
    const toMathX = (sx: number) => view.xMin + (sx / width) * (view.xMax - view.xMin);
    const toMathY = (sy: number) => view.yMax - (sy / height) * (view.yMax - view.yMin);

    // 1. Draw Grid
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#64748b';
    ctx.font = '10px JetBrains Mono, monospace';

    // Grid spacing based on zoom
    const xSpan = view.xMax - view.xMin;
    const rawStepX = xSpan / 10;
    const stepPowX = Math.pow(10, Math.floor(Math.log10(rawStepX)));
    const stepX = (rawStepX / stepPowX > 5 ? 5 : rawStepX / stepPowX > 2 ? 2 : 1) * stepPowX;

    const firstGridX = Math.floor(view.xMin / stepX) * stepX;
    for (let x = firstGridX; x <= view.xMax; x += stepX) {
      const sx = toScreenX(x);
      ctx.beginPath();
      ctx.moveTo(sx, 0);
      ctx.lineTo(sx, height);
      ctx.stroke();

      if (Math.abs(x) > 1e-6) {
        const sy0 = Math.max(14, Math.min(height - 6, toScreenY(0) + 12));
        ctx.fillText(formatNumber(x, 2), sx + 2, sy0);
      }
    }

    const firstGridY = Math.floor(view.yMin / stepX) * stepX;
    for (let y = firstGridY; y <= view.yMax; y += stepX) {
      const sy = toScreenY(y);
      ctx.beginPath();
      ctx.moveTo(0, sy);
      ctx.lineTo(width, sy);
      ctx.stroke();

      if (Math.abs(y) > 1e-6) {
        const sx0 = Math.max(6, Math.min(width - 30, toScreenX(0) + 4));
        ctx.fillText(formatNumber(y, 2), sx0, sy - 2);
      }
    }

    // 2. Main Axes (X and Y)
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.5;

    const originX = toScreenX(0);
    const originY = toScreenY(0);

    // X Axis
    ctx.beginPath();
    ctx.moveTo(0, originY);
    ctx.lineTo(width, originY);
    ctx.stroke();

    // Y Axis
    ctx.beginPath();
    ctx.moveTo(originX, 0);
    ctx.lineTo(originX, height);
    ctx.stroke();

    // 3. Draw Functions
    compiledFns.forEach((fn) => {
      if (!fn || !fn.compiled) return;

      ctx.strokeStyle = fn.color;
      ctx.lineWidth = 2.5;
      ctx.beginPath();

      let hasStarted = false;
      const stepPx = 1; // sample every pixel

      for (let sx = 0; sx <= width; sx += stepPx) {
        const x = toMathX(sx);
        try {
          const y = fn.compiled.evaluate({ x });
          if (typeof y === 'number' && Number.isFinite(y)) {
            const sy = toScreenY(y);
            // Don't draw extreme jumps (asymptotes)
            if (Math.abs(sy) < height * 3) {
              if (!hasStarted) {
                ctx.moveTo(sx, sy);
                hasStarted = true;
              } else {
                ctx.lineTo(sx, sy);
              }
            } else {
              hasStarted = false;
            }
          } else {
            hasStarted = false;
          }
        } catch {
          hasStarted = false;
        }
      }

      ctx.stroke();
    });

    // 4. Cursor tracking & points
    if (hoverCoord) {
      const hx = toScreenX(hoverCoord.x);
      const hy = toScreenY(hoverCoord.y);

      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);

      ctx.beginPath();
      ctx.moveTo(hx, 0);
      ctx.lineTo(hx, height);
      ctx.moveTo(0, hy);
      ctx.lineTo(width, hy);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(hx, hy, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }, [view, compiledFns, hoverCoord]);

  // Adjust canvas size to parent container on resize
  useEffect(() => {
    const resize = () => {
      draw();
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [draw]);

  useEffect(() => {
    draw();
  }, [draw]);

  // Zoom handlers
  const zoom = (factor: number) => {
    setView((prev) => {
      const xMid = (prev.xMin + prev.xMax) / 2;
      const yMid = (prev.yMin + prev.yMax) / 2;
      const xHalf = ((prev.xMax - prev.xMin) * factor) / 2;
      const yHalf = ((prev.yMax - prev.yMin) * factor) / 2;
      return {
        xMin: xMid - xHalf,
        xMax: xMid + xHalf,
        yMin: yMid - yHalf,
        yMax: yMid + yHalf,
      };
    });
  };

  const resetView = () => {
    setView({ xMin: -10, xMax: 10, yMin: -6, yMax: 6 });
    setHoverCoord(null);
  };

  // Mouse / Touch drag to pan
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = true;
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;

    const mathX = view.xMin + (sx / rect.width) * (view.xMax - view.xMin);
    const mathY = view.yMax - (sy / rect.height) * (view.yMax - view.yMin);

    if (isDraggingRef.current) {
      const dxPx = e.clientX - dragStartRef.current.x;
      const dyPx = e.clientY - dragStartRef.current.y;
      dragStartRef.current = { x: e.clientX, y: e.clientY };

      const dxMath = (dxPx / rect.width) * (view.xMax - view.xMin);
      const dyMath = (dyPx / rect.height) * (view.yMax - view.yMin);

      setView((prev) => ({
        xMin: prev.xMin - dxMath,
        xMax: prev.xMax - dxMath,
        yMin: prev.yMin + dyMath,
        yMax: prev.yMax + dyMath,
      }));
    } else {
      setHoverCoord({ x: mathX, y: mathY });
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = false;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  // Presets
  const applyPreset = (expr: string) => {
    setFunctions((prev) => [
      { id: Date.now().toString(), expr, color: '#6366f1', visible: true },
      ...prev.slice(1),
    ]);
    resetView();
  };

  // Add new function
  const addFunction = () => {
    const colors = ['#ec4899', '#f59e0b', '#06b6d4', '#8b5cf6'];
    const nextColor = colors[functions.length % colors.length];
    setFunctions((prev) => [
      ...prev,
      { id: Date.now().toString(), expr: '2*x + 1', color: nextColor, visible: true },
    ]);
  };

  return (
    <div className="max-w-4xl mx-auto px-2 sm:px-4 py-2 pb-24">
      {/* Functions Management Bar */}
      <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-3xl p-3 sm:p-4 shadow-xl mb-3">
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Funksiyalar ro'yxati:
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => applyPreset('x^2 - 4')}
              className="px-2 py-0.5 rounded bg-slate-800 text-[11px] text-indigo-300 hover:bg-slate-700"
            >
              Parabola
            </button>
            <button
              type="button"
              onClick={() => applyPreset('sin(x)')}
              className="px-2 py-0.5 rounded bg-slate-800 text-[11px] text-indigo-300 hover:bg-slate-700"
            >
              Sinus
            </button>
            <button
              type="button"
              onClick={() => applyPreset('1/x')}
              className="px-2 py-0.5 rounded bg-slate-800 text-[11px] text-indigo-300 hover:bg-slate-700"
            >
              Giperbola
            </button>
            {functions.length < 4 && (
              <button
                type="button"
                onClick={addFunction}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium ml-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Qo'shish
              </button>
            )}
          </div>
        </div>

        <div className="space-y-2">
          {functions.map((fn, idx) => (
            <div key={fn.id} className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: fn.color }}
              />
              <span className="font-mono text-xs text-slate-400 w-12 flex-shrink-0">
                f{idx + 1}(x) =
              </span>
              <input
                type="text"
                value={fn.expr}
                onChange={(e) => {
                  const val = e.target.value;
                  setFunctions((prev) =>
                    prev.map((item) => (item.id === fn.id ? { ...item, expr: val } : item))
                  );
                }}
                className="flex-1 bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-1.5 text-white font-mono text-xs sm:text-sm focus:border-indigo-500 focus:outline-none"
                placeholder="Masalan: x^2 - 4"
              />
              <button
                type="button"
                onClick={() =>
                  setFunctions((prev) =>
                    prev.map((item) =>
                      item.id === fn.id ? { ...item, visible: !item.visible } : item
                    )
                  )
                }
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                title={fn.visible ? 'Yashirish' : 'Ko\'rsatish'}
              >
                {fn.visible ? <Eye className="w-4 h-4 text-emerald-400" /> : <EyeOff className="w-4 h-4" />}
              </button>
              {functions.length > 1 && (
                <button
                  type="button"
                  onClick={() => setFunctions((prev) => prev.filter((item) => item.id !== fn.id))}
                  className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Canvas View Area */}
      <div className="relative bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl h-[360px] sm:h-[450px]">
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={() => setHoverCoord(null)}
          className="w-full h-full cursor-grab active:cursor-grabbing touch-none"
        />

        {/* Floating Controls Overlay */}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-2xl border border-slate-800 shadow-xl">
          <button
            type="button"
            onClick={() => zoom(0.75)}
            className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
            title="Kattalashtirish (Zoom in)"
            aria-label="Kattalashtirish"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => zoom(1.25)}
            className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
            title="Kichiklashtirish (Zoom out)"
            aria-label="Kichiklashtirish"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={resetView}
            className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
            title="Markazga qaytarish"
            aria-label="Markazga qaytarish"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Live Coordinate Badge */}
        <div className="absolute bottom-3 left-3 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 shadow-lg flex items-center gap-2">
          {hoverCoord ? (
            <span>
              x: <strong className="text-amber-400">{formatNumber(hoverCoord.x, 3)}</strong>, y:{' '}
              <strong className="text-amber-400">{formatNumber(hoverCoord.y, 3)}</strong>
            </span>
          ) : (
            <span className="text-slate-500">Kursor koordinatasi</span>
          )}
        </div>

        {/* Table Toggle Button */}
        <div className="absolute bottom-3 right-3">
          <button
            type="button"
            onClick={() => setShowTable(!showTable)}
            className="bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 font-semibold text-xs text-indigo-300 hover:text-white transition-colors"
          >
            {showTable ? 'Grafikni ko\'rish' : 'Qiymatlar jadvali'}
          </button>
        </div>

        {/* Table of Values Overlay */}
        {showTable && (
          <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md p-4 overflow-y-auto z-10">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800">
              <span className="text-xs font-bold text-slate-200">
                Qiymatlar jadvali [x vs f(x)]
              </span>
              <button
                type="button"
                onClick={() => setShowTable(false)}
                className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800"
              >
                Yopish
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono text-left">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="py-2 px-3">x</th>
                    {compiledFns.map((fn, idx) =>
                      fn ? (
                        <th key={fn.id} className="py-2 px-3" style={{ color: fn.color }}>
                          f{idx + 1}(x) = {fn.expr}
                        </th>
                      ) : null
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {[-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5].map((x) => (
                    <tr key={x} className="hover:bg-slate-900/50">
                      <td className="py-2 px-3 font-bold text-slate-300">{x}</td>
                      {compiledFns.map((fn) => {
                        if (!fn || !fn.compiled) return null;
                        try {
                          const y = fn.compiled.evaluate({ x });
                          return (
                            <td key={fn.id} className="py-2 px-3 text-slate-200">
                              {typeof y === 'number' ? formatNumber(y, 4) : '-'}
                            </td>
                          );
                        } catch {
                          return (
                            <td key={fn.id} className="py-2 px-3 text-rose-400">
                              aniqlanmagan
                            </td>
                          );
                        }
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

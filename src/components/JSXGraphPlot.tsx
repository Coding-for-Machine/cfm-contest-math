import React, { useEffect, useRef, useState, useId } from 'react';
import JXG from 'jsxgraph';
import { Copy, Check, RotateCcw, Code2 } from 'lucide-react';

interface JSXGraphProps {
  source: string;
  height?: number;
}

export default function JSXGraphPlot({ source, height = 340 }: JSXGraphProps) {
  const containerId = useId().replace(/:/g, '_');
  const boardId = `jxgbox_${containerId}`;
  const boardRef = useRef<any>(null);
  const [copied, setCopied] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCopy = () => {
    navigator.clipboard?.writeText(source);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const initJSXBoard = () => {
    try {
      setError(null);
      if (boardRef.current) {
        JXG.JSXGraph.freeBoard(boardRef.current);
        boardRef.current = null;
      }

      const el = document.getElementById(boardId);
      if (!el) return;

      const trimmed = source.trim();

      // Check if source is JSON spec
      if (trimmed.startsWith('{')) {
        const spec = JSON.parse(trimmed);
        const bbox = spec.boundingbox || [-5, 5, 5, -5];
        const axis = spec.axis ?? true;
        const grid = spec.grid ?? true;

        const board = JXG.JSXGraph.initBoard(boardId, {
          boundingbox: bbox,
          axis,
          grid,
          showNavigation: true,
          showCopyright: false,
          pan: { enabled: true, needShift: false },
          zoom: { factorX: 1.25, factorY: 1.25, wheel: true },
        });

        boardRef.current = board;
        const elementsMap: Record<string, any> = {};

        if (Array.isArray(spec.elements)) {
          spec.elements.forEach((elem: any) => {
            const { type, parents = [], attrs = {}, name } = elem;

            // Resolve named parents if string
            const resolvedParents = parents.map((p: any) => {
              if (typeof p === 'string' && elementsMap[p]) {
                return elementsMap[p];
              }
              return p;
            });

            // Special handle for function graph if expression given
            if (type === 'functiongraph' && typeof resolvedParents[0] === 'string') {
              const exprStr = resolvedParents[0];
              const mathFn = new Function('x', `with(Math) { return ${exprStr}; }`);
              resolvedParents[0] = mathFn;
            }

            const created = board.create(type, resolvedParents, attrs);
            if (name) elementsMap[name] = created;
          });
        }
      } else {
        // Source is JavaScript code for JSXGraph construction
        const board = JXG.JSXGraph.initBoard(boardId, {
          boundingbox: [-6, 6, 6, -6],
          axis: true,
          grid: true,
          showNavigation: true,
          showCopyright: false,
          pan: { enabled: true, needShift: false },
          zoom: { factorX: 1.25, factorY: 1.25, wheel: true },
        });
        boardRef.current = board;

        // Run the script safely
        const runner = new Function('board', 'JXG', `
          try {
            ${trimmed}
          } catch(e) {
            console.error('JSXGraph script error:', e);
            throw e;
          }
        `);
        runner(board, JXG);
      }
    } catch (err: unknown) {
      console.warn('JSXGraph error:', err);
      setError(err instanceof Error ? err.message : 'JSXGraph xatosi');
    }
  };

  useEffect(() => {
    initJSXBoard();
    return () => {
      if (boardRef.current) {
        try {
          JXG.JSXGraph.freeBoard(boardRef.current);
          boardRef.current = null;
        } catch {
          // ignore
        }
      }
    };
  }, [source, boardId]);

  return (
    <div className="my-5 rounded-3xl border border-slate-800 bg-slate-900/95 overflow-hidden shadow-xl">
      {/* Header toolbar */}
      <div className="flex items-center justify-between px-3 sm:px-4 py-2 border-b border-slate-800/80 bg-slate-950/60 text-xs">
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-2.5 h-2.5 rounded-full bg-teal-400 flex-shrink-0" />
          <span className="font-semibold text-slate-300 truncate">JSXGraph Geometriya</span>
          <span className="text-[10px] text-teal-400/80 font-mono hidden sm:inline">Interaktiv sensor</span>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            type="button"
            onClick={initJSXBoard}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            title="Qayta yuklash"
            aria-label="Qayta yuklash"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setShowCode(!showCode)}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] transition-colors"
          >
            <Code2 className="w-3.5 h-3.5 text-teal-400" />
            <span>{showCode ? 'Chizma' : 'Kod'}</span>
          </button>
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] transition-colors"
            title="JSXGraph kodini nusxalash"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
            <span className="hidden xs:inline">{copied ? 'Nusxalandi' : 'Nusxalash'}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="m-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono">
          ⚠️ JSXGraph xatolik: {error}
        </div>
      )}

      {showCode ? (
        <div className="p-4 bg-slate-950 font-mono text-xs text-teal-300 overflow-x-auto max-h-80">
          <pre>{source}</pre>
        </div>
      ) : (
        <div className="relative w-full overflow-hidden bg-slate-950">
          <div
            id={boardId}
            className="jxgbox w-full"
            style={{
              height: `${height}px`,
              backgroundColor: '#030712',
            }}
          />
        </div>
      )}
    </div>
  );
}

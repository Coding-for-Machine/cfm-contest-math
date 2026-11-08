import React, { useState } from 'react';
import JSXGraphPlot from './JSXGraphPlot';
import { X, Check, Copy, ArrowRight, Compass, Sparkles } from 'lucide-react';

interface JSXGraphVisualBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertToEditor: (codeBlock: string) => void;
}

const TEMPLATES = [
  {
    id: 'centroid',
    title: "Medianalar va Og'irlik markazi",
    desc: "Uchburchakning 3 ta medianasi va kesishish nuqtasi (Centroid)",
    code: `const A = board.create('point', [-3, -2], { name: 'A', size: 4, color: '#6366f1' });
const B = board.create('point', [3, -2], { name: 'B', size: 4, color: '#6366f1' });
const C = board.create('point', [0, 3], { name: 'C', size: 4, color: '#6366f1' });

const poly = board.create('polygon', [A, B, C], {
  fillColor: '#6366f1',
  fillOpacity: 0.15,
  borders: { strokeColor: '#818cf8', strokeWidth: 2 }
});

// Medianalar
const M_AB = board.create('midpoint', [A, B], { name: 'M_c', size: 2, color: '#10b981' });
const M_BC = board.create('midpoint', [B, C], { name: 'M_a', size: 2, color: '#10b981' });
const M_CA = board.create('midpoint', [C, A], { name: 'M_b', size: 2, color: '#10b981' });

board.create('segment', [C, M_AB], { strokeColor: '#10b981', dash: 2 });
board.create('segment', [A, M_BC], { strokeColor: '#10b981', dash: 2 });
board.create('segment', [B, M_CA], { strokeColor: '#10b981', dash: 2 });

const G = board.create('intersection', [
  board.create('line', [C, M_AB], { visible: false }),
  board.create('line', [A, M_BC], { visible: false })
], { name: 'G', size: 4, color: '#f59e0b' });`,
  },
  {
    id: 'circumcircle',
    title: 'Tashqi chizilgan aylana (Circumcircle)',
    desc: "Uchburchak uchlaridan o'tuvchi aylana va o'rta perpendikulyarlar",
    code: `const A = board.create('point', [-3, -1], { name: 'A', color: '#3b82f6' });
const B = board.create('point', [3, -1], { name: 'B', color: '#3b82f6' });
const C = board.create('point', [1, 3], { name: 'C', color: '#3b82f6' });

board.create('polygon', [A, B, C], { fillColor: '#3b82f6', fillOpacity: 0.1 });
const circle = board.create('circumcircle', [A, B, C], { strokeColor: '#10b981', strokeWidth: 2 });
board.create('point', [() => circle.center.X(), () => circle.center.Y()], { name: 'O (Markaz)', color: '#ef4444' });`,
  },
  {
    id: 'tangent_slider',
    title: 'Dinamik Hosila & Slayderli Urinma',
    desc: "Slayder yordamida funksiya egri chizig'i bo'ylab harakatlanuvchi urinma",
    code: `// Funksiya: f(x) = 0.5*x^2 - 2
const f = board.create('functiongraph', [function(x) { return 0.5 * x * x - 2; }, -5, 5], { strokeColor: '#6366f1', strokeWidth: 2 });

// Slayder: x0 nuqtasi
const s = board.create('slider', [[-4, 4], [0, 4], [-3, 1, 3]], { name: 'x_0', snapWidth: 0.1 });

// Egri chiziqdagi nuqta
const P = board.create('glider', [function() { return s.Value(); }, function() { return 0.5 * Math.pow(s.Value(), 2) - 2; }, f], { name: 'P', color: '#ef4444', size: 4 });

// Urinma to'g'ri chiziq
board.create('tangent', [P], { strokeColor: '#10b981', strokeWidth: 2 });`,
  },
  {
    id: 'incircle',
    title: 'Ichki chizilgan aylana (Incircle)',
    desc: 'Bissektrisalar kesishgan nuqtasi va ichki aylana',
    code: `const A = board.create('point', [-3, -2], { name: 'A', color: '#8b5cf6' });
const B = board.create('point', [3, -2], { name: 'B', color: '#8b5cf6' });
const C = board.create('point', [0, 3], { name: 'C', color: '#8b5cf6' });

board.create('polygon', [A, B, C], { fillColor: '#8b5cf6', fillOpacity: 0.1 });
board.create('incircle', [A, B, C], { strokeColor: '#f59e0b', strokeWidth: 2 });`,
  },
];

export const JSXGraphVisualBuilderModal: React.FC<JSXGraphVisualBuilderModalProps> = ({
  isOpen,
  onClose,
  onInsertToEditor,
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState(TEMPLATES[0]);
  const [customCode, setCustomCode] = useState(TEMPLATES[0].code);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const fencedBlock = `\`\`\`jsxgraph\n${customCode}\n\`\`\``;

  const handleCopy = () => {
    navigator.clipboard?.writeText(fencedBlock);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-slate-800 bg-slate-950/80">
          <div>
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Compass className="w-5 h-5 text-teal-400" />
              JSXGraph Interaktiv Geometriya Konstruktori
            </h3>
            <p className="text-xs text-slate-400">
              Tayyor shablonni tanlang, kodni xohlagancha o'zgartiring va Django'ga tashlang
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Controls Column */}
          <div className="space-y-4">
            <span className="text-xs font-bold text-slate-300 block">Geometrik Shablonlar:</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {TEMPLATES.map((tmpl) => (
                <button
                  key={tmpl.id}
                  type="button"
                  onClick={() => {
                    setSelectedTemplate(tmpl);
                    setCustomCode(tmpl.code);
                  }}
                  className={`p-3 rounded-2xl text-left border transition-all ${
                    selectedTemplate.id === tmpl.id
                      ? 'bg-indigo-950/60 border-indigo-500 shadow-md'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="font-bold text-xs text-slate-200">{tmpl.title}</div>
                  <div className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">{tmpl.desc}</div>
                </button>
              ))}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-slate-300">JSXGraph Skript kodi:</span>
                <button
                  type="button"
                  onClick={() => setCustomCode(selectedTemplate.code)}
                  className="text-[11px] text-slate-400 hover:text-indigo-300"
                >
                  Shablonni qaytarish
                </button>
              </div>
              <textarea
                value={customCode}
                onChange={(e) => setCustomCode(e.target.value)}
                rows={9}
                className="w-full bg-slate-950 border border-slate-700 rounded-2xl p-3 font-mono text-xs text-teal-300 focus:border-teal-500 focus:outline-none leading-relaxed"
              />
            </div>
          </div>

          {/* Live Preview Column */}
          <div className="flex flex-col space-y-3">
            <span className="text-xs font-bold text-slate-300">Jonli Interaktiv Chizma:</span>
            <div className="flex-1 min-h-[280px]">
              <JSXGraphPlot source={customCode} height={280} />
            </div>

            {/* Generated Markdown Preview */}
            <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 text-xs font-mono">
              <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-800 text-slate-400">
                <span className="text-[11px]">Django TextField uchun kod:</span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex items-center gap-1 text-[11px] text-teal-400 hover:text-teal-300"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Nusxalandi' : 'Nusxalash'}</span>
                </button>
              </div>
              <pre className="text-slate-300 overflow-x-auto max-h-24 text-[11px]">{fencedBlock}</pre>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-t border-slate-800 bg-slate-950/80">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs"
          >
            Bekor qilish
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
            >
              <Copy className="w-4 h-4 text-slate-400" />
              <span>Nusxalash</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onInsertToEditor(`\n${fencedBlock}\n`);
                onClose();
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30"
            >
              <span>Darslikka Qo'shish</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

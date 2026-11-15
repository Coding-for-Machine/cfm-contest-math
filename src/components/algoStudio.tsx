import React, { useEffect, useMemo, useState } from 'react';
import { Check, Copy, HelpCircle, Pause, Play, RotateCcw } from 'lucide-react';

export type AlgoStep = { note: string; line?: number; [key: string]: unknown };
export type AlgoSpec = { type: string; title: string; delay?: number; code?: string; array?: number[]; view?: 'cells' | 'bars'; items?: (string | number)[]; tree?: (string | number | null)[]; nodes?: (string | number)[]; edges?: [string | number, string | number, (string | number)?][]; directed?: boolean; pos?: [number, number][]; rows?: unknown[][]; steps: AlgoStep[]; [key: string]: unknown };

export function validateAlgo(raw: string): { value?: AlgoSpec; errors: string[] } {
  try {
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== 'object' || Array.isArray(value)) return { errors: ['JSON obyekt ko‘rinishida bo‘lishi kerak.'] };
    const spec = value as Partial<AlgoSpec>;
    const errors: string[] = [];
    const allowed = ['array', 'stack', 'queue', 'list', 'tree', 'graph', 'grid'];
    if (!allowed.includes(String(spec.type ?? 'array'))) errors.push('Tur array, stack, queue, list, tree, graph yoki grid bo‘lishi kerak.');
    if (typeof spec.title !== 'string' || !spec.title.trim()) errors.push('Sarlavha kiritilishi kerak.');
    if (!Array.isArray(spec.steps)) errors.push('steps massiv bo‘lishi kerak.');
    else {
      if (spec.steps.length > 2000) errors.push('Qadamlar soni 2000 tadan oshmasligi kerak.');
      if (spec.steps.some((step) => !step || typeof step.note !== 'string' || typeof step.line !== 'number')) errors.push('Har bir qadamda note va line maydonlari bo‘lishi kerak.');
    }
    if (spec.type === 'array' && (!Array.isArray(spec.array) || spec.array.length > 40)) errors.push('Massiv 40 tagacha sondan iborat bo‘lishi kerak.');
    if (['stack', 'queue', 'list'].includes(String(spec.type)) && (!Array.isArray(spec.items) || spec.items.length > 40)) errors.push('Elementlar soni 40 tadan oshmasligi kerak.');
    if (spec.type === 'tree' && (!Array.isArray(spec.tree) || spec.tree.length > 127)) errors.push('Daraxt 127 tagacha katakka ega bo‘lishi kerak.');
    if (spec.type === 'graph' && (!Array.isArray(spec.nodes) || spec.nodes.length > 30)) errors.push('Graf 30 tagacha tugundan iborat bo‘lishi kerak.');
    if (spec.type === 'grid' && (!Array.isArray(spec.rows) || spec.rows.length > 20 || spec.rows.some((row) => !Array.isArray(row) || row.length > 20))) errors.push('Jadval o‘lchami 20 × 20 dan oshmasligi kerak.');
    return errors.length ? { errors } : { value: spec as AlgoSpec, errors };
  } catch {
    return { errors: ['JSON sintaksisi noto‘g‘ri.'] };
  }
}

function getArrayState(spec: AlgoSpec, stepIndex: number): (string | number)[] {
  const values = [...(spec.array ?? spec.items ?? [])];
  for (const step of spec.steps.slice(0, stepIndex + 1)) {
    if (Array.isArray(step.swap) && step.swap.length === 2) {
      const [left, right] = step.swap;
      if (typeof left === 'number' && typeof right === 'number' && left < values.length && right < values.length) [values[left], values[right]] = [values[right], values[left]];
    }
    if (Array.isArray(step.set)) for (const change of step.set) {
      if (Array.isArray(change) && typeof change[0] === 'number' && change[0] >= 0 && change[0] < values.length) values[change[0]] = change[1] as string | number;
    }
  }
  return values;
}

function getGridState(spec: AlgoSpec, stepIndex: number): unknown[][] {
  const rows = (spec.rows ?? []).map((row) => [...row]);
  for (const step of spec.steps.slice(0, stepIndex + 1)) if (Array.isArray(step.set)) for (const change of step.set) {
    if (Array.isArray(change) && typeof change[0] === 'number' && typeof change[1] === 'number' && change[0] >= 0 && change[0] < rows.length && change[1] >= 0 && change[1] < (rows[change[0]]?.length ?? 0)) rows[change[0]][change[1]] = change[2];
  }
  return rows;
}

export function AlgoVisualizer({ source }: { source: string }) {
  const checked = useMemo(() => validateAlgo(source), [source]);
  const [stepIndex, setStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const spec = checked.value;
  useEffect(() => {
    if (!spec || !isPlaying || spec.steps.length < 2) return;
    const timer = window.setInterval(() => setStepIndex((index) => {
      if (index >= spec.steps.length - 1) { setIsPlaying(false); return index; }
      return index + 1;
    }), Math.max(250, spec.delay ?? 900));
    return () => window.clearInterval(timer);
  }, [isPlaying, spec]);
  if (!spec) return <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">Ko‘rish uchun JSON to‘g‘ri bo‘lishi kerak.</div>;
  const current = spec.steps[Math.min(stepIndex, spec.steps.length - 1)];
  const highlighted = Array.isArray(current?.highlight) ? current.highlight : Array.isArray(current?.sorted) ? current.sorted : [];
  const values = getArrayState(spec, stepIndex);
  const gridValues = getGridState(spec, stepIndex);
  return <section className="rounded-2xl border border-slate-200 bg-white p-4 text-slate-800 shadow-sm" aria-label="Algoritm jonli ko‘rinishi">
    <div className="mb-4 flex items-start justify-between gap-3"><div><h3 className="font-semibold">{spec.title}</h3><p className="mt-1 text-sm text-slate-500">{current?.note ?? 'Boshlang‘ich holat'}</p></div><span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700">{stepIndex + 1} / {Math.max(spec.steps.length, 1)}</span></div>
    {spec.type === 'graph' ? <GraphPreview spec={spec} step={current} /> : spec.type === 'grid' ? <div className="overflow-x-auto"><div className="inline-grid gap-1" style={{ gridTemplateColumns: `repeat(${Math.max(...gridValues.map((r) => r.length), 1)}, minmax(2.25rem, 1fr))` }}>{gridValues.flatMap((row, r) => row.map((cell, c) => <div key={`${r}-${c}`} className={`grid h-10 min-w-9 place-items-center rounded-lg border text-sm ${highlighted.some((point) => Array.isArray(point) && point[0] === r && point[1] === c) ? 'border-indigo-400 bg-indigo-100' : 'border-slate-200 bg-slate-50'}`}>{String(cell)}</div>))}</div></div> : spec.type === 'tree' ? <div className="flex flex-wrap gap-2">{(spec.tree ?? []).map((item, index) => item == null ? null : <span key={index} className={`grid h-10 w-10 place-items-center rounded-full border ${current?.current === index ? 'border-indigo-500 bg-indigo-100' : 'border-slate-200 bg-slate-50'}`}>{String(item)}</span>)}</div> : <div className={`flex min-h-24 items-end gap-2 overflow-x-auto rounded-xl bg-slate-50 p-4 ${spec.view === 'bars' ? 'items-end' : 'items-center'}`}>{values.map((item, index) => { const isHot = highlighted.includes(index) || (Array.isArray(current?.compare) && current.compare.includes(index)) || (Array.isArray(current?.found) && current.found.includes(index)); const height = Math.max(24, Number(item) * 4); return <div key={index} className={`${spec.view === 'bars' ? 'w-10' : 'min-w-10 px-2'} flex shrink-0 items-center justify-center rounded-md border border-indigo-200 bg-white text-sm font-semibold ${isHot ? 'ring-2 ring-indigo-500 bg-indigo-50' : ''}`} style={spec.view === 'bars' ? { height: `${Math.min(height, 180)}px` } : undefined}>{String(item)}</div>; })}</div>}
    {spec.code && <pre className="mt-3 max-h-28 overflow-auto rounded-xl bg-slate-950 p-3 text-xs text-slate-100"><code>{spec.code}</code></pre>}
    <div className="mt-4 flex items-center gap-2"><button type="button" onClick={() => setStepIndex((i) => Math.max(0, i - 1))} className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-indigo-500">Oldingi</button><button type="button" onClick={() => { if (stepIndex >= spec.steps.length - 1) setStepIndex(0); setIsPlaying((playing) => !playing); }} aria-label={isPlaying ? 'Animatsiyani to‘xtatish' : 'Animatsiyani davom ettirish'} className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-sm text-white hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-indigo-500">{isPlaying ? <Pause className="h-3.5 w-3.5"/> : <Play className="h-3.5 w-3.5"/>}{isPlaying ? 'To‘xtatish' : 'Davom etish'}</button><button type="button" onClick={() => { setStepIndex(0); setIsPlaying(true); }} aria-label="Birinchi qadamga qaytish" className="rounded-lg border border-slate-200 p-2 hover:bg-slate-50"><RotateCcw className="h-4 w-4"/></button><button type="button" onClick={() => setStepIndex((i) => Math.min(Math.max(0, spec.steps.length - 1), i + 1))} className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-indigo-500">Keyingi</button></div>
  </section>;
}

function GraphPreview({ spec, step }: { spec: AlgoSpec; step?: AlgoStep }) {
  const nodes = spec.nodes ?? [];
  const positions = spec.pos ?? nodes.map((_, i): [number, number] => [60 + i * (280 / Math.max(nodes.length - 1, 1)), 150]);
  const active = Array.isArray(step?.active) ? step.active : [];
  return <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50"><svg viewBox="0 0 400 300" className="h-auto w-full" role="img" aria-label="Graf tugunlari va bog‘lanishlari">{(spec.edges ?? []).map((edge, i) => { const a = nodes.indexOf(edge[0]); const b = nodes.indexOf(edge[1]); if (a < 0 || b < 0) return null; const start = positions[a]; const end = positions[b]; const hot = active.some((pair) => Array.isArray(pair) && pair[0] === edge[0] && pair[1] === edge[1]); return <g key={i}><line x1={start[0]} y1={start[1]} x2={end[0]} y2={end[1]} stroke={hot ? '#4f46e5' : '#94a3b8'} strokeWidth={hot ? 3 : 1.5} markerEnd={spec.directed ? 'url(#arrow)' : undefined}/>{edge[2] != null && <text x={(start[0] + end[0]) / 2} y={(start[1] + end[1]) / 2 - 7} fontSize="11" fill="#475569">{String(edge[2])}</text>}</g>; })}<defs><marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3 z" fill="#64748b"/></marker></defs>{nodes.map((node, i) => { const [x, y] = positions[i] ?? [200, 150]; const isActive = step?.current === node || (Array.isArray(step?.visited) && step.visited.includes(node)); return <g key={String(node)}><rect x={x - 36} y={y - 17} width="72" height="34" rx="10" fill={isActive ? '#e0e7ff' : 'white'} stroke={isActive ? '#4f46e5' : '#94a3b8'} strokeWidth="2"/><text x={x} y={y + 4} textAnchor="middle" fontSize="11" fill="#1e293b">{String(node)}</text></g>; })}</svg></div>;
}

export function HelpPopover() { return <details className="relative"><summary className="flex cursor-pointer list-none items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs text-slate-600 hover:bg-slate-50"><HelpCircle className="h-4 w-4"/>Yordam</summary><div className="absolute right-0 z-20 mt-2 w-64 rounded-xl border border-slate-200 bg-white p-3 text-xs leading-relaxed text-slate-600 shadow-xl">1. Algoritm yoki diagrammani yarating.<br/>2. Markdown blokni nusxalang.<br/>3. Django admin’dagi dars matniga qo‘ying.</div></details>; }

export function CopyPanel({ json, onToast }: { json: string; onToast?: (message: string) => void }) {
  const [copied, setCopied] = useState(false);
  const markdown = `\`\`\`algo\n${json}\n\`\`\``;
  async function copy(text: string) { try { await navigator.clipboard.writeText(text); setCopied(true); onToast?.('Nusxalandi ✓'); window.setTimeout(() => setCopied(false), 1800); } catch { onToast?.('Nusxalash amalga oshmadi. Matnni qo‘lda belgilang.'); } }
  return <div className="space-y-3"><label className="block text-xs font-semibold text-slate-600" htmlFor="algo-markdown">Django uchun Markdown</label><textarea id="algo-markdown" readOnly value={markdown} className="h-36 w-full resize-y rounded-xl border border-slate-200 bg-slate-50 p-3 font-mono text-xs text-slate-700 focus-visible:outline-2 focus-visible:outline-indigo-500"/><div className="flex flex-wrap gap-2"><button type="button" onClick={() => void copy(markdown)} className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">{copied ? <Check className="h-4 w-4"/> : <Copy className="h-4 w-4"/>}Markdown nusxalash</button><button type="button" onClick={() => void copy(json)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-indigo-500">Faqat JSON nusxalash</button></div><p className="text-xs leading-relaxed text-slate-500">Nusxani Django admin'dagi dars matniga qo'ying. Admin preview'da ko'rinmaydi, saytda ko'rinadi.</p></div>;
}

export function blankStep(note = 'Boshlang‘ich holat'): AlgoStep { return { note, line: 1 }; }

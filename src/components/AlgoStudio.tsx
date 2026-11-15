import React, { useEffect, useMemo, useState } from 'react';
import AlgoVisualizer from './AlgoVisualizer';
import presets from '../lib/diagram-presets.json';
import { Check, Copy, HelpCircle, RotateCcw, Plus, Trash2 } from 'lucide-react';

type Spec = Record<string, unknown>;
type Mode = 'algorithm' | 'system' | 'sequence' | 'uml';

const INITIAL_BUBBLE: Spec = { type: 'array', title: 'Bubble sort', array: [5, 2, 8, 1], steps: [] };
const DIAGRAMS = presets as Record<string, Spec>;
const PRESET_LIST: { label: string; key: string; group: string }[] = [
  { label: 'Bubble sort', key: 'bubble', group: 'Saralash' },
  { label: 'Selection sort', key: 'selection', group: 'Saralash' },
  { label: 'Insertion sort', key: 'insertion', group: 'Saralash' },
  { label: 'Binary search', key: 'binary', group: 'Qidiruv' },
  { label: 'Ikki ko‘rsatkich', key: 'two-pointers', group: 'Massiv usullari' },
  { label: 'Prefix sum', key: 'prefix', group: 'Massiv usullari' },
  { label: 'Stek / qavslar', key: 'stack', group: 'Stek/Navbat/Ro‘yxat' },
  { label: 'Navbat', key: 'queue', group: 'Stek/Navbat/Ro‘yxat' },
  { label: 'Daraxt ko‘rigi', key: 'tree', group: 'Daraxt' },
  { label: 'BFS graf', key: 'graph', group: 'Graf' },
  { label: 'LCS jadvali', key: 'grid', group: 'DP jadval' },
];
const ALGO_HELP = '1. Andozani tanlang yoki JSON ni tahrirlang. 2. Ko‘rinishni tekshirib, blokni nusxalang. 3. Django admin darslik maydoniga qo‘ying.';
const NODE_KINDS = ['client', 'user', 'server', 'loadbalancer', 'database', 'cache', 'queue', 'cloud', 'service'];

function traceAlgorithm(key: string, input: string, target: number): Spec {
  const values = input.split(',').map((v) => Number(v.trim()));
  if (!values.length || values.some((v) => !Number.isFinite(v))) throw new Error('Sonlarni vergul bilan ajrating. Masalan: 5, 2, 8, 1');
  const steps: Spec[] = [];
  const arr = [...values];
  if (['bubble', 'selection', 'insertion'].includes(key)) {
    if (arr.length > 40) throw new Error('Massivda 40 tadan ko‘p son bo‘lmasin.');
    const sorted: number[] = [];
    if (key === 'bubble') {
      for (let end = arr.length - 1; end > 0; end--) {
        for (let i = 0; i < end; i++) {
          if (arr[i] > arr[i + 1]) {
            steps.push({ compare: [i, i + 1], note: `${arr[i]} va ${arr[i + 1]} solishtiriladi; o‘rin almashadi.`, swap: [i, i + 1] });
            [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
          } else steps.push({ compare: [i, i + 1], note: `${arr[i]} va ${arr[i + 1]} tartibda.` });
        }
        sorted.push(end);
      }
    } else if (key === 'selection') {
      for (let i = 0; i < arr.length; i++) {
        let min = i;
        for (let j = i + 1; j < arr.length; j++) {
          steps.push({ compare: [min, j], note: `${arr[j]} qiymati eng kichik qiymat bilan solishtirilmoqda.` });
          if (arr[j] < arr[min]) min = j;
        }
        if (min !== i) { steps.push({ swap: [i, min], note: `Eng kichik qiymat ${arr[min]} oldinga o‘tkazildi.` }); [arr[i], arr[min]] = [arr[min], arr[i]]; }
        sorted.push(i);
      }
    } else {
      for (let i = 1; i < arr.length; i++) {
        let j = i;
        while (j > 0 && arr[j - 1] > arr[j]) {
          steps.push({ compare: [j - 1, j], swap: [j - 1, j], note: `${arr[j]} chapdagi katta qiymatdan oldinga suriladi.` });
          [arr[j - 1], arr[j]] = [arr[j], arr[j - 1]];
          j--;
        }
        sorted.push(i);
      }
    }
    steps.push({ sorted: arr.map((_, i) => i), note: 'Saralash yakunlandi.' });
    return { type: 'array', title: PRESET_LIST.find((p) => p.key === key)?.label, array: values, steps };
  }
  if (key === 'binary') {
    const sorted = [...arr].sort((a, b) => a - b); let lo = 0; let hi = sorted.length - 1;
    while (lo <= hi) { const mid = Math.floor((lo + hi) / 2); const cmp: number[] = [mid]; const hit = sorted[mid] === target; steps.push({ compare: cmp, found: hit ? [mid] : undefined, note: hit ? `${target} qiymati ${mid}-indeksda topildi.` : `${sorted[mid]} tekshirildi; qidiruv oralig‘i qisqartirildi.`, ranges: [[lo, hi]] }); if (hit) break; if (sorted[mid] < target) lo = mid + 1; else hi = mid - 1; }
    return { type: 'array', title: 'Binary search', array: sorted, steps };
  }
  if (key === 'prefix') { let total = 0; const below: number[] = []; arr.forEach((n, i) => { total += n; below.push(total); steps.push({ below: [...below], belowHighlight: [i], note: `Yig‘indi: ${total}` }); }); return { type: 'array', title: 'Prefix sum', array: values, below: values.map(() => 0), belowLabel: 'Yig‘indi', steps }; }
  if (key === 'two-pointers') return { type: 'array', title: 'Ikki ko‘rsatkich', array: values, steps: Array.from({ length: Math.floor(values.length / 2) }, (_, i) => ({ pointers: { chap: i, ong: values.length - 1 - i }, compare: [i, values.length - 1 - i], note: 'Chap va o‘ng ko‘rsatkichlar jufti ko‘riladi.' })) };
  if (key === 'stack') return { type: 'stack', title: 'Stek', items: [], steps: values.map((value, i) => ({ items: values.slice(0, i + 1), highlight: [i], note: `${value} stek tepasiga qo‘shildi.` })) };
  if (key === 'queue') return { type: 'queue', title: 'Navbat', items: [], steps: values.map((value, i) => ({ items: values.slice(i), highlight: [0], note: `${value} navbatdan chiqariladi.` })) };
  if (key === 'tree') return { type: 'tree', title: 'Daraxt bo‘ylab ko‘rik', tree: values.slice(0, 127), steps: values.map((_, i) => ({ current: i, visited: values.slice(0, i), note: `${i}-tugun ko‘rilmoqda.` })) };
  if (key === 'graph') { const nodes = Math.min(values.length, 30); return { type: 'graph', title: 'Graf ko‘rigi', nodes, edges: Array.from({ length: Math.max(0, nodes - 1) }, (_, i) => [i, i + 1]), steps: Array.from({ length: nodes }, (_, i) => ({ current: i, visited: Array.from({ length: i }, (_v, j) => j), active: i < nodes - 1 ? [[i, i + 1]] : [], note: `${i}-tugun ko‘rilmoqda.` })) }; }
  if (key === 'grid') { const chars = input.slice(0, 20).split(''); return { type: 'grid', title: 'LCS jadvali', rows: [chars.map((c) => c), chars.map((_, i) => i)], steps: chars.map((_, i) => ({ highlight: [[0, i]], note: `${i + 1}-ustun hisoblanmoqda.` })) }; }
  return INITIAL_BUBBLE;
}

function validateSpec(value: Spec): string | null {
  const steps = Array.isArray(value.steps) ? value.steps : [];
  if (steps.length > 2000) return 'Qadamlar soni 2000 tadan oshmasligi kerak.';
  if (value.type === 'array' && Array.isArray(value.array) && value.array.length > 40) return 'Massiv 40 tadan oshmasligi kerak.';
  if (value.type === 'tree' && Array.isArray(value.tree) && value.tree.length > 127) return 'Daraxt 127 ta uyadan oshmasligi kerak.';
  if (value.type === 'graph' && Array.isArray(value.nodes) && value.nodes.length > 30) return 'Graf 30 ta tugundan oshmasligi kerak.';
  if (value.type === 'grid' && Array.isArray(value.rows) && (value.rows.length > 20 || value.rows.some((row) => Array.isArray(row) && row.length > 20))) return 'Jadval 20×20 dan oshmasligi kerak.';
  if (value.type === 'sequence' && Array.isArray(value.actors) && value.actors.length > 8) return 'Ketma-ketlik 8 ta aktordan oshmasligi kerak.';
  if (value.type === 'sequence' && Array.isArray(value.messages) && value.messages.length > 60) return 'Xabarlar 60 tadan oshmasligi kerak.';
  if (value.type === 'uml' && Array.isArray(value.classes) && value.classes.length > 12) return 'UML diagrammasi 12 ta sinfdan oshmasligi kerak.';
  return null;
}

export function AlgoStudio({ onInsert, initialMode = 'algorithm' }: { onInsert: (block: string) => void; initialMode?: Mode }) {
  const [mode, setMode] = useState<Mode>('algorithm');
  const [source, setSource] = useState(JSON.stringify(INITIAL_BUBBLE, null, 2));
  const [input, setInput] = useState('5, 2, 8, 1');
  const [target, setTarget] = useState(8);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [help, setHelp] = useState(false);
  const [dragging, setDragging] = useState<number | null>(null);
  const [connect, setConnect] = useState<number | null>(null);
  const [activePreset, setActivePreset] = useState('bubble');
  const parsed = useMemo(() => { try { return JSON.parse(source) as Spec; } catch { return null; } }, [source]);
  const block = `\`\`\`algo\n${parsed ? JSON.stringify(parsed, null, 2) : source}\n\`\`\``;

  const update = (spec: Spec) => { const next = JSON.stringify(spec, null, 2); setSource(next); setError(validateSpec(spec) ?? ''); };
  const selectAlgo = (key: string) => { setActivePreset(key); try { update(traceAlgorithm(key, input, target)); } catch (e) { setError(e instanceof Error ? e.message : 'Kiritilgan ma’lumot noto‘g‘ri.'); } };
  const selectDiagram = (key: string) => { setActivePreset(key); const spec = DIAGRAMS[key]; if (spec) { setMode(key.startsWith('system_') ? 'system' : key.startsWith('sequence_') ? 'sequence' : 'uml'); update(spec); } };
  const switchMode = (value: Mode) => {
    setMode(value);
    if (value === 'algorithm' && parsed?.type !== 'array') selectAlgo('bubble');
    if (value === 'system' && parsed?.type !== 'graph') selectDiagram('system_load_balancer');
    if (value === 'sequence' && parsed?.type !== 'sequence') selectDiagram('sequence_mutex');
    if (value === 'uml' && parsed?.type !== 'uml') selectDiagram('uml_observer');
  };
  useEffect(() => { switchMode(initialMode); }, [initialMode]);
  const copy = async () => { if (error || !parsed) return; await navigator.clipboard?.writeText(block); setCopied(true); window.setTimeout(() => setCopied(false), 1600); };
  const reset = () => { setError(''); if (mode === 'algorithm') selectAlgo('bubble'); else if (mode === 'system') selectDiagram('system_load_balancer'); else if (mode === 'sequence') selectDiagram('sequence_mutex'); else selectDiagram('uml_observer'); };

  const patchGraph = (patch: Partial<{ nodes: unknown[]; kinds: string[]; pos: number[][]; edges: unknown[][]; steps: Spec[] }>) => { if (!parsed) return; update({ ...parsed, directed: true, view: [640, 360], ...patch }); };
  const graphNodes = Array.isArray(parsed?.nodes) ? parsed.nodes as string[] : [];
  const graphPos = Array.isArray(parsed?.pos) ? parsed.pos as number[][] : [];
  const graphKinds = Array.isArray(parsed?.kinds) ? parsed.kinds as string[] : [];
  const graphEdges = Array.isArray(parsed?.edges) ? parsed.edges as unknown[][] : [];
  const graphSteps = Array.isArray(parsed?.steps) ? parsed.steps as Spec[] : [];

  return <section className="flex flex-col gap-4" aria-label="Algoritm va diagramma studiyasi">
    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
      <div><h2 className="text-lg font-bold text-white">Algoritm va tizim diagrammalari</h2><p className="text-xs text-slate-400">Interaktiv darslik blokini yarating, ko‘ring va Django uchun nusxalang.</p></div>
      <div className="flex flex-wrap gap-1.5">
        {([['algorithm', 'Algoritm'], ['system', 'System Design'], ['sequence', 'Diagramma · Sequence'], ['uml', 'Diagramma · UML']] as [Mode, string][]).map(([value, label]) => <button key={value} type="button" onClick={() => switchMode(value)} className={`rounded-lg px-3 py-1.5 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${mode === value ? 'bg-indigo-600 text-white' : 'border border-slate-700 text-slate-300 hover:bg-slate-800'}`}>{label}</button>)}
        <button type="button" onClick={() => setHelp(!help)} aria-expanded={help} className="rounded-lg border border-slate-700 px-2.5 py-1.5 text-xs text-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"><HelpCircle className="mr-1 inline size-3.5"/>Yordam</button>
      </div>
    </div>
    {help && <aside className="rounded-xl border border-indigo-500/30 bg-indigo-950/30 p-3 text-xs text-indigo-100">{ALGO_HELP}</aside>}
    {mode === 'algorithm' && <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-3">
      <div className="mb-2 flex flex-wrap items-center gap-2"><span className="text-xs font-semibold text-slate-300">Algoritm andozalari:</span><label className="text-[11px] text-slate-400">Sonlar <input value={input} onChange={(e) => setInput(e.target.value)} onBlur={() => selectAlgo(activePreset)} className="ml-1 w-36 rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400" /></label><label className="text-[11px] text-slate-400">Maqsad <input type="number" value={target} onChange={(e) => setTarget(Number(e.target.value))} onBlur={() => activePreset === 'binary' && selectAlgo(activePreset)} className="ml-1 w-16 rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400" /></label></div>
      {['Saralash', 'Qidiruv', 'Massiv usullari', 'Stek/Navbat/Ro‘yxat', 'Daraxt', 'Graf', 'DP jadval'].map((group) => <div key={group} className="mb-2 flex flex-wrap items-center gap-1.5"><span className="w-32 text-[10px] text-slate-500">{group}</span>{PRESET_LIST.filter((item) => item.group === group).map((item) => <button key={item.key} type="button" onClick={() => selectAlgo(item.key)} className={`rounded-md border px-2 py-1 text-[11px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${activePreset === item.key ? 'border-indigo-500 bg-indigo-500/20 text-indigo-200' : 'border-slate-700 text-slate-300 hover:border-slate-500'}`}>{item.label}</button>)}</div>)}
    </div>}
    {mode === 'system' && <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-3"><div className="flex flex-wrap gap-1.5"><span className="mr-2 text-xs text-slate-300">System Design andozalari:</span>{[['Load Balancer','system_load_balancer'],['Cache-aside (Redis)','system_cache_aside'],['Message Queue','system_message_queue'],['URL Shortener','system_url_shortener'],['CDN','system_cdn']].map(([label,key])=><button key={key} type="button" onClick={()=>selectDiagram(key)} className="rounded-lg border border-slate-700 px-2.5 py-1 text-[11px] text-indigo-200 hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400">{label}</button>)}</div>
      {parsed?.type === 'graph' && <div className="mt-3 grid gap-3 lg:grid-cols-[1fr_1fr]"><div><div className="mb-2 flex flex-wrap gap-1">{NODE_KINDS.map((kind)=><button key={kind} type="button" onClick={()=>{ if(graphNodes.length>=30){setError('Grafda 30 tadan ko‘p tugun bo‘lmasligi kerak.');return;} const n=graphNodes.length; patchGraph({nodes:[...graphNodes,kind],kinds:[...graphKinds,kind],pos:[...graphPos,[70+(n%3)*220,80+Math.floor(n/3)*100]]});}} className="rounded-md border border-slate-700 px-2 py-1 text-[10px] text-slate-300">+ {kind}</button>)}</div><button type="button" onClick={()=>{setActivePreset('connect');setConnect(null);}} aria-pressed={activePreset==='connect'} className="mb-2 rounded-md border border-indigo-500/50 px-2 py-1 text-[10px] text-indigo-200">{connect===null?'Aloqa chizish':'Ikkinchi tugunni tanlang'}</button><div className="relative mx-auto aspect-[16/9] max-w-[640px] rounded-xl border border-slate-700 bg-slate-950" onPointerMove={(e)=>{if(dragging===null)return;const r=e.currentTarget.getBoundingClientRect();const next=graphPos.map((p,i)=>i===dragging?[Math.round((e.clientX-r.left)*640/r.width),Math.round((e.clientY-r.top)*360/r.height)]:p);patchGraph({pos:next});}} onPointerUp={()=>setDragging(null)} onPointerLeave={()=>setDragging(null)}>{graphEdges.map((edge,i)=>{const a=Number(edge[0]);const b=Number(edge[1]);const pa=graphPos[a]??[0,0];const pb=graphPos[b]??[0,0];return <svg key={i} className="pointer-events-none absolute inset-0 size-full" viewBox="0 0 640 360"><defs><marker id={`algo-arrow-${i}`} markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L7,3 z" fill="#818cf8"/></marker></defs><line x1={pa[0]} y1={pa[1]} x2={pb[0]} y2={pb[1]} stroke="#818cf8" strokeWidth="2" markerEnd={`url(#algo-arrow-${i})`}/><text x={(pa[0]+pb[0])/2} y={(pa[1]+pb[1])/2-7} fill="#cbd5e1" fontSize="10">{String(edge[2]??'')}</text></svg>})}{graphNodes.map((node,i)=>{const p=graphPos[i]??[40+i*100,180];return <button key={i} type="button" onPointerDown={(e)=>{e.currentTarget.setPointerCapture(e.pointerId);setDragging(i);}} onClick={()=>{if(connect!==null){if(connect!==i)patchGraph({edges:[...graphEdges,[connect,i,'so‘rov']]});setConnect(null);}else if(connect===null&&activePreset==='connect')setConnect(i);}} onDoubleClick={()=>{const name=window.prompt('Tugun nomi',String(node));if(name)patchGraph({nodes:graphNodes.map((n,j)=>j===i?name:n)});}} style={{left:`${(p[0]/640)*100}%`,top:`${(p[1]/360)*100}%`}} className={`absolute max-w-[110px] -translate-x-1/2 -translate-y-1/2 touch-none rounded-lg border border-indigo-400/50 bg-slate-800 px-2 py-1.5 text-[10px] text-white shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${dragging===i?'ring-2 ring-amber-300':''}`} aria-label={`${node}; surib joylashtiring`}>{String(node)}<span className="block text-[9px] text-indigo-300">{graphKinds[i]??'service'}</span></button>})}</div><div className="mt-2 flex flex-wrap gap-1.5"><button type="button" onClick={()=>{setActivePreset('connect');setConnect(null);}} className="rounded-lg border border-indigo-500/40 px-2.5 py-1 text-[11px] text-indigo-200">{activePreset==='connect'?'Tugunlarni ketma-ket tanlang':'Ulash rejimi'}</button>{graphEdges.map((edge,i)=><label key={i} className="flex items-center gap-1 text-[10px] text-slate-400">{String(graphNodes[Number(edge[0])]??'?')}→{String(graphNodes[Number(edge[1])]??'?')}<input aria-label="Qirra yozuvi" value={String(edge[2]??'')} onChange={(e)=>patchGraph({edges:graphEdges.map((v,j)=>j===i?[v[0],v[1],e.target.value]:v)})} className="w-24 rounded border border-slate-700 bg-slate-950 px-1.5 py-1 text-slate-100"/><button type="button" aria-label="Qirrani o‘chirish" onClick={()=>patchGraph({edges:graphEdges.filter((_,j)=>j!==i)})}><Trash2 className="size-3 text-rose-400"/></button></label>)}</div></div>
      <div className="max-h-[300px] overflow-auto rounded-lg border border-slate-800 p-2"><div className="mb-2 flex items-center justify-between text-xs font-semibold text-slate-300">Qadamlar <button type="button" onClick={()=>patchGraph({steps:[...graphSteps,{note:'Yangi qadam'}]})} className="text-indigo-300">+ Qadam</button></div>{graphSteps.map((step,i)=><div key={i} className="mb-2 grid grid-cols-[1fr_auto] gap-1.5"><input aria-label="Qadam izohi" value={String(step.note??'')} onChange={(e)=>patchGraph({steps:graphSteps.map((s,j)=>j===i?{...s,note:e.target.value}:s)})} className="min-w-0 rounded border border-slate-700 bg-slate-950 px-2 py-1 text-[11px] text-slate-100"/><button type="button" aria-label="Qadamni o‘chirish" onClick={()=>patchGraph({steps:graphSteps.filter((_,j)=>j!==i)})}><Trash2 className="size-3.5 text-rose-400"/></button></div>)}</div></div>}
    </div>}
    {(mode === 'sequence' || mode === 'uml') && <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-3"><div className="flex flex-wrap gap-1.5">{(mode==='sequence'?[['Mutex','sequence_mutex'],['Login oqimi','sequence_login']]:[['Adapter','uml_adapter'],['Observer','uml_observer']]).map(([label,key])=><button key={key} type="button" onClick={()=>selectDiagram(key)} className="rounded-lg border border-slate-700 px-2.5 py-1 text-[11px] text-indigo-200">{label}</button>)}</div><p className="mt-2 text-xs text-slate-400">Andozani tanlang yoki JSON muharririda aktorlar, xabarlar, sinflar va aloqalarni tahrirlang. O‘zgarishlar jonli ko‘rinishda aks etadi.</p></div>}
    {error && <div role="alert" className="rounded-xl border border-rose-500/40 bg-rose-950/40 px-3 py-2 text-xs text-rose-200">Xatolik: {error}</div>}
    {parsed && !error && <div className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,.9fr)]"><div className="min-w-0 rounded-2xl border border-slate-700 bg-white p-2 text-slate-900"><AlgoVisualizer source={JSON.stringify(parsed)} /></div><div className="flex min-w-0 flex-col gap-3"><div className="rounded-2xl border border-slate-800 bg-slate-900 p-3"><div className="mb-2 flex items-center justify-between"><h3 className="text-sm font-semibold text-white">Sozlash · JSON</h3><button type="button" onClick={reset} className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white"><RotateCcw className="size-3.5"/>Qayta tiklash</button></div><textarea aria-label="Algoritm JSON muharriri" value={source} onChange={(e)=>{setSource(e.target.value);try{const value=JSON.parse(e.target.value) as Spec;setError(validateSpec(value)??'');}catch{setError('JSON formati noto‘g‘ri. Qavslar va vergullarni tekshiring.');}}} spellCheck={false} className="min-h-[240px] w-full resize-y rounded-xl border border-slate-700 bg-slate-950 p-3 font-mono text-[11px] leading-5 text-indigo-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"/><div className="mt-2 flex flex-wrap gap-2"><button type="button" onClick={()=>onInsert(`${block}\n\n`)} disabled={Boolean(error)} className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-500 disabled:opacity-40"><Plus className="mr-1 inline size-3.5"/>Darslikka qo‘shish</button><button type="button" onClick={copy} disabled={Boolean(error)} className="rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-200 hover:bg-slate-800 disabled:opacity-40">{copied?<Check className="mr-1 inline size-3.5 text-emerald-400"/>:<Copy className="mr-1 inline size-3.5"/>}{copied?'Nusxalandi':'Django formatida nusxalash'}</button><button type="button" onClick={reset} className="rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-400">Tozalash</button></div></div><div className="rounded-2xl border border-slate-800 bg-slate-900 p-3"><div className="mb-2 flex items-center justify-between"><h3 className="text-xs font-semibold text-slate-300">Django uchun nusxalanadigan blok</h3><button type="button" onClick={copy} disabled={Boolean(error)} className="text-[11px] text-indigo-300 disabled:opacity-40">Nusxalash</button></div><pre className="max-h-40 overflow-auto whitespace-pre-wrap break-all rounded-lg bg-slate-950 p-2 font-mono text-[10px] leading-4 text-slate-300">{block}</pre></div></div></div>}
  </section>;
}

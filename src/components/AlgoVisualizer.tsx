"use client";

import React, { useEffect, useId, useMemo, useState } from "react";
import { Pause, Play, RotateCcw, SkipBack, SkipForward } from "lucide-react";

/* ============================================================
   ```algo bloki — algoritmlarni qadam-baqadam ko'rsatadi.
   Qo'shimcha kutubxona kerak emas (faqat lucide-react).

   Umumiy maydonlar:
     type    "array" (sukut) | "stack" | "queue" | "list" | "tree" | "graph" | "grid"
     title   sarlavha
     delay   qadam orasidagi ms (sukut 900)
     code    ixtiyoriy kod paneli; har qadamda "line" (1 dan) qatorni yoritadi
     steps   [{ note, line, ...turga xos maydonlar }]

   array : array[], view("cells"|"bars"); step: compare[], swap[i,j], set[[i,v]],
           sorted[], pointers{}, ranges[[l,r]], dim[], found[]
   stack/queue/list : items[]; step: items[] (to'liq holat), highlight[], pointers{}
   tree  : tree[] (heap-indeks: chap 2i+1, o'ng 2i+2, yo'q = null);
           step: current, visited[], highlight[], output[], structure{name,items}
   graph : nodes (son yoki nomlar[]), edges[[u,v,w?]], directed, pos[[x,y]] (0..400, 0..300);
           step: current, visited[], frontier[], active[[u,v]], labels{idx:text}, structure
   grid  : rows[][], rowLabels[], colLabels[];
           step: set[[r,c,v]], highlight[[r,c]], from[[r,c]], path[[r,c]]

   array qo'shimcha (Prefix Sum kabi ikki qatorli ko'rinish uchun):
           below[] (pastki qator), belowLabel, step: below[] (to'liq holat), belowHighlight[]
   graph qo'shimcha (SYSTEM DESIGN chizmalari uchun):
           kinds[] — har tugun uchun belgi: client | user | server | loadbalancer |
                     database | cache | queue | cloud (cdn) | service; view:[w,h] (sukut 640x360),
           edges[[u,v,"yozuv"]] — yozuv matn bo'lishi mumkin
   sequence : actors[], messages[{ from, to, label, kind:"call"|"reply"|"note", note, line }]
              (har xabar bitta qadam; "steps" kerak emas)
   uml      : classes[{ name, stereotype, fields[], methods[] }],
              relations[{ from, to, kind:"inherit"|"implement"|"compose"|"aggregate"|"assoc"|"depend", label }],
              pos[[x,y]] (markaz koordinatalari), steps[{ note, show[], highlight[] }] (ixtiyoriy, bo'lmasa statik)
============================================================ */

type Scalar = string | number;
type Pair = [number, number];

interface BaseStep {
  note?: string;
  line?: number;
}

interface Structure {
  name: string;
  items: Scalar[];
}

interface ArrayStep extends BaseStep {
  compare?: number[];
  swap?: Pair;
  set?: Pair[];
  sorted?: number[];
  pointers?: Record<string, number>;
  ranges?: Pair[];
  dim?: number[];
  found?: number[];
  below?: Scalar[];
  belowHighlight?: number[];
}
interface ArraySpec {
  type?: "array";
  array: number[];
  view?: "cells" | "bars";
  below?: Scalar[];
  belowLabel?: string;
  steps: ArrayStep[];
}

interface SeqStep extends BaseStep {
  items?: Scalar[];
  highlight?: number[];
  pointers?: Record<string, number>;
}
interface SeqSpec {
  type: "stack" | "queue" | "list";
  items: Scalar[];
  steps: SeqStep[];
}

interface TreeStep extends BaseStep {
  current?: number;
  visited?: number[];
  highlight?: number[];
  output?: Scalar[];
  structure?: Structure;
}
interface TreeSpec {
  type: "tree";
  tree: (Scalar | null)[];
  steps: TreeStep[];
}

interface GraphStep extends BaseStep {
  current?: number;
  visited?: number[];
  frontier?: number[];
  active?: Pair[];
  labels?: Record<string, Scalar>;
  structure?: Structure;
}
interface GraphSpec {
  type: "graph";
  nodes: Scalar[] | number;
  edges: (number | string)[][];
  directed?: boolean;
  pos?: Pair[];
  kinds?: string[];
  view?: Pair;
  steps: GraphStep[];
}

interface GridStep extends BaseStep {
  set?: [number, number, Scalar][];
  highlight?: Pair[];
  from?: Pair[];
  path?: Pair[];
}
interface GridSpec {
  type: "grid";
  rows: Scalar[][];
  rowLabels?: Scalar[];
  colLabels?: Scalar[];
  steps: GridStep[];
}

interface SequenceMessage {
  from: number;
  to: number;
  label?: string;
  kind?: "call" | "reply" | "note";
  note?: string;
  line?: number;
}
interface SequenceSpec {
  type: "sequence";
  actors: string[];
  messages: SequenceMessage[];
  steps?: BaseStep[];
}

interface UmlClass {
  name: string;
  stereotype?: string;
  fields?: string[];
  methods?: string[];
}
interface UmlRelation {
  from: number;
  to: number;
  kind?: "inherit" | "implement" | "compose" | "aggregate" | "assoc" | "depend";
  label?: string;
}
interface UmlStep extends BaseStep {
  show?: number[];
  highlight?: number[];
}
interface UmlSpec {
  type: "uml";
  classes: UmlClass[];
  relations?: UmlRelation[];
  pos?: Pair[];
  steps?: UmlStep[];
}

type Spec = (ArraySpec | SeqSpec | TreeSpec | GraphSpec | GridSpec | SequenceSpec | UmlSpec) & {
  title?: string;
  delay?: number;
  code?: string;
};

const TYPES = ["array", "stack", "queue", "list", "tree", "graph", "grid", "sequence", "uml"];
const SPEEDS = [0.5, 1, 2, 4];

const MAX_ITEMS = 40;
const MAX_TREE = 127;
const MAX_NODES = 30;
const MAX_GRID = 20;
const MAX_ACTORS = 8;
const MAX_MESSAGES = 60;
const MAX_CLASSES = 12;
const MAX_STEPS = 2000;

/* ---------- ranglar ---------- */

const TONE = {
  current: "border-amber-400 bg-amber-100 text-amber-800",
  swap: "border-rose-400 bg-rose-100 text-rose-700",
  done: "border-emerald-400 bg-emerald-100 text-emerald-700",
  range: "border-sky-300 bg-sky-50 text-sky-800",
  idle: "border-slate-300 bg-white text-slate-700",
} as const;

const SVG_TONE = {
  current: { fill: "#fef3c7", stroke: "#f59e0b" },
  highlight: { fill: "#ffe4e6", stroke: "#fb7185" },
  done: { fill: "#d1fae5", stroke: "#34d399" },
  frontier: { fill: "#e0f2fe", stroke: "#38bdf8" },
  idle: { fill: "#ffffff", stroke: "#94a3b8" },
} as const;

const toSet = (list?: number[]) => new Set(list ?? []);
const pairKey = (a: number, b: number) => `${a}-${b}`;

/* ---------- parse ---------- */

function parseSpec(source: string): { spec: Spec | null; error: string | null } {
  try {
    const raw = JSON.parse(source.trim()) as any;
    const type: string = raw.type ?? "array";

    if (!TYPES.includes(type)) throw new Error(`Noma'lum type: ${type}`);
    if (raw.steps === undefined && (type === "sequence" || type === "uml")) raw.steps = [];
    if (!Array.isArray(raw.steps)) throw new Error("`steps` massiv bo'lishi kerak");
    if (raw.steps.length > MAX_STEPS) throw new Error(`Qadamlar ${MAX_STEPS} tadan oshmasligi kerak`);

    switch (type) {
      case "array":
        if (!Array.isArray(raw.array) || !raw.array.every((n: unknown) => typeof n === "number")) {
          throw new Error("`array` sonlardan iborat massiv bo'lishi kerak");
        }
        if (raw.array.length > MAX_ITEMS) throw new Error(`Massiv ${MAX_ITEMS} tadan oshmasligi kerak`);
        break;
      case "stack":
      case "queue":
      case "list":
        if (!Array.isArray(raw.items)) throw new Error("`items` massiv bo'lishi kerak");
        if (raw.items.length > MAX_ITEMS) throw new Error(`Elementlar ${MAX_ITEMS} tadan oshmasligi kerak`);
        break;
      case "tree":
        if (!Array.isArray(raw.tree) || raw.tree.length === 0) throw new Error("`tree` bo'sh bo'lmagan massiv bo'lishi kerak");
        if (raw.tree.length > MAX_TREE) throw new Error(`Daraxt ${MAX_TREE} tadan oshmasligi kerak`);
        break;
      case "graph": {
        const n = typeof raw.nodes === "number" ? raw.nodes : Array.isArray(raw.nodes) ? raw.nodes.length : -1;
        if (n < 1) throw new Error("`nodes` son yoki nomlar massivi bo'lishi kerak");
        if (n > MAX_NODES) throw new Error(`Tugunlar ${MAX_NODES} tadan oshmasligi kerak`);
        if (!Array.isArray(raw.edges)) throw new Error("`edges` massiv bo'lishi kerak");
        for (const e of raw.edges) {
          const ok = (v: unknown) => Number.isInteger(v) && (v as number) >= 0 && (v as number) < n;
          if (!Array.isArray(e) || !ok(e[0]) || !ok(e[1])) throw new Error("Qirralar mavjud tugun indekslariga ulanishi kerak: [u, v]");
        }
        break;
      }
      case "grid":
        if (!Array.isArray(raw.rows) || !raw.rows.every((r: unknown) => Array.isArray(r))) {
          throw new Error("`rows` ikki o'lchamli massiv bo'lishi kerak");
        }
        if (raw.rows.length > MAX_GRID || raw.rows.some((r: unknown[]) => r.length > MAX_GRID)) {
          throw new Error(`Jadval ${MAX_GRID}×${MAX_GRID} dan oshmasligi kerak`);
        }
        break;
      case "sequence": {
        if (!Array.isArray(raw.actors) || raw.actors.length < 2 || raw.actors.length > MAX_ACTORS) {
          throw new Error("`actors` 2 dan " + MAX_ACTORS + " gacha nomdan iborat bo'lishi kerak");
        }
        if (!Array.isArray(raw.messages) || raw.messages.length > MAX_MESSAGES) {
          throw new Error("`messages` massiv bo'lishi kerak (eng ko'pi " + MAX_MESSAGES + " ta)");
        }
        const n = raw.actors.length;
        for (const m of raw.messages) {
          const ok = (v: unknown) => Number.isInteger(v) && (v as number) >= 0 && (v as number) < n;
          if (!ok(m?.from) || !ok(m?.to)) throw new Error("Xabarlarning `from`/`to` qiymati aktor indeksi bo'lishi kerak");
        }
        break;
      }
      case "uml": {
        if (!Array.isArray(raw.classes) || raw.classes.length === 0 || raw.classes.length > MAX_CLASSES) {
          throw new Error("`classes` 1 dan " + MAX_CLASSES + " gacha sinfdan iborat bo'lishi kerak");
        }
        const n = raw.classes.length;
        for (const r of raw.relations ?? []) {
          const ok = (v: unknown) => Number.isInteger(v) && (v as number) >= 0 && (v as number) < n;
          if (!ok(r?.from) || !ok(r?.to)) throw new Error("Aloqalarning `from`/`to` qiymati sinf indeksi bo'lishi kerak");
        }
        break;
      }
    }

    return { spec: { ...raw, type } as Spec, error: null };
  } catch (e) {
    return { spec: null, error: e instanceof Error ? e.message : "JSON xato" };
  }
}

/* ============================================================
   PLAYER: boshqaruv, progress, izoh, kod paneli
============================================================ */

function Player<S extends BaseStep>({
  title,
  steps,
  delay = 900,
  code,
  resetKey,
  render,
}: {
  title?: string;
  steps: S[];
  delay?: number;
  code?: string;
  resetKey: string;
  render: (k: number, step: S | undefined) => React.ReactNode;
}) {
  const last = steps.length;
  const [k, setK] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  useEffect(() => {
    setK(0);
    setPlaying(false);
  }, [resetKey]);

  useEffect(() => {
    if (!playing) return;
    if (k >= last) {
      setPlaying(false);
      return;
    }
    const timer = window.setTimeout(() => setK((v) => Math.min(v + 1, last)), delay / speed);
    return () => window.clearTimeout(timer);
  }, [playing, k, last, delay, speed]);

  const current = Math.min(k, last);
  const step = current > 0 ? steps[current - 1] : undefined;
  const note = step?.note ?? (current === 0 ? "Boshlang'ich holat" : "");
  const codeLines = code ? code.split("\n") : null;
  const isStatic = last === 0;

  const goTo = (value: number) => {
    setPlaying(false);
    setK(Math.min(Math.max(value, 0), last));
  };

  const togglePlay = () => {
    if (playing) return setPlaying(false);
    if (current >= last) setK(0);
    setPlaying(true);
  };

  const btn =
    "flex size-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <div className="my-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <style>{`@keyframes algo-pop{from{opacity:0;transform:scale(.85)}to{opacity:1;transform:none}}`}</style>

      <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-4 py-2 text-xs">
        <span className="font-semibold text-slate-700">{title || "Algoritm vizualizatsiyasi"}</span>
        {!isStatic && (
          <span className="tabular-nums text-slate-500">
            Qadam {current} / {last}
          </span>
        )}
      </div>

      <div className={codeLines ? "grid lg:grid-cols-2" : ""}>
        <div className="min-w-0 p-4">
          {render(current, step)}

          {!isStatic && (
            <>
          <p className="mt-3 min-h-12 rounded-lg bg-slate-50 px-3 py-2 text-sm leading-6 text-slate-600">{note}</p>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button type="button" className={btn} onClick={() => goTo(0)} aria-label="Boshiga qaytish">
              <RotateCcw className="size-4" />
            </button>
            <button type="button" className={btn} onClick={() => goTo(current - 1)} disabled={current === 0} aria-label="Oldingi qadam">
              <SkipBack className="size-4" />
            </button>
            <button
              type="button"
              onClick={togglePlay}
              className="flex h-8 items-center gap-1.5 rounded-lg bg-slate-900 px-3 text-xs font-semibold text-white transition hover:bg-slate-800"
            >
              {playing ? <Pause className="size-4" /> : <Play className="size-4" />}
              {playing ? "To'xtatish" : "Boshlash"}
            </button>
            <button type="button" className={btn} onClick={() => goTo(current + 1)} disabled={current >= last} aria-label="Keyingi qadam">
              <SkipForward className="size-4" />
            </button>

            <select
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="ml-auto h-8 rounded-lg border border-slate-200 bg-white px-2 text-xs text-slate-600"
              aria-label="Tezlik"
            >
              {SPEEDS.map((s) => (
                <option key={s} value={s}>
                  {s}x
                </option>
              ))}
            </select>
          </div>

          <input
            type="range"
            min={0}
            max={last}
            value={current}
            onChange={(e) => goTo(Number(e.target.value))}
            className="mt-3 w-full accent-slate-900"
            aria-label="Qadamlar"
          />
            </>
          )}
        </div>

        {codeLines && (
          <div className="min-w-0 overflow-x-auto border-t border-slate-100 bg-[#fafafa] py-3 lg:border-l lg:border-t-0">
            {codeLines.map((line, i) => (
              <div
                key={i}
                className={`flex px-3 font-mono text-[13px] leading-6 transition-colors ${
                  step?.line === i + 1 ? "bg-amber-100 text-slate-900" : "text-slate-600"
                }`}
              >
                <span className="mr-3 w-5 shrink-0 select-none text-right text-slate-300">{i + 1}</span>
                <span className="whitespace-pre">{line || " "}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StructureBar({ structure }: { structure?: Structure }) {
  if (!structure) return null;
  return (
    <div className="mt-3 flex min-h-8 flex-wrap items-center gap-1.5 text-xs">
      <span className="font-semibold uppercase tracking-wide text-slate-500">{structure.name}:</span>
      {structure.items.length === 0 ? (
        <span className="text-slate-400">bo'sh</span>
      ) : (
        structure.items.map((item, i) => (
          <span key={`${i}-${item}`} className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 font-mono text-slate-700">
            {item}
          </span>
        ))
      )}
    </div>
  );
}

function OutputBar({ output }: { output?: Scalar[] }) {
  if (!output || output.length === 0) return null;
  return (
    <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs">
      <span className="font-semibold uppercase tracking-wide text-slate-500">Natija:</span>
      {output.map((v, i) => (
        <span key={`${i}-${v}`} className="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 font-mono text-emerald-700">
          {v}
        </span>
      ))}
    </div>
  );
}

/* ============================================================
   ARRAY
============================================================ */

const CELL = 56;
const GAP = 8;
const SLOT = CELL + GAP;
const BAR_MIN = 32;
const BAR_MAX = 150;

interface ArrayCell {
  id: number;
  value: number;
}

function buildArrayFrames(spec: ArraySpec): ArrayCell[][] {
  const frames: ArrayCell[][] = [spec.array.map((value, id) => ({ id, value }))];

  for (const step of spec.steps) {
    const next = frames[frames.length - 1].map((c) => ({ ...c }));

    if (step.swap) {
      const [i, j] = step.swap;
      if (next[i] && next[j]) [next[i], next[j]] = [next[j], next[i]];
    }
    for (const [i, value] of step.set ?? []) {
      if (next[i]) next[i] = { ...next[i], value };
    }
    frames.push(next);
  }

  return frames;
}

function ArrayView({ spec, title, resetKey }: { spec: ArraySpec & { delay?: number; code?: string }; title?: string; resetKey: string }) {
  const frames = useMemo(() => buildArrayFrames(spec), [spec]);
  const maxVal = useMemo(() => Math.max(1, ...frames.flat().map((c) => Math.abs(c.value))), [frames]);
  const belowFrames = useMemo(() => {
    const out: Scalar[][] = [spec.below ?? []];
    for (const s of spec.steps) out.push(s.below ?? out[out.length - 1]);
    return out;
  }, [spec]);
  const bars = spec.view === "bars";

  return (
    <Player
      title={title}
      steps={spec.steps}
      delay={spec.delay}
      code={spec.code}
      resetKey={resetKey}
      render={(k, step) => {
        const cells = frames[k];
        const areaHeight = bars ? BAR_MAX : CELL;
        const totalWidth = Math.max(1, cells.length * SLOT - GAP);

        const sorted = toSet(step?.sorted);
        const compare = toSet(step?.compare);
        const swapped = toSet(step?.swap);
        const found = toSet(step?.found);
        const dim = toSet(step?.dim);
        const inRange = (pos: number) => (step?.ranges ?? []).some(([l, r]) => pos >= l && pos <= r);

        const pointersByIndex: Record<number, string[]> = {};
        for (const [name, idx] of Object.entries(step?.pointers ?? {})) {
          (pointersByIndex[idx] = pointersByIndex[idx] ?? []).push(name);
        }

        const tone = (pos: number) => {
          if (swapped.has(pos)) return TONE.swap;
          if (found.has(pos)) return TONE.done + " ring-2 ring-emerald-400";
          if (compare.has(pos)) return TONE.current;
          if (sorted.has(pos)) return TONE.done;
          if (inRange(pos)) return TONE.range;
          return TONE.idle;
        };

        // DOM tartibi id bo'yicha o'zgarmas: aks holda brauzer elementni ko'chirganda transition uziladi
        const renderCells = cells.map((c, pos) => ({ ...c, pos })).sort((a, b) => a.id - b.id);

        return (
          <div className="overflow-x-auto pb-2">
            <div className="relative mx-auto" style={{ width: totalWidth }}>
              <div className="relative" style={{ height: areaHeight }}>
                {renderCells.map((c) => {
                  const height = bars ? BAR_MIN + (Math.abs(c.value) / maxVal) * (BAR_MAX - BAR_MIN) : CELL;
                  return (
                    <div
                      key={c.id}
                      className={`absolute bottom-0 left-0 flex justify-center rounded-lg border-2 text-sm font-semibold ${
                        bars ? "items-start pt-1.5" : "items-center"
                      } ${tone(c.pos)} ${dim.has(c.pos) ? "opacity-40" : ""}`}
                      style={{
                        width: CELL,
                        height,
                        transform: `translateX(${c.pos * SLOT}px)`,
                        transition:
                          "transform 450ms cubic-bezier(.4,0,.2,1), height 300ms ease, background-color 200ms, border-color 200ms, opacity 200ms",
                      }}
                    >
                      {c.value}
                    </div>
                  );
                })}
              </div>

              <div className="relative mt-1" style={{ height: 40 }}>
                {cells.map((_, i) => (
                  <div key={i} className="absolute top-0 text-center" style={{ left: i * SLOT, width: CELL }}>
                    <div className="text-[11px] text-slate-400">{i}</div>
                    {pointersByIndex[i] && (
                      <div className="text-[11px] font-semibold text-blue-600">{pointersByIndex[i].join(", ")}</div>
                    )}
                  </div>
                ))}
              </div>

              {belowFrames[k].length > 0 && (
                <div className="mt-1">
                  {spec.belowLabel && (
                    <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">{spec.belowLabel}</div>
                  )}
                  <div className="relative" style={{ height: 44 }}>
                    {belowFrames[k].map((v, i) => (
                      <div
                        key={i}
                        className={`absolute top-0 flex h-10 items-center justify-center rounded-lg border-2 text-sm font-semibold transition-colors duration-200 ${
                          toSet(step?.belowHighlight).has(i) ? TONE.current : TONE.idle
                        }`}
                        style={{ left: i * SLOT, width: CELL }}
                      >
                        {v}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      }}
    />
  );
}

/* ============================================================
   STACK / QUEUE / LIST
============================================================ */

function SeqView({ spec, title, resetKey }: { spec: SeqSpec & { delay?: number; code?: string }; title?: string; resetKey: string }) {
  const frames = useMemo(() => {
    const out: Scalar[][] = [spec.items];
    for (const s of spec.steps) out.push(s.items ?? out[out.length - 1]);
    return out;
  }, [spec]);

  return (
    <Player
      title={title}
      steps={spec.steps}
      delay={spec.delay}
      code={spec.code}
      resetKey={resetKey}
      render={(k, step) => {
        const items = frames[k];
        const highlight = toSet(step?.highlight);
        const box = (i: number) =>
          `flex h-11 min-w-14 items-center justify-center rounded-lg border-2 px-3 text-sm font-semibold ${
            highlight.has(i) ? TONE.current : TONE.idle
          }`;
        const popStyle = { animation: "algo-pop 250ms ease" } as const;

        if (spec.type === "stack") {
          return (
            <div className="flex justify-center">
              <div className="relative flex min-h-32 w-48 flex-col-reverse items-stretch gap-1.5 border-b-4 border-l-4 border-r-4 border-slate-300 px-2 pb-2 pt-3">
                {items.length === 0 && (
                  <span className="absolute inset-0 flex items-center justify-center text-xs text-slate-400">bo'sh stek</span>
                )}
                {items.map((v, i) => (
                  <div key={`${i}-${v}`} className="relative" style={popStyle}>
                    <div className={box(i)}>{v}</div>
                    {i === items.length - 1 && (
                      <span className="absolute -right-12 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-blue-600">← top</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        }

        if (spec.type === "queue") {
          return (
            <div className="overflow-x-auto pb-2">
              <div className="flex min-h-20 items-start justify-center gap-1.5 border-y-4 border-slate-300 px-2 py-3">
                {items.length === 0 && <span className="self-center text-xs text-slate-400">bo'sh navbat</span>}
                {items.map((v, i) => (
                  <div key={`${i}-${v}`} className="flex flex-col items-center gap-1" style={popStyle}>
                    <div className={box(i)}>{v}</div>
                    <span className="text-[11px] font-semibold text-blue-600">
                      {[i === 0 ? "front" : "", i === items.length - 1 ? "back" : ""].filter(Boolean).join(" / ") || "\u00a0"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        }

        // list
        const pointersByIndex: Record<number, string[]> = {};
        for (const [name, idx] of Object.entries(step?.pointers ?? {})) {
          (pointersByIndex[idx] = pointersByIndex[idx] ?? []).push(name);
        }
        return (
          <div className="overflow-x-auto pb-2">
            <div className="flex min-h-20 items-end justify-center gap-1 px-2">
              {items.map((v, i) => (
                <div key={`${i}-${v}`} className="flex items-end gap-1" style={popStyle}>
                  <div className="flex flex-col items-center gap-1">
                    <span className="h-4 text-[11px] font-semibold text-blue-600">{pointersByIndex[i]?.join(", ") ?? ""}</span>
                    <div className={box(i)}>{v}</div>
                  </div>
                  <span className="pb-2.5 text-slate-400">→</span>
                </div>
              ))}
              <span className="pb-3 font-mono text-xs text-slate-400">null</span>
            </div>
          </div>
        );
      }}
    />
  );
}

/* ============================================================
   TREE (heap-indeksli massiv)
============================================================ */

function layoutTree(arr: (Scalar | null)[]) {
  const pos = new Map<number, { x: number; y: number }>();
  let counter = 0;
  let maxDepth = 0;

  const walk = (i: number, depth: number) => {
    if (i >= arr.length || arr[i] == null) return;
    walk(2 * i + 1, depth + 1);
    pos.set(i, { x: counter++, y: depth });
    maxDepth = Math.max(maxDepth, depth);
    walk(2 * i + 2, depth + 1);
  };
  walk(0, 0);

  return { pos, count: counter, maxDepth };
}

function TreeView({ spec, title, resetKey }: { spec: TreeSpec & { delay?: number; code?: string }; title?: string; resetKey: string }) {
  const layout = useMemo(() => layoutTree(spec.tree), [spec.tree]);

  const R = 20;
  const X_GAP = 56;
  const Y_GAP = 70;
  const PAD = 30;
  const width = Math.max(1, layout.count - 1) * X_GAP + PAD * 2;
  const height = layout.maxDepth * Y_GAP + PAD * 2;
  const at = (i: number) => {
    const p = layout.pos.get(i)!;
    return { x: PAD + p.x * X_GAP, y: PAD + p.y * Y_GAP };
  };

  return (
    <Player
      title={title}
      steps={spec.steps}
      delay={spec.delay}
      code={spec.code}
      resetKey={resetKey}
      render={(_k, step) => {
        const visited = toSet(step?.visited);
        const highlight = toSet(step?.highlight);
        const state = (i: number) => {
          if (step?.current === i) return SVG_TONE.current;
          if (highlight.has(i)) return SVG_TONE.highlight;
          if (visited.has(i)) return SVG_TONE.done;
          return SVG_TONE.idle;
        };

        const edges: [number, number][] = [];
        for (const i of layout.pos.keys()) {
          for (const c of [2 * i + 1, 2 * i + 2]) if (layout.pos.has(c)) edges.push([i, c]);
        }

        return (
          <div>
            <div className="overflow-x-auto">
              <svg viewBox={`0 0 ${width} ${height}`} className="mx-auto block h-auto w-full" style={{ maxWidth: width }} role="img" aria-label="Daraxt">
                {edges.map(([a, b]) => {
                  const p = at(a);
                  const q = at(b);
                  return <line key={`${a}-${b}`} x1={p.x} y1={p.y} x2={q.x} y2={q.y} stroke="#cbd5e1" strokeWidth={2} />;
                })}
                {[...layout.pos.keys()].map((i) => {
                  const p = at(i);
                  const s = state(i);
                  return (
                    <g key={i}>
                      <circle cx={p.x} cy={p.y} r={R} fill={s.fill} stroke={s.stroke} strokeWidth={2.5} style={{ transition: "fill 250ms, stroke 250ms" }} />
                      <text x={p.x} y={p.y} textAnchor="middle" dominantBaseline="central" fontSize={14} fontWeight={600} fill="#334155">
                        {String(spec.tree[i])}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
            <OutputBar output={step?.output} />
            <StructureBar structure={step?.structure} />
          </div>
        );
      }}
    />
  );
}

/* ============================================================
   GRAPH
============================================================ */

const KIND_W = 84;
const KIND_H = 66;

/** System design belgilari (o'zimiz chizgan oddiy SVG ikonkalar) */
function NodeIcon({ kind, x, y }: { kind: string; x: number; y: number }) {
  let body: React.ReactNode;

  switch (kind) {
    case "client":
      body = (
        <>
          <rect x={-12} y={-10} width={24} height={16} rx={2} />
          <path d="M-6 11H6M0 6V11" />
        </>
      );
      break;
    case "user":
      body = (
        <>
          <circle cx={0} cy={-5} r={5} />
          <path d="M-10 11c0-6 5-8 10-8s10 2 10 8" />
        </>
      );
      break;
    case "server":
      body = (
        <>
          {[-12, -3, 6].map((oy) => (
            <g key={oy}>
              <rect x={-12} y={oy} width={24} height={7} rx={2} />
              <circle cx={-7} cy={oy + 3.5} r={0.9} fill="#475569" />
            </g>
          ))}
        </>
      );
      break;
    case "loadbalancer":
      body = (
        <>
          <circle cx={-9} cy={0} r={3} />
          <path d="M-6 0L6 -8M-6 0H6M-6 0L6 8" />
          <circle cx={9} cy={-8} r={2.5} />
          <circle cx={9} cy={0} r={2.5} />
          <circle cx={9} cy={8} r={2.5} />
        </>
      );
      break;
    case "database":
      body = (
        <>
          <ellipse cx={0} cy={-8} rx={11} ry={4} />
          <path d="M-11 -8V8C-11 12 11 12 11 8V-8" />
          <path d="M-11 0C-11 4 11 4 11 0" />
        </>
      );
      break;
    case "cache":
      body = <path d="M3 -12L-7 2H0L-3 12L8 -3H1Z" />;
      break;
    case "queue":
      body = (
        <>
          {[-13, -4.5, 4].map((ox) => (
            <rect key={ox} x={ox} y={-5} width={8} height={10} rx={1.5} />
          ))}
        </>
      );
      break;
    case "cdn":
    case "cloud":
      body = <path d="M-8 8H7A5 5 0 0 0 8 -2A7 7 0 0 0 -5 -4A6 6 0 0 0 -8 8Z" />;
      break;
    default:
      body = (
        <>
          <rect x={-11} y={-9} width={22} height={18} rx={4} />
          <path d="M-5 -2H5M-5 3H2" />
        </>
      );
  }

  return (
    <g
      transform={`translate(${x},${y})`}
      fill="none"
      stroke="#475569"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {body}
    </g>
  );
}

function GraphView({ spec, title, resetKey }: { spec: GraphSpec & { delay?: number; code?: string }; title?: string; resetKey: string }) {
  const rawId = useId();
  const markerId = `algo_${rawId.replace(/[^a-zA-Z0-9_-]/g, "")}`;

  const labels = useMemo(
    () => (typeof spec.nodes === "number" ? Array.from({ length: spec.nodes }, (_, i) => String(i)) : spec.nodes.map(String)),
    [spec.nodes],
  );

  const hasKinds = Boolean(spec.kinds?.some(Boolean));
  const [VW, VH] = spec.view ?? (hasKinds ? [640, 360] : [400, 300]);

  const pts = useMemo(() => {
    const n = labels.length;
    if (spec.pos && spec.pos.length >= n) return spec.pos.map(([x, y]) => ({ x, y }));
    if (n === 1) return [{ x: VW / 2, y: VH / 2 }];

    const rx = hasKinds ? VW * 0.36 : Math.min(115, 40 + n * 12) * 1.35;
    const ry = hasKinds ? VH * 0.34 : Math.min(115, 40 + n * 12);
    return labels.map((_, i) => {
      const angle = (2 * Math.PI * i) / n - Math.PI / 2;
      return { x: VW / 2 + rx * Math.cos(angle), y: VH / 2 + ry * Math.sin(angle) };
    });
  }, [labels, spec.pos, hasKinds, VW, VH]);

  const R = 18;
  const directed = Boolean(spec.directed);
  const kindOf = (i: number) => spec.kinds?.[i] || "";

  // Tugun markazidan chegarasigacha masofa (doira yoki to'rtburchak)
  const edgeDistance = (i: number, ux: number, uy: number) => {
    if (!kindOf(i)) return R;
    const tx = Math.abs(ux) < 1e-6 ? Infinity : KIND_W / 2 / Math.abs(ux);
    const ty = Math.abs(uy) < 1e-6 ? Infinity : KIND_H / 2 / Math.abs(uy);
    return Math.min(tx, ty);
  };

  return (
    <Player
      title={title}
      steps={spec.steps}
      delay={spec.delay}
      code={spec.code}
      resetKey={resetKey}
      render={(_k, step) => {
        const visited = toSet(step?.visited);
        const frontier = toSet(step?.frontier);
        const activeSet = new Set((step?.active ?? []).map(([a, b]) => pairKey(a, b)));

        const state = (i: number) => {
          if (step?.current === i) return SVG_TONE.current;
          if (visited.has(i)) return SVG_TONE.done;
          if (frontier.has(i)) return SVG_TONE.frontier;
          return SVG_TONE.idle;
        };

        return (
          <div>
            <svg viewBox={`0 0 ${VW} ${VH}`} className="mx-auto block h-auto max-h-[28rem] w-full" role="img" aria-label="Graf yoki tizim chizmasi">
              <defs>
                <marker id={`${markerId}_n`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
                  <path d="M0 0L10 5L0 10z" fill="#94a3b8" />
                </marker>
                <marker id={`${markerId}_a`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
                  <path d="M0 0L10 5L0 10z" fill="#f59e0b" />
                </marker>
              </defs>

              {spec.edges.map((e, idx) => {
                const [a, b, w] = e as [number, number, Scalar | undefined];
                const A = pts[a];
                const B = pts[b];
                if (!A || !B) return null;

                const dx = B.x - A.x;
                const dy = B.y - A.y;
                const len = Math.hypot(dx, dy) || 1;
                const ux = dx / len;
                const uy = dy / len;
                const startGap = edgeDistance(a, ux, uy);
                const endGap = edgeDistance(b, ux, uy) + (directed ? 3 : 0);
                const active = activeSet.has(pairKey(a, b)) || (!directed && activeSet.has(pairKey(b, a)));
                const color = active ? "#f59e0b" : "#cbd5e1";

                return (
                  <g key={idx}>
                    <line
                      x1={A.x + ux * startGap}
                      y1={A.y + uy * startGap}
                      x2={B.x - ux * endGap}
                      y2={B.y - uy * endGap}
                      stroke={color}
                      strokeWidth={active ? 3.5 : 2}
                      markerEnd={directed ? `url(#${markerId}_${active ? "a" : "n"})` : undefined}
                      style={{ transition: "stroke 250ms" }}
                    />
                    {w !== undefined && (
                      <text
                        x={(A.x + B.x) / 2 - uy * 12}
                        y={(A.y + B.y) / 2 + ux * 12}
                        textAnchor="middle"
                        dominantBaseline="central"
                        fontSize={12}
                        fontWeight={600}
                        fill="#64748b"
                        stroke="#ffffff"
                        strokeWidth={4}
                        paintOrder="stroke"
                      >
                        {String(w)}
                      </text>
                    )}
                  </g>
                );
              })}

              {labels.map((label, i) => {
                const p = pts[i];
                const s = state(i);
                const extra = step?.labels?.[String(i)];
                const kind = kindOf(i);

                if (kind) {
                  return (
                    <g key={i}>
                      <rect
                        x={p.x - KIND_W / 2}
                        y={p.y - KIND_H / 2}
                        width={KIND_W}
                        height={KIND_H}
                        rx={12}
                        fill={s.fill}
                        stroke={s.stroke}
                        strokeWidth={2.5}
                        style={{ transition: "fill 250ms, stroke 250ms" }}
                      />
                      <NodeIcon kind={kind} x={p.x} y={p.y - 9} />
                      <text x={p.x} y={p.y + KIND_H / 2 - 10} textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={600} fill="#334155">
                        {label}
                      </text>
                      {extra !== undefined && (
                        <text x={p.x} y={p.y + KIND_H / 2 + 14} textAnchor="middle" fontSize={12} fontWeight={700} fill="#2563eb">
                          {String(extra)}
                        </text>
                      )}
                    </g>
                  );
                }

                return (
                  <g key={i}>
                    <circle cx={p.x} cy={p.y} r={R} fill={s.fill} stroke={s.stroke} strokeWidth={2.5} style={{ transition: "fill 250ms, stroke 250ms" }} />
                    <text x={p.x} y={p.y} textAnchor="middle" dominantBaseline="central" fontSize={14} fontWeight={600} fill="#334155">
                      {label}
                    </text>
                    {extra !== undefined && (
                      <text x={p.x} y={p.y + R + 13} textAnchor="middle" fontSize={12} fontWeight={700} fill="#2563eb">
                        {String(extra)}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
            <StructureBar structure={step?.structure} />
          </div>
        );
      }}
    />
  );
}

/* ============================================================
   GRID (DP jadvali)
============================================================ */

function GridView({ spec, title, resetKey }: { spec: GridSpec & { delay?: number; code?: string }; title?: string; resetKey: string }) {
  const frames = useMemo(() => {
    const out: Scalar[][][] = [spec.rows.map((r) => [...r])];
    for (const s of spec.steps) {
      const next = out[out.length - 1].map((r) => [...r]);
      for (const [r, c, v] of s.set ?? []) {
        if (next[r] && c >= 0 && c < next[r].length) next[r][c] = v;
      }
      out.push(next);
    }
    return out;
  }, [spec]);

  return (
    <Player
      title={title}
      steps={spec.steps}
      delay={spec.delay}
      code={spec.code}
      resetKey={resetKey}
      render={(k, step) => {
        const grid = frames[k];
        const highlight = new Set((step?.highlight ?? []).map(([r, c]) => pairKey(r, c)));
        const from = new Set((step?.from ?? []).map(([r, c]) => pairKey(r, c)));
        const path = new Set((step?.path ?? []).map(([r, c]) => pairKey(r, c)));

        const tone = (r: number, c: number) => {
          const key = pairKey(r, c);
          if (highlight.has(key)) return TONE.current;
          if (from.has(key)) return TONE.range;
          if (path.has(key)) return TONE.done;
          return TONE.idle;
        };

        const label = "px-2 text-center text-[11px] font-semibold text-slate-400";

        return (
          <div className="overflow-x-auto pb-1">
            <table className="mx-auto border-separate border-spacing-1 text-sm">
              {spec.colLabels && (
                <thead>
                  <tr>
                    {spec.rowLabels && <th />}
                    {spec.colLabels.map((l, c) => (
                      <th key={c} className={label}>
                        {l}
                      </th>
                    ))}
                  </tr>
                </thead>
              )}
              <tbody>
                {grid.map((row, r) => (
                  <tr key={r}>
                    {spec.rowLabels && (
                      <th className={`${label} whitespace-nowrap text-right`}>{spec.rowLabels[r] ?? ""}</th>
                    )}
                    {row.map((v, c) => (
                      <td
                        key={c}
                        className={`h-10 min-w-10 rounded-md border-2 text-center font-semibold tabular-nums transition-colors duration-200 ${tone(r, c)}`}
                      >
                        {v}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }}
    />
  );
}

/* ============================================================
   SEQUENCE (ketma-ketlik diagrammasi)
============================================================ */

function SequenceView({ spec, title, resetKey }: { spec: SequenceSpec & { delay?: number; code?: string }; title?: string; resetKey: string }) {
  const rawId = useId();
  const markerId = `seq_${rawId.replace(/[^a-zA-Z0-9_-]/g, "")}`;

  const steps = useMemo<BaseStep[]>(
    () => spec.messages.map((m) => ({ note: m.note ?? m.label, line: m.line })),
    [spec.messages],
  );

  const n = spec.actors.length;
  const W = Math.max(480, n * 150);
  const colW = W / n;
  const ax = (i: number) => colW * (i + 0.5);
  const TOP = 64;
  const STEP_Y = 54;
  const H = TOP + 20 + spec.messages.length * STEP_Y + 16;

  return (
    <Player
      title={title}
      steps={steps}
      delay={spec.delay}
      code={spec.code}
      resetKey={resetKey}
      render={(k) => (
        <div className="overflow-x-auto">
          <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto block h-auto w-full" style={{ maxWidth: W }} role="img" aria-label="Ketma-ketlik diagrammasi">
            <defs>
              {(["s", "c"] as const).map((t) => (
                <marker key={t} id={`${markerId}_${t}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto">
                  <path d="M0 0L10 5L0 10z" fill={t === "c" ? "#f59e0b" : "#64748b"} />
                </marker>
              ))}
            </defs>

            {spec.actors.map((name, i) => (
              <g key={i}>
                <line x1={ax(i)} y1={TOP - 14} x2={ax(i)} y2={H - 8} stroke="#cbd5e1" strokeWidth={2} strokeDasharray="5 5" />
                <rect x={ax(i) - 56} y={8} width={112} height={36} rx={9} fill="#f8fafc" stroke="#94a3b8" strokeWidth={2} />
                <text x={ax(i)} y={26} textAnchor="middle" dominantBaseline="central" fontSize={13} fontWeight={600} fill="#334155">
                  {name}
                </text>
              </g>
            ))}

            {spec.messages.map((m, idx) => {
              const y = TOP + 22 + idx * STEP_Y;
              const visible = idx < k;
              const current = idx === k - 1;
              const color = current ? "#f59e0b" : "#64748b";
              const x1 = ax(m.from);
              const x2 = ax(m.to);
              const fade = { opacity: visible ? 1 : 0, transition: "opacity 300ms" };

              if (m.kind === "note") {
                const left = Math.min(x1, x2) - 62;
                const right = Math.max(x1, x2) + 62;
                return (
                  <g key={idx} style={fade}>
                    <rect x={left} y={y - 15} width={right - left} height={30} rx={6} fill={current ? "#fef3c7" : "#fefce8"} stroke="#facc15" strokeWidth={1.5} />
                    <text x={(left + right) / 2} y={y} textAnchor="middle" dominantBaseline="central" fontSize={12} fill="#713f12">
                      {m.label}
                    </text>
                  </g>
                );
              }

              const marker = `url(#${markerId}_${current ? "c" : "s"})`;
              const dash = m.kind === "reply" ? "6 4" : undefined;

              if (m.from === m.to) {
                return (
                  <g key={idx} style={fade}>
                    <path d={`M${x1} ${y - 8} h38 v22 h-38`} fill="none" stroke={color} strokeWidth={2} strokeDasharray={dash} markerEnd={marker} />
                    <text x={x1 + 46} y={y + 3} fontSize={12} fontWeight={600} fill="#334155" stroke="#ffffff" strokeWidth={4} paintOrder="stroke">
                      {m.label}
                    </text>
                  </g>
                );
              }

              const dir = x2 > x1 ? 1 : -1;
              return (
                <g key={idx} style={fade}>
                  <line
                    x1={x1}
                    y1={y}
                    x2={x2 - dir * 2}
                    y2={y}
                    stroke={color}
                    strokeWidth={current ? 3 : 2}
                    strokeDasharray={dash}
                    markerEnd={marker}
                    style={{ transition: "stroke 200ms" }}
                  />
                  <text x={(x1 + x2) / 2} y={y - 9} textAnchor="middle" fontSize={12} fontWeight={600} fill="#334155" stroke="#ffffff" strokeWidth={4} paintOrder="stroke">
                    {m.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      )}
    />
  );
}

/* ============================================================
   UML (sinf diagrammasi)
============================================================ */

const UML_FONT = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
const UML_CH = 7.4;
const UML_LINE = 18;
const UML_MARKER: Record<string, string> = {
  inherit: "tri",
  implement: "tri",
  compose: "dia",
  aggregate: "dia0",
  assoc: "open",
  depend: "open",
};

function umlMeasure(c: UmlClass) {
  const lines = [c.name, ...(c.stereotype ? [`«${c.stereotype}»`] : []), ...(c.fields ?? []), ...(c.methods ?? [])];
  const maxLen = Math.max(...lines.map((l) => l.length));
  const header = 30 + (c.stereotype ? 14 : 0);
  const fieldsH = (c.fields?.length ?? 0) * UML_LINE + 10;
  const methodsH = (c.methods?.length ?? 0) * UML_LINE + 10;
  return { w: Math.max(130, Math.ceil(maxLen * UML_CH) + 28), header, fieldsH, methodsH, h: header + fieldsH + methodsH };
}

function boxEdgeDistance(w: number, h: number, ux: number, uy: number) {
  const tx = Math.abs(ux) < 1e-6 ? Infinity : w / 2 / Math.abs(ux);
  const ty = Math.abs(uy) < 1e-6 ? Infinity : h / 2 / Math.abs(uy);
  return Math.min(tx, ty);
}

function UmlView({ spec, title, resetKey }: { spec: UmlSpec & { delay?: number; code?: string }; title?: string; resetKey: string }) {
  const rawId = useId();
  const markerId = `uml_${rawId.replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const steps = useMemo(() => spec.steps ?? [], [spec.steps]);
  const relations = spec.relations ?? [];

  const layout = useMemo(() => {
    const boxes = spec.classes.map(umlMeasure);
    const n = boxes.length;
    let centers: { x: number; y: number }[];

    if (spec.pos && spec.pos.length >= n) {
      centers = spec.pos.map(([x, y]) => ({ x, y }));
    } else {
      const cols = Math.min(3, Math.ceil(Math.sqrt(n)));
      const cellW = Math.max(...boxes.map((b) => b.w)) + 90;
      const cellH = Math.max(...boxes.map((b) => b.h)) + 80;
      centers = boxes.map((_, i) => ({
        x: (i % cols) * cellW + cellW / 2,
        y: Math.floor(i / cols) * cellH + cellH / 2,
      }));
    }

    const PAD = 28;
    const minX = Math.min(...centers.map((c, i) => c.x - boxes[i].w / 2)) - PAD;
    const maxX = Math.max(...centers.map((c, i) => c.x + boxes[i].w / 2)) + PAD;
    const minY = Math.min(...centers.map((c, i) => c.y - boxes[i].h / 2)) - PAD;
    const maxY = Math.max(...centers.map((c, i) => c.y + boxes[i].h / 2)) + PAD;
    return { boxes, centers, vb: [minX, minY, maxX - minX, maxY - minY] };
  }, [spec.classes, spec.pos]);

  // step.show berilmasa oldingi holat saqlanadi; hech qaysi qadamda show bo'lmasa hamma sinf ko'rinadi
  const visibleFrames = useMemo(() => {
    const all = spec.classes.map((_, i) => i);
    const anyShow = steps.some((s) => s.show);
    const out: number[][] = [anyShow ? [] : all];
    for (const s of steps) out.push(s.show ?? out[out.length - 1]);
    return out;
  }, [spec.classes, steps]);

  const stroke = "#64748b";

  return (
    <Player
      title={title}
      steps={steps}
      delay={spec.delay}
      code={spec.code}
      resetKey={resetKey}
      render={(k, step) => {
        const visible = new Set(visibleFrames[k]);
        const highlight = toSet(step?.highlight);
        const fade = (on: boolean) => ({ opacity: on ? 1 : 0, transition: "opacity 300ms" });

        return (
          <div className="overflow-x-auto">
            <svg viewBox={layout.vb.join(" ")} className="mx-auto block h-auto w-full" style={{ maxWidth: layout.vb[2] }} role="img" aria-label="UML sinf diagrammasi">
              <defs>
                <marker id={`${markerId}_tri`} viewBox="0 0 12 12" refX="12" refY="6" markerWidth="12" markerHeight="12" markerUnits="userSpaceOnUse" orient="auto">
                  <path d="M0 0L12 6L0 12z" fill="#ffffff" stroke={stroke} strokeWidth={1.5} />
                </marker>
                <marker id={`${markerId}_dia`} viewBox="0 0 12 12" refX="12" refY="6" markerWidth="12" markerHeight="12" markerUnits="userSpaceOnUse" orient="auto">
                  <path d="M0 6L6 1L12 6L6 11z" fill={stroke} stroke={stroke} strokeWidth={1.5} />
                </marker>
                <marker id={`${markerId}_dia0`} viewBox="0 0 12 12" refX="12" refY="6" markerWidth="12" markerHeight="12" markerUnits="userSpaceOnUse" orient="auto">
                  <path d="M0 6L6 1L12 6L6 11z" fill="#ffffff" stroke={stroke} strokeWidth={1.5} />
                </marker>
                <marker id={`${markerId}_open`} viewBox="0 0 12 12" refX="12" refY="6" markerWidth="12" markerHeight="12" markerUnits="userSpaceOnUse" orient="auto">
                  <path d="M1 1L11 6L1 11" fill="none" stroke={stroke} strokeWidth={1.5} />
                </marker>
              </defs>

              {relations.map((r, idx) => {
                const A = layout.centers[r.from];
                const B = layout.centers[r.to];
                if (!A || !B) return null;

                const dx = B.x - A.x;
                const dy = B.y - A.y;
                const len = Math.hypot(dx, dy) || 1;
                const ux = dx / len;
                const uy = dy / len;
                const bA = layout.boxes[r.from];
                const bB = layout.boxes[r.to];
                const dA = boxEdgeDistance(bA.w, bA.h, ux, uy);
                const dB = boxEdgeDistance(bB.w, bB.h, ux, uy);
                const p1 = { x: A.x + ux * dA, y: A.y + uy * dA };
                const p2 = { x: B.x - ux * dB, y: B.y - uy * dB };

                const kind = r.kind ?? "assoc";
                // compose/aggregate: romb "from" (butun) tomonda turadi
                const [s, e] = kind === "compose" || kind === "aggregate" ? [p2, p1] : [p1, p2];
                const dashed = kind === "implement" || kind === "depend";
                const on = visible.has(r.from) && visible.has(r.to);

                return (
                  <g key={idx} style={fade(on)}>
                    <line
                      x1={s.x}
                      y1={s.y}
                      x2={e.x}
                      y2={e.y}
                      stroke={stroke}
                      strokeWidth={1.8}
                      strokeDasharray={dashed ? "6 4" : undefined}
                      markerEnd={`url(#${markerId}_${UML_MARKER[kind] ?? "open"})`}
                    />
                    {r.label && (
                      <text
                        x={(p1.x + p2.x) / 2 - uy * 12}
                        y={(p1.y + p2.y) / 2 + ux * 12}
                        textAnchor="middle"
                        fontSize={11}
                        fill="#475569"
                        stroke="#ffffff"
                        strokeWidth={4}
                        paintOrder="stroke"
                      >
                        {r.label}
                      </text>
                    )}
                  </g>
                );
              })}

              {spec.classes.map((c, i) => {
                const box = layout.boxes[i];
                const ctr = layout.centers[i];
                const x = ctr.x - box.w / 2;
                const y = ctr.y - box.h / 2;
                const hi = highlight.has(i);

                return (
                  <g key={i} style={fade(visible.has(i))}>
                    <rect x={x} y={y} width={box.w} height={box.h} rx={8} fill="#ffffff" stroke={hi ? "#f59e0b" : "#94a3b8"} strokeWidth={hi ? 2.5 : 1.8} />
                    <path
                      d={`M${x} ${y + box.header}V${y + 8}Q${x} ${y} ${x + 8} ${y}H${x + box.w - 8}Q${x + box.w} ${y} ${x + box.w} ${y + 8}V${y + box.header}Z`}
                      fill={hi ? "#fef3c7" : "#f1f5f9"}
                    />
                    <line x1={x} y1={y + box.header} x2={x + box.w} y2={y + box.header} stroke="#cbd5e1" />
                    <line x1={x} y1={y + box.header + box.fieldsH} x2={x + box.w} y2={y + box.header + box.fieldsH} stroke="#cbd5e1" />
                    {c.stereotype && (
                      <text x={ctr.x} y={y + 13} textAnchor="middle" fontSize={11} fontStyle="italic" fill="#64748b" fontFamily={UML_FONT}>
                        {`«${c.stereotype}»`}
                      </text>
                    )}
                    <text x={ctr.x} y={y + (c.stereotype ? 28 : 20)} textAnchor="middle" fontSize={13} fontWeight={700} fill="#0f172a">
                      {c.name}
                    </text>
                    {(c.fields ?? []).map((f, j) => (
                      <text key={`f${j}`} x={x + 10} y={y + box.header + 14 + j * UML_LINE} fontSize={12} fontFamily={UML_FONT} fill="#334155">
                        {f}
                      </text>
                    ))}
                    {(c.methods ?? []).map((m, j) => (
                      <text key={`m${j}`} x={x + 10} y={y + box.header + box.fieldsH + 14 + j * UML_LINE} fontSize={12} fontFamily={UML_FONT} fill="#334155">
                        {m}
                      </text>
                    ))}
                  </g>
                );
              })}
            </svg>
          </div>
        );
      }}
    />
  );
}

/* ============================================================
   KIRISH NUQTASI
============================================================ */

export default function AlgoVisualizer({ source }: { source: string }) {
  const { spec, error } = useMemo(() => parseSpec(source), [source]);

  if (!spec) {
    return (
      <div className="my-5 rounded-xl border border-rose-200 bg-rose-50 p-3 font-mono text-xs text-rose-700">
        Algoritm JSON xato: {error}
      </div>
    );
  }

  switch (spec.type) {
    case "stack":
    case "queue":
    case "list":
      return <SeqView spec={spec as SeqSpec & { delay?: number; code?: string }} title={spec.title} resetKey={source} />;
    case "tree":
      return <TreeView spec={spec as TreeSpec & { delay?: number; code?: string }} title={spec.title} resetKey={source} />;
    case "graph":
      return <GraphView spec={spec as GraphSpec & { delay?: number; code?: string }} title={spec.title} resetKey={source} />;
    case "sequence":
      return <SequenceView spec={spec as SequenceSpec & { delay?: number; code?: string }} title={spec.title} resetKey={source} />;
    case "uml":
      return <UmlView spec={spec as UmlSpec & { delay?: number; code?: string }} title={spec.title} resetKey={source} />;
    case "grid":
      return <GridView spec={spec as GridSpec & { delay?: number; code?: string }} title={spec.title} resetKey={source} />;
    default:
      return <ArrayView spec={spec as ArraySpec & { delay?: number; code?: string }} title={spec.title} resetKey={source} />;
  }
}
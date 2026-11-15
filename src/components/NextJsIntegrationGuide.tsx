import React, { useState } from 'react';
import AlgoVisualizerSource from './AlgoVisualizer?raw';
import { Copy, Check, Terminal, FileCode, CheckCircle2, Sparkles, Layers } from 'lucide-react';

export function NextJsIntegrationGuide() {
  const [activeFile, setActiveFile] = useState<'markdownRenderer' | 'mathGraph' | 'jsxGraph' | 'css'>('markdownRenderer');
  const [copied, setCopied] = useState<string | null>(null);

  const copyCode = (key: string, code: string) => {
    navigator.clipboard?.writeText(code);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const codeMarkdownRenderer = `"use client";

import React, { useCallback, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import ReactMarkdown, {
  type Components,
  type ExtraProps,
} from "react-markdown";

import remarkMath from "remark-math";
import remarkGfm from "remark-gfm";
import remarkUnwrapImages from "remark-unwrap-images";

import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";

import { visit } from "unist-util-visit";

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";

import { Check, Copy, ImageIcon } from "lucide-react";

import "katex/dist/katex.min.css";

// ⭐️ Mafs va JSXGraph'ni Next.js SSR xatolaridan himoyalash uchun dynamic import qilamiz
const MathGraph = dynamic(() => import("./MathGraph"), {
  ssr: false,
  loading: () => (
    <div className="my-6 h-80 animate-pulse rounded-2xl bg-slate-100 flex items-center justify-center text-xs text-slate-400">
      Grafik yuklanmoqda...
    </div>
  ),
});

const JSXGraphPlot = dynamic(() => import("./JSXGraphPlot"), {
  ssr: false,
  loading: () => (
    <div className="my-6 h-96 animate-pulse rounded-2xl bg-slate-100 flex items-center justify-center text-xs text-slate-400">
      Geometrik doska yuklanmoqda...
    </div>
  ),
});

import { VideoPlayer } from "@/components/VideoPlayer";
import { QuestionLoader } from "./question/QuestionLoader";
import { EmbeddableViews } from "./problems/EmbeddableViews";

interface MarkdownRendererProps {
  content: string | null | undefined;
  className?: string;
  inline?: boolean;
  fontSize?: number;
}

const EMBEDDABLE_BLOCK_TAGS = new Set(["question", "problem"]);

function rehypeUnwrapEmbeddable() {
  return (tree: any) => {
    visit(tree, "element", (node: any, index: number | undefined, parent: any) => {
      if (node.tagName !== "p" || !parent || index == null) return;

      const hasEmbeddable = (node.children ?? []).some((child: any) =>
        EMBEDDABLE_BLOCK_TAGS.has(child?.tagName)
      );

      if (hasEmbeddable) {
        parent.children.splice(index, 1, ...node.children);
        return index;
      }
    });
  };
}

function isHlsUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.pathname.toLowerCase().endsWith(".m3u8");
  } catch {
    return url.toLowerCase().split("?")[0].split("#")[0].endsWith(".m3u8");
  }
}

function getYoutubeVideoId(url: string): string | null {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.toLowerCase();

    if (
      hostname === "youtube.com" ||
      hostname === "www.youtube.com" ||
      hostname === "m.youtube.com"
    ) {
      if (parsed.pathname === "/watch") {
        return parsed.searchParams.get("v");
      }
      if (parsed.pathname.startsWith("/embed/")) {
        return parsed.pathname.replace("/embed/", "").split("/")[0] || null;
      }
      if (parsed.pathname.startsWith("/shorts/")) {
        return parsed.pathname.replace("/shorts/", "").split("/")[0] || null;
      }
    }

    if (hostname === "youtu.be" || hostname === "www.youtu.be") {
      return parsed.pathname.replace(/^\\/+/, "").split("/")[0] || null;
    }

    return null;
  } catch {
    return null;
  }
}

function MarkdownImage({ src, alt }: { src?: string; alt?: string }) {
  const [error, setError] = useState(false);

  if (!src || error) {
    return (
      <div className="my-5 flex min-h-32 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-slate-400">
        <ImageIcon className="mb-2 size-7" />
        <span className="text-sm">{alt || "Rasm yuklanmadi"}</span>
      </div>
    );
  }

  return (
    <figure className="my-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <img
        src={src}
        alt={alt || "Rasm"}
        className="block h-auto w-full object-contain"
        loading="lazy"
        onError={() => setError(true)}
      />
      {alt && alt !== "image" && (
        <figcaption className="border-t border-slate-100 px-4 py-2.5 text-center text-xs text-slate-500">
          {alt}
        </figcaption>
      )}
    </figure>
  );
}

function YoutubePlayer({ videoId }: { videoId: string }) {
  return (
    <div className="my-6 overflow-hidden rounded-2xl border border-slate-200 bg-black shadow-sm">
      <div className="aspect-video w-full">
        <iframe
          src={\`https://www.youtube.com/embed/\${videoId}\`}
          title="YouTube video"
          className="block h-full w-full border-0"
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    </div>
  );
}

function MarkdownLink({
  href,
  children,
  ...props
}: React.ComponentPropsWithoutRef<"a"> & ExtraProps) {
  if (!href) return <a {...props} href={href}>{children}</a>;

  const youtubeVideoId = getYoutubeVideoId(href);
  if (youtubeVideoId) {
    return (
      <div className="my-6">
        <YoutubePlayer videoId={youtubeVideoId} />
      </div>
    );
  }

  if (isHlsUrl(href)) {
    return (
      <div className="my-6">
        <VideoPlayer src={href} />
      </div>
    );
  }

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
      {children}
    </a>
  );
}

/* ============================================================
   CODE BLOCK: Mafs va JSXGraph integratsiyasi shu yerda!
============================================================ */

function CodeBlock({
  className,
  children,
  ...props
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  const [copied, setCopied] = useState(false);
  const match = /language-(\\w+)/.exec(className || "");

  const handleCopy = useCallback(() => {
    const text = String(children).replace(/\\n$/, "");
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {});
  }, [children]);

  /* Inline code */
  if (!match) {
    return (
      <code
        className="rounded-md bg-slate-100 px-1.5 py-0.5 font-mono text-[13px] text-slate-800 ring-1 ring-slate-200"
        {...props}
      >
        {children}
      </code>
    );
  }

  const language = match[1]?.toLowerCase();
  const rawContent = String(children).replace(/\\n$/, "");

  // ⭐️ 1. Mafs Grafik Bloki: \`\`\`mafs
  if (language === "mafs") {
    return <MathGraph source={rawContent} />;
  }

  // ⭐️ 2. JSXGraph Geometriya Bloki: \`\`\`jsxgraph
  if (language === "jsxgraph") {
    return <JSXGraphPlot source={rawContent} />;
  }

  // Standart dasturlash kodlari (Python, JS, HTML, va hk)
  return (
    <div className="group relative my-5 overflow-hidden rounded-xl border border-slate-200 bg-[#fafafa] shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 bg-white px-4 py-2">
        <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
          {language}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
        >
          {copied ? (
            <>
              <Check className="size-3.5 text-emerald-600" />
              <span className="text-emerald-600">Nusxalandi</span>
            </>
          ) : (
            <>
              <Copy className="size-3.5" />
              Nusxa olish
            </>
          )}
        </button>
      </div>

      <div className="overflow-x-auto">
        <SyntaxHighlighter
          style={oneLight}
          language={language}
          PreTag="div"
          customStyle={{
            margin: 0,
            padding: "1.25rem",
            background: "#fafafa",
            fontSize: "13px",
            lineHeight: "1.6",
          }}
        >
          {rawContent}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}

const BLOCK_LEVEL_TAGS = new Set(["img", "a", ...EMBEDDABLE_BLOCK_TAGS]);

function MarkdownParagraph({ children, node }: { children?: React.ReactNode; node?: any }) {
  const containsBlockMedia = (node?.children ?? []).some((child: any) =>
    BLOCK_LEVEL_TAGS.has(child?.tagName)
  );

  if (containsBlockMedia) {
    return <>{children}</>;
  }

  return <p className="mb-4 leading-7">{children}</p>;
}

export function MarkdownRenderer({
  content,
  className = "",
  inline = false,
  fontSize,
}: MarkdownRendererProps) {
  const params = useParams();
  const slug = (params?.slug as string) || "";

  const parsedContent = useMemo(() => {
    if (!content) return "";
    return content
      .replace(/\\{\\{savol:([a-zA-Z0-9_-]+)\\}\\}/g, '<question id="$1"></question>')
      .replace(/\\{\\{problem:([a-zA-Z0-9_-]+)\\}\\}/g, '<problem slug="$1"></problem>');
  }, [content]);

  const blockComponents: Components = useMemo(
    () => ({
      p: MarkdownParagraph,
      img: ({ src, alt }) => <MarkdownImage src={typeof src === "string" ? src : undefined} alt={alt} />,
      a: MarkdownLink,
      code: CodeBlock,
      question: ({ id }: any) => (id ? <QuestionLoader slug={slug} questionId={id} /> : null),
      problem: ({ slug: pSlug }: any) => (pSlug ? <EmbeddableViews slug={pSlug} /> : null),
    }),
    [slug]
  );

  if (!content) return null;

  return (
    <article
      style={fontSize ? { fontSize: \`\${fontSize}px\` } : undefined}
      className={\`
        prose prose-slate max-w-none
        \${fontSize ? "" : "text-[15px] sm:text-[15.5px]"} leading-7 text-slate-700
        [&_h1]:mb-4 [&_h1]:mt-8 [&_h1]:text-xl [&_h1]:font-bold [&_h1]:tracking-tight [&_h1]:text-slate-900 sm:[&_h1]:text-2xl
        [&_h2]:mb-3 [&_h2]:mt-7 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:tracking-tight [&_h2]:text-slate-900 sm:[&_h2]:text-xl
        [&_h3]:mb-3 [&_h3]:mt-6 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-slate-900 sm:[&_h3]:text-lg
        [&_p]:mb-4 [&_p]:leading-7
        [&_.katex]:text-[1em] sm:[&_.katex]:text-[1.05em]
        [&_.katex-display]:my-4 [&_.katex-display]:overflow-x-auto [&_.katex-display]:rounded-lg [&_.katex-display]:bg-slate-50 [&_.katex-display]:p-3 sm:[&_.katex-display]:p-4
        \${className}
      \`}
    >
      <ReactMarkdown
        remarkPlugins={[remarkUnwrapImages, remarkMath, remarkGfm]}
        rehypePlugins={[rehypeUnwrapEmbeddable, rehypeKatex, rehypeRaw]}
        components={blockComponents}
      >
        {parsedContent}
      </ReactMarkdown>
    </article>
  );
}`;

  const codeMathGraph = `"use client";

import React, { useMemo, useState } from "react";
import { Mafs, Coordinates, Plot, Point, Vector, Line, Circle, Polygon, Text } from "mafs";
import { compile } from "mathjs";
import { Copy, Check } from "lucide-react";
import "mafs/core.css";
import "mafs/font.css";

type V2 = [number, number];

type Item =
  | { type: "function"; expr: string; color?: string; domain?: V2 }
  | { type: "point"; x: number; y: number; color?: string; label?: string }
  | { type: "vector"; from?: V2; to: V2; color?: string }
  | { type: "segment"; a: V2; b: V2; color?: string }
  | { type: "circle"; center: V2; r: number; color?: string }
  | { type: "polygon"; points: V2[]; color?: string }
  | { type: "text"; x: number; y: number; text: string; color?: string };

interface Spec {
  x?: V2;
  y?: V2;
  height?: number;
  grid?: boolean;
  items: Item[];
}

const DEFAULT_COLOR = "#2563eb";

function makeFn(expr: string): (x: number) => number {
  if (expr.length > 200) return () => NaN;
  try {
    const code = compile(expr);
    return (x) => {
      try {
        const v = code.evaluate({ x });
        return typeof v === "number" && Number.isFinite(v) ? v : NaN;
      } catch {
        return NaN;
      }
    };
  } catch {
    return () => NaN;
  }
}

function FunctionPlot({ item }: { item: Extract<Item, { type: "function" }> }) {
  const fn = useMemo(() => makeFn(item.expr), [item.expr]);
  return <Plot.OfX y={fn} color={item.color ?? DEFAULT_COLOR} domain={item.domain} />;
}

export default function MathGraph({ source }: { source: string }) {
  const [copied, setCopied] = useState(false);

  const parsed = useMemo(() => {
    try {
      const cleanSource = source.trim();
      const spec = JSON.parse(cleanSource) as Spec;
      if (!Array.isArray(spec.items)) throw new Error("items massiv bo'lishi kerak");
      return { spec, error: null as string | null };
    } catch (e) {
      return { spec: null, error: e instanceof Error ? e.message : "JSON xato" };
    }
  }, [source]);

  const handleCopy = () => {
    navigator.clipboard?.writeText(source);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!parsed.spec) {
    return (
      <div className="my-5 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 font-mono">
        Grafik JSON xato: {parsed.error}
      </div>
    );
  }

  const { x = [-5, 5], y = [-5, 5], height = 320, grid = true, items } = parsed.spec;

  return (
    <div className="my-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm relative group">
      <div className="absolute top-2 right-2 z-10 opacity-70 group-hover:opacity-100 transition-opacity">
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/90 hover:bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200 shadow-sm transition-colors"
          title="Mafs JSON kodini nusxalash"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
          <span>{copied ? "Nusxalandi" : "Nusxalash"}</span>
        </button>
      </div>

      <Mafs viewBox={{ x, y }} height={height} preserveAspectRatio={false}>
        {grid && <Coordinates.Cartesian />}
        {items.map((item, i) => {
          const color = "color" in item ? item.color ?? DEFAULT_COLOR : DEFAULT_COLOR;
          switch (item.type) {
            case "function":
              return <FunctionPlot key={i} item={item} />;
            case "point":
              return (
                <g key={i}>
                  <Point x={item.x} y={item.y} color={color} />
                  {item.label && (
                    <Text x={item.x} y={item.y} attach="ne" attachDistance={12}>
                      {item.label}
                    </Text>
                  )}
                </g>
              );
            case "vector":
              return <Vector key={i} tail={item.from ?? [0, 0]} tip={item.to} color={color} />;
            case "segment":
              return <Line.Segment key={i} point1={item.a} point2={item.b} color={color} />;
            case "circle":
              return <Circle key={i} center={item.center} radius={item.r} color={color} />;
            case "polygon":
              return <Polygon key={i} points={item.points} color={color} />;
            case "text":
              return <Text key={i} x={item.x} y={item.y}>{item.text}</Text>;
            default:
              return null;
          }
        })}
      </Mafs>
    </div>
  );
}`;

  const codeJSXGraph = `"use client";

import React, { useEffect, useRef, useState, useId } from "react";
import JXG from "jsxgraph";
import { Copy, Check, RotateCcw } from "lucide-react";

interface JSXGraphPlotProps {
  source: string;
  height?: number;
}

export default function JSXGraphPlot({ source, height = 340 }: JSXGraphPlotProps) {
  const containerId = useId().replace(/:/g, "_");
  const boardRef = useRef<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const initBoard = () => {
    if (typeof window === "undefined") return;

    if (boardRef.current) {
      try {
        JXG.JSXGraph.freeBoard(boardRef.current);
      } catch (e) {}
      boardRef.current = null;
    }

    try {
      const board = JXG.JSXGraph.initBoard(containerId, {
        boundingbox: [-5, 5, 5, -5],
        axis: true,
        showNavigation: true,
        showCopyright: false,
        zoom: { factorX: 1.25, factorY: 1.25, wheel: true, needOption: false },
        pan: { enabled: true, needTwoFingers: false },
      });

      boardRef.current = board;

      const runFn = new Function("board", "JXG", source);
      runFn(board, JXG);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "JSXGraph xatolik");
    }
  };

  useEffect(() => {
    initBoard();
    return () => {
      if (boardRef.current) {
        try {
          JXG.JSXGraph.freeBoard(boardRef.current);
        } catch (e) {}
      }
    };
  }, [source]);

  const handleCopy = () => {
    navigator.clipboard?.writeText(source);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm relative group">
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-100 bg-slate-50/80 text-xs">
        <span className="font-semibold text-slate-700">JSXGraph Interaktiv Geometriya</span>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={initBoard}
            className="flex items-center gap-1 px-2 py-0.5 rounded bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 text-[11px]"
          >
            <RotateCcw className="w-3 h-3" />
            Qayta yuklash
          </button>
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1 px-2 py-0.5 rounded bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 text-[11px]"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-slate-500" />}
            <span>{copied ? "Nusxalandi" : "Kodni nusxalash"}</span>
          </button>
        </div>
      </div>

      {error ? (
        <div className="p-4 text-xs text-rose-600 bg-rose-50 font-mono">
          JSXGraph Skript Xatoligi: {error}
        </div>
      ) : (
        <div id={containerId} className="jxgbox w-full bg-white" style={{ height: \`\${height}px\` }} />
      )}
    </div>
  );
}`;

  const codeCss = `/* Next.js loyihangizdagi app/globals.css yoki app/layout.tsx faylida quyidagi CSS kutubxonalarni import qiling: */

/* 1. KaTeX formulalar stili */
import "katex/dist/katex.min.css";

/* 2. Mafs koordinata va shriftlar stili */
import "mafs/core.css";
import "mafs/font.css";

/* 3. JSXGraph geometriya stili (yoki app/layout.tsx head ichida CDN orqali) */
<link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/npm/jsxgraph/distrib/jsxgraph.css"
  crossOrigin="anonymous"
/>
`;

  return (
    <div className="flex flex-col gap-5">
      <section className="rounded-2xl border border-cyan-500/20 bg-slate-900 p-4 shadow-xl">
        <div className="mb-3 flex items-center justify-between gap-2">
          <div><h2 className="text-sm font-bold text-white">Algoritm vizualizatsiya</h2><p className="text-xs text-slate-400">Production uchun AlgoVisualizer.tsx va MarkdownRenderer ulanishi.</p></div>
          <button type="button" onClick={() => copyCode('algoVisualizer', AlgoVisualizerSource)} className="flex items-center gap-1 rounded-lg border border-slate-700 px-2.5 py-1.5 text-xs text-indigo-200">{copied === 'algoVisualizer' ? <Check className="size-3.5"/> : <Copy className="size-3.5"/>}{copied === 'algoVisualizer' ? 'Nusxalandi' : 'Faylni nusxalash'}</button>
        </div>
        <pre className="max-h-64 overflow-auto rounded-xl bg-slate-950 p-3 font-mono text-[10px] leading-4 text-cyan-100"><code>{AlgoVisualizerSource}</code></pre>
        <div className="mt-3 flex items-center justify-between gap-2"><span className="text-xs text-slate-300">MarkdownRenderer uchun kod</span><button type="button" onClick={() => copyCode('algoSnippet', 'const AlgoVisualizer = dynamic(() => import("./math/AlgoVisualizer"), { ssr: false });\\n// CodeBlock ichida:\\nif (language === "algo") return <AlgoVisualizer source={rawContent} />;\\n// InlineCode ichida: language === "algo" bo\'lsa null qaytaring.')} className="text-xs text-indigo-300">{copied === 'algoSnippet' ? 'Nusxalandi' : 'Nusxalash'}</button></div>
        <pre className="mt-2 overflow-x-auto rounded-xl bg-slate-950 p-3 font-mono text-[11px] leading-5 text-indigo-200">{'const AlgoVisualizer = dynamic(() => import("./math/AlgoVisualizer"), { ssr: false });\\n// CodeBlock ichida:\\nif (language === "algo") return <AlgoVisualizer source={rawContent} />;\\n// InlineCode ichida: language === "algo" bo‘lsa null qaytaring.'}</pre>
      </section>
      {/* Overview Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
              Next.js Loyihangizdagi <code className="text-indigo-300 font-mono text-xs">MarkdownRenderer.tsx</code> Integratsiyasi
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Siz yuborgan faylga <strong>Mafs (```mafs)</strong>, <strong>JSXGraph (```jsxgraph)</strong> va <strong>Algoritm (```algo)</strong> ni
              qo‘shish uchun <code>CodeBlock</code> qismiga atigi <strong>6 qator</strong> kod qo‘shiladi.
              SSR (Server-Side Rendering) xatolarini oldini olish uchun komponentlar <code>next/dynamic</code> bilan yuklanadi.
            </p>
          </div>
        </div>

        {/* Step-by-Step Quick Commands */}
        <div className="mt-4 pt-4 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
            <span className="font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-indigo-600/30 text-indigo-400 flex items-center justify-center text-[10px] font-bold">1</span>
              Kutubxonalarni o‘rnatish:
            </span>
            <div className="flex items-center justify-between bg-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-800 font-mono text-[11px] text-indigo-300">
              <code>npm i mafs mathjs jsxgraph</code>
              <button
                type="button"
                onClick={() => copyCode('npm', 'npm i mafs mathjs jsxgraph')}
                className="text-slate-400 hover:text-white ml-2"
              >
                {copied === 'npm' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
            <span className="font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-teal-600/30 text-teal-400 flex items-center justify-center text-[10px] font-bold">2</span>
              Komponentlarni joylash:
            </span>
            <p className="text-[11px] text-slate-400">
              <code>MathGraph.tsx</code> va <code>JSXGraphPlot.tsx</code> fayllarini <code>MarkdownRenderer.tsx</code> yoniga qo‘ying.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
            <span className="font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-purple-600/30 text-purple-400 flex items-center justify-center text-[10px] font-bold">3</span>
              Django bilan ishlash:
            </span>
            <p className="text-[11px] text-slate-400">
              Ushbu studiyada yaratilgan matnni nusxalab, Django admin orqali bazaga tashlang.
            </p>
          </div>
        </div>
      </div>

      {/* Code Tabs & Viewer */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        {/* Tab Headers */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950 border-b border-slate-800 overflow-x-auto text-xs">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setActiveFile('markdownRenderer')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition-colors whitespace-nowrap ${
                activeFile === 'markdownRenderer'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>MarkdownRenderer.tsx (Tayyor kod)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveFile('mathGraph')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition-colors whitespace-nowrap ${
                activeFile === 'mathGraph'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>MathGraph.tsx</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveFile('jsxGraph')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition-colors whitespace-nowrap ${
                activeFile === 'jsxGraph'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>JSXGraphPlot.tsx</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveFile('css')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition-colors whitespace-nowrap ${
                activeFile === 'css'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>CSS & Shriftlar</span>
            </button>
          </div>

          {/* Copy Button for current active file */}
          <button
            type="button"
            onClick={() => {
              const codeMap = {
                markdownRenderer: codeMarkdownRenderer,
                mathGraph: codeMathGraph,
                jsxGraph: codeJSXGraph,
                css: codeCss,
              };
              copyCode(activeFile, codeMap[activeFile]);
            }}
            className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-indigo-500/30 text-xs font-semibold shrink-0 ml-3"
          >
            {copied === activeFile ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied === activeFile ? 'Nusxalandi!' : 'Faylni to‘liq nusxalash'}</span>
          </button>
        </div>

        {/* Code Content View */}
        <pre className="p-4 bg-slate-950 font-mono text-xs text-indigo-200 overflow-x-auto max-h-[580px] leading-relaxed selection:bg-indigo-500 selection:text-white">
          {activeFile === 'markdownRenderer' && codeMarkdownRenderer}
          {activeFile === 'mathGraph' && codeMathGraph}
          {activeFile === 'jsxGraph' && codeJSXGraph}
          {activeFile === 'css' && codeCss}
        </pre>
      </div>
    </div>
  );
}

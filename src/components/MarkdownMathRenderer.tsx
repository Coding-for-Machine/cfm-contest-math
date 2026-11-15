import React, { useState } from 'react';
import MathGraph from './MathGraph';
import JSXGraphPlot from './JSXGraphPlot';
import { MathView } from './MathView';
import { AlgoVisualizer } from './algoStudio';
import { Copy, Check } from 'lucide-react';

interface MarkdownMathRendererProps {
  content: string;
}

interface BlockItem {
  type: 'mafs' | 'jsxgraph' | 'algo' | 'code' | 'math-block' | 'markdown';
  content: string;
  lang?: string;
}

export const MarkdownMathRenderer: React.FC<MarkdownMathRendererProps> = ({ content }) => {
  // Parse blocks: code fences ```lang ... ``` and display math $$ ... $$
  const blocks = React.useMemo(() => {
    const list: BlockItem[] = [];
    const lines = content.split('\n');
    let currentMarkdown: string[] = [];
    let inFence = false;
    let fenceLang = '';
    let fenceContent: string[] = [];

    let inMathBlock = false;
    let mathBlockContent: string[] = [];

    const flushMarkdown = () => {
      if (currentMarkdown.length > 0) {
        list.push({ type: 'markdown', content: currentMarkdown.join('\n') });
        currentMarkdown = [];
      }
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Check fenced code block start/end
      if (line.trim().startsWith('```')) {
        if (!inFence) {
          flushMarkdown();
          inFence = true;
          fenceLang = line.trim().slice(3).trim().toLowerCase();
          fenceContent = [];
        } else {
          inFence = false;
          if (fenceLang === 'mafs') {
            list.push({ type: 'mafs', content: fenceContent.join('\n') });
          } else if (fenceLang === 'jsxgraph') {
            list.push({ type: 'jsxgraph', content: fenceContent.join('\n') });
          } else if (fenceLang === 'algo') {
            list.push({ type: 'algo', content: fenceContent.join('\n') });
          } else {
            list.push({ type: 'code', content: fenceContent.join('\n'), lang: fenceLang });
          }
          fenceContent = [];
          fenceLang = '';
        }
        continue;
      }

      if (inFence) {
        fenceContent.push(line);
        continue;
      }

      // Check display math $$ ... $$
      if (line.trim() === '$$') {
        if (!inMathBlock) {
          flushMarkdown();
          inMathBlock = true;
          mathBlockContent = [];
        } else {
          inMathBlock = false;
          list.push({ type: 'math-block', content: mathBlockContent.join('\n') });
          mathBlockContent = [];
        }
        continue;
      }

      if (inMathBlock) {
        mathBlockContent.push(line);
        continue;
      }

      // Single-line display math $$...$$
      const singleMathMatch = line.trim().match(/^\$\$(.+?)\$\$$/);
      if (singleMathMatch) {
        flushMarkdown();
        list.push({ type: 'math-block', content: singleMathMatch[1] });
        continue;
      }

      currentMarkdown.push(line);
    }

    if (inFence && fenceContent.length > 0) {
      list.push({ type: 'code', content: fenceContent.join('\n'), lang: fenceLang });
    }
    if (inMathBlock && mathBlockContent.length > 0) {
      list.push({ type: 'math-block', content: mathBlockContent.join('\n') });
    }
    flushMarkdown();

    return list;
  }, [content]);

  // Render inline math and text inside a markdown paragraph
  const renderInlineMath = (text: string) => {
    // Split by inline math: $...$
    const parts = text.split(/(\$[^\$]+?\$)/g);
    return parts.map((part, idx) => {
      if (part.startsWith('$') && part.endsWith('$') && part.length > 2) {
        const mathExpr = part.slice(1, -1);
        return <MathView key={idx} math={mathExpr} className="mx-1" />;
      }
      return <span key={idx}>{part}</span>;
    });
  };

  // Render a markdown text chunk
  const renderMarkdownBlock = (md: string, blockIdx: number) => {
    const lines = md.split('\n');
    return (
      <div key={blockIdx} className="space-y-2.5 my-2 text-slate-200 leading-relaxed text-sm">
        {lines.map((line, lineIdx) => {
          const trimmed = line.trim();
          if (!trimmed) return <div key={lineIdx} className="h-2" />;

          // Headings
          if (trimmed.startsWith('### ')) {
            return (
              <h4 key={lineIdx} className="text-base font-bold text-indigo-300 mt-4 mb-2">
                {renderInlineMath(trimmed.slice(4))}
              </h4>
            );
          }
          if (trimmed.startsWith('## ')) {
            return (
              <h3 key={lineIdx} className="text-lg font-bold text-white mt-5 mb-2 pb-1 border-b border-slate-800">
                {renderInlineMath(trimmed.slice(3))}
              </h3>
            );
          }
          if (trimmed.startsWith('# ')) {
            return (
              <h2 key={lineIdx} className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-200 to-teal-200 mt-6 mb-3 pb-2 border-b border-slate-800">
                {renderInlineMath(trimmed.slice(2))}
              </h2>
            );
          }

          // Bullet list
          if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            return (
              <div key={lineIdx} className="flex items-start gap-2 ml-2 my-1">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2 flex-shrink-0" />
                <div className="flex-1 text-slate-300 text-sm leading-relaxed">
                  {renderInlineMath(trimmed.slice(2))}
                </div>
              </div>
            );
          }

          // Blockquote
          if (trimmed.startsWith('> ')) {
            return (
              <div key={lineIdx} className="border-l-2 border-indigo-500 pl-3 py-1 my-2 bg-indigo-950/20 rounded-r-xl text-slate-300 italic text-xs">
                {renderInlineMath(trimmed.slice(2))}
              </div>
            );
          }

          // Regular paragraph
          return (
            <p key={lineIdx} className="text-slate-300 leading-relaxed">
              {renderInlineMath(line)}
            </p>
          );
        })}
      </div>
    );
  };

  return (
    <div className="w-full">
      {blocks.map((block, idx) => {
        if (block.type === 'mafs') {
          return <MathGraph key={idx} source={block.content} />;
        }
        if (block.type === 'jsxgraph') {
          return <JSXGraphPlot key={idx} source={block.content} />;
        }
        if (block.type === 'algo') {
          return <AlgoVisualizer key={idx} source={block.content} />;
        }
        if (block.type === 'math-block') {
          return (
            <div key={idx} className="my-3 p-3.5 bg-slate-900/90 rounded-2xl border border-slate-800 text-center shadow-lg overflow-x-auto">
              <MathView math={block.content} block />
            </div>
          );
        }
        if (block.type === 'code') {
          return <GenericCodeBlock key={idx} code={block.content} lang={block.lang} />;
        }
        return renderMarkdownBlock(block.content, idx);
      })}
    </div>
  );
};

function GenericCodeBlock({ code, lang }: { code: string; lang?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard?.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-4 rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden shadow-lg">
      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900/80 border-b border-slate-800 text-xs">
        <span className="font-mono text-slate-400 text-[11px] uppercase">{lang || 'kod'}</span>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Nusxalandi' : 'Nusxalash'}</span>
        </button>
      </div>
      <pre className="p-3 font-mono text-xs text-slate-200 overflow-x-auto">
        <code>{code}</code>
      </pre>
    </div>
  );
}

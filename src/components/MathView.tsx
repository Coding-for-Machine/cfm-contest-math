import React, { useMemo } from 'react';
import katex from 'katex';

interface MathViewProps {
  math: string;
  block?: boolean;
  className?: string;
  errorColor?: string;
}

export const MathView: React.FC<MathViewProps> = ({
  math,
  block = false,
  className = '',
  errorColor = '#ef4444',
}) => {
  const html = useMemo(() => {
    if (!math || !math.trim()) return '';
    try {
      return katex.renderToString(math, {
        displayMode: block,
        throwOnError: false,
        errorColor,
        strict: false,
      });
    } catch (err) {
      console.warn('KaTeX render error:', err);
      return `<span style="color: ${errorColor}">KaTeX xatolik: ${math}</span>`;
    }
  }, [math, block, errorColor]);

  if (!html) return null;

  return (
    <span
      className={`inline-block select-text ${className} ${block ? 'w-full text-center overflow-x-auto my-1 py-1' : ''}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

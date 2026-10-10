import React, { useState } from 'react';
import { Copy, Check, Code2 } from 'lucide-react';

interface MarkdownMessageProps {
  content: string;
}

export const MarkdownMessage: React.FC<MarkdownMessageProps> = ({ content }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = (code: string, index: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const renderFormatted = (text: string) => {
    const parts = text.split(/(```[\s\S]*?```)/g);

    return parts.map((part, idx) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const lines = part.slice(3, -3).trim().split('\n');
        let language = 'text';
        let codeContent = part.slice(3, -3).trim();

        if (lines[0] && !lines[0].includes(' ') && lines[0].length < 15) {
          language = lines[0].trim();
          codeContent = lines.slice(1).join('\n');
        }

        return (
          <div
            key={idx}
            className="my-3 border border-white/10 bg-[#070709] rounded-xs overflow-hidden font-mono text-xs"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-1.5 bg-[#0C0C0E] border-b border-white/5 text-[#777777]">
              <span className="uppercase text-[10px] tracking-wider text-[#999999]">
                {language}
              </span>
              <button
                onClick={() => handleCopy(codeContent, idx)}
                className="flex items-center gap-1 text-[10px] text-[#777777] hover:text-white transition-colors cursor-pointer px-1.5 py-0.5 rounded-xs hover:bg-white/5"
              >
                {copiedIndex === idx ? (
                  <>
                    <Check size={11} className="text-white" />
                    <span className="text-white">COPIED</span>
                  </>
                ) : (
                  <>
                    <Copy size={11} />
                    <span>COPY</span>
                  </>
                )}
              </button>
            </div>

            {/* Code */}
            <div className="p-3.5 overflow-x-auto text-[#E0E0E0] leading-relaxed">
              <pre className="whitespace-pre font-mono">{codeContent}</pre>
            </div>
          </div>
        );
      }

      const paragraphs = part.split('\n\n');

      return (
        <div key={idx} className="space-y-3">
          {paragraphs.map((p, pIdx) => {
            if (!p.trim()) return null;

            if (p.startsWith('# ') || p.startsWith('## ')) {
              const headingText = p.replace(/^#+\s*/, '');
              return (
                <h3
                  key={pIdx}
                  className="text-base font-bold text-white tracking-tight mt-4 mb-2 font-mono uppercase border-l border-white/40 pl-2.5"
                >
                  {headingText}
                </h3>
              );
            }

            if (p.includes('\n- ') || p.startsWith('- ') || p.includes('\n* ') || p.startsWith('* ')) {
              const items = p.split(/\n[-*]\s+/).filter(Boolean);
              return (
                <ul key={pIdx} className="space-y-1.5 pl-4 list-disc marker:text-white/40 my-2">
                  {items.map((item, itemIdx) => (
                    <li key={itemIdx} className="text-sm text-[#CCCCCC] leading-relaxed">
                      {formatInline(item)}
                    </li>
                  ))}
                </ul>
              );
            }

            if (/^\d+\.\s/.test(p)) {
              const lines = p.split('\n');
              return (
                <ol key={pIdx} className="space-y-1.5 pl-4 list-decimal marker:text-white/40 my-2">
                  {lines.map((line, lIdx) => (
                    <li key={lIdx} className="text-sm text-[#CCCCCC] leading-relaxed">
                      {formatInline(line.replace(/^\d+\.\s*/, ''))}
                    </li>
                  ))}
                </ol>
              );
            }

            return (
              <p key={pIdx} className="text-sm text-[#CCCCCC] leading-relaxed font-sans">
                {formatInline(p)}
              </p>
            );
          })}
        </div>
      );
    });
  };

  const formatInline = (text: string) => {
    const inlineParts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);

    return inlineParts.map((part, i) => {
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code
            key={i}
            className="px-1.5 py-0.5 bg-white/5 text-white border border-white/10 rounded-xs font-mono text-xs mx-0.5"
          >
            {part.slice(1, -1)}
          </code>
        );
      }
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-semibold text-white">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  return <div className="space-y-2">{renderFormatted(content)}</div>;
};

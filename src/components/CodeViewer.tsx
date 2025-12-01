import React from 'react';
import { Copy, Download, Check } from 'lucide-react';

interface CodeViewerProps {
  code: string;
  language?: string;
  quality?: number;
  attempts?: number;
  executionTime?: number;
}

export const CodeViewer: React.FC<CodeViewerProps> = ({
  code,
  language = 'pine',
  quality = 0,
  attempts = 0,
  executionTime = 0,
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([code], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'generated_script.pine';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-3">
      {/* Metrics */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-slate-800/30 p-2.5 rounded border border-slate-700/30">
          <p className="text-xs text-slate-400">Quality</p>
          <p className="text-lg font-semibold text-green-400 mt-0.5">{quality}%</p>
        </div>
        <div className="bg-slate-800/30 p-2.5 rounded border border-slate-700/30">
          <p className="text-xs text-slate-400">Attempts</p>
          <p className="text-lg font-semibold text-blue-400 mt-0.5">{attempts}</p>
        </div>
        <div className="bg-slate-800/30 p-2.5 rounded border border-slate-700/30">
          <p className="text-xs text-slate-400">Time</p>
          <p className="text-lg font-semibold text-slate-300 mt-0.5">{executionTime.toFixed(1)}s</p>
        </div>
      </div>

      {/* Code Block */}
      <div className="bg-slate-900/40 rounded border border-slate-700/30 overflow-hidden">
        <div className="flex items-center justify-between px-3 py-2 bg-slate-800/50 border-b border-slate-700/30">
          <span className="text-xs font-medium text-slate-400">{language.toUpperCase()}</span>
          <div className="flex gap-1">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 px-2 py-1 text-xs text-slate-400 hover:text-slate-300 hover:bg-slate-700/50 rounded transition-colors"
              title="Copy"
            >
              {copied ? (
                <>
                  <Check size={12} />
                  Copied
                </>
              ) : (
                <>
                  <Copy size={12} />
                  Copy
                </>
              )}
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1 px-2 py-1 text-xs text-slate-400 hover:text-slate-300 hover:bg-slate-700/50 rounded transition-colors"
              title="Download"
            >
              <Download size={12} />
              Download
            </button>
          </div>
        </div>
        <pre className="p-3 overflow-x-auto max-h-96 text-xs text-slate-200 font-mono leading-relaxed bg-slate-900/20">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
};

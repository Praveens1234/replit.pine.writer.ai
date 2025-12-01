import React from 'react';
import { Copy, Check } from 'lucide-react';
import type { Message } from '../types';

interface ChatMessageProps {
  message: Message;
  onCopy?: (text: string) => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, onCopy }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    onCopy?.(text);
  };

  const isAssistant = message.role === 'assistant';
  const isCodeBlock = message.content.includes('```');

  return (
    <div className={`flex ${isAssistant ? 'justify-start' : 'justify-end'} mb-4`}>
      <div className={`flex gap-3 max-w-2xl ${isAssistant ? 'flex-row' : 'flex-row-reverse'}`}>
        <div className={`w-7 h-7 rounded flex items-center justify-center text-xs flex-shrink-0 mt-0.5 ${isAssistant ? 'bg-slate-700' : 'bg-blue-600'}`}>
          {isAssistant ? '🤖' : '👤'}
        </div>

        <div>
          {isCodeBlock ? (
            <div className="space-y-2">
              {message.content.split('\n').map((line, idx) => {
                if (line.includes('```')) return null;
                return (
                  <div key={idx} className="bg-slate-900/60 rounded overflow-hidden">
                    <code className="text-xs bg-slate-900/60 text-slate-200 p-3 block overflow-x-auto leading-relaxed">
                      {line}
                    </code>
                  </div>
                );
              })}
              <button
                onClick={() => handleCopy(message.content.replace(/```/g, '').trim())}
                className="text-xs text-slate-400 hover:text-slate-300 transition flex items-center gap-1"
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
            </div>
          ) : (
            <div
              className={`rounded px-3 py-2 text-sm leading-relaxed ${
                isAssistant
                  ? 'bg-slate-800/40 text-slate-100'
                  : 'bg-blue-600/30 text-blue-100'
              }`}
            >
              {message.content}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

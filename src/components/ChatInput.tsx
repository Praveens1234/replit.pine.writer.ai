import React from 'react';
import { Send, Loader } from 'lucide-react';

interface ChatInputProps {
  onSubmit: (prompt: string) => void;
  disabled?: boolean;
  loading?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSubmit, disabled, loading }) => {
  const [input, setInput] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !disabled && !loading) {
      onSubmit(input);
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex gap-2 items-end">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Message Pine Forge... (Ctrl+Enter to send)"
          disabled={disabled || loading}
          className="flex-1 px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/30 focus:ring-1 focus:ring-blue-500/10 transition resize-none max-h-32 text-sm"
          rows={3}
        />
        <button
          type="submit"
          disabled={disabled || loading || !input.trim()}
          className="flex items-center justify-center p-2.5 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-slate-700 disabled:cursor-not-allowed transition duration-150 flex-shrink-0"
          title="Send (Ctrl+Enter)"
        >
          {loading ? (
            <Loader size={18} className="animate-spin" />
          ) : (
            <Send size={18} />
          )}
        </button>
      </div>
    </form>
  );
};

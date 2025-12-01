import React from 'react';
import { Settings as SettingsIcon } from 'lucide-react';

interface HeaderProps {
  onSettingsClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onSettingsClick }) => {
  return (
    <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-2xl">🌲</div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Pine Forge</h1>
              <p className="text-xs text-slate-500">AI-Powered Pine Script Generator</p>
            </div>
          </div>
          <button
            onClick={onSettingsClick}
            className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors duration-200"
            title="Settings"
          >
            <SettingsIcon size={20} />
          </button>
        </div>
      </div>
    </header>
  );
};

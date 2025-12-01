import React from 'react';
import { Menu, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

interface TopBarProps {
  currentPage: string;
  onToggleSidebar: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ currentPage, onToggleSidebar }) => {
  return (
    <header className="sticky top-0 z-20 bg-slate-900/95 backdrop-blur border-b border-slate-800 px-4 md:px-8 py-4">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-4">
          <button
            onClick={onToggleSidebar}
            className="hidden md:inline-flex p-2 hover:bg-slate-800 rounded-lg transition"
          >
            <Menu size={20} className="text-slate-300" />
          </button>
          <h1 className="text-2xl font-bold text-white">{currentPage}</h1>
        </div>

        <Link
          to="/settings"
          className="p-2 hover:bg-slate-800 rounded-lg transition text-slate-300"
        >
          <Settings size={20} />
        </Link>
      </div>
    </header>
  );
};

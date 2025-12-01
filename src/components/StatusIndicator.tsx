import React from 'react';
import { Activity } from 'lucide-react';

interface StatusIndicatorProps {
  isActive: boolean;
  onClick?: () => void;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({ isActive, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-3 py-2 rounded bg-slate-800/50 hover:bg-slate-800 transition border border-slate-700/30"
      title="View agents and system activities"
    >
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-500 animate-pulse' : 'bg-slate-600'}`} />
        <span className="text-xs font-medium text-slate-300">
          {isActive ? 'Active' : 'Ready'}
        </span>
      </div>
      <Activity size={14} className="text-slate-400" />
    </button>
  );
};

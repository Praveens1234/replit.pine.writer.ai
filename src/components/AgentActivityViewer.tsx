import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bot } from 'lucide-react';

interface AgentActivity {
  agent: string;
  status: 'running' | 'completed' | 'error';
  message: string;
  timestamp: string;
}

interface AgentActivityViewerProps {
  isOpen: boolean;
  onClose: () => void;
  activities: AgentActivity[];
  isGenerating: boolean;
}

const agentEmojis: { [key: string]: string } = {
  Alpha: '🔍',
  Beta: '⚙️',
  Gamma: '🧬',
  Delta: '🔧',
  Epsilon: '✅',
};

const agentDescriptions: { [key: string]: string } = {
  Alpha: 'Feasibility Analysis - Checking if strategy is viable',
  Beta: 'Plan Optimization - Creating optimal execution strategy',
  Gamma: 'Code Generation - Writing Pine Script v5 code',
  Delta: 'Error Fixing - Correcting syntax and logic issues',
  Epsilon: 'Quality Audit - Verifying code quality and requirements',
};

export const AgentActivityViewer: React.FC<AgentActivityViewerProps> = ({
  isOpen,
  onClose,
  activities,
  isGenerating,
}) => {
  const [filteredActivities, setFilteredActivities] = useState<AgentActivity[]>([]);

  useEffect(() => {
    setFilteredActivities(activities.slice().reverse());
  }, [activities]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-96 bg-slate-900/95 border-l border-slate-800/50 z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/30">
              <div className="flex items-center gap-2">
                <Bot size={18} className="text-blue-400" />
                <h3 className="text-sm font-semibold text-slate-100">System Activity</h3>
                {isGenerating && (
                  <div className="ml-2 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                )}
              </div>
              <button
                onClick={onClose}
                className="p-1 hover:bg-slate-800/50 rounded transition text-slate-400 hover:text-slate-300"
              >
                <X size={16} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto space-y-2 p-3">
              {filteredActivities.length === 0 ? (
                <div className="flex items-center justify-center h-full text-slate-500 text-xs">
                  {isGenerating ? 'Waiting for activities...' : 'No activities yet'}
                </div>
              ) : (
                filteredActivities.map((activity, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`px-3 py-2 rounded text-xs border ${
                      activity.status === 'running'
                        ? 'bg-blue-500/10 border-blue-500/30 text-blue-200'
                        : activity.status === 'completed'
                          ? 'bg-green-500/10 border-green-500/30 text-green-200'
                          : 'bg-red-500/10 border-red-500/30 text-red-200'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-sm flex-shrink-0">
                        {agentEmojis[activity.agent] || '🤖'}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium">
                          {activity.agent} - {agentDescriptions[activity.agent] || 'Agent'}
                        </div>
                        <div className="text-slate-400 mt-0.5 break-words">{activity.message}</div>
                        <div className="text-slate-500 text-xs mt-1 opacity-75">{activity.timestamp}</div>
                      </div>
                      <div className="flex-shrink-0 mt-1">
                        {activity.status === 'running' && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                        )}
                        {activity.status === 'completed' && (
                          <div className="w-2 h-2 bg-green-500 rounded-full" />
                        )}
                        {activity.status === 'error' && (
                          <div className="w-2 h-2 bg-red-500 rounded-full" />
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-3 border-t border-slate-800/30 text-xs text-slate-400">
              {isGenerating ? (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  Generation in progress...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-slate-600 rounded-full" />
                  Idle
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

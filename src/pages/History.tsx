import React from 'react';
import { motion } from 'framer-motion';
import { MainLayout } from '../layouts/MainLayout';
import { Trash2, Copy } from 'lucide-react';

export const History: React.FC = () => {
  const recentScripts = [
    { id: 1, prompt: 'RSI divergence scalper', date: 'Today', quality: 92 },
    { id: 2, prompt: 'Moving average crossover', date: 'Yesterday', quality: 88 },
    { id: 3, prompt: 'Bollinger Bands breakout', date: '2 days ago', quality: 95 },
  ];

  return (
    <MainLayout currentPage="History">
      <div className="max-w-3xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-2xl font-bold text-white mb-1">Generation History</h2>
          <p className="text-slate-400">Your saved Pine Scripts</p>
        </motion.div>

        {recentScripts.length > 0 ? (
          <div className="space-y-3">
            {recentScripts.map((script, idx) => (
              <motion.div
                key={script.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-slate-800/30 rounded-lg border border-slate-700/30 p-4 hover:border-green-500/30 transition group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-white">{script.prompt}</h3>
                    <p className="text-xs text-slate-400 mt-1">{script.date}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-400">{script.quality}%</p>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                      <button className="p-2 hover:bg-slate-700/50 rounded transition text-slate-400 hover:text-white">
                        <Copy size={16} />
                      </button>
                      <button className="p-2 hover:bg-red-500/10 rounded transition text-slate-400 hover:text-red-400">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-slate-400">
            <p>No scripts yet. Start generating!</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MainLayout } from '../layouts/MainLayout';
import { Eye, EyeOff, Save, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Settings as SettingsType } from '../types';

export const Settings: React.FC = () => {
  const navigate = useNavigate();
  const [showApiKey, setShowApiKey] = useState(false);
  const [settings, setSettings] = useState<SettingsType>(() => {
    const saved = localStorage.getItem('pineForgeSettings');
    return saved
      ? JSON.parse(saved)
      : {
          apiKey: '',
          temperature: 0.6,
          maxAttempts: 5,
        };
  });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    localStorage.setItem('pineForgeSettings', JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <MainLayout currentPage="Settings">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Back Button */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition text-slate-300 hover:text-white border border-slate-700/30"
            title="Back to Dashboard"
          >
            <ArrowLeft size={18} />
            <span className="text-sm font-medium">Back</span>
          </button>
          <h1 className="text-2xl font-semibold text-white">Settings</h1>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* API Key Section */}
          <div className="bg-slate-800/30 rounded-lg border border-slate-700/30 p-8">
            <h2 className="text-xl font-semibold text-white mb-6">API Configuration</h2>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3">NVIDIA API Key</label>
              <div className="relative">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={settings.apiKey}
                  onChange={(e) => setSettings({ ...settings, apiKey: e.target.value })}
                  placeholder="nvapi-..."
                  className="w-full px-4 py-2.5 bg-slate-700/40 border border-slate-600/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/20 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300"
                >
                  {showApiKey ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <p className="text-xs text-slate-400 mt-2">
                Get from{' '}
                <a href="https://build.nvidia.com" target="_blank" rel="noopener noreferrer" className="text-green-400 hover:underline">
                  NVIDIA Build
                </a>
              </p>
            </div>
          </div>

          {/* Parameters Section */}
          <div className="bg-slate-800/30 rounded-lg border border-slate-700/30 p-8">
            <h2 className="text-xl font-semibold text-white mb-6">Model Parameters</h2>

            <div className="space-y-8">
              {/* Temperature */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-slate-300">Temperature</label>
                  <span className="text-sm font-semibold text-green-400">{settings.temperature.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.1"
                  value={settings.temperature}
                  onChange={(e) => setSettings({ ...settings, temperature: parseFloat(e.target.value) })}
                  className="w-full h-2 bg-slate-700/40 rounded-lg appearance-none cursor-pointer accent-green-500"
                />
                <p className="text-xs text-slate-400 mt-2">Deterministic ← → Creative</p>
              </div>

              {/* Max Attempts */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">Max Correction Attempts</label>
                <input
                  type="number"
                  min="1"
                  max="15"
                  value={settings.maxAttempts}
                  onChange={(e) => setSettings({ ...settings, maxAttempts: parseInt(e.target.value) })}
                  className="w-full px-4 py-2.5 bg-slate-700/40 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/20 transition"
                />
                <p className="text-xs text-slate-400 mt-2">More attempts = better quality</p>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition duration-200"
          >
            <Save size={18} />
            Save Settings
          </button>

          {/* Success Message */}
          {saved && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-green-200 text-sm text-center"
            >
              ✅ Saved successfully!
            </motion.div>
          )}
        </motion.div>
      </div>
    </MainLayout>
  );
};

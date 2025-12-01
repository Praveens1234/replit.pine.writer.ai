import React from 'react';
import { X, Eye, EyeOff } from 'lucide-react';
import type { Settings } from '../types';

interface SettingsPanelProps {
  settings: Settings;
  onSettingsChange: (settings: Settings) => void;
  onClose: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  settings,
  onSettingsChange,
  onClose,
}) => {
  const [showApiKey, setShowApiKey] = React.useState(false);

  const handleChange = (key: keyof Settings, value: string | number) => {
    onSettingsChange({
      ...settings,
      [key]: value,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">Settings</h2>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* API Key */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              NVIDIA API Key
            </label>
            <div className="relative">
              <input
                type={showApiKey ? 'text' : 'password'}
                value={settings.apiKey}
                onChange={(e) => handleChange('apiKey', e.target.value)}
                placeholder="nvapi-..."
                className="input-field pr-10"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showApiKey ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Get your key from the <a href="https://build.nvidia.com" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline">NVIDIA Build Platform</a>
            </p>
          </div>

          {/* Temperature */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Temperature: {settings.temperature.toFixed(1)}
            </label>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.1"
              value={settings.temperature}
              onChange={(e) => handleChange('temperature', parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
            />
            <p className="text-xs text-slate-500 mt-1">
              Lower values = more deterministic, Higher values = more creative
            </p>
          </div>

          {/* Max Attempts */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Max Correction Attempts
            </label>
            <input
              type="number"
              min="1"
              max="15"
              value={settings.maxAttempts}
              onChange={(e) => handleChange('maxAttempts', parseInt(e.target.value))}
              className="input-field"
            />
            <p className="text-xs text-slate-500 mt-1">
              Maximum number of self-correction attempts
            </p>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-200 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 btn-secondary"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

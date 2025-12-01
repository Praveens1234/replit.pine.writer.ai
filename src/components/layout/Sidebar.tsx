import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, History, BarChart3, Settings, Menu, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const navItems = [
  { label: 'Chat', href: '/generator', icon: MessageSquare },
  { label: 'History', href: '/history', icon: History },
  { label: 'Analytics', href: '/analytics', icon: BarChart3 },
  { label: 'Settings', href: '/settings', icon: Settings },
];

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  const location = useLocation();

  return (
    <>
      <button
        onClick={onToggle}
        className="md:hidden fixed top-4 left-4 z-50 p-2 hover:bg-slate-800 rounded-lg transition"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {isOpen && (
        <motion.div
          onClick={onToggle}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 md:hidden bg-black/30 z-30"
        />
      )}

      <motion.aside
        initial={false}
        animate={{ x: isOpen ? 0 : -280 }}
        transition={{ duration: 0.3 }}
        className="fixed left-0 top-0 h-screen w-72 bg-slate-900 z-40 flex flex-col border-r border-slate-800/50"
      >
        {/* Logo */}
        <Link to="/" className="p-6 border-b border-slate-800/30 hover:bg-slate-800/30 transition">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🌲</span>
            <div>
              <h1 className="font-bold text-white text-lg">Pine Forge</h1>
              <p className="text-xs text-slate-400">AI Generator</p>
            </div>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            return (
              <Link key={item.href} to={item.href}>
                <motion.div
                  whileHover={{ x: 2 }}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition duration-200 ${
                    isActive
                      ? 'bg-green-600/20 text-green-400 border border-green-600/30'
                      : 'text-slate-400 hover:bg-slate-800/50'
                  }`}
                >
                  <Icon size={18} />
                  <span className="font-medium text-sm">{item.label}</span>
                </motion.div>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800/30 bg-slate-800/20">
          <p className="text-xs text-slate-500">Pine Forge v4.0</p>
        </div>
      </motion.aside>
    </>
  );
};

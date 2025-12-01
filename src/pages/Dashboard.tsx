import React from 'react';
import { motion } from 'framer-motion';
import { MainLayout } from '../layouts/MainLayout';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export const Dashboard: React.FC = () => {
  return (
    <MainLayout currentPage="Dashboard">
      <div className="space-y-12">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Generate Pine Script with AI
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl">
            Describe your trading strategy and let AI create Pine Script v5 code instantly. No coding experience needed.
          </p>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {[
            { num: '0', label: 'Scripts Generated' },
            { num: '0%', label: 'Success Rate' },
            { num: '0', label: 'Total Generations' },
          ].map((stat, idx) => (
            <div key={idx} className="bg-slate-800/40 rounded-lg p-6 border border-slate-700/30">
              <p className="text-3xl font-bold text-white mb-1">{stat.num}</p>
              <p className="text-sm text-slate-400">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Link
            to="/generator"
            className="inline-flex items-center gap-3 px-8 py-4 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition duration-200"
          >
            Start Generating
            <ArrowRight size={20} />
          </Link>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12"
        >
          {[
            { icon: '✨', title: 'Smart Generation', desc: 'AI understands your strategy and generates optimized code' },
            { icon: '🔍', title: 'Auto-Correction', desc: 'Code is automatically validated and improved' },
            { icon: '📚', title: 'History', desc: 'Save and reuse your favorite Pine Scripts' },
            { icon: '📊', title: 'Analytics', desc: 'Track your generation performance and trends' },
          ].map((feature, idx) => (
            <div key={idx} className="bg-slate-800/40 rounded-lg p-6 border border-slate-700/30">
              <div className="text-3xl mb-3">{feature.icon}</div>
              <h3 className="font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-sm text-slate-400">{feature.desc}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </MainLayout>
  );
};

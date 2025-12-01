import React from 'react';
import { motion } from 'framer-motion';
import { MainLayout } from '../layouts/MainLayout';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const Analytics: React.FC = () => {
  const data = [
    { day: 'Mon', scripts: 4, success: 3 },
    { day: 'Tue', scripts: 6, success: 5 },
    { day: 'Wed', scripts: 5, success: 4 },
    { day: 'Thu', scripts: 8, success: 7 },
    { day: 'Fri', scripts: 9, success: 8 },
    { day: 'Sat', scripts: 3, success: 3 },
    { day: 'Sun', scripts: 5, success: 4 },
  ];

  return (
    <MainLayout currentPage="Analytics">
      <div className="max-w-4xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-2xl font-bold text-white mb-1">Analytics</h2>
          <p className="text-slate-400">Your Pine Script generation performance</p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {[
            { label: 'Total Generated', value: '45' },
            { label: 'Success Rate', value: '89%' },
            { label: 'Avg Quality', value: '91' },
            { label: 'This Week', value: '40' },
          ].map((stat, idx) => (
            <div key={idx} className="bg-slate-800/30 rounded-lg border border-slate-700/30 p-4">
              <p className="text-xs text-slate-400 mb-2">{stat.label}</p>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
            </div>
          ))}
        </motion.div>

        {/* Charts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          <div className="bg-slate-800/30 rounded-lg border border-slate-700/30 p-6">
            <h3 className="font-medium text-white mb-6 text-sm">Weekly Activity</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="day" stroke="#94a3b8" style={{ fontSize: '12px' }} />
                <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '6px' }}
                  labelStyle={{ color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="scripts" fill="#22c55e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-slate-800/30 rounded-lg border border-slate-700/30 p-6">
            <h3 className="font-medium text-white mb-6 text-sm">Success Trend</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="day" stroke="#94a3b8" style={{ fontSize: '12px' }} />
                <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '6px' }}
                  labelStyle={{ color: '#fff', fontSize: '12px' }}
                />
                <Line type="monotone" dataKey="success" stroke="#22c55e" strokeWidth={2} dot={{ fill: '#22c55e', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </MainLayout>
  );
};

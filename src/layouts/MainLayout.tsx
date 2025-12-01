import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sidebar } from '../components/layout/Sidebar';
import { TopBar } from '../components/layout/TopBar';

interface MainLayoutProps {
  children: React.ReactNode;
  currentPage: string;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children, currentPage }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      <div className={`transition-all duration-300 ${sidebarOpen ? 'md:ml-72' : 'md:ml-72'}`}>
        <TopBar currentPage={currentPage} onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        <motion.main
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="p-6 md:p-8 pb-20"
        >
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </motion.main>
      </div>
    </div>
  );
};

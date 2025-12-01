import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatMessage } from '../components/ChatMessage';
import { ChatInput } from '../components/ChatInput';
import { CodeViewer } from '../components/CodeViewer';
import { FeedbackForm } from '../components/FeedbackForm';
import { StatusIndicator } from '../components/StatusIndicator';
import { AgentActivityViewer } from '../components/AgentActivityViewer';
import { apiClient } from '../api';
import type { Message, GenerationResult } from '../types';
import { AlertCircle, CheckCircle2, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Generator: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastGenerationResult, setLastGenerationResult] = useState<GenerationResult | null>(null);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showActivityViewer, setShowActivityViewer] = useState(false);
  const [activities, setActivities] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const activityPollingRef = useRef<NodeJS.Timeout | null>(null);

  const apiKey = localStorage.getItem('pineForgeSettings')
    ? JSON.parse(localStorage.getItem('pineForgeSettings')!).apiKey
    : '';

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Poll for activities when generating
  useEffect(() => {
    if (loading) {
      const pollActivities = async () => {
        try {
          const response = await apiClient.getActivities();
          setActivities(response.activities);
        } catch (err) {
          console.error('Failed to fetch activities:', err);
        }
      };

      // Poll every 500ms during generation
      activityPollingRef.current = setInterval(pollActivities, 500);
      return () => {
        if (activityPollingRef.current) {
          clearInterval(activityPollingRef.current);
        }
      };
    }
  }, [loading]);

  const handleSubmitPrompt = async (prompt: string) => {
    setError(null);
    setFeedbackSubmitted(false);
    setLastGenerationResult(null);

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: prompt,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);

    if (!apiKey) {
      const errorMsg = 'Please add your API key in Settings to start.';
      setError(errorMsg);
      const assistantMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: errorMsg,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      return;
    }

    const loadingMessage: Message = {
      id: `loading-${Date.now()}`,
      role: 'assistant',
      content: 'Generating your Pine Script...',
      timestamp: new Date(),
      loading: true,
    };

    setMessages((prev) => [...prev, loadingMessage]);
    setLoading(true);
    setActivities([]);

    try {
      const settings = JSON.parse(localStorage.getItem('pineForgeSettings') || '{}');
      const result = await apiClient.generateScript(
        prompt,
        apiKey,
        settings.temperature || 0.6,
        settings.maxAttempts || 5
      );

      // Update activities from result
      if (result.activities) {
        setActivities(result.activities);
      }

      setMessages((prev) => prev.filter((m) => m.id !== loadingMessage.id));

      if (result.success && result.code) {
        const successMsg: Message = {
          id: `success-${Date.now()}`,
          role: 'assistant',
          content: `✅ Generated successfully!\n\n\`\`\`pine\n${result.code}\n\`\`\``,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, successMsg]);
        setLastGenerationResult(result);
      } else {
        throw new Error(result.error || 'Failed to generate');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      setMessages((prev) => prev.filter((m) => m.id !== loadingMessage.id));

      const errorMsg: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: `❌ ${errorMessage}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitFeedback = async (works: boolean, reason?: string) => {
    try {
      if (lastGenerationResult?.code) {
        await apiClient.submitFeedback(lastGenerationResult.code, works, reason);
        setFeedbackSubmitted(true);

        const feedbackMsg: Message = {
          id: `feedback-${Date.now()}`,
          role: 'assistant',
          content: works ? '✨ Thanks for the feedback!' : '💡 Thank you for reporting this.',
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, feedbackMsg]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit feedback');
    }
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-slate-950">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-slate-800/30 bg-slate-900/30">
        <div className="flex items-center gap-2">
          <span className="text-xl">🌲</span>
          <h1 className="text-sm font-semibold text-slate-100">Pine Forge</h1>
        </div>
        <div className="flex items-center gap-2">
          <StatusIndicator isActive={loading} onClick={() => setShowActivityViewer(!showActivityViewer)} />
          <Link to="/settings" className="p-1.5 hover:bg-slate-800/50 rounded transition text-slate-400 hover:text-slate-300">
            <Settings size={18} />
          </Link>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-6 py-6">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
              <div>
                <div className="text-5xl mb-3">🌲</div>
                <h2 className="text-2xl font-medium text-slate-100 mb-2">Welcome to Pine Forge</h2>
                <p className="text-slate-400 text-sm max-w-md mx-auto">
                  Describe your trading strategy and let AI generate Pine Script v5 code
                </p>
              </div>

              {!apiKey && (
                <div className="bg-blue-600/10 border border-blue-600/20 rounded px-5 py-3 max-w-md">
                  <p className="text-blue-200 text-xs mb-3">Add your API key to get started</p>
                  <Link
                    to="/settings"
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-xs font-medium"
                  >
                    <Settings size={14} />
                    Settings
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
              <div ref={messagesEndRef} />
            </>
          )}

          {/* Code Viewer */}
          <AnimatePresence>
            {lastGenerationResult && lastGenerationResult.code && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="my-6"
              >
                <CodeViewer
                  code={lastGenerationResult.code}
                  quality={lastGenerationResult.quality_score || 0}
                  attempts={lastGenerationResult.attempts || 0}
                  executionTime={lastGenerationResult.execution_time || 0}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Feedback Form */}
          <AnimatePresence>
            {lastGenerationResult && !feedbackSubmitted && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <FeedbackForm onSubmitFeedback={handleSubmitFeedback} loading={loading} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Success Message */}
          <AnimatePresence>
            {feedbackSubmitted && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg flex gap-3"
              >
                <CheckCircle2 className="text-green-500 flex-shrink-0" size={20} />
                <p className="text-sm text-green-200">Thanks for your feedback!</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error Alert */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="my-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex gap-3"
              >
                <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
                <p className="text-sm text-red-200">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Input Area - Sticky Bottom */}
      <div className="bg-slate-900/50 border-t border-slate-800/30 px-6 py-4">
        <div className="max-w-3xl mx-auto">
          <ChatInput onSubmit={handleSubmitPrompt} disabled={!apiKey} loading={loading} />
          {!apiKey && (
            <p className="text-xs text-slate-500 mt-2 text-center">
              Add API key in Settings
            </p>
          )}
        </div>
      </div>

      {/* Agent Activity Viewer */}
      <AgentActivityViewer
        isOpen={showActivityViewer}
        onClose={() => setShowActivityViewer(false)}
        activities={activities}
        isGenerating={loading}
      />
    </div>
  );
};

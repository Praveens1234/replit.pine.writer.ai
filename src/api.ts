import axios from 'axios';
import type { GenerationResult } from './types';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 300000, // 5 minutes for generation
});

export const apiClient = {
  generateScript: async (
    prompt: string,
    apiKey: string,
    temperature: number,
    maxAttempts: number
  ): Promise<GenerationResult> => {
    const response = await api.post('/generate', {
      prompt,
      api_key: apiKey,
      temperature,
      max_attempts: maxAttempts,
    });
    return response.data;
  },

  submitFeedback: async (
    code: string,
    works: boolean,
    reason?: string
  ): Promise<{ success: boolean; message: string }> => {
    const response = await api.post('/feedback', {
      code,
      works,
      reason,
    });
    return response.data;
  },

  getActivities: async (): Promise<{ activities: any[]; isGenerating: boolean }> => {
    const response = await api.get('/activities');
    return response.data;
  },

  getStatus: async (): Promise<{ status: string; isGenerating: boolean }> => {
    const response = await api.get('/status');
    return response.data;
  },

  health: async (): Promise<{ status: string }> => {
    const response = await api.get('/health');
    return response.data;
  },
};

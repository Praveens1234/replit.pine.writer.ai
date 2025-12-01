export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  loading?: boolean;
}

export interface GenerationResult {
  success: boolean;
  code?: string;
  error?: string;
  attempts?: number;
  quality_score?: number;
  execution_time?: number;
  errors_fixed?: string[];
  updates?: string[];
}

export interface Settings {
  apiKey: string;
  temperature: number;
  maxAttempts: number;
}

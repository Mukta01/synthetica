/* ============================================
   SYNTHETICA — API Client
   Typed API layer with offline fallback
   ============================================ */

import type {
  EvaluateRequest,
  EvaluateResponse,
  LeaderboardResponse,
  SubmitScoreRequest,
  RegisterRequest,
  RegisterResponse,
} from './types';

// Backend URL — replace with your Azure Container Apps URL
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${path}`;
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Add auth token if available
  const token = typeof window !== 'undefined' ? localStorage.getItem('synthetica_token') : null;
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new ApiError(response.status, `API Error: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Check if the backend API is available
 */
export async function checkApiHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/health`, { 
      method: 'GET',
      signal: AbortSignal.timeout(3000),
    });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Evaluate a DNA sequence against a puzzle
 */
export async function evaluateSequence(data: EvaluateRequest): Promise<EvaluateResponse> {
  return request<EvaluateResponse>('/evaluate', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Get leaderboard for a specific puzzle
 */
export async function getLeaderboard(puzzleId: string): Promise<LeaderboardResponse> {
  return request<LeaderboardResponse>(`/leaderboard?puzzleId=${encodeURIComponent(puzzleId)}`);
}

/**
 * Get global leaderboard (all puzzles combined)
 */
export async function getGlobalLeaderboard(): Promise<LeaderboardResponse> {
  return request<LeaderboardResponse>('/leaderboard');
}

/**
 * Submit a score to the leaderboard
 */
export async function submitScore(data: SubmitScoreRequest): Promise<{ success: boolean }> {
  return request<{ success: boolean }>('/leaderboard', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Register a username for leaderboard
 */
export async function registerUser(data: RegisterRequest): Promise<RegisterResponse> {
  return request<RegisterResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

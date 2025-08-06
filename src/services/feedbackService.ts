import { v4 as uuidv4 } from 'uuid';

export interface FeedbackData {
  id: string;
  nombre: string;
  temasQA: string[];
  herramientas: string[];
  participacion: string;
  formato: string;
  sugerencias: string;
  fecha: string;
  sessionId: string;
  userAgent: string;
  ip?: string;
  pais?: string;
  otrosTemas?: string;
  otrasHerramientas?: string;
}

export interface FeedbackMetrics {
  totalSubmissions: number;
  topTemasQA: { tema: string; count: number }[];
  topHerramientas: { herramienta: string; count: number }[];
  topParticipacion: { tipo: string; count: number }[];
  topFormatos: { formato: string; count: number }[];
  submissionsByDate: { date: string; count: number }[];
  commonSuggestions: string[];
}

export interface Comment {
  id: number;
  name: string;
  message: string;
  isAnonymous: boolean;
  userAgent?: string;
  ip?: string;
  createdAt: string;
  updatedAt: string;
}

// Backend API configuration
const getApiBaseUrl = () => {
  // Check for Vite environment variable first
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  
  // Fallback based on environment
  if (import.meta.env.MODE === 'production') {
    return 'https://api.aiquaa.com'; // URL del backend en producción
  }
  
  return 'http://localhost:3001';
};

const API_BASE_URL = getApiBaseUrl();

// Debug logging (only in development)
if (import.meta.env.MODE === 'development') {
  console.log('🔧 API Base URL:', API_BASE_URL);
  console.log('🔧 Environment:', import.meta.env.MODE);
}

class FeedbackService {
  private readonly STORAGE_KEY = 'aiquaa_feedback';
  private readonly SESSION_KEY = 'aiquaa_session_id';

  // Submit feedback to backend API
  async submitFeedback(data: Omit<FeedbackData, 'id' | 'fecha' | 'sessionId'>): Promise<FeedbackData> {
    const feedbackData = {
      ...data,
      sessionId: this.getSessionId(),
      userAgent: navigator.userAgent
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(feedbackData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      // Also store in localStorage as backup
      const existingFeedback = this.getStoredFeedback();
      existingFeedback.push({
        ...result,
        id: result.id.toString(),
        fecha: new Date(result.creadoEn).toISOString()
      });
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(existingFeedback));

      return {
        ...result,
        id: result.id.toString(),
        fecha: new Date(result.creadoEn).toISOString()
      };
    } catch (error) {
      console.error('Error submitting feedback to API:', error);
      
      // Fallback to localStorage if API fails
      const fallbackData: FeedbackData = {
        ...feedbackData,
        id: uuidv4(),
        fecha: new Date().toISOString(),
        sessionId: this.getSessionId(),
        userAgent: navigator.userAgent
      };

      const existingFeedback = this.getStoredFeedback();
      existingFeedback.push(fallbackData);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(existingFeedback));

      return fallbackData;
    }
  }

  // Get stored feedback from localStorage (fallback)
  getStoredFeedback(): FeedbackData[] {
    try {
      return JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '[]');
    } catch (error) {
      console.error('Error parsing stored feedback:', error);
      return [];
    }
  }

  // Get feedback from backend API
  async getFeedback(): Promise<FeedbackData[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/feedback`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      return result.map((item: any) => ({
        ...item,
        id: item.id.toString(),
        fecha: new Date(item.creadoEn).toISOString()
      }));
    } catch (error) {
      console.error('Error fetching feedback from API:', error);
      // Fallback to localStorage
      return this.getStoredFeedback();
    }
  }

  // Get metrics from backend API
  async getMetrics(): Promise<FeedbackMetrics> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/feedback/metrics`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching metrics from API:', error);
      // Fallback to local calculation
      return this.calculateMetrics();
    }
  }

  // Get or create session ID
  private getSessionId(): string {
    let sessionId = localStorage.getItem(this.SESSION_KEY);
    if (!sessionId) {
      sessionId = uuidv4();
      localStorage.setItem(this.SESSION_KEY, sessionId);
    }
    return sessionId;
  }

  // Calculate metrics from stored feedback (fallback)
  calculateMetrics(): FeedbackMetrics {
    const feedback = this.getStoredFeedback();
    
    if (feedback.length === 0) {
      return {
        totalSubmissions: 0,
        topTemasQA: [],
        topHerramientas: [],
        topParticipacion: [],
        topFormatos: [],
        submissionsByDate: [],
        commonSuggestions: []
      };
    }

    // Count topics
    const temasCount: Record<string, number> = {};
    feedback.forEach(item => {
      item.temasQA.forEach(tema => {
        temasCount[tema] = (temasCount[tema] || 0) + 1;
      });
    });

    // Count tools
    const herramientasCount: Record<string, number> = {};
    feedback.forEach(item => {
      item.herramientas.forEach(herramienta => {
        herramientasCount[herramienta] = (herramientasCount[herramienta] || 0) + 1;
      });
    });

    // Count participation types
    const participacionCount: Record<string, number> = {};
    feedback.forEach(item => {
      if (item.participacion) {
        participacionCount[item.participacion] = (participacionCount[item.participacion] || 0) + 1;
      }
    });

    // Count formats
    const formatosCount: Record<string, number> = {};
    feedback.forEach(item => {
      if (item.formato) {
        formatosCount[item.formato] = (formatosCount[item.formato] || 0) + 1;
      }
    });

    // Count submissions by date
    const dateCount: Record<string, number> = {};
    feedback.forEach(item => {
      const date = new Date(item.fecha).toLocaleDateString('es-PY');
      dateCount[date] = (dateCount[date] || 0) + 1;
    });

    // Get common suggestions (non-empty)
    const suggestions = feedback
      .map(item => item.sugerencias)
      .filter(suggestion => suggestion.trim().length > 0);

    return {
      totalSubmissions: feedback.length,
      topTemasQA: Object.entries(temasCount)
        .map(([tema, count]) => ({ tema, count }))
        .sort((a, b) => b.count - a.count),
      topHerramientas: Object.entries(herramientasCount)
        .map(([herramienta, count]) => ({ herramienta, count }))
        .sort((a, b) => b.count - a.count),
      topParticipacion: Object.entries(participacionCount)
        .map(([tipo, count]) => ({ tipo, count }))
        .sort((a, b) => b.count - a.count),
      topFormatos: Object.entries(formatosCount)
        .map(([formato, count]) => ({ formato, count }))
        .sort((a, b) => b.count - a.count),
      submissionsByDate: Object.entries(dateCount)
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
      commonSuggestions: suggestions
    };
  }

  // Export data for analysis
  exportData(): string {
    const feedback = this.getStoredFeedback();
    return JSON.stringify(feedback, null, 2);
  }

  // Clear stored data (for testing)
  clearData(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.SESSION_KEY);
  }

  // Get word frequency from suggestions
  getWordFrequency(): Record<string, number> {
    const feedback = this.getStoredFeedback();
    const wordCount: Record<string, number> = {};
    
    feedback.forEach(item => {
      if (item.sugerencias) {
        const words = item.sugerencias
          .toLowerCase()
          .replace(/[^\w\s]/g, '')
          .split(/\s+/)
          .filter(word => word.length > 3); // Filter out short words
        
        words.forEach(word => {
          wordCount[word] = (wordCount[word] || 0) + 1;
        });
      }
    });

    return wordCount;
  }

  // Community comments methods
  async submitComment(data: { name: string; message: string; isAnonymous: boolean }): Promise<Comment> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return {
        ...result,
        createdAt: new Date(result.createdAt).toISOString(),
        updatedAt: new Date(result.updatedAt).toISOString()
      };
    } catch (error) {
      console.error('Error submitting comment to API:', error);
      throw error;
    }
  }

  async getComments(): Promise<Comment[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/comments`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      return result.map((item: any) => ({
        ...item,
        createdAt: new Date(item.createdAt).toISOString(),
        updatedAt: new Date(item.updatedAt).toISOString()
      }));
    } catch (error) {
      console.error('Error fetching comments from API:', error);
      throw error;
    }
  }
}

export const feedbackService = new FeedbackService(); 
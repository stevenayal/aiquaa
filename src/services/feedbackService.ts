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

class FeedbackService {
  private readonly STORAGE_KEY = 'aiquaa_feedback';
  private readonly SESSION_KEY = 'aiquaa_session_id';

  // Simulate API call to Firebase/Google Sheets
  async submitFeedback(data: Omit<FeedbackData, 'id' | 'fecha' | 'sessionId'>): Promise<FeedbackData> {
    const feedbackData: FeedbackData = {
      ...data,
      id: uuidv4(),
      fecha: new Date().toISOString(),
      sessionId: this.getSessionId(),
      userAgent: navigator.userAgent
    };

    // Store in localStorage for now
    // In production, this would be sent to Firebase or Google Sheets
    const existingFeedback = this.getStoredFeedback();
    existingFeedback.push(feedbackData);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(existingFeedback));

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log('Feedback submitted:', feedbackData);
    return feedbackData;
  }

  // Get stored feedback from localStorage
  getStoredFeedback(): FeedbackData[] {
    try {
      return JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '[]');
    } catch (error) {
      console.error('Error parsing stored feedback:', error);
      return [];
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

  // Calculate metrics from stored feedback
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
}

export const feedbackService = new FeedbackService(); 
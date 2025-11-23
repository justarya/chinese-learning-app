import api from './api';

export const studyService = {
  async getProgress() {
    const response = await api.get('/api/study/progress');
    return response.data;
  },

  async getStats() {
    const response = await api.get('/api/study/stats');
    return response.data;
  },

  async logSession(sessionType, score, total, durationSeconds) {
    const response = await api.post('/api/study/session', {
      sessionType,
      score,
      total,
      durationSeconds,
    });
    return response.data;
  },

  async logFlashcardReview(vocabularyId) {
    const response = await api.post('/api/study/flashcard', {
      vocabularyId,
    });
    return response.data;
  },
};

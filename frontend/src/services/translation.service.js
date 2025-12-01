import api from './api';

export const translationService = {
  async generateSentence(mode, difficulty = null) {
    const payload = { mode };
    if (difficulty) {
      payload.difficulty = difficulty;
    }
    const response = await api.post('/api/study/translation/generate-sentence', payload);
    return response.data;
  },

  async validateAnswer(sentenceId, userAnswer) {
    const response = await api.post('/api/study/translation/validate', {
      sentenceId,
      userAnswer,
    });
    return response.data;
  },

  async skipSentence(sentenceId) {
    const response = await api.post('/api/study/translation/skip', {
      sentenceId,
    });
    return response.data;
  },

  async getSentence(sentenceId) {
    const response = await api.get(`/api/study/translation/sentence/${sentenceId}`);
    return response.data;
  },
};

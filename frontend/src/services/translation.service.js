import api from './api';

export const translationService = {
  async generateSentence(mode) {
    const response = await api.post('/api/study/translation/generate-sentence', { mode });
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

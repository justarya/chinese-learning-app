import api from './api';

export const vocabularyService = {
  async getAll(page = 1, limit = 100) {
    const response = await api.get('/api/vocabulary', {
      params: { page, limit },
    });
    return response.data;
  },

  async create(vocabulary) {
    const response = await api.post('/api/vocabulary', vocabulary);
    return response.data;
  },

  async import(notes) {
    const response = await api.post('/api/vocabulary/import', { notes });
    return response.data;
  },

  async delete(id) {
    await api.delete(`/api/vocabulary/${id}`);
  },

  async markAsStudied(id) {
    const response = await api.patch(`/api/vocabulary/${id}/study`);
    return response.data;
  },

  async getStats() {
    const response = await api.get('/api/vocabulary/stats');
    return response.data;
  },
};

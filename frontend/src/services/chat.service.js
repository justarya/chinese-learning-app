import api from './api';

export const chatService = {
  async getSessions() {
    const response = await api.get('/api/chat/sessions');
    return response.data;
  },

  async createSession(title) {
    const response = await api.post('/api/chat/sessions', { title });
    return response.data;
  },

  async getSession(sessionId) {
    const response = await api.get(`/api/chat/sessions/${sessionId}`);
    return response.data;
  },

  async deleteSession(sessionId) {
    await api.delete(`/api/chat/sessions/${sessionId}`);
  },

  async sendMessage(content, sessionId = null) {
    const response = await api.post('/api/chat/message', {
      content,
      sessionId,
    });
    return response.data;
  },

  async getMessages(sessionId) {
    const response = await api.get(`/api/chat/sessions/${sessionId}/messages`);
    return response.data;
  },
};

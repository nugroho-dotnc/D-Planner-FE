import api from '../api';

// ─── Note Service ─────────────────────────────────────────────────

export const noteService = {
  /**
   * List notes with optional filters
   * @param {Object} params - { isPinned?, relatedDate? }
   */
  async getNotes(params = {}) {
    const query = new URLSearchParams(params).toString();
    const { data } = await api.get(`/api/notes${query ? '?' + query : ''}`);
    return data.data;
  },

  async getOneNote(id) {
    const { data } = await api.get(`/api/notes/${id}`);
    return data.data;
  },

  async createNote(payload) {
    const { data } = await api.post('/api/notes', payload);
    return data.data;
  },

  async updateNote(id, payload) {
    const { data } = await api.put(`/api/notes/${id}`, payload);
    return data.data;
  },

  async deleteNote(id) {
    await api.delete(`/api/notes/${id}`);
  },

  async togglePin(id) {
    const { data } = await api.patch(`/api/notes/${id}/pin`);
    return data.data;
  },

  /**
   * Create multiple notes (from AI response)
   * @param {Array} notes
   */
  async createBulkNotes(notes) {
    const results = await Promise.all(
      notes.map((n) => noteService.createNote(n)),
    );
    return results;
  },
};

export default noteService;

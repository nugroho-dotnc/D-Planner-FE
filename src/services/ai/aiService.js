import api from '../api';

// ─── AI Service ────────────────────────────────────────────────────
// Sends natural language prompt to backend → returns structured plan

export const aiService = {
  /**
   * Parse a natural language prompt into structured activities/notes
   * @param {string} prompt - User's free text
   * @returns {{ type, message, warnings, activities, notes }}
   */
  async parsePrompt(prompt) {
    const { data } = await api.post('/api/ai/parse', { prompt });
    return data.data;
  },
};

export default aiService;

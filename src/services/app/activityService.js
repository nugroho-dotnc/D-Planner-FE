import api from '../api';

// ─── Activity Service (type = "schedule") ─────────────────────────
// Activities have required date + start/end time

export const activityService = {
  /**
   * List activities with optional filters
   * @param {Object} params - { date: "YYYY-MM-DD", status, priority }
   */
  async getActivities(params = {}) {
    const query = new URLSearchParams({ type: 'schedule', ...params }).toString();
    const { data } = await api.get(`/api/activities?${query}`);
    return data.data;
  },

  async getOne(id) {
    const { data } = await api.get(`/api/activities/${id}`);
    return data.data;
  },

  async createActivity(payload) {
    const { data } = await api.post('/api/activities', {
      source: 'manual',   // default, can be overridden by payload
      type: 'schedule',
      ...payload,
    });
    return data.data;
  },

  /**
   * Create multiple activities (from AI response)
   * @param {Array} activities
   */
  async createBulk(activities) {
    const results = await Promise.all(
      activities.map((a) => activityService.createActivity({ source: 'ai', ...a })),
    );
    return results;
  },

  async updateActivity(id, payload) {
    const { data } = await api.put(`/api/activities/${id}`, payload);
    return data.data;
  },

  async deleteActivity(id) {
    await api.delete(`/api/activities/${id}`);
  },

  /**
   * @param {string} id
   * @param {"pending"|"done"|"skipped"} status
   */
  async updateStatus(id, status) {
    const { data } = await api.patch(`/api/activities/${id}/status`, { status });
    return data.data;
  },
};

export default activityService;

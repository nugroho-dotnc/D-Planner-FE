import api from '../api';

// ─── Task Service (type = "task") ─────────────────────────────────
// Tasks are personal items — date, startTime, endTime are ALL optional

export const taskService = {
  /**
   * List tasks with optional filters
   * @param {Object} params - { status, priority, date? }
   */
  async getTasks(params = {}) {
    const query = new URLSearchParams({ type: 'task', ...params }).toString();
    const { data } = await api.get(`/api/activities?${query}`);
    return data.data;
  },

  /**
   * Create a task (date, startTime, endTime are optional)
   * @param {Object} payload - { title, priority, status?, date?, startTime?, endTime?, description? }
   */
  async createTask(payload) {
    const { data } = await api.post('/api/activities', {
      type:   'task',
      source: 'manual',   // backend default; AI callers override to 'ai'
      status: 'pending',
      ...payload,         // date/startTime/endTime optional — backend defaults to today
    });
    return data.data;
  },

  /**
   * Create multiple tasks (from AI response)
   * @param {Array} tasks
   */
  async createBulkTasks(tasks) {
    const results = await Promise.all(
      tasks.map((t) => taskService.createTask({ source: 'ai', ...t })),
    );
    return results;
  },

  async updateTask(id, payload) {
    const { data } = await api.put(`/api/activities/${id}`, payload);
    return data.data;
  },

  async deleteTask(id) {
    await api.delete(`/api/activities/${id}`);
  },

  /**
   * Toggle between "pending" and "done"
   */
  async toggleTaskStatus(id, currentStatus) {
    const newStatus = currentStatus === 'done' ? 'pending' : 'done';
    const { data }  = await api.patch(`/api/activities/${id}/status`, { status: newStatus });
    return data.data;
  },
};

export default taskService;

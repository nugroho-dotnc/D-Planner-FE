import useSWR from 'swr';
import { swrFetcher } from '../services/api';
import taskService from '../services/app/taskService';

// ─── useTasks — SWR hook for tasks (type=task) ───────────────────

/**
 * @param {Object} params - { status?, priority? }
 */
export function useTasks(params = {}) {
  const query = new URLSearchParams({ type: 'task', ...params }).toString();
  const key   = `/api/activities?${query}`;

  const { data, error, isLoading, mutate } = useSWR(key, swrFetcher, {
    revalidateOnFocus:     false,
    revalidateOnReconnect: true,
    dedupingInterval:      5000,
  });

  return {
    tasks: data ?? [],
    isLoading,
    error,
    mutate,
    // Convenience mutations
    async addTask(payload) {
      const created = await taskService.createTask(payload);
      mutate((prev) => [created, ...(prev ?? [])], false);
      mutate();
      return created;
    },
    async removeTask(id) {
      await taskService.deleteTask(id);
      mutate((prev) => (prev ?? []).filter((t) => t.id !== id), false);
    },
    async toggleStatus(id, currentStatus) {
      const updated = await taskService.toggleTaskStatus(id, currentStatus);
      mutate((prev) => (prev ?? []).map((t) => t.id === id ? updated : t), false);
      return updated;
    },
  };
}

export default useTasks;

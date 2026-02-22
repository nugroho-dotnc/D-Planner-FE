import useSWR from 'swr';
import { swrFetcher } from '../services/api';
import activityService from '../services/app/activityService';

// ─── useActivities — SWR hook for schedule activities ────────────

/**
 * @param {Object} params - { date?: "YYYY-MM-DD", status?, priority? }
 */
export function useActivities(params = {}) {
  // Build stable cache key from params
  const query = new URLSearchParams({ type: 'schedule', ...params }).toString();
  const key   = `/api/activities?${query}`;

  const { data, error, isLoading, mutate } = useSWR(key, swrFetcher, {
    revalidateOnFocus:       false,
    revalidateOnReconnect:   true,
    dedupingInterval:        5000,
  });

  return {
    activities: data ?? [],
    isLoading,
    error,
    mutate,
    // Convenience mutations
    async addActivity(payload) {
      const created = await activityService.createActivity(payload);
      mutate((prev) => [...(prev ?? []), created], false);
      mutate(); // revalidate
      return created;
    },
    async removeActivity(id) {
      await activityService.deleteActivity(id);
      mutate((prev) => (prev ?? []).filter((a) => a.id !== id), false);
    },
    async changeStatus(id, status) {
      const updated = await activityService.updateStatus(id, status);
      mutate((prev) => (prev ?? []).map((a) => a.id === id ? updated : a), false);
      return updated;
    },
  };
}

export default useActivities;

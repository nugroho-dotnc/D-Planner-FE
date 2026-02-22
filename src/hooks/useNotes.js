import useSWR from 'swr';
import { swrFetcher } from '../services/api';
import noteService from '../services/app/noteService';

// ─── useNotes — SWR hook for notes ───────────────────────────────

/**
 * @param {Object} params - { isPinned?, relatedDate? }
 */
export function useNotes(params = {}) {
  const query = new URLSearchParams(params).toString();
  const key   = `/api/notes${query ? '?' + query : ''}`;

  const { data, error, isLoading, mutate } = useSWR(key, swrFetcher, {
    revalidateOnFocus:     false,
    revalidateOnReconnect: true,
    dedupingInterval:      5000,
  });

  return {
    notes: data ?? [],
    isLoading,
    error,
    mutate,
    // Convenience mutations
    async addNote(payload) {
      const created = await noteService.createNote(payload);
      mutate((prev) => [created, ...(prev ?? [])], false);
      mutate();
      return created;
    },
    async removeNote(id) {
      await noteService.deleteNote(id);
      mutate((prev) => (prev ?? []).filter((n) => n.id !== id), false);
    },
    async togglePin(id) {
      const updated = await noteService.togglePin(id);
      mutate((prev) => (prev ?? []).map((n) => n.id === id ? updated : n), false);
      mutate();
      return updated;
    },
  };
}

export default useNotes;

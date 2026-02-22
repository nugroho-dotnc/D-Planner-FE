// ─── Auth Store ───────────────────────────────────────────────────
// Simple localStorage-based token management

const ACCESS_KEY  = 'cpa_access_token';
const REFRESH_KEY = 'cpa_refresh_token';
const USER_KEY    = 'cpa_user';

export const authStore = {
  // ── Getters ──
  getAccessToken:  () => localStorage.getItem(ACCESS_KEY),
  getRefreshToken: () => localStorage.getItem(REFRESH_KEY),
  getUser:         () => {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  // ── Setters ──
  setTokens({ accessToken, refreshToken }) {
    localStorage.setItem(ACCESS_KEY,  accessToken);
    localStorage.setItem(REFRESH_KEY, refreshToken);
  },
  setAccessToken(token) {
    localStorage.setItem(ACCESS_KEY, token);
  },
  setUser(user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  // ── Clear all ──
  clear() {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(USER_KEY);
  },

  // ── Hydrate (login result) ──
  save({ user, accessToken, refreshToken }) {
    this.setTokens({ accessToken, refreshToken });
    this.setUser(user);
  },

  // ── Is authenticated ──
  isAuthenticated: () => !!localStorage.getItem(ACCESS_KEY),
};

export default authStore;

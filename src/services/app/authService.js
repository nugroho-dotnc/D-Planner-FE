import api from '../api';
import authStore from '../../store/authStore';

// ─── Auth Service ─────────────────────────────────────────────────

export const authService = {
  async login(email, password) {
    const { data } = await api.post('/api/auth/login', { email, password });
    authStore.save(data.data);
    return data.data;
  },

  async register(name, email, password, confirmPassword) {
    const { data } = await api.post('/api/auth/register', {
      name, email, password, confirmPassword,
    });
    authStore.save(data.data);
    return data.data;
  },

  async refreshToken() {
    const refreshToken = authStore.getRefreshToken();
    const { data } = await api.post('/api/auth/refresh', { refreshToken });
    authStore.setAccessToken(data.data.accessToken);
    return data.data.accessToken;
  },

  logout() {
    authStore.clear();
  },
};

export default authService;

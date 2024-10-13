import { defineStore } from 'pinia';
import { fetchWrapper } from '@/helpers/fetchWrapper';
import type { User } from '@/models/User';
import { useSesionStore } from '@/stores/sesionStore';
import router from '@/router';

const baseUrl = `${import.meta.env.VITE_API_URL}/users`;

export const useAuthStore = defineStore({
  id: 'auth',
  state: () => ({
    auth: {
      loading: false,
      data: null as User | null,
      refreshTokenTimeout: null as ReturnType<typeof setTimeout> | null,
    }
  }),
  actions: {
    async login(username: string, password: string) {
      this.auth.loading = true;
      try {
        const user = await fetchWrapper.post(`${baseUrl}/authenticate`, { username, password });
        this.auth.data = user;
        this.startRefreshTokenTimer();

        const sesionStore = useSesionStore();
        const payload = this.getJwtPayload(user.jwtToken);
        const now = new Date();
        sesionStore.updateSesion(payload, now, this.getRefreshAt(payload.exp), new Date(payload.exp * 1000));

        return user;
      } finally {
        this.auth.loading = false;
      }
    },

    logout() {
      this.stopRefreshTokenTimer();
      this.auth.data = null;
      localStorage.removeItem('vue-3-jwt-refresh-token-users');

      fetchWrapper.post(`${baseUrl}/revoke-token`, {}, { credentials: 'include' })
        .then(() => router.push('/'))
        .catch(error => {
          console.error('Error al revocar el token:', error);
          router.push('/');
        });
    },

    async refreshToken() {
      try {
        const user = await fetchWrapper.post(`${baseUrl}/refresh-token`, {}, { credentials: 'include' });
        this.auth.data = user;
        this.startRefreshTokenTimer(); // Reinicia el temporizador tras recibir el nuevo token
        return user;
      } catch (error) {
        this.logout();
        throw error;
      }
    },

    startRefreshTokenTimer() {
      if (!this.auth.data || !this.auth.data.jwtToken) return;

      const jwtBase64 = this.auth.data.jwtToken.split('.')[1];
      const decodedJwtJson = JSON.parse(atob(jwtBase64.replace(/-/g, '+').replace(/_/g, '/')));
      const expires = new Date(decodedJwtJson.exp * 1000);
      const timeout = expires.getTime() - Date.now() - (60 * 1000); // Refrescar el token 1 minuto antes de que expire

      // Si ya existe un temporizador anterior, lo limpiamos
      if (this.auth.refreshTokenTimeout) {
        clearTimeout(this.auth.refreshTokenTimeout);
      }

      if (timeout > 0) {
        this.auth.refreshTokenTimeout = setTimeout(() => {
          this.refreshToken();
        }, timeout);
      } else {
        this.refreshToken(); // Si ya está expirado o cerca de expirar, refrescamos inmediatamente
      }
    },

    stopRefreshTokenTimer() {
      if (this.auth.refreshTokenTimeout) {
        clearTimeout(this.auth.refreshTokenTimeout);
        this.auth.refreshTokenTimeout = null;
      }
    },

    getJwtPayload(jwtToken: string) {
      if (!jwtToken) return null;
      const jwtBase64 = jwtToken.split('.')[1];
      return JSON.parse(atob(jwtBase64.replace(/-/g, '+').replace(/_/g, '/')));
    },

    getRefreshAt(exp: number): Date {
      const tokenExpTime = exp * 1000; // convert seconds to milliseconds
      return new Date(tokenExpTime - 60 * 1000); // 1 minute before expiration
    }
  }
});

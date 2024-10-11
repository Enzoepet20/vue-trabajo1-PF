import { defineStore } from 'pinia';
import { fetchWrapper } from '@/helpers/fetchWrapper';
import type { User } from '@/models/User';
import router from '@/router';

const baseUrl = `${import.meta.env.VITE_API_URL}/users`;

export const useAuthStore = defineStore({
  id: 'auth',
  state: () => ({
    auth: {
      loading: false,
      data: null as User | null,
      refreshTokenTimeout: 0,
    }
  }),
  actions: {
    // Método para login
    async login(username: string, password: string) {
      this.auth.loading = true;
      try {
        const user = await fetchWrapper.post(`${baseUrl}/authenticate`, { username, password });
        this.auth.data = user;
        this.startRefreshTokenTimer();
        return user;
      } catch (error) {
        this.auth.data = null;
        throw error;
      } finally {
        this.auth.loading = false;
      }
    },

    // Método para logout
    logout() {
      this.stopRefreshTokenTimer();
      this.auth.data = null;
      fetchWrapper.post(`${baseUrl}/revoke-token`, {}, { credentials: 'include' });
      router.push('/');
    },

    // Método para refreshToken
    async refreshToken() {
      try {
        const user = await fetchWrapper.post(`${baseUrl}/refresh-token`, {}, { credentials: 'include' });
        this.auth.data = user;
        this.startRefreshTokenTimer();
        return user;
      } catch (error) {
        this.logout();
        throw error;
      }
    },
    // Método para iniciar el temporizador de refreshToken
    startRefreshTokenTimer() {
      if (!this.auth.data || !this.auth.data.jwtToken) return;
    
      // Obtener la parte codificada en base64 del JWT (el payload)
      const jwtBase64 = this.auth.data.jwtToken.split('.')[1];
      console.log(jwtBase64);
    
      // Decodificar el token base64 (con padding)
      const decodedJwtJson = JSON.parse(atob(jwtBase64.replace(/-/g, '+').replace(/_/g, '/')));
      
      // Seteamos el tiempo de expiración del token
      const expires = new Date(decodedJwtJson.exp * 1000);
      const timeout = expires.getTime() - Date.now() - (60 * 1000);
    
      this.auth.refreshTokenTimeout = setTimeout(this.refreshToken, timeout);
    },
    

    // Método para detener el temporizador de refreshToken
    stopRefreshTokenTimer() {
      clearTimeout(this.auth.refreshTokenTimeout);
      this.auth.refreshTokenTimeout = 0;
    }
  }
});

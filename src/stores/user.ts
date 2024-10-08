import { defineStore } from 'pinia';
import type { User } from '@/models/User';

export const useUserStore = defineStore('user', {
  state: () => ({
    userData: {} as User | null,
  }),
  actions: {
    setUser(user: User) {
      this.userData = user;
    },
    clearUser() {
      this.userData = null;
    }
  },
  getters: {
    getUser: (state) => state.userData,
  },
});

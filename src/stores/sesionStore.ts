import { defineStore } from 'pinia';
import type { SesionState } from '@/models/SesionState';
import type { Sesion } from '@/models/Sesion';

export const useSesionStore = defineStore({
  id: 'sesion',
  state: (): SesionState => ({
    loading: false,
    data: null as Sesion | null,  // Asegurarse de que el estado esté en el tipo Sesion
  }),
  actions: {
updateSesion(payload: string, createdAt: Date, refreshAt: Date, expiresAt: Date) {
  // Usar $patch para asegurar la reactividad
  this.$patch({
    data: {
      payload,
      createdAt,
      refreshAt,
      expiresAt,
    },
  });
},

    setLoading(loading: boolean) {
      this.loading = loading;
    },
  },
});

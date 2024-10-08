import {defineStore} from 'pinia'
import type {User} from '@/models/User'
import { fetchWrapper } from '@/helpers/fetchWrapper'

const baseUrl = `${import.meta.env.VITE_API_URL}/users`;
export const useAuthStore = defineStore({
    id: "auth",
    state: () => ({
      auth: {} as { loading: boolean, data?: User | null,  refreshTokenTimeout: number},
    }),
    actions:{
    logout() {
        fetchWrapper.post(`${baseUrl}/revoke-token`, {}, {credentials: 'include'});
    }
},
})
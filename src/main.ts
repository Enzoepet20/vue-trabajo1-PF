import { createApp } from 'vue';
import App from './App.vue';
import { useAuthStore } from './stores/authStore';
import { fakeBackend } from './helpers/fakebackend';
import router from './router';
import { createPinia } from 'pinia';
import './assets/style.css';

fakeBackend();

startApp();

async function startApp() {
    const app = createApp(App);
    app.use(createPinia());
    app.use(router);

    const authStore = useAuthStore();

    try {
        // Verificar si ya hay un usuario autenticado en el authStore
        if (authStore.auth?.data?.jwtToken) {
            // Comprobación adicional para verificar si el token está expirado o cercano a expirar
            const jwtPayload = authStore.getJwtPayload(authStore.auth.data.jwtToken);
            const now = new Date();

            // Si el token aún es válido, refrescar y configurar temporizador
            if (jwtPayload && jwtPayload.exp * 1000 > now.getTime()) {
                console.log('Token válido, refrescando...');
                await authStore.refreshToken(); // Refrescar token si es necesario
                authStore.startRefreshTokenTimer(); // Asegurarse de iniciar el temporizador después del refresh
            } else {
                console.warn('Token expirado o inválido, redirigiendo al login...');
                authStore.logout(); // Forzar logout si el token está vencido
            }
        }
    } catch (error) {
        console.error('Error al refrescar el token', error);
        authStore.logout(); // En caso de error, hacer logout
        router.push('/'); // Redirigir al login
    }

    app.mount('#app');
}

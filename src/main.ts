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
try {
    const authStore = useAuthStore();
    await authStore.refreshToken();
}
catch (error) {
    console.error('Error al refrescar el token', error);
    router.push('/');
}
app.mount('#app');
}

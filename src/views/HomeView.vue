<template>
  <div class="home-view">
    <h1>Home View</h1>

    <!-- Mostrar la hora actual -->
    <div class="current-time">
      <p>Hora actual: {{ formatDate(currentTime) }}</p>
    </div>

    <!-- Mostrar información del usuario -->
    <div v-if="authStore.auth.data" class="user-info">
      <h2>Usuario: {{ authStore.auth.data.userName }}</h2>
      <p>Nombre completo: {{ authStore.auth.data.firstName }} {{ authStore.auth.data.lastName }}</p>
      <p>Rol: {{ authStore.auth.data.isAdmin ? 'Admin' : 'User' }}</p>
    </div>

    <!-- Mostrar información del token -->
    <div v-if="sesionStore.data" class="token-info">
      <h3>Token Payload: {{ sesionStore.data.payload }}</h3>
      <p>Creado: {{ formatDate(sesionStore.data.createdAt) }}</p>
      <p :class="{ 'updated': refreshUpdated }">Expira: {{ formatDate(expiresAt) }}</p>
      <p :class="{ 'updated': refreshUpdated }">Refresh en: {{ formatDate(refreshAt) }}</p>
    </div>

    <!-- Listado de usuarios si el usuario es admin -->
    <div v-if="authStore.auth.data?.isAdmin" class="user-list">
      <h3>Usuarios</h3>
      <ul>
        <li v-for="user in state.users" :key="user.id">{{ user.userName }} - {{ user.isAdmin ? 'Admin' : 'User' }}</li>
      </ul>
      <button class="create-user-btn" @click="createUser">Crear nuevo usuario</button>
    </div>

    <!-- Botón de logout -->
    <button class="logout-btn" @click="logout">Logout</button>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '../stores/authStore';
import { useSesionStore } from '../stores/sesionStore';
import { reactive, ref, onMounted, onUnmounted, watch } from 'vue';

// Definición de la interfaz para un usuario
interface User {
  id: number;
  userName: string;
  isAdmin: boolean;
}

const authStore = useAuthStore();
const sesionStore = useSesionStore();

// Estado reactivo para manejar los usuarios
const state = reactive({
  users: [] as User[]
});

// Estado reactivo para la hora actual
const currentTime = ref(new Date());

// Estado reactivo para los tiempos de expiración y refresh
const expiresAt = ref(new Date(sesionStore.data?.expiresAt || ''));
const refreshAt = ref(new Date(sesionStore.data?.refreshAt || ''));

// Estado reactivo para manejar si el refresh ha sido actualizado
const refreshUpdated = ref(false);

// Formatear fechas
const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('es-ES', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(date));
};

// Simulación de fetch de usuarios (puedes reemplazar con la API real)
const fetchUsers = async () => {
  return [
    { id: 1, userName: 'admin', isAdmin: true },
    { id: 2, userName: 'user', isAdmin: false },
  ];
};

// Iniciar el intervalo para actualizar la hora actual cada segundo
let intervalId: ReturnType<typeof setInterval>;

onMounted(async () => {
  if (authStore.auth.data?.isAdmin) {
    state.users = await fetchUsers();
  }

  // Actualizar la hora cada segundo
  intervalId = setInterval(() => {
    currentTime.value = new Date();

    // Verificar si los tiempos de expiración o refresh han cambiado
    if (sesionStore.data) {
      const newExpiresAt = new Date(sesionStore.data.expiresAt);
      const newRefreshAt = new Date(sesionStore.data.refreshAt);

      // Si el refresh o expira cambian, marcar como actualizados y reiniciar la animación
      if (newExpiresAt.getTime() !== expiresAt.value.getTime() || newRefreshAt.getTime() !== refreshAt.value.getTime()) {
        expiresAt.value = newExpiresAt;
        refreshAt.value = newRefreshAt;
        refreshUpdated.value = true;

        setTimeout(() => {
          refreshUpdated.value = false; // Desactivar la animación después de un tiempo
        }, 1000); // Duración de la animación
      }
    }
  }, 1000);
});

onUnmounted(() => {
  // Limpiar el intervalo cuando el componente se desmonte
  clearInterval(intervalId);
});

// Acción para crear un usuario
const createUser = () => {
  console.log('Creando usuario...');
};

// Acción de logout
const logout = () => {
  authStore.logout();
};

// Verificar si los valores de la sesión cambian y actualizar los tiempos
watch(
  () => sesionStore.data,
  (newData) => {
    if (newData) {
      expiresAt.value = new Date(newData.expiresAt);
      refreshAt.value = new Date(newData.refreshAt);
    }
  }
);
</script>

<style scoped>
/* Estilos generales */
@import url('https://fonts.googleapis.com/css2?family=Rubik:ital,wght@0,300..900;1,300..900&family=Saira:ital,wght@0,100..900;1,100..900&display=swap');

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: "Saira", sans-serif;
  font-size: 16px;
}

.home-view {
  padding: 20px;
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  backdrop-filter: blur(20px);
  border: 2px solid rgba(255, 255, 255, .2);
  border-radius: 15px;
  box-shadow: 0 0 10px rgba(0,0,0,.2);
  background-color: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.user-info, .token-info, .user-list {
  margin-bottom: 20px;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  background-color: rgba(255, 255, 255, 0.2);
}

.create-user-btn, .logout-btn {
  padding: 10px 15px;
  border: none;
  border-radius: 15px;
  background-color: #007bff;
  color: white;
  cursor: pointer;
  width: 100%;
  margin-top: 10px;
}

.create-user-btn:hover, .logout-btn:hover {
  background-color: #0056b3;
}

/* Estilo para la animación de actualización */
.updated {
  animation: fade-in-out 1s ease-in-out;
}

/* Definición de la animación */
@keyframes fade-in-out {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
  100% {
    opacity: 1;
  }
}

</style>


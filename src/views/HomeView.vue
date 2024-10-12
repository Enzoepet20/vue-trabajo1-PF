<template>
  <div class="home-view">
    <h1>Home View</h1>

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
      <p>Expira: {{ formatDate(sesionStore.data.expiresAt) }}</p>
      <p>Refresh en: {{ formatDate(sesionStore.data.refreshAt) }}</p>
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
import { useAuthStore } from '@/stores/authStore';
import { useSesionStore } from '@/stores/sesionStore';
import { reactive, onMounted } from 'vue';

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

onMounted(async () => {
  if (authStore.auth.data?.isAdmin) {
    state.users = await fetchUsers();
  }
});

// Acción para crear un usuario
const createUser = () => {
  console.log('Creando usuario...');
};

// Acción de logout
const logout = () => {
  authStore.logout();
};
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
</style>

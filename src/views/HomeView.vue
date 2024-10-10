<template>
  <div class="home-container">
    <h1>Bienvenido, {{ user?.userName}}</h1>
    <p class="remember-status">
      Recordarme: <span>{{ user?.remember ? 'Sí' : 'No' }}</span>
    </p>
    
    <div class="user-details">
      <h2>Detalles del usuario</h2>
      <p><strong>Usuario:</strong> {{ user?.userName }}</p>
      <p><strong>Contraseña (Encriptada):</strong> ********</p>
      <p><strong>Fecha de ingreso:</strong> {{ new Date().toLocaleDateString() }}</p>
    </div>
    <button @click="logout">Logout</button>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '@/stores/user';
import { useAuthStore } from '@/stores/authStore';


const userStore = useUserStore();
const authStore = useAuthStore();
const user = userStore.getUser;

function logout() {
  authStore.logout();
}
</script>

<style scoped>
/* Estilos para HomeView */

.home-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 15px;
  backdrop-filter: blur(15px);
  width: 100%;
  max-width: 600px;
  margin: 50px auto;
  color: #fff;
}

h1 {
  font-size: 2.5em;
  margin-bottom: 20px;
}

.remember-status span {
  font-weight: bold;
  color: #ffd700;
}

.user-details {
  background-color: rgba(255, 255, 255, 0.2);
  padding: 15px;
  border-radius: 10px;
  width: 100%;
  text-align: left;
  margin-top: 20px;
}

.user-details p {
  font-size: 1.2em;
  margin: 5px 0;
}

.btn-logout {
  margin-top: 30px;
  padding: 10px 20px;
  background-color: #ff6347;
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-size: 1.2em;
  transition: background-color 0.3s ease;
}

.btn-logout:hover {
  background-color: #ff4500;
}
</style>

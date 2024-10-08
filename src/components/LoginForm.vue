<template>
    <div class="wrapper">
      <form @submit.prevent="submitLogin">
        <h1>Login</h1>
        <div class="input-bx">
          <input v-model="user.user" type="text" placeholder="Usuario" required />
          <ion-icon class="icon" name="person-circle"></ion-icon>
        </div>
        <div class="input-bx">
          <input v-model="user.password" type="password" placeholder="Contraseña" required />
          <ion-icon class="icon" name="lock-closed"></ion-icon>
        </div>
        <div class="remember-forgot">
          <label><input v-model="user.remember" type="checkbox" /> Recordarme</label>
          <a href="#">Olvidaste tu contraseña</a>
        </div>
        <button type="submit" class="btn">Ingresar</button>
      </form>
    </div>
  </template>
  
  <script setup lang="ts">
  import { reactive } from 'vue';
  import { useRouter } from 'vue-router';
  import { useUserStore } from '@/stores/user';
  import type { User } from '@/models/User';
  
  const user = reactive<User>({
    id: 0,
    firstName: '',
    lastName: '',
    user: '',
    password: '',
    remember: false,
    isAdmin: false,
    jwtToken: '',
    refreshTokens: [],
  });
  
  const userStore = useUserStore();
  const router = useRouter();
  
  const submitLogin = () => {
    userStore.setUser(user);
    router.push({ name: 'home' });
  };
  </script>
  
  <style scoped>
  </style>
  
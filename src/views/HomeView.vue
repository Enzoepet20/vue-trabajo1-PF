<template>
  <div>
    <h1>Bienvenido, {{ user?.user }}</h1>
    <p>Recordarme: {{ user?.remember ? 'Sí' : 'No' }}</p>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '@/store/user';

const userStore = useUserStore();
const user = userStore.getUser;
</script>

<style scoped>
/* Estilos para HomeView */
</style>

<template>
  <div class="wrapper">
    <Form @submit="handleSubmit" :validation-schema="schema" v-slot="{errors, isSubmitting}">
      <h1>Login</h1>

      <!-- Campo Usuario -->
      <div class="input-bx">
        <Field name="userName" type="text" :class="{'is-invalid': errors.userName || errors.apiError}" placeholder="Usuario" />
        <ion-icon class="icon" name="person-circle"></ion-icon>
        <!-- Mostrar error de validación -->
        <div class="invalid-feedback">{{ errors.userName }}</div>
      </div>

      <!-- Campo Contraseña -->
      <div class="input-bx">
        <Field name="password" type="password" :class="{'is-invalid': errors.password || errors.apiError}" placeholder="Contraseña" />
        <ion-icon class="icon" name="lock-closed"></ion-icon>
        <!-- Mostrar error de validación -->
        <div class="invalid-feedback">{{ errors.password }}</div>
      </div>

      <div class="remember-forgot">
        <label>
          <input v-model="remember" type="checkbox" />
          Recordarme
        </label>
        <a href="#">Olvidaste tu contraseña</a>
      </div>

      <button type="submit" class="btn">
        <span v-show="isSubmitting" class="loader"></span>
        <p v-show="!isSubmitting">Ingresar</p>
      </button>

      <div v-if="errors.apiError" class="error-alert">{{ errors.apiError }}</div>
    </Form>
  </div>
</template>

<script setup lang="ts">
import { Field, Form, useField } from 'vee-validate';
import * as yup from 'yup';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';

// Esquema de validación
const schema = yup.object().shape({
  userName: yup.string().required('El nombre de usuario es obligatorio'),
  password: yup.string().required('La contraseña es obligatoria'),
  remember: yup.boolean(),
});

// Inicializamos los campos con useField
const { value: remember } = useField('remember');

// Store de autenticación y router
const authStore = useAuthStore();
const router = useRouter();

// Manejar el login
async function handleSubmit(values: any, { setErrors }: any) {
  const { userName, password } = values;
  try {
    await authStore.login(userName, password);
    router.push('home');
  } catch (error: any) {
    setErrors({ apiError: 'Usuario o contraseña incorrectos' });
  }
}

// Redirigir si el usuario ya está autenticado
if (authStore.auth.data) {
  router.push('home');
}
</script>

<style scoped>
/* estilos generales */
@import url('https://fonts.googleapis.com/css2?family=Rubik:ital,wght@0,300..900;1,300..900&family=Saira:ital,wght@0,100..900;1,100..900&display=swap');

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: "Saira", sans-serif;
    font-size: 16px;
}

body {
    display: flex;
    justify-content: center;
    align-items: center;
    background: url('./background.jpg') no-repeat;
    background-size: cover;
    background-position: center;
    min-height: 100vh;
    max-height: 100vh;
    max-width: 100vw;
}

/* estilos del componente */
.wrapper {
    width: 400px;
    background: transparent;
    border: 2px solid rgba(255, 255, 255, .2);
    backdrop-filter: blur(20px);
    box-shadow: 0 0 10px rgba(0,0,0,.2);
    color: #fff;
    padding: 30px 40px;
    border-radius: 15px;
}

.wrapper h1 {
    font-size: 3em;
    text-align: center;
}

.wrapper .input-bx {
    position: relative;
    width: 100%;
    height: 50px;
    margin: 30px 0;
}

.wrapper .input-bx input {
    width: 100%;
    height: 100%;
    background: transparent;
    border: 2px solid rgba(255, 255, 255, .2);
    border-radius: 15px;
    color: #fff;
    padding: 20px 45px 20px 20px;
}

.wrapper .input-bx input::placeholder {
    color: #fff;
}

.wrapper .input-bx .icon {
    position: absolute;
    right: 20px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 1.5em;
}

.input-bx input.is-invalid {
    border-color: red;
}

.input-bx .invalid-feedback {
    padding: 0px 16px;
    margin: 0px;
    color: red;
    font-weight: 300;
}

.wrapper .remember-forgot {
    display: flex;
    justify-content: space-between;
    font-size: 1.2em;
    margin: -15px 0 15px;
}

.wrapper .remember-forgot label input {
    accent-color: #fff;
    margin-right: 3px;
}

.wrapper .remember-forgot a {
    color: #fff;
    text-decoration: none;
}

.wrapper .remember-forgot a:hover {
    text-decoration: underline;
}

.wrapper button {
    width: 100%;
    height: 50px;
    border-radius: 15px;
    border: none;
    box-shadow: 0 0 10px rgba(0,0,0,.1);
    cursor: pointer;
    font-size: 1.2em;
    font-weight: 600;
    color: #333;
}

button p {
    font-size: 1.2em;
    font-weight: 600;
    color: #333;
}

.loader {
    margin: auto 0;
    width: 24px;
    height: 24px;
    border: 4px solid purple;
    border-bottom-color: transparent;
    border-radius: 50%;
    display: inline-block;
    animation: rotation 1s linear infinite;
}

@keyframes rotation {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.error-alert {
    margin: 16px 0 0 0;
    width: 100%;
    color: red;
    text-align: center;
    font-weight: 400;
}
</style>

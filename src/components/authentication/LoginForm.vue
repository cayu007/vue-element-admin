<template>
    <div>
      <h2>Autenticación WordPress</h2>
      <input v-model="username" placeholder="Username" />
      <input type="password" v-model="password" placeholder="Password" />
      <button @click="handleLogin">Login</button>
      <p v-if="errorMessage" style="color: red">{{ errorMessage }}</p>
    </div>
  </template>
  
  <script>
  import { authenticateWithWordPress } from '@/api/wordpress';
  
  export default {
    data() {
      return {
        username: '',
        password: '',
        errorMessage: ''  // Mensaje de error para mostrar al usuario
      };
    },
    methods: {
      async handleLogin() {
        if (!this.username || !this.password) {
          this.errorMessage = 'Por favor, introduzca un nombre de usuario y contraseña.';
          return;
        }
  
        try {
          const token = await authenticateWithWordPress(this.username, this.password);
          console.log("Token received:", token);
          this.$emit('login', token);
          this.errorMessage = '';
        } catch (error) {
          console.error("Error during authentication:", error);
          this.errorMessage = 'Error de autenticación. Por favor, intente de nuevo.';
        }
      }
    }
  };
  </script>

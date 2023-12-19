<template>
    <div>
        <button @click="handleToggleMaintenance">
        {{ maintenanceActive ? 'Desactivar' : 'Activar' }} Modo de Mantenimiento
      </button>
      <p v-if="message">{{ message }}</p>
    </div>
  </template>
  <script>
  import { authenticateWithWordPress, toggleMaintenanceMode } from "@/api/wordpress";

  
  export default {
    data() {
      return {
        maintenanceActive: false, // Estado inicial del modo de mantenimiento
        message: '' // Mensaje para mostrar la respuesta de la API
      };
    },
    methods: {
        async handleToggleMaintenance() {
        try {
            const response = await toggleMaintenanceMode();
            console.log("Response from toggle maintenance:", response);
            // Aquí puedes manejar la respuesta, mostrar un mensaje al usuario, etc.
        } catch (error) {
            console.error("Error toggling maintenance mode in component:", error);
            // Maneja el error, muestra un mensaje al usuario, etc.
        }
    }
    },
    async mounted() {
            // Verificar si hay un token
    const token = sessionStorage.getItem("jwtToken");
    console.log("Token retrieved from sessionStorage:", token);

        if (token && token.trim() !== "") {  // Asegurarse de que el token no esté vacío
            this.jwtToken = token;
            this.isAuthenticated = true;
        }
      // Aquí puedes hacer una llamada API para verificar el estado inicial del modo de mantenimiento si lo deseas
      // Por ejemplo, puedes tener un endpoint que simplemente devuelva el estado actual del modo de mantenimiento
    }
  }
  </script>

  
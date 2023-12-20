<template>
  <div>
    <button @click="cargarDatosDePython">Cargar Datos</button>
    <p v-if="mensaje">{{ mensaje }}</p>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  data() {
    return {
      mensaje: ''
    }
  },
  methods: {
    async cargarDatosDePython() {
      try {
        const response = await axios.get('https://apipythondash.azurewebsites.net/')
        this.mensaje = response.data.mensaje
      } catch (error) {
        console.error('Error al cargar datos de Python:', error)
      }
    }
  }
}
</script>

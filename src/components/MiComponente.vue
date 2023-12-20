<template>
  <div>
    <p>{{ mensaje }}</p>
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
  mounted() {
    this.obtenerMensaje()
  },
  methods: {
    async obtenerMensaje() {
      try {
        // Usar variable de entorno para la URL base
        const baseUrl = process.env.VUE_APP_BASE_API || ''
        const respuesta = await axios.get(`${baseUrl}/hola-mundo`)
        this.mensaje = respuesta.data
      } catch (error) {
        console.error('Error al obtener el mensaje:', error)
      }
    }
  }
}
</script>

<style>
/* Estilos si necesitas */
</style>

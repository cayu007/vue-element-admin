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
        const respuesta = await axios.get('http://127.0.0.1:5000/hola-mundo')
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

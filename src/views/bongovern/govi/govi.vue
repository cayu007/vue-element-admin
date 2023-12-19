<template>
  <div class="govi">
    <h1>Chatbot Govi</h1>
    <div>
      <input 
        type="text" 
        v-model="input"
        placeholder="Escribe tu pregunta..."
      />
      <button @click="handleQuerySubmit">Enviar</button>
    </div>
    <div>
      <p>{{ response }}</p>
    </div>
  </div>
</template>

<script>
import { handle_chatbot_query } from "@/api/wordpress";

export default {
  data() {
    return {
      input: '',
      response: ''
    };
  },
  methods: {
    async handleQuerySubmit() {
  try {
    const chatbotResponse = await handle_chatbot_query(this.input);
    console.log("Respuesta completa del chatbot:", chatbotResponse); // Añade esta línea
    this.response = chatbotResponse.data || "Respuesta no recibida.";

  } catch (error) {
    console.error("Hubo un error al consultar el chatbot:", error);
    this.response = "Hubo un error al obtener una respuesta.";
  }
}
  }
}
</script>

<style scoped>
/* Aquí puedes agregar el CSS que tenías en "govi.less" */
</style>


  
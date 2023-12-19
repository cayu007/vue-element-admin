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
          const url = 'https://governobert.staperpetua.cat/wp-json/mwai/v1/simpleChatbotQuery';
          const nonceResponse = await fetch('https://governobert.staperpetua.cat/wp-admin/admin-ajax.php?action=get_nonce');
          const nonce = await nonceResponse.text();
  
          const payload = {
            prompt: this.input,
            botId: 'default'
          };
  
          const apiResponse = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-WP-Nonce': nonce
            },
            body: JSON.stringify(payload)
          });
  
          const data = await apiResponse.json();
          this.response = data.message;  // Asumiendo que la respuesta contiene un campo "message"
  
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
  
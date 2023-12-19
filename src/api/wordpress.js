import axios from 'axios';

const authenticateWithWordPress = async (username, password) => {
    const apiUrl = `https://governobert.staperpetua.cat/wp-json/jwt-auth/v1/token`;

    try {
        const response = await axios.post(apiUrl, {
            username,
            password
        });
        
        if (response.data && response.data.token) {
            return response.data.token;
        } else {
            throw new Error('Authentication failed. No token received.');
        }
    } catch (error) {
        console.error("Error during authentication:", error);
        throw error;
    }
};


const fetchPosts = async (postType = 'datasetsdata', page = 1, per_page = 100, acfFilterValue, acfDropdownValue) => {

// const fetchPosts = async (postType = 'datasetsdata', page = 1, per_page = 10, acfFilterValue, acfDropdownValue) => {    
    if (!postType || typeof postType !== 'string') {
        throw new Error('Invalid post type provided.');
    }

    const apiUrl = `https://governobert.staperpetua.cat/wp-json/wp/v2/${postType}?_embed&page=${page}&per_page=${per_page}`;

   // const apiUrl = `https://governobert.staperpetua.cat/wp-json/wp/v2/${postType}?_embed&page=${page}&per_page=${per_page}`;
    try {
        const response = await axios.get(apiUrl);
        // 1. Recuperar el total de posts del encabezado de la respuesta
         const totalPosts = parseInt(response.headers['x-wp-total'], 10);
        console.log("Posts fetched:", response.data);
        return { data: response.data, total: totalPosts };
    } catch (error) {
        console.error("Error fetching posts:", error);
        throw error;
    }
};
//POSTTYPE RENDIMENT DE COMPTES
/*
const fetchPosts2 = async (postType = 'estadisticas', page = 1, per_page = 100, acfFilterValue, acfDropdownValue) => {

  // const fetchPosts = async (postType = 'datasetsdata', page = 1, per_page = 10, acfFilterValue, acfDropdownValue) => {    
      if (!postType || typeof postType !== 'string') {
          throw new Error('Invalid post type provided.');
      }
  
      const apiUrl = `https://governobert.staperpetua.cat/wp-json/wp/v2/${postType}?_embed&page=${page}&per_page=${per_page}`;
  
     // const apiUrl = `https://governobert.staperpetua.cat/wp-json/wp/v2/${postType}?_embed&page=${page}&per_page=${per_page}`;
      try {
          const response = await axios.get(apiUrl);
          // 1. Recuperar el total de posts del encabezado de la respuesta
           const totalPosts = parseInt(response.headers['x-wp-total'], 10);
          console.log("Posts fetched:", response.data);
          return { data: response.data, total: totalPosts };
      } catch (error) {
          console.error("Error fetching posts:", error);
          throw error;
      }
  };
*/
const fetchAuthors = async () => {
    const apiUrl = `https://governobert.staperpetua.cat/wp-json/wp/v2/users?per_page=100`;

    try {
        const response = await axios.get(apiUrl);
        console.log("Authors fetched:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error fetching authors:", error);
        throw error;
    }
};
const fetchACFUsers = async () => {
    const apiUrl = `https://governobert.staperpetua.cat/wp-json/acf/v3/users?per_page=100`;

    try {
        const response = await axios.get(apiUrl);
        console.log("ACF Users fetched:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error fetching ACF users:", error);
        throw error;
    }
};
//const updatePost = async (postId, updates) => {
const updatePost = async (postType = 'datasetsdata', postId, updates) => {

  //const apiUrl = `https://governobert.staperpetua.cat/wp-json/acf/v3/datasetsdata/${postId}`;
  const apiUrl = `https://governobert.staperpetua.cat/wp-json/acf/v3/${postType}/${postId}`;
  const jwtToken = sessionStorage.getItem("jwtToken");  // Obtenemos el token JWT

  try {
    const response = await axios.post(apiUrl, {
      fields: updates  // Usamos el objeto updates directamente
    }, {
      headers: {
        'Authorization': `Bearer ${jwtToken}`  // Usamos el token JWT obtenido
      }
    });

    if (response.status !== 200) {
      throw new Error('Failed to update the post.');
    }
    
    return response.data;
  } catch (error) {
    console.error("Error updating the post:", error);
    throw error;
  }
};
const fetchACFAuthors = async () => {
  const apiUrl = `https://governobert.staperpetua.cat/wp-json/acf/v3/users?per_page=100`;

  try {
      const response = await axios.get(apiUrl);
      console.log("ACF Authors fetched:", response.data);
      return response.data;
  } catch (error) {
      console.error("Error fetching ACF authors:", error);
      throw error;
  }
};
/*para connseguir los datasets del tipo de campo select con el nombre de SISTEMA*/
const fetchTemaDatasets = async () => {
  const apiUrl = `https://governobert.staperpetua.cat/wp-json/acf/v3/datasetsdata?_embed`; // Asumo que los datos de "tema_datasets" están en este endpoint. Ajusta si es necesario.

  try {
      const response = await axios.get(apiUrl);
      
      if (response.status !== 200) {
          throw new Error('Failed to fetch tema_datasets.');
      }

      // Asumiendo que la respuesta contiene un array de posts y cada post tiene un campo acf con el valor de tema_datasets
      //const temaDatasetsData = response.data.map(post => post.acf.tema_rcomptes);
      const temaDatasetsData = response.data.map(post => post.acf.tema_rcomptes).flat();



      return temaDatasetsData;
  } catch (error) {
      console.error("Error fetching tema_datasets:", error);
      throw error;
  }
};
const fetchAIAggregatedEngine = async () => {
  const apiUrl = 'https://governobert.staperpetua.cat/wp-json/acf/v3/datasetsdata?_embed'; 

  try {
      const response = await axios.get(apiUrl);
      
      if (response.status !== 200) {
          throw new Error('Failed to fetch agregado_ai_engine.');
      }

      // Assuming that the response contains an array of posts and each post has an ACF field with the value of agregado_ai_engine
      const aiEngineData = response.data.map(post => post.acf.agregado_ai_engine).flat();

      return aiEngineData;
  } catch (error) {
      console.error("Error fetching agregado_ai_engine:", error);
      throw error;
  }
};
const toggleMaintenanceMode = async () => {
  const apiUrl = 'https://governobert.staperpetua.cat/wp-json/maintenanceplugin/v1/toggle/';
  const jwtToken = sessionStorage.getItem("jwtToken");  // Obtenemos el token JWT

  try {
      const response = await axios.post(apiUrl, {}, {
          headers: {
              'Authorization': `Bearer ${jwtToken}`  // Usamos el token JWT obtenido
          }
      });

      if (response.status !== 200) {
          throw new Error('Failed to toggle maintenance mode.');
      }

      return response.data;
  } catch (error) {
      console.error("Error toggling maintenance mode:", error);
      throw error;
  }
};

const handle_chatbot_query = async (message) => {
  const apiUrl = 'https://governobert.staperpetua.cat/wp-json/mwai/v1/simpleChatbotQuery';

  try {
    const response = await axios.post(apiUrl, {
        prompt: message,
        botId: 'default'
    }, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer 123456'
        }
    });

    if (response.status !== 200) {
        throw new Error('Failed to send message to chatbot.');
    }

    return response.data;
  } catch (error) {
      console.error("Error sending message to chatbot:", error);
      throw error;
  }
};


// export { authenticateWithWordPress, fetchPosts, updatePost, fetchAuthors, fetchACFAuthors, fetchTemaDatasets };
// export { authenticateWithWordPress, fetchPosts, updatePost, fetchAuthors, fetchACFAuthors, fetchTemaDatasets };
 export { authenticateWithWordPress, fetchPosts, updatePost, fetchAuthors, fetchACFAuthors, toggleMaintenanceMode, handle_chatbot_query };






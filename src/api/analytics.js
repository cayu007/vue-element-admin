import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001', // dirección de tu servidor Express
  timeout: 7000,
});



export default api;


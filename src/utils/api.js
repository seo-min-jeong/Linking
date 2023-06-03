import axios from 'axios';

const api = axios.create({
  baseURL: 'http://43.201.231.51:8080',
  headers: {
    'Content-Type': 'application/json',
  },
})

export default api;
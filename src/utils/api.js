import axios from 'axios';

const api = axios.create({
  // baseURL: 'http://43.200.237.173:8080',
  headers: {
    'Content-Type': 'application/json',
  },
})

export default api;
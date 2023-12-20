import axios from 'axios'

const api = axios.create({
  // baseURL: 'https://mylinking.shop/',
  baseURL: 'http://url/',
  headers: {
    'Content-Type': 'application/json',
  },
})

export default api
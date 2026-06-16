import axios from 'axios'
import { API_BASE_URL } from '@/lib/constants'
import { applyInterceptors } from './interceptors'

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

applyInterceptors(client)

export default client

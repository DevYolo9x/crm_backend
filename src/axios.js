import axios from 'axios'
const isProduction = import.meta.env.MODE === 'production'
const axiosInstance = axios.create({
    baseURL: isProduction
        ? import.meta.env.VITE_API_BASE_URL_PROD // Production API
        : import.meta.env.VITE_API_BASE_URL_DEV, // Development API
    headers: {
        accept: 'application/json',
    },
})
export default axiosInstance

import axios from "axios";

// If using Vite, use import.meta.env.MODE instead of process.env.NODE_ENV
const baseURL = import.meta.env.MODE === 'production' ? "/api" : "http://localhost:4000/api";

export default axios.create({
    withCredentials: true,
    baseURL,
});

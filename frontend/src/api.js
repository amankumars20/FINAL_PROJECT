import axios from "axios";
const baseUrl = import.meta.env.VITE_BACKEND_URL;

const api = axios.create({
  baseURL: `${baseUrl}/api`,
});




export const signUp = (formData) => api.post("/signup", formData).then(res => res.data);

export const Login = (formData) => api.post("/login", formData).then(res => res.data);

import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
});



export const signUp = (formData) => api.post("/signup", formData).then(res => res.data);

export const Login = (formData) => api.post("/login", formData).then(res => res.data);

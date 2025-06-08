import axios from "axios";

const api = axios.create({
  baseURL: "http://18.209.13.39:5000/api",
});



export const signUp = (formData) => api.post("/signup", formData).then(res => res.data);

export const Login = (formData) => api.post("/login", formData).then(res => res.data);

import { createSlice } from '@reduxjs/toolkit';
import { jwtDecode } from "jwt-decode";

const token = localStorage.getItem("token");
const initialState = {
  isLoggedIn: Boolean(localStorage.getItem('token')),
  token: localStorage.getItem('token') || null,
  user: token ? jwtDecode(token) : { name: "", email: "",id:"" },

};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action) => {
      state.isLoggedIn = true;
      state.token = action.payload.token;  // Store the token
      localStorage.setItem('token', action.payload.token); // Save token to localStorage
      const decodedToken = jwtDecode(action.payload.token);      
      state.user.id = decodedToken.id;
      state.user.name = decodedToken.name;
      state.user.email = decodedToken.email;
    },
    logout: (state) => {
      state.isLoggedIn = false;
      state.token = null;
      state.user = { name: '', email: '',id:''};
      localStorage.removeItem('token');
    },
  },
});

export const { login, logout } = authSlice.actions;

export default authSlice.reducer;
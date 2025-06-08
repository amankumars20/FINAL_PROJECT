import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Login, signUp } from "../api";
import { useDispatch } from "react-redux";
import { useToast } from "@chakra-ui/react";
import { login } from "../redux/authSlice";

export const SignUp = () => {
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const toast = useToast();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const response = await signUp(formData);
      const { token, message, user } = response;

      if (token && user?._id) {
        localStorage.setItem("token", token);
        dispatch(login({ token }));

        toast({
          title: "Account Created",
          description: message,
          status: "success",
          duration: 4000,
          isClosable: true,
        });

        navigate(`/`);
      }
    } catch (error) {
      const errMsg = error.response?.data?.message || "Something went wrong";
      toast({
        title: "Signup Failed",
        description: errMsg,
        status: "error",
        duration: 5000,
        isClosable: true,
      });

      if (errMsg.toLowerCase().includes("email already exists")) {
        alert("User already exists. Please sign in instead.");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-3xl font-bold text-center mb-6">Create an Account</h2>
        <form onSubmit={handleSignup} className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg"
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg"
            required
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
          >
            Sign Up
          </button>
        </form>
        <p className="mt-4 text-sm text-center text-gray-600">
          Already have an account?{" "}
          <Link to="/signin" className="text-blue-600 hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export const SignIn = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const toast = useToast();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await Login(formData);
      const { token, message, user } = response;

      if (token && user?._id) {
        localStorage.setItem("token", token);
        dispatch(login({ token }));

        toast({
          title: "Login Successful",
          description: message,
          status: "success",
          duration: 4000,
          isClosable: true,
        });

        navigate(`/`);
      }
    } catch (error) {
      toast({
        title: "Login Failed",
        description: error.response?.data?.message || "Invalid credentials",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-3xl font-bold text-center mb-6">Welcome Back</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg"
            required
          />
          <button
            type="submit"
            className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition"
          >
            Sign In
          </button>
        </form>
        <p className="mt-4 text-sm text-center text-gray-600">
          Don’t have an account?{" "}
          <Link to="/signup" className="text-green-600 hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};














// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { Login, signUp } from "../api";
// import { useDispatch } from "react-redux";
// import { useToast } from "@chakra-ui/react";
// import { login } from "../redux/authSlice";

// const SignUp = () => {
//   const [formData, setFormData] = useState({ name: "", email: "", password: "" });
//   const navigate = useNavigate();
//   const dispatch = useDispatch();
//   const toast = useToast();

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleSignup = async (e) => {
//     console.log("Sign up triggered");
//     e.preventDefault();

//     try {
//       console.log("Form data before sending:", formData);
//       const response = await signUp(formData);
//       console.log("API response:", response);

//       const { token, message } = response;
//       if (token) {
//         localStorage.setItem("token", token);
//         dispatch(login({ token }));
//         toast({
//           title: "User Account Created Successfully",
//           description: message,
//           status: "success",
//           duration: 5000,
//           isClosable: true,
//         });
//         navigate("/");
//       }
//     } catch (error) {
//       console.error("Signup error:", error);
//       toast({
//         title: "Signup Failed",
//         description: error.response?.data?.message || "Something went wrong",
//         status: "error",
//         duration: 5000,
//         isClosable: true,
//       });
//     }
//   };

//   return (
//     <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-lg">
//       <h2 className="text-2xl font-bold mb-4">Sign Up</h2>
//       <form onSubmit={handleSignup} className="space-y-4">
//         <input type="text" name="name" placeholder="Name" value={formData.name} onChange={handleChange} className="w-full p-2 border rounded" required />
//         <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} className="w-full p-2 border rounded" required />
//         <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} className="w-full p-2 border rounded" required />
//         <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded">Sign Up</button>
//       </form>
//     </div>
//   );
// };

// const SignIn = () => {
//   const [formData, setFormData] = useState({ email: "", password: "" });
//   const navigate = useNavigate();
//   const dispatch = useDispatch();
//   const toast = useToast();

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     try {
//       const response = await Login(formData);
//       console.log("Login response:", response);

//       const { token, message } = response;
//       if (token) {
//         localStorage.setItem("token", token);
//         dispatch(login({ token }));
//         toast({
//           title: "Login Successful",
//           description: message,
//           status: "success",
//           duration: 5000,
//           isClosable: true,
//         });
//         navigate("/");
//       }
//     } catch (error) {
//       console.error("Login error:", error);
//       toast({
//         title: "Login Failed",
//         description: error.response?.data?.message || "Something went wrong",
//         status: "error",
//         duration: 5000,
//         isClosable: true,
//       });
//     }
//   };

//   return (
//     <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-lg">
//       <h2 className="text-2xl font-bold mb-4">Sign In</h2>
//       <form onSubmit={handleLogin} className="space-y-4">
//         <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} className="w-full p-2 border rounded" required />
//         <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} className="w-full p-2 border rounded" required />
//         <button type="submit" className="w-full bg-green-500 text-white p-2 rounded">Sign In</button>
//       </form>
//     </div>
//   );
// };

// export { SignUp, SignIn };










// // import { useState } from "react";
// // import { useNavigate } from "react-router-dom";
// // import { Login, signUp } from "../api";
// // import { useDispatch } from "react-redux";
// // import { useToast } from "@chakra-ui/react";
// // import { login } from "../redux/authSlice";

// // const SignUp = () => {
// //   const [formData, setFormData] = useState({ name: "", email: "", password: "" });
// //   const navigate = useNavigate();
// //   const dispatch = useDispatch();
// //   const toast = useToast();
// //   const handleChange = (e) => {
// //     setFormData({ ...formData, [e.target.name]: e.target.value });
// //   };

// //   const handleSubmit = (e) => {
// //     e.preventDefault();
// //     const previousPath = localStorage.getItem("previousPath") || "/home";
// //     localStorage.removeItem("previousPath");
// //     navigate(previousPath);
// //   };
// //   const handleSignup = async (e) => {
// //     console.log("sing up triggerd")
// //     e.preventDefault();
// //     try {
// //       const response = await signUp(formData);

// //       // remove
// //       console.log("now form data")
// //       console.log(formData)

// //       const token = response.data.token;
// //       if (token) {
// //         localStorage.setItem('token', token);
// //       }
// //       dispatch(login({ token }));
// //       navigate("/")
// //       toast({
// //         title: "User Account Created Successfully",
// //         description: response.data.message,
// //         status: "success",
// //         duration: 5000,
// //         isClosable: true,
// //       });
// //     } catch (error) {
// //       toast({
// //         title: "Signup Failed",
// //         description: error.response?.data?.message || "Something went wrong",
// //         status: "error",
// //         duration: 5000,
// //         isClosable: true,
// //       });
// //     }
// //   };

// //   return (
// //     <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-lg">
// //       <h2 className="text-2xl font-bold mb-4">Sign Up</h2>
// //       <form onSubmit={handleSignup} className="space-y-4">
// //         <input type="text" name="name" placeholder="Name" onChange={handleChange} className="w-full p-2 border rounded" required />
// //         <input type="email" name="email" placeholder="Email" onChange={handleChange} className="w-full p-2 border rounded" required />
// //         <input type="password" name="password" placeholder="Password" onChange={handleChange} className="w-full p-2 border rounded" required />
// //         <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded">Sign Up</button>
// //       </form>
// //     </div>
// //   );
// // };

// // const SignIn = () => {
// //   const [formData, setFormData] = useState({ email: "", password: "" });
// //   const navigate = useNavigate();
// // const dispatch = useDispatch();
// //   const toast = useToast();
// //   const handleChange = (e) => {
// //     setFormData({ ...formData, [e.target.name]: e.target.value });
// //   };

// //   const handleSubmit = (e) => {
// //     e.preventDefault();
// //     const previousPath = localStorage.getItem("previousPath") || "/home";
// //     localStorage.removeItem("previousPath");
// //     navigate(previousPath);
// //   };
// //   const handleLogin = async (e) => {
// //     e.preventDefault();
// //     try {
// //       const response = await Login(formData);
// //       const token = response?.token;
// //       if (token) {
// //         localStorage.setItem('token', token);
// //       }
// //       dispatch(login({ token }));
// //       navigate("/")
// //       toast({
// //         title: "Login Successful",
// //         description: response?.message,
// //         status: "success",
// //         duration: 5000,
// //         isClosable: true,
// //       });
// //     } catch (error) {
// //       toast({
// //         title: "Login Failed",
// //         description: error.response?.message || "Something went wrong",
// //         status: "error",
// //         duration: 5000,
// //         isClosable: true,
// //       });
// //     }
// //   };

// //   return (
// //     <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-lg">
// //       <h2 className="text-2xl font-bold mb-4">Sign In</h2>
// //       <form onSubmit={handleLogin} className="space-y-4">
// //         <input type="email" name="email" placeholder="Email" onChange={handleChange} className="w-full p-2 border rounded" required />
// //         <input type="password" name="password" placeholder="Password" onChange={handleChange} className="w-full p-2 border rounded" required />
// //         <button type="submit" className="w-full bg-green-500 text-white p-2 rounded">Sign In</button>
// //       </form>
// //     </div>
// //   );
// // };

// // export { SignUp, SignIn };
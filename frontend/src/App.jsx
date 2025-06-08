import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes, useNavigate, useParams, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import UpdateEditor from "./components/UpdateEditor";
import Whiteboard from "./components/Whiteboard";
import {SignUp,SignIn} from "./components/Auth";
import PrivateRoute from "./components/PrivateRoute";
import { useSelector } from "react-redux";

const App = () => {
    const isAuthenticated = useSelector((state) => state.auth.isLoggedIn);

    //added
     const userId = useSelector((state) => state.auth.userId);  

    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/board/:roomId" element={<Whiteboard />} />
                <Route path="/code/:roomId" element={<UpdateEditor />} />
                <Route path="/room/:id" element={<Home />} />
                <Route path="/signup" element={isAuthenticated ? <Navigate to={`/`} /> : <SignUp />} />
                <Route path="/signin" element={isAuthenticated ? <Navigate to={`/`} /> : <SignIn />} />
            </Routes>
        </Router>

        // <Router>
        //     <Routes>
        //     {/* <Route path="/" element={isAuthenticated ? <Home/>:<Navigate to="/signin" />}  /> */}
        //         <Route path="/" element={<Home />} />
        //         <Route path="/board/:roomId" element={<Whiteboard />} />
        //         <Route path="/code/:roomId" element={<UpdateEditor />} />
        //         <Route path="/signup" element={isAuthenticated ? <Navigate to="/" />:<SignUp/>} />
        //         <Route path="/signin" element={isAuthenticated ? <Navigate to="/code/${user._id}" />:<SignIn/>} />
      
        //     </Routes>
        // </Router>
    );
};

export default App;

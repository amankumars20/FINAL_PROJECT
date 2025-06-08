import React from "react";
import { Navigate,matchPath } from "react-router-dom";
import { useSelector } from "react-redux";

const PrivateRoute = ({ children }) => {
  const { isLoggedIn, user } = useSelector((state) => state.auth);

  if (!isLoggedIn || !user || !user.roles) {
    return <div>Loading...</div>;
  }

  if (!user.modules || !Array.isArray(user.modules)) {
    return <Navigate to="/unauthorized" />;
  }
  if (!isLoggedIn) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default PrivateRoute;
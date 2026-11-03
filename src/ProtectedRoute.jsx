import { Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";

const ProtectedRoute = ({ children }) => {
    const { accessToken, authChecked } = useContext(AuthContext);

    if(!authChecked) {
        return <p>Loading...</p>;
    }

    if (!accessToken) {
        return <Navigate to="/Login" replace />;
    }

    return children;
};

export default ProtectedRoute;
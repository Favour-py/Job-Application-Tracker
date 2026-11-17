import { Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";
import Spinner from "./Spinner";

const ProtectedRoute = ({ children }) => {
    const { accessToken, authChecked } = useContext(AuthContext);

    if(!authChecked) {
        return <Spinner size={80} fullPage />;
    }

    if (!accessToken) {
        return <Navigate to="/Login" replace />;
    }

    return children;
};

export default ProtectedRoute;
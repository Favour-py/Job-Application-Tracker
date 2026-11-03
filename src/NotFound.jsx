import { Link } from "react-router-dom";

const NotFound = () => {
    return (
        <div className="not-found">
            <h1>404</h1>
            <p>Oops! This page doesn't exist.</p>
            <Link to="/">Go Back Home</Link>
        </div>
    );
};

export default NotFound;

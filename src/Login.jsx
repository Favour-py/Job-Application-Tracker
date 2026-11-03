import { useState, useContext } from "react";
import { AuthContext } from "./context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import { API_URL } from "./config";

const Login = () => {
    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const { setAccessToken } = useContext(AuthContext);

    const handleSubmit = (e) => {
        e.preventDefault();

        fetch(`${API_URL}/api/login/`, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        })
        .then(response => response.json().then(data => {
            if (!response.ok) {
                throw data;
            }
            return data;
        }))
        .then(data => {
            setError("");
            setAccessToken(data.access);
            navigate("/");
        })
        .catch(err => {
            setError(err.detail || "Login failed. Please try again.");
        });
    };

    return (
        <div className="login-container">
            <form onSubmit={handleSubmit}>
                <h2>Login</h2>

                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <div className="login-action-row">
                    <button type="submit">Login</button>
                    <button type="button" className="secondary" onClick={() => navigate("/Signup")}>Sign Up</button>
                </div>

                <div className="divider">Or</div>

                <button type="button" className="secondary" onClick={() => navigate("/forgot-password")}>Forgot Password?</button>

                {error && <p className="error">{error}</p>}
            </form>
        </div>
    );
};

export default Login;
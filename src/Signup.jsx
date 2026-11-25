import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "./config";
import toast from "react-hot-toast";

const Signup = () => {

    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);

        fetch(`${API_URL}/api/register/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                username: username,
                email: email,
                password: password,
                password2: confirmPassword
            })
        })
        .then(response => response.json().then(data => {
            if (!response.ok) {
                throw data;
            }
            return data;
        }))
        .then(() => {
            toast.success("Account created! Redirecting to login...");
            setEmail("");
            setUsername("");
            setPassword("");
            setConfirmPassword("");
            navigate("/Login");
        })
        .catch(error => {
            Object.entries(error).forEach(([field, messages]) => {
                const label = field === 'non_field_errors' ? '' : `${field.charAt(0).toUpperCase() + field.slice(1)}: `;
                messages.forEach(msg => toast.error(`${label}${msg}`));
            });
        })
        .finally(() => setLoading(false));
    };

    return (
        <div className="auth-page">
            <form className="auth-card" onSubmit={handleSubmit}>
                <div className="auth-header">
                    <h2>Sign Up</h2>
                </div>

                <div className="auth-fields">
                    <input
                        type="text"
                        placeholder="Username"
                        autoComplete="username"
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />

                    <input
                        type="email"
                        name="email"
                        placeholder="Email Address"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />

                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    <input
                        type="password"
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                </div>

                <div className="auth-actions">
                    <button type="submit" disabled={loading}>
                        {loading ? "Signing up..." : "Sign Up"}
                    </button>
                    <p>Already have an account? <a href="/Login" className="login-link">Log In</a></p>
                </div>
            </form>
        </div>
    );
};

export default Signup;
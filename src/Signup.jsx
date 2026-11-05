import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "./config";

const Signup = () => {

    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        setErrors({});
        setSuccessMessage("");
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
            setSuccessMessage("User registered successfully!");
            setEmail("");
            setUsername("");
            setPassword("");
            setConfirmPassword("");
            navigate("/Login");
        })
        .catch(error => {
            setErrors(error);
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
                        placeholder="Full Name"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />

                    <input
                        type="email"
                        placeholder="Email Address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />

                    <input
                        type="password"
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
                    <div className="divider">Or</div>
                    <button type="button" className="secondary">Sign up with Google</button>
                    <button type="button" className="secondary">Sign up with Facebook</button>
                </div>

                {successMessage && <p className="success">{successMessage}</p>}
                {Object.entries(errors).map(([field, messages]) => {
                    const fieldName = field === "non_field_errors" ? "Error" : field.charAt(0).toUpperCase() + field.slice(1);
                    return messages.map((message, index) => (
                        <p key={`${field}-${index}`} className="error">
                            <strong>{fieldName}:</strong> {message}
                        </p>
                    ));
                })}
            </form>
        </div>
    );
};

export default Signup;
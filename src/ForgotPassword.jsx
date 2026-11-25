import { useState } from "react";
import { API_URL } from "./config";
import toast from "react-hot-toast";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();

        fetch(`${API_URL}/api/password-reset/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email })
        })
        .then(response => response.json().then(data => ({ status: response.status, data })))
        .then(({ status, data }) => {
            if (status >= 400) throw data;
            toast.success(data.message || "If that email exists, a reset link has been sent.");
            setEmail("");
        })
        .catch(err => {
            toast.error(err?.email || err?.detail || "Unable to send reset email.");
        });
    };

    return (
        <div className="login-container">
            <h2>Forgot Password</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <button type="submit">Send Reset Link</button>
            </form>
        </div>
    );
};

export default ForgotPassword;

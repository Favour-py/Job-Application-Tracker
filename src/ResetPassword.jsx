import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { API_URL } from "./config";

const ResetPassword = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const params = new URLSearchParams(location.search);
    const uid = params.get("uid") || params.get("ui");
    const token = params.get("token");

    const [password, setPassword] = useState("");
    const [passwordConfirm, setPasswordConfirm] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        setMessage("");
        setError("");

        if (password !== passwordConfirm) {
            setError("Passwords do not match.");
            return;
        }

        fetch(`${API_URL}/api/password-reset-confirm/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                uid,
                token,
                password,
                password_confirm: passwordConfirm
            })
        })
        .then(response => response.json().then(data => ({ status: response.status, data })))
        .then(({ status, data }) => {
            if (status >= 400) {
                throw data;
            }

            setMessage(data.message || "Password reset successful.");
            setPassword("");
            setPasswordConfirm("");

            setTimeout(() => navigate("/Login"), 1500);
        })
        .catch(err => {
            const serverError = err?.password || err?.error || "Reset failed. Please try again.";
            setError(serverError);
        });
    };

    return (
        <div className="login-container">
            <h2>Reset Password</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="password"
                    placeholder="New password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Confirm new password"
                    value={passwordConfirm}
                    onChange={(e) => setPasswordConfirm(e.target.value)}
                />
                <button type="submit">Update Password</button>
            </form>
            {!uid || !token ? (
                <p className="error">Invalid or missing reset link.</p>
            ) : null}
            {message && <p className="success">{message}</p>}
            {error && <p className="error">{error}</p>}
        </div>
    );
};

export default ResetPassword;

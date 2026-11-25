import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { API_URL } from "./config";
import toast from "react-hot-toast";

const ResetPassword = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const params = new URLSearchParams(location.search);
    const uid = params.get("uid") || params.get("ui");
    const token = params.get("token");

    const [password, setPassword] = useState("");
    const [passwordConfirm, setPasswordConfirm] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();

        if (password !== passwordConfirm) {
            toast.error("Passwords do not match.");
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
                new_password: passwordConfirm
            })
        })
        .then(response => response.json().then(data => ({ status: response.status, data })))
        .then(({ status, data }) => {
            if (status >= 400) {
                throw data;
            }

            toast.success(data.message || "Password reset successful.");
            setPassword("");
            setPasswordConfirm("");
            setTimeout(() => navigate("/Login"), 1500);
        })
        .catch(err => {
            const serverError = err?.password || err?.error || "Reset failed. Please try again.";
            toast.error(Array.isArray(serverError) ? serverError.join(' ') : serverError);
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
                <button type="submit" disabled={!uid || !token}>Update Password</button>
            </form>
            {(!uid || !token) && (
                <p className="error">Invalid or missing reset link. Please request a new one.</p>
            )}
        </div>
    );
};

export default ResetPassword;

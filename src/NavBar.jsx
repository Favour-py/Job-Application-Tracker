import { NavLink, Link, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";
import { useTheme } from "./context/ThemeContext";

const NavBar = () => {
    const { logout } = useContext(AuthContext);
    const { isDark, toggleTheme } = useTheme();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate("/Login");
    };

    return (
        <div className="NavBar">
            <Link to="/" className="brand-wrap" aria-label="Go to homepage">
                <div className="brand-icon">📁</div>
                <div className="brand-name">Job Application Tracker</div>
                <div className="brand-badge">✦</div>
            </Link>
            <div className="navig">
                <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
                    <span>⌂</span> Home
                </NavLink>
                <NavLink to="/AddApplication" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
                    <span>＋</span> Add Application
                </NavLink>
                <NavLink to="/ViewApplication" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
                    <span>◫</span> View Applications
                </NavLink>
                <NavLink to="/EditProfile" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
                    <span>◔</span> Profile
                </NavLink>
                <button onClick={toggleTheme} className="theme-toggle" style={{ background: "#263141", color: "#fff" }}>
                    {isDark ? "☀️ Light" : "🌙 Dark"}
                </button>
                <button onClick={handleLogout} className="nav-link logout-btn">
                    <span>↩</span> Logout
                </button>
            </div>
        </div>
    );
};

export default NavBar;
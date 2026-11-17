import { NavLink, Link, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";
import { useTheme } from "./context/ThemeContext";
import HomeIcon from "./home-1-svgrepo-com.svg?react";
import AddIcon from "./add-to-queue-svgrepo-com.svg?react";
import ViewIcon from "./view-grid-svgrepo-com.svg?react";
import ProfileIcon from "./profile-round-1342-svgrepo-com.svg?react";
import LogoutIcon from "./logout-2-svgrepo-com.svg?react";

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
                    <HomeIcon className="nav-icon" /> Home
                </NavLink>
                <NavLink to="/AddApplication" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
                    <AddIcon className="nav-icon" /> Add Application
                </NavLink>
                <NavLink to="/ViewApplication" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
                    <ViewIcon className="nav-icon" /> View Applications
                </NavLink>
                <NavLink to="/EditProfile" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
                    <ProfileIcon className="nav-icon" /> Profile
                </NavLink>
                <button onClick={toggleTheme} className="theme-toggle" style={{ background: "#263141", color: "#fff" }}>
                    {isDark ? "☀️ Light" : "🌙 Dark"}
                </button>
                <button onClick={handleLogout} className="nav-link logout-btn">
                    <LogoutIcon className="nav-icon" /> Logout
                </button>
            </div>
        </div>
    );
};

export default NavBar;
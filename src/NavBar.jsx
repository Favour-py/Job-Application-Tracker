import { NavLink, Link, useNavigate } from "react-router-dom";
import { useContext, useState, useEffect } from "react";
import { AuthContext } from "./context/AuthContext";
import { useTheme } from "./context/ThemeContext";
import HomeIcon from "./home-1-svgrepo-com.svg?react";
import AddIcon from "./add-to-queue-svgrepo-com.svg?react";
import ViewIcon from "./view-grid-svgrepo-com.svg?react";
import ProfileIcon from "./profile-round-1342-svgrepo-com.svg?react";
import LogoutIcon from "./logout-2-svgrepo-com.svg?react";
import logoImg from "./JOB_APPLICATION_TRACKER_20261117_024402_0000-removebg-preview.png";

const navLinks = [
    { to: "/", label: "Home", Icon: HomeIcon, end: true },
    { to: "/AddApplication", label: "Add Application", Icon: AddIcon },
    { to: "/ViewApplication", label: "View Applications", Icon: ViewIcon },
    { to: "/EditProfile", label: "Profile", Icon: ProfileIcon },
];

const NavBar = () => {
    const { logout } = useContext(AuthContext);
    const { isDark, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);

    const handleLogout = async () => {
        setMenuOpen(false);
        await logout();
        navigate("/Login");
    };

    // close drawer on route change
    useEffect(() => { setMenuOpen(false); }, [navigate]);

    // lock body scroll when drawer open
    useEffect(() => {
        document.body.style.overflow = menuOpen ? "hidden" : "";
        return () => { document.body.style.overflow = ""; };
    }, [menuOpen]);

    return (
        <>
            <div className="NavBar">
                {/* ── Mobile hamburger ── */}
                <button
                    className="nav-hamburger"
                    onClick={() => setMenuOpen(o => !o)}
                    aria-label={menuOpen ? "Close menu" : "Open menu"}
                >
                    <span className={`ham-bar ${menuOpen ? "open" : ""}`} />
                    <span className={`ham-bar ${menuOpen ? "open" : ""}`} />
                    <span className={`ham-bar ${menuOpen ? "open" : ""}`} />
                </button>

                {/* ── Brand ── */}
                <Link to="/" className="brand-wrap" aria-label="Go to homepage">
                    <img src={logoImg} alt="Job Application Tracker" className="brand-logo" />
                </Link>

                {/* ── Desktop nav ── */}
                <nav className="navig">
                    {navLinks.map(({ to, label, Icon, end }) => (
                        <NavLink
                            key={to}
                            to={to}
                            end={end}
                            className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
                        >
                            <Icon className="nav-icon" />
                            <span>{label}</span>
                        </NavLink>
                    ))}
                </nav>

                {/* ── Desktop right actions ── */}
                <div className="nav-actions">
                    <button onClick={toggleTheme} className="theme-toggle">
                        {isDark ? "☀️" : "🌙"}
                    </button>
                    <button onClick={handleLogout} className="logout-btn">
                        <LogoutIcon className="nav-icon" />
                        <span>Logout</span>
                    </button>
                </div>
            </div>

            {/* ── Mobile overlay ── */}
            <div
                className={`mobile-overlay ${menuOpen ? "visible" : ""}`}
                onClick={() => setMenuOpen(false)}
            />

            {/* ── Mobile drawer ── */}
            <div className={`mobile-drawer ${menuOpen ? "open" : ""}`}>
                <div className="drawer-header">
                    <img src={logoImg} alt="Job Application Tracker" className="drawer-logo" />
                    <button className="drawer-close" onClick={() => setMenuOpen(false)} aria-label="Close menu">
                        ✕
                    </button>
                </div>
                <nav className="drawer-nav">
                    {navLinks.map(({ to, label, Icon, end }, i) => (
                        <NavLink
                            key={to}
                            to={to}
                            end={end}
                            onClick={() => setMenuOpen(false)}
                            className={({ isActive }) => `drawer-link${isActive ? " active" : ""}`}
                            style={{ animationDelay: `${i * 60}ms` }}
                        >
                            <Icon className="nav-icon" />
                            <span>{label}</span>
                        </NavLink>
                    ))}
                </nav>
                <div className="drawer-footer">
                    <button onClick={toggleTheme} className="drawer-theme-btn">
                        {isDark ? "☀️ Light Mode" : "🌙 Dark Mode"}
                    </button>
                    <button onClick={handleLogout} className="drawer-logout-btn">
                        <LogoutIcon className="nav-icon" /> Logout
                    </button>
                </div>
            </div>
        </>
    );
};

export default NavBar;
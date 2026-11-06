import { Link } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";
import { API_URL } from "./config";
import {
    PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, CartesianGrid
} from "recharts";

const statusMap = {
    Applied: "applied",
    Interview: "interview",
    Offer: "offer",
    Declined: "declined",
    Pending: "pending",
};

const STATUS_COLORS = {
    Applied: "#22c55e",
    Interview: "#f59e0b",
    Offer: "#3b82f6",
    Declined: "#ef4444",
    Pending: "#fbbf24",
};

const Home = ({ applications, profile }) => {
    const { accessToken } = useContext(AuthContext);

    const statusCounts = ["Applied", "Interview", "Offer", "Declined", "Pending"].map((status) => ({
        name: status,
        value: applications.filter((app) => app.status === status).length,
    }));

    const monthlyData = applications
        .reduce((acc, app) => {
            const date = app.application_date ? new Date(app.application_date) : new Date();
            const month = date.toLocaleString("default", { month: "short", year: "numeric" });
            const existing = acc.find((entry) => entry.month === month);

            if (existing) {
                existing.count += 1;
            } else {
                acc.push({ month, count: 1 });
            }
            return acc;
        }, [])
        .sort((a, b) => new Date(a.month) - new Date(b.month));

    const successRate = applications.length
        ? ((applications.filter((a) => a.status === "Offer").length / applications.length) * 100).toFixed(1)
        : 0;

    const recentApplications = [...applications]
        .sort((a, b) => new Date(b.application_date) - new Date(a.application_date))
        .slice(0, 3);

    const initials = (profile?.name || "JD")
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

    const totalApplications = applications.length;

    return (
        <div className="home">
            <div className="home-shell">
                <header className="profile-banner">
                    <div className="profile-info">
                        <div className="profile-avatar">
                            {profile?.image_url ? (
                                <img
                                    src={profile.image_url}
                                    alt={profile?.name || "Profile"}
                                />
                            ) : (
                                initials
                            )}
                        </div>
                        <div>
                            <h2 className="profile-name">{profile?.name || "John Doe"}</h2>
                            <p className="profile-title">{profile?.title || "Software Engineer"}</p>
                        </div>
                    </div>

                    <Link to="/EditProfile" className="edit-profile-button">
                        Edit Profile
                    </Link>
                </header>

                <section className="summary-row">
                    <div className="summary-card total">
                        <span className="summary-label">Total Applications</span>
                        <span className="summary-number">{totalApplications}</span>
                    </div>

                    {statusCounts.map(({ name, value }) => (
                        <div key={name} className={`summary-card ${name.toLowerCase()}`}>
                            <span className="summary-label">{name}</span>
                            <span className="summary-number" style={{ color: STATUS_COLORS[name] }}>
                                {value}
                            </span>
                        </div>
                    ))}
                </section>

                <section className="charts">
                    <div className="chart-box">
                        <h3>Applications by Status</h3>
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={statusCounts}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    label={({ name, value }) => (value > 0 ? `${name}: ${value}` : "")}
                                >
                                    {statusCounts.map((entry) => (
                                        <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || "#4f86f7"} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="chart-box">
                        <h3>Applications Over Time</h3>
                        {monthlyData.length === 0 ? (
                            <p className="no-data">No data yet.</p>
                        ) : (
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={monthlyData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(125, 135, 155, 0.4)" />
                                    <XAxis dataKey="month" stroke="var(--text-soft)" />
                                    <YAxis allowDecimals={false} stroke="var(--text-soft)" />
                                    <Tooltip />
                                    <Bar dataKey="count" fill="#f15ab3" name="Applications" radius={[8, 8, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </section>

                <div className="applications-header">
                    <h3 className="section-title">My Applications</h3>
                    <Link to="/AddApplication" className="add-application-button">
                        + Add Application
                    </Link>
                </div>

                <section className="applications-grid">
                    {recentApplications.length > 0 ? (
                        recentApplications.map((app) => (
                            <article className="application-card" key={app.id || app.company + app.title}>
                                <div className="app-top-row">
                                    <h4 className="app-title">{app.title || "Untitled Role"}</h4>
                                    <span className={`status-pill ${statusMap[app.status] || "applied"}`}>
                                        {app.status || "Applied"}
                                    </span>
                                </div>

                                <div className="app-meta">
                                    <div className="meta-item">
                                        <span>💼</span>
                                        <span>{app.company || "Company"}</span>
                                    </div>
                                    <div className="meta-item">
                                        <span>📍</span>
                                        <span>{app.location || "Remote"}</span>
                                    </div>
                                    <div className="meta-item">
                                        <span>📅</span>
                                        <span>
                                            Applied: {app.application_date ? new Date(app.application_date).toLocaleDateString("en-CA") : "N/A"}
                                        </span>
                                    </div>
                                </div>

                                                {app.notes && (
                                    <p className="app-summary">{app.notes}</p>
                                )}
                            </article>
                        ))
                    ) : (
                        <article className="application-card empty-card">
                            <h4 className="app-title">No applications yet</h4>
                            <p className="app-summary">Add your first job application to start tracking your progress.</p>
                        </article>
                    )}
                </section>
            </div>
        </div>
    );
};

export default Home;

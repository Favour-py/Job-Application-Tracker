import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";

const statusClassMap = {
    Applied: "applied",
    Interview: "interview",
    Offer: "offer",
    Declined: "declined",
    Pending: "pending",
};

const ViewApplication = ({ applications }) => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");
    const [status, setStatus] = useState("");

    const filteredApplications = applications.filter((application) => {
        const matchesSearch = application.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = status === "" || application.status?.toLowerCase() === status.toLowerCase();
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="ViewApplication">
            <div className="page-action-row">
                <button onClick={() => navigate('/')}>Go Home</button>
            </div>

            <h2>View All Applications</h2>

            <div className="view-filters">
                <input
                    type="text"
                    placeholder="Search by job title..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <select value={status} onChange={(e) => setStatus(e.target.value)}>
                    <option value="">All Statuses</option>
                    <option value="Applied">Applied</option>
                    <option value="Pending">Pending</option>
                    <option value="Interview">Interview</option>
                    <option value="Declined">Declined</option>
                    <option value="Offer">Offer</option>
                </select>
            </div>

            {applications.length === 0 ? (
                <article className="application-card empty-card">
                    <h4 className="app-title">No applications yet</h4>
                    <p className="app-summary">Add your first job application to start tracking your progress.</p>
                </article>
            ) : filteredApplications.length === 0 ? (
                <article className="application-card empty-card">
                    <h4 className="app-title">No matches found</h4>
                    <p className="app-summary">Try adjusting your search or filter.</p>
                </article>
            ) : (
                <div className="applications-grid view-grid">
                    {filteredApplications.map((application) => (
                        <article className="application-card" key={application.id}>
                            <div className="app-top-row">
                                <h4 className="app-title">{application.title}</h4>
                                <span className={`status-pill ${statusClassMap[application.status] || "applied"}`}>
                                    {application.status}
                                </span>
                            </div>
                            <div className="app-meta">
                                <div className="meta-item"><span>💼</span><span>{application.company}</span></div>
                                <div className="meta-item"><span>📍</span><span>{application.location}</span></div>
                                <div className="meta-item"><span>📅</span><span>{application.application_date}</span></div>
                            </div>
                            {application.notes && <p className="app-summary">{application.notes}</p>}
                            <Link to={`/ApplicationDetails/${application.id}`} className="detail-link">View Details →</Link>
                        </article>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ViewApplication;

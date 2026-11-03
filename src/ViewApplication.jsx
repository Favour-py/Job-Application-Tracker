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
        const matchesSearch = application.title
            .toLowerCase()
            .includes(searchTerm.toLowerCase());

        const matchesStatus = status === "" || application.status?.toLowerCase() === status.toLowerCase();

        return matchesSearch && matchesStatus;
    });

    return (
        <div className="ViewApplication">
            <div className="go-home-btn"><button onClick={() => navigate('/')}>Go Home</button></div>
            <div className="go-back"><button onClick={() => navigate(-1)}>Go Back</button></div>

            <h2>View All Applications</h2>

            <label>Search by Job Title</label>
            <input
                type="text"
                placeholder="Search applications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />

            <label>Filter by Status</label>
            <select name="status" id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
            >
                <option value="">All</option>
                <option value="Applied">Applied</option>
                <option value="Pending">Pending</option>
                <option value="Interview">Interview</option>
                <option value="Declined">Declined</option>
                <option value="Offer">Offer</option>
            </select>

            {applications.length === 0 ? (
                <p>You haven't added any applications yet. <Link to="/AddApplication">Add one now!</Link></p>
            ) : filteredApplications.length === 0 ? (
                <p>No applications matched your search query!</p>
            ) : (
                filteredApplications.map((application) => (
                    <div className="application-list" key={application.id}>
                        <div className="app-row">
                            <p className="title">{application.title}</p>
                            <span className={`status-pill ${statusClassMap[application.status] || "applied"}`}>
                                {application.status}
                            </span>
                        </div>

                        <div className="meta">
                            <p><strong>Company:</strong> {application.company}</p>
                            <p><strong>Location:</strong> {application.location}</p>
                            <p><strong>Date:</strong> {application.application_date}</p>
                        </div>

                        {application.url && <p><strong>URL:</strong> {application.url}</p>}
                        {application.notes && <p><strong>Notes:</strong> {application.notes}</p>}

                        <Link to={`/ApplicationDetails/${application.id}`} className="detail-link">View Details</Link>
                    </div>
                ))
            )}
        </div>
    );
};

export default ViewApplication;
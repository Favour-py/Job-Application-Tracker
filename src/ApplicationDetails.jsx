import { useParams, useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import { AuthContext } from "./context/AuthContext";
import { fetchWithAuth } from "./api";
import { API_URL } from "./config";


const ApplicationDetails = ({applications, setApplications}) => {
    const navigate = useNavigate();
    const { accessToken, setAccessToken } = useContext(AuthContext);
    const [error, setError] = useState("");
    const [deleting, setDeleting] = useState(false);

    const { id } = useParams()
    const application = applications.find(application => application.id === Number(id)
    )
    if (!application) {
        return <h2>Application not Found!</h2>
    }

    const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this application?")) return;
    setError("");
    setDeleting(true);
    try {
        await fetchWithAuth(
            `${API_URL}/api/applications/${application.id}/`,
            { method: "DELETE" },
            accessToken,
            setAccessToken
        );
        setApplications(applications.filter((app) => app.id !== application.id));
        navigate('/ViewApplication');
    } catch (err) {
        setError("Failed to delete application. Please try again.");
    } finally {
        setDeleting(false);
    }
};


    return ( 
        <div className="ApplicationDetails">
            <div className="action-buttons">
                <div className="go-home-btn"><button onClick={() => navigate('/')}>Go Home</button></div>
                <div className="go-back"><button onClick={() => navigate(-1)}>Go Back</button></div>
                <div className="edit-btn"><button onClick={() => navigate(`/ApplicationDetails/${application.id}/edit`)}>Edit Application</button></div>
                <div className="delete-btn"><button onClick={handleDelete} disabled={deleting}>{deleting ? "Deleting..." : "Delete"}</button></div>
            </div>
            <h2>Application Details</h2>
            <div className="detail-card">
                <div className="detail-row">
                    <span className="detail-label">Job Title</span>
                    <span className="detail-value">{application.title}</span>
                </div>
                <div className="detail-row">
                    <span className="detail-label">Company</span>
                    <span className="detail-value">{application.company}</span>
                </div>
                <div className="detail-row">
                    <span className="detail-label">Location</span>
                    <span className="detail-value">{application.location}</span>
                </div>
                <div className="detail-row">
                    <span className="detail-label">Status</span>
                    <span className={`status-badge status-${application.status}`}>{application.status}</span>
                </div>
                <div className="detail-row">
                    <span className="detail-label">Date Applied</span>
                    <span className="detail-value">{application.application_date}</span>
                </div>
                {application.url && (
                    <div className="detail-row">
                        <span className="detail-label">Job URL</span>
                        <a href={application.url} target="_blank" rel="noreferrer" className="detail-value">{application.url}</a>
                    </div>
                )}
                {application.notes && (
                    <div className="detail-row">
                        <span className="detail-label">Notes</span>
                        <span className="detail-value">{application.notes}</span>
                    </div>
                )}
                {application.job_description && (
                    <div className="detail-row">
                        <span className="detail-label">Job Description</span>
                        <span className="detail-value">{application.job_description}</span>
                    </div>
                )}
            </div>
            {error && <p className="toast toast-error">{error}</p>}
        </div>
     );
}
 
export default ApplicationDetails;
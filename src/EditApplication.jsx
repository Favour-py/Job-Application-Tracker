import { useState, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "./context/AuthContext";
import { fetchWithAuth } from "./api";
import { API_URL } from "./config";

const EditApplication = ({ applications, setApplications }) => {
    const { id } = useParams();
    const application = applications.find((application) => application.id === Number(id));
    const { accessToken, setAccessToken } = useContext(AuthContext);
    const navigate = useNavigate();
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const [title, setTitle] = useState(application.title);
    const [company, setCompany] = useState(application.company);
    const [location, setLocation] = useState(application.location);
    const [status, setStatus] = useState(application.status);
    const [applicationDate, setApplicationDate] = useState(application.application_date);
    const [jobUrl, setJobUrl] = useState(application.url);
    const [notes, setNotes] = useState(application.notes);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSubmitting(true);
        try {
            const updatedApplication = { title, company, location, status, application_date: applicationDate, url: jobUrl, notes };
            const updatedApplicationFromServer = await fetchWithAuth(
                `${API_URL}/api/applications/${application.id}/`,
                {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(updatedApplication)
                },
                accessToken,
                setAccessToken
            );
            setApplications(applications.map((app) =>
                app.id === updatedApplicationFromServer.id ? updatedApplicationFromServer : app
            ));
            navigate(`/ApplicationDetails/${application.id}`);
        } catch (err) {
            setError("Failed to update application. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="EditApplication">
            <div className="back-btn"><button onClick={() => navigate(-1)}>Back</button></div>
            <h2>Edit Application</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Title:</label>
                    <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
                </div>
                <div className="form-group">
                    <label>Company:</label>
                    <input type="text" value={company} onChange={(e) => setCompany(e.target.value)} />
                </div>
                <div className="form-group">
                    <label>Location:</label>
                    <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} />
                </div>
                <div className="form-group">
                    <label>Status:</label>
                    <select value={status} onChange={(e) => setStatus(e.target.value)}>
                        <option value="Applied">Applied</option>
                        <option value="Interview">Interview</option>
                        <option value="Offer">Offer</option>
                        <option value="Declined">Declined</option>
                        <option value="Pending">Pending</option>
                    </select>
                </div>
                <div className="form-group">
                    <label>Application Date:</label>
                    <input type="date" value={applicationDate} onChange={(e) => setApplicationDate(e.target.value)} />
                </div>
                <div className="form-group">
                    <label>Job URL:</label>
                    <input type="url" value={jobUrl} onChange={(e) => setJobUrl(e.target.value)} />
                </div>
                <div className="form-group">
                    <label>Notes:</label>
                    <textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
                </div>
                <button type="submit" disabled={submitting}>
                    {submitting ? "Saving..." : "Save Changes"}
                </button>
            </form>
            {error && <p className="toast toast-error">{error}</p>}
        </div>
    );
}

export default EditApplication;

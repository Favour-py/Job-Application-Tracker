import { useNavigate } from "react-router-dom";
import { useState, useContext } from "react";
import { AuthContext } from "./context/AuthContext";
import { fetchWithAuth } from "./api";
import { API_URL } from "./config";

const AddApplication = ({setApplications}) => {

    const [title, setTitle] = useState("");
    const [company, setCompany] = useState("");
    const [location, setLocation] = useState("");
    const [status, setStatus] = useState("Applied");
    const [applicationDate, setApplicationDate] = useState("");
    const [jobUrl, setJobUrl] = useState("");
    const [notes, setNotes] = useState("");
    const [jobDescription, setJobDescription] = useState("");
    const [extractUrl, setExtractUrl] = useState("");
    const [extracting, setExtracting] = useState(false);
    const [extractError, setExtractError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const { accessToken, setAccessToken } = useContext(AuthContext);
    const navigate = useNavigate();
    const [error, setError] = useState("");

    const handleExtract = async () => {
        if (!extractUrl) return;
        setExtracting(true);
        setExtractError("");
        try {
            const data = await fetchWithAuth(
                `${API_URL}/api/extract-job/`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ url: extractUrl })
                },
                accessToken,
                setAccessToken
            );
            if (data.title) setTitle(data.title);
            if (data.company) setCompany(data.company);
            if (data.location) setLocation(data.location);
            if (data.description) setJobDescription(data.description);
            setJobUrl(extractUrl);
        } catch (err) {
            setExtractError("Failed to extract job details. Try again or fill in manually.");
        } finally {
            setExtracting(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSubmitting(true);
        const newApplication = { title, company, location, status, application_date: applicationDate, url: jobUrl, notes, job_description: jobDescription };
        try {
            const createdApplication = await fetchWithAuth(
                `${API_URL}/api/applications/`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(newApplication)
                },
                accessToken,
                setAccessToken
            );
            setApplications(prevApplications => [...prevApplications, createdApplication]);
            navigate('/ViewApplication');
        } catch (err) {
            setError("Failed to add application. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    return ( 
        <div className="AddApplication">
            <div className="go-home-btn"><button onClick={() => navigate('/')}>Go Home</button></div>
            <h2>Add Application</h2>

            <div className="extract-section">
                <label>Paste Job URL to Auto-fill:</label>
                <input type="text" value={extractUrl} onChange={(e) => setExtractUrl(e.target.value)} placeholder="https://example.com/job/..." />
                <button type="button" onClick={handleExtract} disabled={extracting}>
                    {extracting ? "Extracting..." : "Extract with AI"}
                </button>
                {extractError && <p className="toast toast-error">{extractError}</p>}
            </div>

            <form onSubmit={handleSubmit}>
                <label>Job Title: </label>
                <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} />
                <label>Company: </label>
                <input type="text" required value={company} onChange={(e) => setCompany(e.target.value)} />
                <label>Location: </label>
                <input type="text" required value={location} onChange={(e) => setLocation(e.target.value)} />
                <label>Status: </label>
                <select required value={status} onChange={(e) => setStatus(e.target.value)}>
                    <option value="Applied">Applied</option>
                    <option value="Declined">Declined</option>
                    <option value="Interview">Interview</option>
                    <option value="Offer">Offer</option>
                    <option value="Pending">Pending</option>
                </select>
                <label>Application Date: </label>
                <input type="date" required value={applicationDate} onChange={(e) => setApplicationDate(e.target.value)} />
                <label>Job Url: </label>
                <input type="text" value={jobUrl} onChange={(e) => setJobUrl(e.target.value)} />
                <label>Notes: </label>
                <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} />
                <label>Job Description: </label>
                <textarea value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} />
                <button type="submit" disabled={submitting}>
                    {submitting ? "Adding..." : "Add Application"}
                </button>
            </form>
            {error && <p className="toast toast-error">{error}</p>}
        </div>
     );
}
 
export default AddApplication;

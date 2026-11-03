import { Link } from "react-router-dom";

const Applications = ({ applications }) => {
    return ( 
        <div className="Applications">
            <h2>My Applications</h2>
            {applications.map(application => (
                <div key={application.id}>
                    <p>{application.title}</p>
                    <p>{application.company}</p>
                    <p>{application.location}</p>
                    <p>{application.status}</p>
                    <p>{application.application_date}</p>
                    <Link to={`/ApplicationDetails/${application.id}`}>Application Details</Link>
                </div>
            ))}
        </div>
     );
}
 
export default Applications;

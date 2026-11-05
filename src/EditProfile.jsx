import { useNavigate } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import { AuthContext } from "./context/AuthContext";
import { fetchWithAuth } from "./api";
import { API_URL } from "./config";

const getImageSrc = (image, image_url) => {
    if (image instanceof File) return URL.createObjectURL(image);
    return image_url || null;
};

const EditProfile = ({profile, setProfile}) => {

    const [name, setName] = useState(profile.name);
    const [title, setTitle] = useState(profile.title);
    const [image, setImage] = useState(null);

    const navigate = useNavigate();
    const { accessToken, setAccessToken } = useContext(AuthContext);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    
    useEffect(() => {
        setName(profile.name);
        setTitle(profile.title);
        setImage(null);
    }, [profile])

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!accessToken) {
            navigate("/Login");
            return;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append("name", name);
        formData.append("title", title);

        if (image instanceof File) {
            formData.append("image", image);
        }

        const url = profile.id
            ? `${API_URL}/api/profiles/${profile.id}/`
            : `${API_URL}/api/profiles/`;
        const method = profile.id ? 'PATCH' : 'POST';

        try {
            const data = await fetchWithAuth(
                url,
                {
                    method,
                    body: formData,
                },
                accessToken,
                setAccessToken
            );
            setProfile(data);
            navigate('/');
        } catch (err) {
            setError("Failed to save profile. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    const handleDelete = async () => {
        if (!accessToken) {
            navigate("/Login");
            return;
        }

        try {
            await fetchWithAuth(
                `${API_URL}/api/profiles/${profile.id}/`,
                { method: 'DELETE' },
                accessToken,
                setAccessToken
            );
            setProfile({ name: "", title: "", image: "" });
            navigate('/');
        } catch (error) {
            setError("Failed to delete profile. Please try again.");
        }
    }

    return ( 
        <div className="EditProfileContainer">
            <div className="EditProfile">
                <div className="go-home-btn"><button onClick={() => navigate('/')}>Go Home</button></div>
                <h2>{profile.id ? "Set up your Profile" : "Create your Profile"}</h2>
                
                <form onSubmit={handleSubmit}>
                    <label>Name: </label>
                    <input type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    <label>Title: </label>
                    <input type="text"
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                    <label>Profile Image:</label>

                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                            if (e.target.files[0]) setImage(e.target.files[0])
                        }}
                    />

                    {(image || profile.image_url) && (
                        <div className="profile-image-preview-wrap">
                            <img
                                src={getImageSrc(image, profile.image_url)}
                                alt="Profile preview"
                                className="profile-image-preview"
                            />
                        </div>
                    )}

                    <button type="submit" disabled={loading}>
                        {loading ? "Saving..." : (profile.id ? "Update Profile" : "Create Profile")}
                    </button>
                </form>
                {error && <p className="error">{error}</p>}
                {profile.id && (
                    <button onClick={handleDelete}>Delete Profile</button>
                )}
            </div>
        </div>
     );
}
 
export default EditProfile;

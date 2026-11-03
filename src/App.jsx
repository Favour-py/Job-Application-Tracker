import { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom'; 
import './App.css';
import NavBar from './NavBar';
import Home from './Home';
import EditProfile from './EditProfile';
import NotFound from './NotFound';
import AddApplication from './AddApplication';
import ApplicationDetails from './ApplicationDetails';
import ViewApplication from './ViewApplication';
import EditApplication from './EditApplication';
import Signup from './Signup';
import Login from "./Login";
import ProtectedRoute from "./ProtectedRoute";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";
import { fetchWithAuth } from "./api";
import ForgotPassword from './ForgotPassword';
import ResetPassword from './ResetPassword';
import { API_URL } from "./config";

function AppShell() {
  const location = useLocation();
  const hideNav = ["/login", "/signup", "/forgot-password", "/reset-password"].includes(location.pathname.toLowerCase());
  const [applications, setApplications] = useState([]);
  const { accessToken, setAccessToken } = useContext(AuthContext);
  const userProfileUrl = `${API_URL}/api/profiles/`;

  useEffect(() => {
    if (!accessToken) {
      setApplications([]);
      setProfile({ name: "", title: "", image: "" });
      return;
    }

    fetchWithAuth(userProfileUrl, {}, accessToken, setAccessToken)
      .then(data => {
        if (data.length > 0) setProfile(data[0]);
      })
      .catch(error => console.log(error));

    fetchWithAuth(`${API_URL}/api/applications/`, {}, accessToken, setAccessToken)
      .then(data => setApplications(data))
      .catch(error => console.log(error));

  }, [accessToken]);

  const [profile, setProfile] = useState({
    name: "",
    title: "",
    image: ""
  });

  return (
    <div className={`App ${hideNav ? 'auth-layout' : 'app-layout'}`}>
      {!hideNav && <NavBar />}
      <Routes>
        <Route path="/Signup" element={<Signup />} />
        <Route path="/Login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/" element={
          <ProtectedRoute>
            <Home applications={applications} profile={profile} setProfile={setProfile} setApplications={setApplications} />
          </ProtectedRoute>
        } /> 
        <Route path="/AddApplication" element={
          <ProtectedRoute>
            <AddApplication setApplications = {setApplications} />
          </ProtectedRoute>
        } />
        <Route path="/ViewApplication" element={
          <ProtectedRoute>
            <ViewApplication applications = {applications} setApplications={setApplications}/>
          </ProtectedRoute>
        } />
        <Route path="/EditProfile" element={
          <ProtectedRoute>
            <EditProfile 
            profile={profile}
            setProfile={setProfile} />
          </ProtectedRoute>
        }/>
        <Route path="/ApplicationDetails/:id" element={
          <ProtectedRoute>
            <ApplicationDetails applications={applications} setApplications={setApplications} />
          </ProtectedRoute>
        } />
        <Route path="/ApplicationDetails/:id/edit" 
          element={
            <ProtectedRoute>
              <EditApplication applications={applications} setApplications={setApplications} />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppShell />
    </Router>
  );
}

export default App;

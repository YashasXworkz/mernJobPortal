import { BrowserRouter as Router, Navigate, Route, Routes } from "react-router-dom";
import { Container } from "react-bootstrap";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthProvider } from "./contexts/AuthContext.jsx";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import Home from "./components/Home.jsx";
import Login from "./components/Login.jsx";
import Register from "./components/Register.jsx";
import Jobs from "./components/Jobs.jsx";
import JobDetails from "./components/JobDetails.jsx";
import PostJob from "./components/PostJob.jsx";
import EditJob from "./components/EditJob.jsx";
import Applications from "./components/Applications.jsx";
import MyApplications from "./components/MyApplications.jsx";
import Profile from "./components/Profile.jsx";
import AdminPanel from "./components/AdminPanel.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App min-vh-100 d-flex flex-column">
          <Header />
          <main className="flex-grow-1">
            <Container fluid className="py-4">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/jobs" element={<Jobs />} />
                <Route path="/jobs/:id" element={<JobDetails />} />
                <Route
                  path="/post-job"
                  element={
                    <ProtectedRoute requiredRole="employer">
                      <PostJob />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/edit-job/:id"
                  element={
                    <ProtectedRoute requiredRole="employer">
                      <EditJob />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/applications"
                  element={
                    <ProtectedRoute requiredRole="employer">
                      <Applications />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/my-applications"
                  element={
                    <ProtectedRoute requiredRole="jobseeker">
                      <MyApplications />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute>
                      <AdminPanel />
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </Container>
          </main>
          <Footer />
        </div>

        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
        />
      </Router>
    </AuthProvider>
  );
}

export default App;

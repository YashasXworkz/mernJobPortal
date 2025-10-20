import { BrowserRouter as Router, Navigate, Route, Routes } from "react-router-dom";
import { Container } from "react-bootstrap";
import { Toaster } from "react-hot-toast";
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

        <Toaster
          position="top-center"
          reverseOrder={false}
          gutter={8}
          toastOptions={{
            duration: 3000,
            style: {
              background: 'rgba(15, 23, 42, 0.95)',
              color: '#f1f5f9',
              border: '1px solid rgba(148, 163, 184, 0.2)',
              borderRadius: '12px',
              backdropFilter: 'blur(16px)',
              padding: '16px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
            },
            success: {
              iconTheme: {
                primary: '#34d399',
                secondary: '#0f172a',
              },
            },
            error: {
              iconTheme: {
                primary: '#f87171',
                secondary: '#0f172a',
              },
            },
          }}
        />
      </Router>
    </AuthProvider>
  );
}

export default App;

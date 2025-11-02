import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import { useAuth } from "../contexts/AuthContext.jsx";
import { Badge, Button, Card, Col, Container, Modal, Row, Table } from "react-bootstrap";
import toast from "react-hot-toast";
import LoadingSpinner from "./shared/LoadingSpinner.jsx";
import { formatDate } from "../lib/utils.js";

const AdminPanel = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalJobseekers: 0,
    totalEmployers: 0,
    totalJobs: 0,
    totalApplications: 0,
    activeJobs: 0,
  });

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/");
      return;
    }

    fetchDashboardData();
  }, [user, navigate]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const [statsResponse, usersResponse] = await Promise.all([
        api.get("/api/admin/stats"),
        api.get("/api/admin/users"),
      ]);

      const { stats: adminStats, recentJobs } = statsResponse.data;
      setStats(adminStats);
      setJobs(recentJobs || []);
      setUsers(usersResponse.data.users || []);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to fetch dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      await api.delete(`/api/admin/users/${userToDelete._id}`);
      setUsers((prev) => prev.filter((u) => u._id !== userToDelete._id));
      const updatedUsers = users.filter((u) => u._id !== userToDelete._id);
      setStats((prev) => ({
        ...prev,
        totalUsers: updatedUsers.length,
        totalJobseekers: updatedUsers.filter((u) => u.role === "jobseeker").length,
        totalEmployers: updatedUsers.filter((u) => u.role === "employer").length,
      }));
      toast.success("User deleted successfully");
      setShowDeleteModal(false);
      setUserToDelete(null);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to delete user.");
    }
  };

  const confirmDeleteUser = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const getRoleBadge = (role) => {
    const variants = {
      jobseeker: "info",
      employer: "success",
      admin: "primary",
    };
    return <Badge bg={variants[role] || "secondary"}>{role}</Badge>;
  };

  if (!user || user.role !== "admin") {
    return (
      <Container className="py-5">
        <div className="text-center text-danger fw-semibold">Access Denied. Admin privileges required.</div>
      </Container>
    );
  }

  if (loading) {
    return <LoadingSpinner message="Loading admin dashboard..." />;
  }

  return (
    <Container className="py-4">
      {/* Dashboard Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
        <div>
          <h1 className="h2 fw-bold gradient-text mb-1">
            <i className="fas fa-shield-alt me-2"></i>
            Admin Dashboard
          </h1>
          <p className="text-muted mb-0">Manage users, jobs, and applications</p>
        </div>
        <Badge bg="primary" className="status-pill fs-6">
          <i className="fas fa-crown me-2"></i>
          Administrator
        </Badge>
      </div>

      {/* Stats Cards */}
      <Row className="g-4 mb-4">
        <Col md={2}>
          <Card className="glass-panel border-0 text-center">
            <Card.Body className="py-4">
              <div className="mb-2">
                <i className="fas fa-users fa-2x text-primary"></i>
              </div>
              <h4 className="mb-1">{stats.totalUsers}</h4>
              <small className="text-muted">Total Users</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={2}>
          <Card className="glass-panel border-0 text-center">
            <Card.Body className="py-4">
              <div className="mb-2">
                <i className="fas fa-user-tie fa-2x text-info"></i>
              </div>
              <h4 className="mb-1">{stats.totalJobseekers}</h4>
              <small className="text-muted">Job Seekers</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={2}>
          <Card className="glass-panel border-0 text-center">
            <Card.Body className="py-4">
              <div className="mb-2">
                <i className="fas fa-building fa-2x text-success"></i>
              </div>
              <h4 className="mb-1">{stats.totalEmployers}</h4>
              <small className="text-muted">Employers</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={2}>
          <Card className="glass-panel border-0 text-center">
            <Card.Body className="py-4">
              <div className="mb-2">
                <i className="fas fa-briefcase fa-2x text-warning"></i>
              </div>
              <h4 className="mb-1">{stats.totalJobs}</h4>
              <small className="text-muted">Total Jobs</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={2}>
          <Card className="glass-panel border-0 text-center">
            <Card.Body className="py-4">
              <div className="mb-2">
                <i className="fas fa-check-circle fa-2x text-success"></i>
              </div>
              <h4 className="mb-1">{stats.activeJobs}</h4>
              <small className="text-muted">Active Jobs</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={2}>
          <Card className="glass-panel border-0 text-center">
            <Card.Body className="py-4">
              <div className="mb-2">
                <i className="fas fa-file-alt fa-2x text-info"></i>
              </div>
              <h4 className="mb-1">{stats.totalApplications}</h4>
              <small className="text-muted">Applications</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Users Management */}
      <Card className="glass-panel border-0 mb-4">
        <Card.Body className="p-4">
          <h5 className="gradient-text mb-3">
            <i className="fas fa-users me-2"></i>
            User Management
          </h5>

          {users.length > 0 ? (
            <div className="table-responsive">
              <Table hover className="dashboard-table align-middle">
                <thead>
                  <tr>
                    <th style={{ width: "26%" }}>Name</th>
                    <th style={{ width: "28%" }}>Email</th>
                    <th style={{ width: "15%" }}>Role</th>
                    <th style={{ width: "18%" }}>Joined</th>
                    <th className="text-end" style={{ width: "13%" }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user._id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <div>
                            <div className="fw-semibold">{user.name}</div>
                            {user.phone && <small className="text-muted">{user.phone}</small>}
                          </div>
                        </div>
                      </td>
                      <td>{user.email}</td>
                      <td>{getRoleBadge(user.role)}</td>
                      <td>{formatDate(user.createdAt)}</td>
                      <td className="text-end">
                        <Button variant="danger" size="sm" onClick={() => confirmDeleteUser(user)}>
                          <i className="fas fa-trash me-1"></i>
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-5">
              <i className="fas fa-database fa-3x text-muted mb-3"></i>
              <h5 className="text-muted">No users found</h5>
              <p className="text-muted mb-2">Add new employers or job seekers to populate this list.</p>
              <small className="text-muted">Seed the database or invite users to get started.</small>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Recent Jobs */}
      <Card className="glass-panel border-0 mb-4">
        <Card.Body className="p-4">
          <h5 className="gradient-text mb-3">
            <i className="fas fa-briefcase me-2"></i>
            Recent Jobs
          </h5>

          {jobs.length > 0 ? (
            <div className="table-responsive">
              <Table hover className="dashboard-table align-middle">
                <thead>
                  <tr>
                    <th style={{ width: "22%" }}>Title</th>
                    <th style={{ width: "24%" }}>Company</th>
                    <th style={{ width: "20%" }}>Location</th>
                    <th style={{ width: "12%" }}>Type</th>
                    <th style={{ width: "12%" }}>Status</th>
                    <th className="text-end" style={{ width: "10%" }}>
                      Posted
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.slice(0, 10).map((job) => (
                    <tr key={job._id}>
                      <td className="fw-semibold">{job.title}</td>
                      <td>{job.company}</td>
                      <td>{job.location}</td>
                      <td>
                        <Badge bg="info" className="text-capitalize">
                          {job.type}
                        </Badge>
                      </td>
                      <td>
                        <Badge bg={job.status === "active" ? "success" : "secondary"} className="text-capitalize">
                          {job.status || "active"}
                        </Badge>
                      </td>
                      <td className="text-end">{formatDate(job.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-5">
              <i className="fas fa-briefcase fa-3x text-muted mb-3"></i>
              <h5 className="text-muted">No jobs found</h5>
              <p className="text-muted mb-2">Create or import job listings to see them appear here.</p>
              <small className="text-muted">Use the employer dashboard to post new openings.</small>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Delete User Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} size="sm" className="delete-modal">
        <div className="glass-panel border-0 rounded-4 delete-modal-content">
          <Modal.Header closeButton className="border-0 pb-0">
            <Modal.Title className="gradient-text fw-bold">
              <i className="fas fa-exclamation-triangle me-2"></i>
              Confirm Delete
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="border-0">
            <p>
              Are you sure you want to delete user <strong>{userToDelete?.name}</strong>?
            </p>
            <p className="text-muted small">This action cannot be undone and will remove all associated data.</p>
          </Modal.Body>
          <Modal.Footer className="border-0 pt-0">
            <div className="d-flex gap-3 w-100 justify-content-end">
              <Button 
                variant="outline-light" 
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded-3"
              >
                Cancel
              </Button>
              <Button 
                variant="danger" 
                onClick={handleDeleteUser}
                className="px-4 py-2 rounded-3"
              >
                <i className="fas fa-trash me-2"></i>
                Delete User
              </Button>
            </div>
          </Modal.Footer>
        </div>
      </Modal>
    </Container>
  );
};

export default AdminPanel;

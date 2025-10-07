import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../lib/api";
import { useAuth } from "../contexts/AuthContext.jsx";
import {
  Badge,
  Button,
  Card,
  Col,
  Container,
  Form,
  InputGroup,
  Modal,
  Pagination,
  Row,
  Spinner,
} from "react-bootstrap";
import { toast } from "react-toastify";

const initialFilters = {
  search: "",
  location: "",
  type: "",
  experience: "",
};

const statusVariants = {
  active: "success",
  inactive: "secondary",
  expired: "danger",
  filled: "info",
};

const Jobs = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState(initialFilters);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [jobToDelete, setJobToDelete] = useState(null);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const params = {
          page,
          limit: 10,
        };

        Object.entries(filters).forEach(([key, value]) => {
          if (value) {
            params[key] = value;
          }
        });

        const response = await api.get("/api/jobs", { params });
        setJobs(response.data.jobs);
        setTotalPages(response.data.totalPages || 1);
      } catch (err) {
        toast.error(err.response?.data?.error || "Failed to fetch jobs");
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [filters, page]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
    setPage(1);
  };

  const handleSearch = (event) => {
    event.preventDefault();
    setPage(1);
  };

  const clearFilters = () => {
    setFilters(initialFilters);
    setPage(1);
  };

  const formatSalary = (salary) => {
    if (!salary) {
      return null;
    }

    if (salary.min != null && salary.max != null) {
      return `₹${salary.min.toLocaleString()} - ₹${salary.max.toLocaleString()}`;
    } else if (salary.min != null) {
      return `From ₹${salary.min.toLocaleString()}`;
    } else if (salary.max != null) {
      return `Up to ₹${salary.max.toLocaleString()}`;
    }

    return null;
  };

  const handleEditJob = (jobId) => {
    navigate(`/edit-job/${jobId}`);
  };

  const handleDeleteJob = (job) => {
    setJobToDelete(job);
    setShowDeleteModal(true);
  };

  const confirmDeleteJob = async () => {
    try {
      await api.delete(`/api/jobs/${jobToDelete._id}`);
      toast.success("Job deleted successfully");
      // Refresh the jobs list
      const params = {
        page,
        limit: 10,
      };

      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          params[key] = value;
        }
      });

      const response = await api.get("/api/jobs", { params });
      setJobs(response.data.jobs);
      setTotalPages(response.data.totalPages || 1);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to delete job");
    } finally {
      setShowDeleteModal(false);
      setJobToDelete(null);
    }
  };

  const paginationItems = useMemo(() => {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }, [totalPages]);

  // Check if user is an employer
  const isEmployer = user && user.role === "employer";

  // Check if the current user is the owner of a job
  const isJobOwner = (job) => {
    // Check if user and job data exist
    if (!user || !job.postedBy) {
      return false;
    }

    // Make sure both IDs are strings for comparison
    // Note: Backend returns 'id' for users but '_id' for MongoDB documents
    const jobOwnerId = job.postedBy && job.postedBy._id ? job.postedBy._id.toString() : null;
    const currentUserId = user.id ? user.id.toString() : null; // Use 'id' not '_id'

    return isEmployer && jobOwnerId && currentUserId && jobOwnerId === currentUserId;
  };

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h2 fw-bold gradient-text">Job Listings</h1>
        <div className="d-flex align-items-center gap-3">
          <Badge bg="primary" className="fs-6">
            {jobs.length} jobs found
          </Badge>
          {isEmployer && (
            <Badge bg="success">
              <i className="fas fa-briefcase me-1"></i>
              Employer View
            </Badge>
          )}
        </div>
      </div>

      <Card className="shadow-sm mb-4 glass-panel">
        <Card.Body className="p-4">
          <Form onSubmit={handleSearch}>
            <Row className="g-3">
              <Col md={3}>
                <InputGroup className="filter-input">
                  <InputGroup.Text>
                    <i className="fas fa-search"></i>
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    name="search"
                    placeholder="Search jobs, companies..."
                    value={filters.search}
                    onChange={handleFilterChange}
                  />
                </InputGroup>
              </Col>

              <Col md={2}>
                <InputGroup className="filter-input">
                  <InputGroup.Text>
                    <i className="fas fa-map-marker-alt"></i>
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    name="location"
                    placeholder="Location"
                    value={filters.location}
                    onChange={handleFilterChange}
                  />
                </InputGroup>
              </Col>

              <Col md={2}>
                <Form.Select
                  name="type"
                  value={filters.type}
                  onChange={handleFilterChange}
                  className="filter-select"
                >
                  <option value="">Job Type</option>
                  <option value="full-time">Full Time</option>
                  <option value="part-time">Part Time</option>
                  <option value="contract">Contract</option>
                  <option value="internship">Internship</option>
                  <option value="remote">Remote</option>
                </Form.Select>
              </Col>

              <Col md={2}>
                <Form.Select
                  name="experience"
                  value={filters.experience}
                  onChange={handleFilterChange}
                  className="filter-select"
                >
                  <option value="">Experience Level</option>
                  <option value="entry">Entry Level</option>
                  <option value="mid">Mid Level</option>
                  <option value="senior">Senior Level</option>
                  <option value="lead">Lead</option>
                  <option value="executive">Executive</option>
                </Form.Select>
              </Col>

              <Col md={3}>
                <div className="d-flex gap-2">
                  <Button variant="primary" type="submit" className="flex-fill filter-btn">
                    <i className="fas fa-search me-2"></i>
                    Search
                  </Button>
                  <Button variant="outline-light" type="button" onClick={clearFilters} className="filter-btn">
                    <i className="fas fa-times"></i>
                  </Button>
                </div>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      {loading && (
        <div className="loading">
          <Spinner animation="border" variant="primary" className="mb-3" />
          <div>Loading jobs...</div>
        </div>
      )}

      <Row className="g-4">
        {jobs.map((job) => (
          <Col lg={12} key={job._id}>
            <Card className="job-card glass-panel border-0">
              <Card.Body className="p-4">
                <div className="d-flex flex-column flex-lg-row align-items-start gap-4">
                  <div className="flex-grow-1 w-100">
                    <div className="d-flex flex-wrap align-items-center gap-2 gap-md-3 mb-3">
                      <h5 className="mb-0 me-1">
                        <Link
                          to={`/jobs/${job._id}`}
                          className="text-decoration-none fw-bold gradient-text"
                          style={{ fontSize: "1.35rem" }}
                        >
                          {job.title}
                        </Link>
                      </h5>
                      <Badge bg={statusVariants[job.status] || "secondary"} className="status-pill text-uppercase">
                        {job.status}
                      </Badge>
                      {!loading && isEmployer && isJobOwner(job) && (
                        <Badge bg="success" className="status-pill">
                          <i className="fas fa-user me-1"></i>
                          Your Job
                        </Badge>
                      )}
                    </div>

                    <p className="text-muted fw-semibold mb-3">{job.company}</p>

                    <div className="job-card-meta text-muted mb-3">
                      <span>
                        <i className="fas fa-map-marker-alt"></i>
                        {job.location}
                      </span>
                      <span>
                        <i className="fas fa-briefcase"></i>
                        {job.type}
                      </span>
                      {job.experience && (
                        <span>
                          <i className="fas fa-chart-line"></i>
                          {job.experience} level
                        </span>
                      )}
                      {job.salary && (
                        <span>
                          <i className="fas fa-rupee-sign"></i>
                          {formatSalary(job.salary)}
                        </span>
                      )}
                    </div>

                    <p className="text-muted mb-3">
                      {job.description.length > 200 ? `${job.description.substring(0, 200)}...` : job.description}
                    </p>

                    {job.skills && job.skills.length > 0 && (
                      <div className="d-flex flex-wrap gap-2">
                        {job.skills.slice(0, 5).map((skill, index) => (
                          <span key={skill + index} className="skill-tag">
                            {skill}
                          </span>
                        ))}
                        {job.skills.length > 5 && (
                          <small className="text-muted">+{job.skills.length - 5} more skills</small>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="job-card-actions text-lg-end d-flex flex-column gap-2 align-items-stretch w-100 w-lg-auto">
                    <small className="text-muted d-block">Posted {new Date(job.createdAt).toLocaleDateString()}</small>
                    <Button variant="primary" as={Link} to={`/jobs/${job._id}`} className="view-details-btn">
                      View Details
                    </Button>
                    {!loading && isEmployer && isJobOwner(job) && (
                      <div className="d-flex flex-column gap-2">
                        <Button
                          variant="outline-light"
                          size="sm"
                          onClick={() => handleEditJob(job._id)}
                          className="d-flex align-items-center justify-content-center"
                        >
                          <i className="fas fa-edit me-1"></i>
                          Edit
                        </Button>
                        <Button
                          variant="outline-light"
                          size="sm"
                          onClick={() => handleDeleteJob(job)}
                          className="d-flex align-items-center justify-content-center"
                        >
                          <i className="fas fa-trash me-1"></i>
                          Delete
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {!loading && jobs.length === 0 && (
        <div className="text-center py-5">
          <i className="fas fa-search fa-3x text-muted mb-3"></i>
          <h4 className="text-muted mb-3">No jobs found</h4>
          <p className="text-muted mb-4">Try adjusting your search criteria or browse all jobs.</p>
          <Button variant="primary" onClick={clearFilters}>
            Clear Filters
          </Button>
        </div>
      )}

      {totalPages > 1 && (
        <div className="d-flex justify-content-center mt-4">
          <Pagination>
            <Pagination.Prev onClick={() => setPage((prev) => prev - 1)} disabled={page === 1}>
              Previous
            </Pagination.Prev>

            {paginationItems.map((pageNumber) => (
              <Pagination.Item key={pageNumber} active={pageNumber === page} onClick={() => setPage(pageNumber)}>
                {pageNumber}
              </Pagination.Item>
            ))}

            <Pagination.Next onClick={() => setPage((prev) => prev + 1)} disabled={page === totalPages}>
              Next
            </Pagination.Next>
          </Pagination>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete the job posting "{jobToDelete?.title}"? This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDeleteJob}>
            Delete Job
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Jobs;

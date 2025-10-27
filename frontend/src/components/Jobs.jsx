import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../lib/api";
import { useAuth } from "../contexts/AuthContext.jsx";
import { formatSalary } from "../lib/utils.js";
import {
  Badge,
  Button,
  Card,
  Col,
  Container,
  Form,
  Image,
  InputGroup,
  Modal,
  Pagination,
  Row,
} from "react-bootstrap";
import toast from "react-hot-toast";
import LoadingSpinner from "./shared/LoadingSpinner.jsx";

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
  const [loading, setLoading] = useState(true); // Only for initial load
  const [filters, setFilters] = useState(initialFilters);
  const [searchInput, setSearchInput] = useState(""); // Separate state for search input
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [jobToDelete, setJobToDelete] = useState(null);
  const toastIdRef = useRef(null);
  const debounceTimerRef = useRef(null);

  const fetchJobs = useCallback(async () => {
    try {
      // Only show loading on initial page load (when no jobs exist yet)
      if (jobs.length === 0) {
        setLoading(true);
      }
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
      let fetchedJobs = response.data.jobs;
      
      // Filter to show only employer's jobs if user is an employer
      if (user && user.role === "employer") {
        const currentUserId = user.id ? user.id.toString() : null;
        fetchedJobs = fetchedJobs.filter(job => {
          const jobOwnerId = job.postedBy && job.postedBy._id ? job.postedBy._id.toString() : null;
          return jobOwnerId === currentUserId;
        });
      }
      
      // Set jobs and loading to false together to prevent UI flash
      setJobs(fetchedJobs);
      setTotalPages(response.data.totalPages || 1);
      setLoading(false);
    } catch (err) {
      // Prevent duplicate toasts in React StrictMode
      if (toastIdRef.current) {
        toast.dismiss(toastIdRef.current);
      }
      toastIdRef.current = toast.error(err.response?.data?.error || "Failed to fetch jobs");
      setLoading(false);
    }
  }, [filters, page, user]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    
    if (name === 'search') {
      // Update search input immediately for UI responsiveness
      setSearchInput(value);
      
      // Clear existing timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      
      // Debounce: only update filters state after 400ms of no typing
      debounceTimerRef.current = setTimeout(() => {
        setFilters((prev) => ({ ...prev, search: value }));
        setPage(1);
      }, 400);
    } else {
      // For dropdowns, update immediately (no debounce needed)
      setFilters((prev) => ({ ...prev, [name]: value }));
      setPage(1);
    }
  };

  const handleSearch = (event) => {
    event.preventDefault();
    setPage(1);
  };

  const clearFilters = () => {
    setFilters(initialFilters);
    setSearchInput(""); // Clear search input display
    setPage(1);
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
      fetchJobs();
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
        <h1 className="h2 fw-bold gradient-text">{isEmployer ? "My Job Listings" : "Job Listings"}</h1>
        <div className="d-flex align-items-center gap-3">
          <Badge bg="primary" className="status-pill fs-6">
            {jobs.length} jobs found
          </Badge>
          {isEmployer && (
            <Badge bg="success" className="status-pill fs-6">
              <i className="fas fa-briefcase me-1"></i>
              You can Edit/Delete your jobs
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
                    value={searchInput}
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
                  <Button 
                    variant="outline-light" 
                    type="button" 
                    onClick={clearFilters} 
                    className="filter-btn"
                    title="Clear all filters"
                    aria-label="Clear all filters"
                  >
                    <i className="fas fa-times"></i>
                  </Button>
                </div>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      {loading ? (
        <LoadingSpinner message="Loading jobs..." />
      ) : (
        <Row className="g-4">
          {jobs.map((job) => {
          const companyInfo = job.postedBy?.company;
          const companyLogo = companyInfo?.logo;
          const companyName = companyInfo?.name || job.company;
          const logoInitials = (companyName || "JP").slice(0, 2).toUpperCase();

          return (
            <Col lg={12} key={job._id}>
              <Card className="job-card glass-panel border-0">
                <Card.Body className="p-4">
                  <div className="d-flex flex-column flex-lg-row align-items-start gap-4">
                    <div className="flex-grow-1 w-100">
                      <div className="d-flex flex-wrap align-items-center gap-3 mb-3">
                        <div
                          className="d-flex align-items-center justify-content-center rounded-4 shadow-sm"
                          style={{
                            width: "52px",
                            height: "52px",
                            background: "rgba(148, 163, 184, 0.12)",
                            border: "1px solid rgba(148, 163, 184, 0.18)",
                          }}
                        >
                          {companyLogo ? (
                            <Image
                              src={companyLogo}
                              alt={`${companyName || "Company"} logo`}
                              rounded
                              style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "15px" }}
                            />
                          ) : (
                            <span className="fw-bold" style={{ color: "var(--color-primary)" }}>
                              {logoInitials}
                            </span>
                          )}
                        </div>
                        <div className="flex-grow-1">
                          <div className="d-flex flex-wrap align-items-center gap-2 gap-md-3">
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
                          <p className="text-muted fw-semibold mb-0 mt-2">{companyName}</p>
                        </div>
                      </div>

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
                            variant="outline-success"
                            onClick={() => handleEditJob(job._id)}
                          >
                            <i className="fas fa-pen me-2"></i>
                            Edit
                          </Button>
                          <Button
                            variant="outline-danger"
                            onClick={() => handleDeleteJob(job)}
                          >
                            <i className="fas fa-trash-alt me-2"></i>
                            Delete
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          );
        })}
        
        {jobs.length === 0 && (
          <Col xs={12}>
            <div className="text-center py-5">
              <i className={`fas ${isEmployer ? 'fa-briefcase' : 'fa-search'} fa-3x text-muted mb-3`}></i>
              <h4 className="text-muted mb-3">{isEmployer ? 'No jobs posted yet' : 'No jobs found'}</h4>
              <p className="text-muted mb-4">
                {isEmployer 
                  ? 'Start by posting your first job to find great talent!' 
                  : 'Try adjusting your search criteria or browse all jobs.'}
              </p>
              {isEmployer ? (
                <Button variant="primary" as={Link} to="/post-job">
                  <i className="fas fa-plus me-2"></i>
                  Post Your First Job
                </Button>
              ) : (
                <Button variant="primary" onClick={clearFilters}>
                  Clear Filters
                </Button>
              )}
            </div>
          </Col>
        )}
      </Row>
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
              Are you sure you want to delete the job posting <strong>"{jobToDelete?.title}"</strong>?
            </p>
            <p className="text-muted small">This action cannot be undone.</p>
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
                onClick={confirmDeleteJob}
                className="px-4 py-2 rounded-3"
              >
                <i className="fas fa-trash me-2"></i>
                Delete Job
              </Button>
            </div>
          </Modal.Footer>
        </div>
      </Modal>
      <style>{`
        .delete-modal-content {
          transition: box-shadow 240ms ease, border-color 240ms ease;
        }
      `}</style>
    </Container>
  );
};

export default Jobs;

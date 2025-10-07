import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import { useAuth } from "../contexts/AuthContext.jsx";
import { Badge, Button, Card, Col, Container, Form, Modal, Row, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import { Worker, Viewer } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';

const Applications = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [allApplications, setAllApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedJob, setSelectedJob] = useState("");
  const [jobs, setJobs] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [statusUpdate, setStatusUpdate] = useState({
    status: "",
    notes: "",
    interviewDate: "",
    interviewNotes: "",
  });
  const [showPdfViewer, setShowPdfViewer] = useState(false);
  const [currentResumeUrl, setCurrentResumeUrl] = useState("");
  const [currentApplicantName, setCurrentApplicantName] = useState("");

  // Create PDF viewer plugin
  const defaultLayoutPluginInstance = defaultLayoutPlugin({
    sidebarTabs: (defaultTabs) => [],
    toolbarPlugin: {
      searchPlugin: {
        keyword: ''
      }
    }
  });

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    setApplications(filterApplications(allApplications, statusFilter));
  }, [statusFilter, allApplications]);

  const filterApplications = (apps, status) => {
    if (!status) return apps;
    return apps.filter((app) => app.status === status);
  };

  const fetchJobs = async () => {
    try {
      const response = await api.get("/api/jobs/user/my-jobs");
      setJobs(response.data.jobs);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to fetch jobs");
    }
  };

  const fetchApplications = async () => {
    try {
      if (!selectedJob) {
        toast.error("Please select a job before applying filters.");
        return;
      }

      setLoading(true);

      let url = "/api/applications/job";

      if (selectedJob) {
        url += `/${selectedJob}`;
      }

      const response = await api.get(url);
      const fetchedApplications = response.data.applications || [];
      setAllApplications(fetchedApplications);
      setApplications(filterApplications(fetchedApplications, statusFilter));
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to fetch applications");
      setAllApplications([]);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleJobChange = (event) => {
    const value = event.target.value;
    setSelectedJob(value);
    setStatusFilter("");
    setAllApplications([]);
    setApplications([]);
    setLoading(false);
  };

  const updateApplicationStatus = async (
    applicationId,
    status,
    notes = "",
    interviewDate = "",
    interviewNotes = ""
  ) => {
    try {
      const response = await api.put(`/api/applications/${applicationId}`, {
        status,
        notes,
        interviewDate,
        interviewNotes,
      });

      setApplications((prev) => prev.map((app) => (app._id === applicationId ? response.data.application : app)));

      setShowStatusModal(false);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to update application status");
    }
  };

  const handleStatusChange = (application) => {
    setSelectedApplication(application);
    setStatusUpdate({
      status: "",
      notes: application.notes || "",
      interviewDate: application.interviewDate || "",
      interviewNotes: application.interviewNotes || "",
    });
    setShowStatusModal(true);
  };

  const handleStatusSubmit = () => {
    if (statusUpdate.status && selectedApplication) {
      updateApplicationStatus(
        selectedApplication._id,
        statusUpdate.status,
        statusUpdate.notes,
        statusUpdate.interviewDate,
        statusUpdate.interviewNotes
      );
    }
  };

  const handleViewResume = (resumeUrl, applicantName) => {
    setCurrentResumeUrl(resumeUrl);
    setCurrentApplicantName(applicantName);
    setShowPdfViewer(true);
  };

  const getStatusBadge = (status) => {
    const variants = {
      pending: "warning",
      reviewed: "info",
      shortlisted: "success",
      rejected: "danger",
      accepted: "primary",
    };
    return <Badge bg={variants[status] || "secondary"}>{status}</Badge>;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (!user) {
    return (
      <Container className="py-5">
        <div className="d-flex flex-column align-items-center justify-content-center">
          <Spinner animation="border" variant="primary" className="mb-3" />
          <div>Loading...</div>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      {/* Dashboard Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
        <div>
          <h1 className="h2 fw-bold gradient-text mb-1">Applications Dashboard</h1>
          <p className="text-muted mb-0">Manage and review job applications</p>
        </div>
        <div className="d-flex align-items-center gap-3">
          <Badge bg="primary" className="status-pill fs-6">
            <i className="fas fa-file-alt me-2"></i>
            {applications.length} applications
          </Badge>
          <Badge bg="info" className="status-pill fs-6">
            <i className="fas fa-briefcase me-2"></i>
            {jobs.length} active jobs
          </Badge>
        </div>
      </div>

      {/* Dashboard Stats Cards */}
      <Row className="g-4 mb-4">
        <Col md={3}>
          <Card className="glass-panel border-0 text-center">
            <Card.Body className="py-4">
              <div className="mb-2">
                <i className="fas fa-clock fa-2x text-warning"></i>
              </div>
              <h4 className="mb-1">{applications.filter((app) => app.status === "pending").length}</h4>
              <small className="text-muted">Pending Review</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="glass-panel border-0 text-center">
            <Card.Body className="py-4">
              <div className="mb-2">
                <i className="fas fa-star fa-2x text-success"></i>
              </div>
              <h4 className="mb-1">{applications.filter((app) => app.status === "shortlisted").length}</h4>
              <small className="text-muted">Shortlisted</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="glass-panel border-0 text-center">
            <Card.Body className="py-4">
              <div className="mb-2">
                <i className="fas fa-check-circle fa-2x text-info"></i>
              </div>
              <h4 className="mb-1">{applications.filter((app) => app.status === "accepted").length}</h4>
              <small className="text-muted">Accepted</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="glass-panel border-0 text-center">
            <Card.Body className="py-4">
              <div className="mb-2">
                <i className="fas fa-calendar-alt fa-2x text-primary"></i>
              </div>
              <h4 className="mb-1">{applications.filter((app) => app.interviewDate).length}</h4>
              <small className="text-muted">Interviews Scheduled</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Filters Card */}
      <Card className="glass-panel border-0 mb-4">
        <Card.Body className="p-4">
          <h5 className="gradient-text mb-3">
            <i className="fas fa-filter me-2"></i>
            Filter Applications
          </h5>
          <Row className="g-3">
            <Col md={4}>
              <Form.Group>
                <Form.Label className="text-muted">Filter by Job</Form.Label>
                <Form.Select
                  value={selectedJob}
                  onChange={handleJobChange}
                  className="filter-select"
                >
                  <option value="">Select a Job</option>
                  {jobs.map((job) => (
                    <option key={job._id} value={job._id}>
                      {job.title} at {job.company}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={4}>
              <Form.Group>
                <Form.Label className="text-muted">Filter by Status</Form.Label>
                <Form.Select
                  className="filter-select"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  disabled={!selectedJob}
                >
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="reviewed">Reviewed</option>
                  <option value="shortlisted">Shortlisted</option>
                  <option value="rejected">Rejected</option>
                  <option value="accepted">Accepted</option>
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={4}>
              <Form.Group>
                <Form.Label className="text-muted">&nbsp;</Form.Label>
                <div className="d-grid">
                  <Button
                    variant="primary"
                    onClick={fetchApplications}
                    disabled={!selectedJob}
                    className="filter-btn"
                  >
                    <i className="fas fa-search me-2"></i>
                    Apply Filters
                  </Button>
                </div>
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {loading && (
        <div className="loading d-flex flex-column align-items-center justify-content-center">
          <Spinner animation="border" variant="primary" className="mb-3" />
          <div>Loading applications...</div>
        </div>
      )}

      {!selectedJob && !loading && (
        <Card className="glass-panel border-0 text-center">
          <Card.Body className="py-5">
            <div className="mb-4">
              <i className="fas fa-filter fa-4x text-muted"></i>
            </div>
            <h4 className="gradient-text mb-3">Select a Job to View Applications</h4>
            <p className="text-muted mb-4">Choose from your active job postings to see who has applied</p>
            <div className="d-flex justify-content-center gap-3">
              <Badge bg="info" className="status-pill">
                <i className="fas fa-briefcase me-1"></i>
                {jobs.length} Jobs Posted
              </Badge>
            </div>
          </Card.Body>
        </Card>
      )}

      {selectedJob && applications.length === 0 && !loading ? (
        <Card className="glass-panel border-0 text-center">
          <Card.Body className="py-5">
            <div className="mb-4">
              <i className="fas fa-inbox fa-4x text-muted"></i>
            </div>
            <h4 className="gradient-text mb-3">No Applications Yet</h4>
            <p className="text-muted mb-4">This job hasn't received any applications matching your current filters.</p>
            <div className="d-flex justify-content-center gap-3">
              <Badge bg="warning" className="status-pill">
                <i className="fas fa-clock me-1"></i>
                Waiting for Applications
              </Badge>
            </div>
          </Card.Body>
        </Card>
      ) : (
        selectedJob &&
        applications.map((application) => (
          <Col lg={12} key={application._id} className="mb-4">
            <Card className="application-card glass-panel border-0">
              <Card.Body className="p-4">
                <div className="d-flex flex-column flex-lg-row justify-content-between align-items-start gap-4 mb-4">
                  <div className="flex-grow-1">
                    <div className="d-flex flex-wrap align-items-center gap-3 mb-3">
                      <h4 className="mb-0 gradient-text">{application.applicant.name}</h4>
                      <div className="status-pill" style={{ background: "rgba(255,255,255,0.08)" }}>
                        {getStatusBadge(application.status)}
                      </div>
                    </div>
                    <div className="application-meta">
                      <span>
                        <i className="fas fa-envelope"></i>
                        {application.applicant.email}
                      </span>
                      {application.applicant.phone && (
                        <span>
                          <i className="fas fa-phone"></i>
                          {application.applicant.phone}
                        </span>
                      )}
                      <span>
                        <i className="far fa-calendar-check"></i>
                        Applied {formatDate(application.appliedAt)}
                      </span>
                      {application.reviewedAt && (
                        <span>
                          <i className="far fa-eye"></i>
                          Reviewed {formatDate(application.reviewedAt)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="d-flex flex-column gap-2 text-end">
                    <Button variant="primary" onClick={() => handleStatusChange(application)}>
                      <i className="fas fa-edit me-2"></i>
                      Update Status
                    </Button>
                    <Button
                      variant="outline-light"
                      href={`mailto:${application.applicant.email}?subject=Regarding your application`}
                    >
                      <i className="fas fa-envelope me-2"></i>
                      Contact
                    </Button>
                  </div>
                </div>

                <Row className="g-4">
                  <Col md={6}>
                    <h5 className="mb-3 gradient-text">Cover Letter</h5>
                    <div
                      className="glass-panel p-3 border-0"
                      style={{ backdropFilter: "blur(16px)", boxShadow: "none" }}
                    >
                      <p className="small mb-0" style={{ whiteSpace: "pre-line" }}>
                        {application.coverLetter}
                      </p>
                    </div>
                  </Col>

                  <Col md={6}>
                    <h5 className="mb-3 gradient-text">Applicant Details</h5>
                    <div
                      className="glass-panel p-3 border-0"
                      style={{ backdropFilter: "blur(16px)", boxShadow: "none" }}
                    >
                      <div className="small">
                        {/* Basic applicant info always shown */}
                        <p className="mb-2">
                          <strong>Name:</strong> {application.applicant.name}
                        </p>
                        <p className="mb-2">
                          <strong>Email:</strong> {application.applicant.email}
                        </p>
                        {application.applicant.phone && (
                          <p className="mb-2">
                            <strong>Phone:</strong> {application.applicant.phone}
                          </p>
                        )}

                        {/* Profile information if available */}
                        {application.applicant.profile?.bio && (
                          <p className="mb-2">
                            <strong>Bio:</strong> {application.applicant.profile.bio}
                          </p>
                        )}
                        {application.applicant.profile?.skills && application.applicant.profile.skills.length > 0 && (
                          <div className="mb-2">
                            <strong>Skills:</strong>
                            <div className="d-flex flex-wrap gap-1 mt-1">
                              {application.applicant.profile.skills.map((skill, index) => (
                                <span key={index} className="skill-tag">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {application.applicant.profile?.experience && (
                          <p className="mb-2">
                            <strong>Experience:</strong> {application.applicant.profile.experience}
                          </p>
                        )}
                        {application.applicant.profile?.location && (
                          <p className="mb-2">
                            <strong>Location:</strong> {application.applicant.profile.location}
                          </p>
                        )}
                        {application.applicant.profile?.resume && (
                          <p className="mb-2">
                            <strong>Resume:</strong>{" "}
                            <Button
                              variant="link"
                              className="p-0 text-decoration-none gradient-text"
                              style={{ fontSize: 'inherit', lineHeight: 'inherit' }}
                              onClick={() => handleViewResume(
                                application.applicant.profile.resume, 
                                application.applicant.name
                              )}
                            >
                              <i className="fas fa-eye me-1"></i>View Resume
                            </Button>
                          </p>
                        )}

                        {/* Show message if no additional profile info */}
                        {!application.applicant.profile?.bio &&
                          (!application.applicant.profile?.skills ||
                            application.applicant.profile.skills.length === 0) &&
                          !application.applicant.profile?.experience &&
                          !application.applicant.profile?.location &&
                          !application.applicant.profile?.resume && (
                            <div className="mt-3 pt-2 border-top border-secondary border-opacity-25">
                              <p className="text-muted small mb-0 fst-italic">
                                <i className="fas fa-info-circle me-2"></i>
                                This applicant hasn't completed their profile yet.
                              </p>
                            </div>
                          )}
                      </div>
                    </div>
                  </Col>
                </Row>

                {application.notes && (
                  <div className="mt-4">
                    <h5 className="mb-2 gradient-text">Your Notes</h5>
                    <div
                      className="glass-panel p-3 border-0"
                      style={{ backdropFilter: "blur(16px)", boxShadow: "none" }}
                    >
                      <p className="small mb-0">{application.notes}</p>
                    </div>
                  </div>
                )}

                {application.interviewDate && (
                  <div className="mt-4">
                    <h5 className="mb-2 gradient-text">Interview Scheduled</h5>
                    <div
                      className="glass-panel p-3 border-0"
                      style={{
                        backdropFilter: "blur(16px)",
                        boxShadow: "none",
                        background: "rgba(34, 197, 94, 0.12)",
                      }}
                    >
                      <p className="small mb-0">
                        <strong>Date:</strong> {formatDate(application.interviewDate)}
                        {application.interviewNotes && (
                          <>
                            <br />
                            <strong>Notes:</strong> {application.interviewNotes}
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        ))
      )}

      <Modal show={showStatusModal} onHide={() => setShowStatusModal(false)} className="glass-panel">
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="gradient-text">
            <i className="fas fa-edit me-2"></i>
            Update Application Status
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <Form.Group className="mb-3">
            <Form.Label className="text-muted">Status</Form.Label>
            <Form.Select
              value={statusUpdate.status}
              onChange={(e) => setStatusUpdate({ ...statusUpdate, status: e.target.value })}
            >
              <option value="">Select Status</option>
              <option value="pending">Pending</option>
              <option value="reviewed">Reviewed</option>
              <option value="shortlisted">Shortlisted</option>
              <option value="rejected">Rejected</option>
              <option value="accepted">Accepted</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="text-muted">Notes</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={statusUpdate.notes}
              onChange={(e) => setStatusUpdate({ ...statusUpdate, notes: e.target.value })}
              placeholder="Add notes about this application..."
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="text-muted">Interview Date</Form.Label>
            <Form.Control
              type="date"
              value={statusUpdate.interviewDate}
              onChange={(e) => setStatusUpdate({ ...statusUpdate, interviewDate: e.target.value })}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="text-muted">Interview Notes</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              value={statusUpdate.interviewNotes}
              onChange={(e) => setStatusUpdate({ ...statusUpdate, interviewNotes: e.target.value })}
              placeholder="Notes about the interview..."
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button variant="outline-light" onClick={() => setShowStatusModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleStatusSubmit}>
            <i className="fas fa-save me-2"></i>
            Update Status
          </Button>
        </Modal.Footer>
      </Modal>

      {/* PDF Viewer Modal */}
      <Modal 
        show={showPdfViewer} 
        onHide={() => setShowPdfViewer(false)} 
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>{currentApplicantName}'s Resume</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0">
          {currentResumeUrl && (
            <div style={{ height: '750px', width: '100%' }}>
              <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
                <Viewer 
                  fileUrl={currentResumeUrl}
                  plugins={[defaultLayoutPluginInstance]}
                />
              </Worker>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="secondary" 
            onClick={() => setShowPdfViewer(false)}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Applications;

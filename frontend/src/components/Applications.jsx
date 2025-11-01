import { useEffect, useState } from "react";
import api from "../lib/api";
import { useAuth } from "../contexts/AuthContext.jsx";
import { Badge, Button, Card, Col, Container, Form, Modal, Row } from "react-bootstrap";
import toast from "react-hot-toast";
import PDFViewer from "./shared/PDFViewer.jsx";
import PDFViewerModal from "./shared/PDFViewerModal.jsx";
import LoadingSpinner from "./shared/LoadingSpinner.jsx";
import ApplicationStats from "./shared/ApplicationStats.jsx";
import ApplicationFilters from "./shared/ApplicationFilters.jsx";
import { formatDate, getStatusBadge } from "../lib/utils.js";
import { APPLICATION_STATUSES } from "../constants/applicationStatuses.js";

const Applications = () => {
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
  const [scheduleInterview, setScheduleInterview] = useState(false);
  const [showPdfViewer, setShowPdfViewer] = useState(false);
  const [currentResumeUrl, setCurrentResumeUrl] = useState("");
  const [currentApplicantName, setCurrentApplicantName] = useState("");

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    setApplications(filterApplications(allApplications, statusFilter));
  }, [statusFilter, allApplications]);

  // Auto-fetch applications when job selection changes
  useEffect(() => {
    if (selectedJob) {
      fetchApplications();
    } else {
      setApplications([]);
      setAllApplications([]);
    }
  }, [selectedJob]);

  const filterApplications = (apps, status) => {
    if (!status) return apps;
    return apps.filter((app) => app.status === status);
  };

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/jobs/user/my-jobs");
      setJobs(response.data.jobs);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to fetch jobs");
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async () => {
    try {
      if (!selectedJob) {
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

      // Update both applications and allApplications to keep them in sync
      const updatedApp = response.data.application;
      setApplications((prev) => prev.map((app) => (app._id === applicationId ? updatedApp : app)));
      setAllApplications((prev) => prev.map((app) => (app._id === applicationId ? updatedApp : app)));

      setShowStatusModal(false);
      toast.success("Application status updated successfully");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to update application status");
    }
  };

  const handleStatusChange = (application) => {
    setSelectedApplication(application);
    const hasInterview = !!(application.interviewDate || application.interviewNotes);
    setScheduleInterview(hasInterview);
    setStatusUpdate({
      status: "",
      notes: application.notes || "",
      interviewDate: application.interviewDate || "",
      interviewNotes: application.interviewNotes || "",
    });
    setShowStatusModal(true);
  };

  const handleStatusSubmit = () => {
    if (!statusUpdate.status) {
      toast.error("Please select a status");
      return;
    }
    
    if (scheduleInterview && !statusUpdate.interviewDate) {
      toast.error("Please select an interview date");
      return;
    }
    
    if (selectedApplication) {
      updateApplicationStatus(
        selectedApplication._id,
        statusUpdate.status,
        statusUpdate.notes,
        scheduleInterview ? statusUpdate.interviewDate : "",
        scheduleInterview ? statusUpdate.interviewNotes : ""
      );
    }
  };

  const handleViewResume = (resumeUrl, applicantName) => {
    setCurrentResumeUrl(resumeUrl);
    setCurrentApplicantName(applicantName);
    setShowPdfViewer(true);
  };


  if (!user) {
    return <LoadingSpinner />;
  }

  if (loading) {
    return <LoadingSpinner />;
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
      <ApplicationStats applications={applications} />

      {/* Filters Card */}
      <ApplicationFilters
        jobs={jobs}
        selectedJob={selectedJob}
        statusFilter={statusFilter}
        onJobChange={handleJobChange}
        onStatusChange={(e) => setStatusFilter(e.target.value)}
      />

      {loading && <LoadingSpinner message="Loading applications..." />}

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
                        <Badge bg={getStatusBadge(application.status)}>{application.status}</Badge>
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
                    <div className="glass-panel glass-panel-content p-3 border-0">
                      <p className="small mb-0" style={{ whiteSpace: "pre-line" }}>
                        {application.coverLetter}
                      </p>
                    </div>
                  </Col>

                  <Col md={6}>
                    <h5 className="mb-3 gradient-text">Applicant Details</h5>
                    <div className="glass-panel glass-panel-content p-3 border-0">
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

                        {/* Profile information - check if profile exists */}
                        {application.applicant.profile ? (
                          <>
                            {application.applicant.profile.bio && (
                              <p className="mb-2">
                                <strong>Bio:</strong> {application.applicant.profile.bio}
                              </p>
                            )}
                            {application.applicant.profile.skills && application.applicant.profile.skills.length > 0 && (
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
                            {application.applicant.profile.experience && (
                              <p className="mb-2">
                                <strong>Experience:</strong> {application.applicant.profile.experience}
                              </p>
                            )}
                            {application.applicant.profile.location && (
                              <p className="mb-2">
                                <strong>Location:</strong> {application.applicant.profile.location}
                              </p>
                            )}
                            {application.applicant.profile.resume && (
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

                            {/* Show message if profile exists but no fields are filled */}
                            {!application.applicant.profile.bio &&
                              (!application.applicant.profile.skills || application.applicant.profile.skills.length === 0) &&
                              !application.applicant.profile.experience &&
                              !application.applicant.profile.location &&
                              !application.applicant.profile.resume && (
                                <div className="mt-3 pt-2 border-top border-secondary border-opacity-25">
                                  <p className="text-muted small mb-0 fst-italic">
                                    <i className="fas fa-info-circle me-2"></i>
                                    This applicant hasn't completed their profile yet.
                                  </p>
                                </div>
                              )}
                          </>
                        ) : (
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
                    <div className="glass-panel glass-panel-content p-3 border-0">
                      <p className="small mb-0">{application.notes}</p>
                    </div>
                  </div>
                )}

                {application.interviewDate && (
                  <div className="mt-4">
                    <h5 className="mb-2 gradient-text">Interview Scheduled</h5>
                    <div className="glass-panel glass-panel-content p-3 border-0">
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

      <Modal show={showStatusModal} onHide={() => setShowStatusModal(false)} size="md" className="status-modal">
        <div className="glass-panel border-0 rounded-4 status-modal-content">
          <Modal.Header closeButton className="border-0 pb-0">
            <Modal.Title className="gradient-text fw-bold">
              <i className="fas fa-edit me-2"></i>
              Update Application Status
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="border-0 p-4">
          <Form.Group className="mb-3">
            <Form.Label className="text-muted fw-semibold">
              Status <span className="text-danger">*</span>
            </Form.Label>
            <Form.Select
              value={statusUpdate.status}
              onChange={(e) => setStatusUpdate({ ...statusUpdate, status: e.target.value })}
              required
            >
              <option value="">Select Status</option>
              {APPLICATION_STATUSES.filter(s => s.value !== '').map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </Form.Select>
            <Form.Text className="text-muted small">
              Required field - please select a status to continue
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="text-muted fw-semibold">
              Application Notes
              <span className="ms-2 small fw-normal text-muted">(General feedback about the candidate)</span>
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={statusUpdate.notes}
              onChange={(e) => setStatusUpdate({ ...statusUpdate, notes: e.target.value })}
              placeholder="Add your feedback about this candidate..."
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Check
              type="checkbox"
              id="schedule-interview-check"
              label="Schedule Interview"
              checked={scheduleInterview}
              onChange={(e) => setScheduleInterview(e.target.checked)}
              className="text-muted fw-semibold"
            />
          </Form.Group>

          {scheduleInterview && (
            <div className="interview-fields" style={{ 
              animation: 'fadeIn 0.3s ease-in',
              borderLeft: '3px solid rgba(139, 92, 246, 0.5)',
              paddingLeft: '1rem',
              marginBottom: '1rem'
            }}>
              <Form.Group className="mb-3">
                <Form.Label className="text-muted fw-semibold">
                  Interview Date <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="date"
                  value={statusUpdate.interviewDate}
                  onChange={(e) => setStatusUpdate({ ...statusUpdate, interviewDate: e.target.value })}
                  required
                />
                <Form.Text className="text-muted small">
                  Required when scheduling an interview
                </Form.Text>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="text-muted fw-semibold">
                  Interview Feedback
                  <span className="ms-2 small fw-normal text-muted">(Notes from the interview)</span>
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  value={statusUpdate.interviewNotes}
                  onChange={(e) => setStatusUpdate({ ...statusUpdate, interviewNotes: e.target.value })}
                  placeholder="Document interview observations and feedback..."
                />
              </Form.Group>
            </div>
          )}
          </Modal.Body>
          <Modal.Footer className="border-0 pt-0">
            <div className="d-flex gap-3 w-100 justify-content-end">
              <Button 
                variant="outline-light" 
                onClick={() => setShowStatusModal(false)}
                className="px-4 py-2 rounded-3"
              >
                Cancel
              </Button>
              <Button 
                variant="primary" 
                onClick={handleStatusSubmit}
                disabled={!statusUpdate.status || (scheduleInterview && !statusUpdate.interviewDate)}
                className="px-4 py-2 rounded-3"
              >
                <i className="fas fa-save me-2"></i>
                Update Status
              </Button>
            </div>
          </Modal.Footer>
        </div>
      </Modal>
      <style>{`
        .status-modal-content {
          transition: transform 240ms ease, box-shadow 240ms ease, border-color 240ms ease;
        }
        .status-modal .modal-dialog:hover .status-modal-content {
          transform: translateY(-6px);
          border-color: rgba(159, 116, 255, 0.55) !important;
          box-shadow: var(--shadow-elevated), var(--shadow-glow) !important;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      {/* PDF Viewer Modal */}
      <PDFViewerModal
        show={showPdfViewer}
        onHide={() => setShowPdfViewer(false)}
        fileUrl={currentResumeUrl}
        title={`${currentApplicantName}'s Resume`}
      />
    </Container>
  );
};

export default Applications;

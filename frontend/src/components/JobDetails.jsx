import { useEffect, useState, useRef } from "react";
import { Link, useParams, useNavigate, useLocation } from "react-router-dom";
import api from "../lib/api";
import { Badge, Button, Card, Col, Container, Form, Row, Spinner, Modal } from "react-bootstrap";
import toast from "react-hot-toast";
import { useAuth } from "../contexts/AuthContext.jsx";
import PDFViewer from "./shared/PDFViewer.jsx";
import LoadingSpinner from "./shared/LoadingSpinner.jsx";
import { useResumeUpload } from "../hooks/useResumeUpload.js";

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const fromMyApplications = location.state?.from === 'my-applications';
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const applicationFormRef = useRef(null);
  const [applicationData, setApplicationData] = useState({
    coverLetter: "",
    resume: "",
  });
  const [userWantsCustomResume, setUserWantsCustomResume] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPdfViewer, setShowPdfViewer] = useState(false);
  const [currentResumeUrl, setCurrentResumeUrl] = useState("");
  const { uploading: resumeUploading, validateAndUploadResume } = useResumeUpload();

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/api/jobs/${id}`);
        setJob(response.data.job);
        setFetchError(false);
      } catch (err) {
        toast.error(err.response?.data?.error || "Failed to fetch job details");
        setFetchError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchJobDetails();
  }, [id]);

  // Auto-populate resume from user profile
  useEffect(() => {
    if (showApplicationForm && user?.profile?.resume && !userWantsCustomResume) {
      setApplicationData((prev) => ({
        ...prev,
        resume: user.profile.resume,
      }));
    }
  }, [showApplicationForm, user?.profile?.resume, userWantsCustomResume]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setApplicationData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleResumeUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUserWantsCustomResume(true);

    const result = await validateAndUploadResume(file);
    if (result) {
      setApplicationData((prev) => ({
        ...prev,
        resume: result.url,
      }));
    }
  };

  const handleApply = async (event) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      const response = await api.post(`/api/applications/${id}`, applicationData);
      setShowApplicationForm(false);
      setApplicationData({ coverLetter: "", resume: "" });
      setUserWantsCustomResume(false); // Reset for next application
      toast.success(response.data.message || "Application submitted successfully");

      // Refresh job details to show updated applicants count
      const jobResponse = await api.get(`/api/jobs/${id}`);
      setJob(jobResponse.data.job);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to submit application");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelApplication = () => {
    setShowApplicationForm(false);
    setApplicationData({ coverLetter: "", resume: "" });
    setUserWantsCustomResume(false); // Reset for next time
  };

  const handleEditJob = () => {
    navigate(`/edit-job/${id}`);
  };

  const handleDeleteJob = async () => {
    try {
      await api.delete(`/api/jobs/${id}`);
      toast.success("Job deleted successfully");
      navigate("/jobs");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to delete job");
    }
  };

  const handleViewResume = (resumeUrl) => {
    try {
      if (!resumeUrl) {
        toast.error("Resume URL is not available");
        return;
      }
      setCurrentResumeUrl(resumeUrl);
      setShowPdfViewer(true);
    } catch {
      toast.error("Failed to open resume viewer");
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading job details..." />;
  }

  if (fetchError) {
    return (
      <Container className="py-5">
        <div className="text-center text-danger fw-semibold">Unable to load job details.</div>
      </Container>
    );
  }

  if (!job) {
    return (
      <Container className="py-5">
        <div className="text-center text-warning fw-semibold">Job not found.</div>
      </Container>
    );
  }

  // Check if the current user is the job owner
  const isJobOwner = user && user.role === "employer" && job.postedBy && job.postedBy._id === user._id;

  // Check if the current user has already applied for this job
  const hasApplied =
    user &&
    user.role === "jobseeker" &&
    job.applicants &&
    job.applicants.some((application) => {
      const applicantDoc = application.applicant;
      if (!applicantDoc) return false;
      const applicantId = typeof applicantDoc === "object" && applicantDoc._id ? applicantDoc._id : applicantDoc;
      return applicantId?.toString() === (user.id || user._id);
    });

  return (
    <Container className="py-5">
      <div className="mb-4">
        <Link 
          to={fromMyApplications ? "/my-applications" : "/jobs"} 
          className="gradient-text text-decoration-none"
        >
          ← Back to {fromMyApplications ? "My Applications" : "Jobs"}
        </Link>
      </div>

      <Card className="glass-panel border-0">
        <Card.Body className="p-4">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-start gap-3 mb-4">
            <div className="flex-grow-1">
              <div className="d-flex flex-wrap align-items-center gap-3 mb-2">
                <h1 className="h2 fw-bold gradient-text mb-0">{job.title}</h1>
                {job.status && (
                  <Badge
                    bg={
                      job.status === "active"
                        ? "success"
                        : job.status === "expired"
                        ? "danger"
                        : job.status === "filled"
                        ? "info"
                        : "secondary"
                    }
                    className="status-pill text-uppercase"
                    style={{ color: "#ffffff", fontWeight: "600" }}
                  >
                    {job.status}
                  </Badge>
                )}
              </div>
              <p className="h5 text-muted mb-0">{job.company}</p>
            </div>
            <div className="d-flex gap-2">
              {!user && (
                <Button variant="primary" onClick={() => navigate(`/login?redirect=${encodeURIComponent(`/jobs/${id}`)}`)}>
                  Login to Apply
                </Button>
              )}
              {user && user.role === "jobseeker" && !hasApplied && (
                <Button 
                  variant="primary" 
                  onClick={() => {
                    setShowApplicationForm((prev) => {
                      const newState = !prev;
                      if (newState) {
                        // Scroll to application form after state updates
                        setTimeout(() => {
                          applicationFormRef.current?.scrollIntoView({ 
                            behavior: 'smooth', 
                            block: 'start' 
                          });
                        }, 100);
                      }
                      return newState;
                    });
                  }}
                >
                  {showApplicationForm ? "Cancel" : "Apply Now"}
                </Button>
              )}
              {user && user.role === "jobseeker" && hasApplied && (
                <Button variant="outline-light" disabled>
                  Applied
                </Button>
              )}
              {isJobOwner && (
                <>
                  <Button variant="outline-light" onClick={handleEditJob}>
                    Edit Job
                  </Button>
                  <Button variant="outline-light" onClick={() => setShowDeleteModal(true)}>
                    Delete Job
                  </Button>
                </>
              )}
            </div>
          </div>

          <Row className="g-4">
            <Col md={6}>
              <h5 className="mb-3">Job Details</h5>
              <div className="glass-panel p-3 border-0" style={{ backdropFilter: "blur(20px)", boxShadow: "none" }}>
                <div className="mb-2 job-detail-item">
                  <i className="fas fa-map-marker-alt me-2"></i>
                  <strong>Location:</strong> {job.location}
                </div>
                <div className="mb-2 job-detail-item">
                  <i className="fas fa-briefcase me-2"></i>
                  <strong>Type:</strong> {job.type}
                </div>
                {job.experience && (
                  <div className="mb-2 job-detail-item">
                    <i className="fas fa-chart-line me-2"></i>
                    <strong>Experience:</strong> {job.experience} level
                  </div>
                )}
                {job.salary && (job.salary.min != null || job.salary.max != null) && (
                  <div className="mb-2 job-detail-item">
                    <i className="fas fa-rupee-sign me-2"></i>
                    <strong>Salary:</strong>
                    {job.salary.min != null && job.salary.max != null
                      ? ` ₹${job.salary.min.toLocaleString()} - ₹${job.salary.max.toLocaleString()}`
                      : job.salary.min != null
                      ? ` From ₹${job.salary.min.toLocaleString()}`
                      : ` Up to ₹${job.salary.max.toLocaleString()}`}
                  </div>
                )}
                <div className="mb-2 job-detail-item">
                  <strong>Posted:</strong> {new Date(job.createdAt).toLocaleDateString()}
                </div>
                {job.applicationDeadline && (
                  <div className="mb-2 job-detail-item">
                    <strong>Deadline:</strong> {new Date(job.applicationDeadline).toLocaleDateString()}
                  </div>
                )}
                {isJobOwner && job.applicants && job.applicants.length > 0 && (
                  <div className="mb-2 job-detail-item">
                    <strong>Applications:</strong>{" "}
                    <Link to={`/applications?jobId=${job._id}`} className="gradient-text">
                      {job.applicants.length} received
                    </Link>
                  </div>
                )}
              </div>
            </Col>

            <Col md={6}>
              <h5 className="mb-3">Company Info</h5>
              <div className="glass-panel p-3 border-0" style={{ backdropFilter: "blur(20px)", boxShadow: "none" }}>
                {job.postedBy?.company?.name && (
                  <div className="mb-2 job-company-item">
                    <strong>Company:</strong> {job.postedBy.company.name}
                  </div>
                )}
                {job.postedBy?.company?.website && (
                  <div className="mb-2 job-company-item">
                    <strong>Website:</strong>{" "}
                    <a
                      href={job.postedBy.company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-decoration-none gradient-text"
                    >
                      {job.postedBy.company.website}
                    </a>
                  </div>
                )}
                {job.postedBy?.company?.location && (
                  <div className="mb-2 job-company-item">
                    <strong>Location:</strong> {job.postedBy.company.location}
                  </div>
                )}
                {job.postedBy?.company?.description && (
                  <div className="mb-2 job-company-item">
                    <strong>About:</strong> {job.postedBy.company.description}
                  </div>
                )}
              </div>
            </Col>
          </Row>

          <div className="mt-4">
            <h5 className="mb-3 gradient-text">Job Description</h5>
            <div className="glass-panel p-3 border-0" style={{ backdropFilter: "blur(18px)", boxShadow: "none" }}>
              <p className="mb-0" style={{ whiteSpace: "pre-line" }}>
                {job.description}
              </p>
            </div>
          </div>

          {job.requirements && (
            <div className="mt-4">
              <h5 className="mb-3 gradient-text">Requirements</h5>
              <div className="glass-panel p-3 border-0" style={{ backdropFilter: "blur(18px)", boxShadow: "none" }}>
                <p className="mb-0" style={{ whiteSpace: "pre-line" }}>
                  {job.requirements}
                </p>
              </div>
            </div>
          )}

          {job.benefits && job.benefits.length > 0 && (
            <div className="mt-4">
              <h5 className="mb-3 gradient-text">Benefits</h5>
              <div className="glass-panel p-3 border-0" style={{ backdropFilter: "blur(18px)", boxShadow: "none" }}>
                <ul className="mb-0">
                  {job.benefits.map((benefit, index) => (
                    <li key={benefit + index}>{benefit}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {job.skills && job.skills.length > 0 && (
            <div className="mt-4">
              <h5 className="mb-3 gradient-text">Required Skills</h5>
              <div className="d-flex flex-wrap gap-2">
                {job.skills.map((skill, index) => (
                  <Badge key={skill + index} bg="primary" className="me-1">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </Card.Body>
      </Card>

      {showApplicationForm && user && user.role === "jobseeker" && (
        <Card ref={applicationFormRef} className="mt-4 glass-panel border-0">
          <Card.Body className="p-4">
            <h4 className="mb-4 gradient-text">Apply for this position</h4>
            <Form onSubmit={handleApply}>
              <Form.Group className="mb-3">
                <Form.Label className="text-muted">Cover Letter <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  as="textarea"
                  rows={6}
                  name="coverLetter"
                  value={applicationData.coverLetter}
                  onChange={handleInputChange}
                  placeholder="Tell us why you're a great fit for this position..."
                  required
                />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label className="text-muted">
                  Resume <small className="text-muted opacity-75">(PDF or Word, max 8MB)</small> <span className="text-danger">*</span>
                </Form.Label>
                
                {user?.profile?.resume && !userWantsCustomResume ? (
                  <div 
                    className="py-3 px-4 d-flex flex-column gap-3"
                    style={{
                      backgroundColor: 'rgba(52, 211, 153, 0.08)',
                      border: '2px solid rgba(52, 211, 153, 0.3)',
                      borderRadius: '12px',
                    }}
                  >
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="d-flex align-items-center gap-2">
                        <i className="fas fa-check-circle" style={{ color: '#34d399', fontSize: '1.1rem' }}></i>
                        <div>
                          <div style={{ fontSize: '0.95rem', fontWeight: '600', color: '#34d399' }}>
                            Using your profile resume
                          </div>
                          <div className="text-muted" style={{ fontSize: '0.875rem' }}>
                            Your resume will be automatically attached to this application
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="link"
                        onClick={(e) => {
                          e.preventDefault();
                          handleViewResume(user.profile.resume);
                        }}
                        className="p-0 text-decoration-none gradient-text"
                        style={{ fontSize: 'inherit', lineHeight: 'inherit' }}
                      >
                        <i className="fas fa-eye me-1"></i>View Resume
                      </Button>
                    </div>
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setUserWantsCustomResume(true);
                        setApplicationData(prev => ({ ...prev, resume: '' }));
                      }}
                      className="align-self-start"
                    >
                      <i className="fas fa-upload me-2"></i>Upload Different Resume
                    </Button>
                  </div>
                ) : (
                  <div>
                    {!user?.profile?.resume && !applicationData.resume && !resumeUploading && (
                      <div className="mb-2 small text-muted">
                        <i className="fas fa-info-circle me-1"></i>
                        No resume in profile. Please upload one to apply.
                      </div>
                    )}
                    <Form.Control
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleResumeUpload}
                      className="file-input-modern"
                      disabled={resumeUploading}
                      required={!applicationData.resume}
                    />
                    {resumeUploading && (
                      <div className="mt-2 text-muted small">
                        <Spinner animation="border" size="sm" className="me-2" /> Uploading resume...
                      </div>
                    )}
                    {applicationData.resume && !resumeUploading && (
                      <div className="mt-2 small">
                        <strong>Uploaded:</strong>{" "}
                        <Button
                          variant="link"
                          onClick={() => handleViewResume(applicationData.resume)}
                          className="p-0 text-decoration-none gradient-text"
                          style={{ fontSize: 'inherit', lineHeight: 'inherit' }}
                        >
                          <i className="fas fa-eye me-1"></i>View Resume
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </Form.Group>

              <div className="d-flex gap-3">
                <Button variant="primary" type="submit" disabled={submitting || !applicationData.coverLetter || !applicationData.resume}>
                  {submitting ? "Submitting..." : "Submit Application"}
                </Button>
                <Button variant="outline-light" type="button" onClick={handleCancelApplication}>
                  Cancel
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
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
              Are you sure you want to delete this job posting <strong>"{job?.title}"</strong>?
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
                onClick={handleDeleteJob}
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
          transition: transform 240ms ease, box-shadow 240ms ease, border-color 240ms ease;
        }
        .delete-modal .modal-dialog:hover .delete-modal-content {
          transform: translateY(-6px);
          border-color: rgba(159, 116, 255, 0.55) !important;
          box-shadow: var(--shadow-elevated), var(--shadow-glow) !important;
        }
      `}</style>

      {/* PDF Viewer Modal */}
      <Modal 
        show={showPdfViewer} 
        onHide={() => setShowPdfViewer(false)} 
        size="lg"
        centered
        contentClassName="bg-white"
      >
        <Modal.Header closeButton style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e5e7eb' }}>
          <Modal.Title style={{ color: '#1f2937' }}>Resume Preview</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0">
          {currentResumeUrl && <PDFViewer fileUrl={currentResumeUrl} />}
        </Modal.Body>
        <Modal.Footer style={{ backgroundColor: '#ffffff', borderTop: '1px solid #e5e7eb' }}>
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

export default JobDetails;

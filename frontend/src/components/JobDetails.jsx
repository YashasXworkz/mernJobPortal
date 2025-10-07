import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import api from "../lib/api";
import { Badge, Button, Card, Col, Container, Form, Row, Spinner, Modal } from "react-bootstrap";
import { toast } from "react-toastify";
import { useAuth } from "../contexts/AuthContext.jsx";

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [applicationData, setApplicationData] = useState({
    coverLetter: "",
    resume: "",
  });
  const [resumeUploading, setResumeUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

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

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Please upload a PDF or Word document.");
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      toast.error("Resume must be 8MB or smaller.");
      return;
    }

    setResumeUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await api.post("/api/upload/document", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setApplicationData((prev) => ({
        ...prev,
        resume: response.data.url,
      }));
    } catch (uploadError) {
      toast.error(uploadError.response?.data?.error || "Failed to upload resume.");
    } finally {
      setResumeUploading(false);
    }
  };

  const handleApply = async (event) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      const response = await api.post(`/api/applications/${id}`, applicationData);
      setShowApplicationForm(false);
      setApplicationData({ coverLetter: "", resume: "" });
      toast.success(response.data.message || "Application submitted successfully!");

      // Refresh job details to show updated applicants count
      const jobResponse = await api.get(`/api/jobs/${id}`);
      setJob(jobResponse.data.job);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to submit application");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
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
      console.error("Failed to delete job:", err);
      toast.error(err.response?.data?.error || "Failed to delete job");
    }
  };

  if (loading) {
    return (
      <Container className="py-5">
        <div className="d-flex flex-column align-items-center justify-content-center">
          <Spinner animation="border" variant="primary" className="mb-3" />
          <div>Loading job details...</div>
        </div>
      </Container>
    );
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
        <Link to="/jobs" className="gradient-text text-decoration-none">
          ← Back to Jobs
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
                <Button variant="primary" onClick={() => setShowApplicationForm((prev) => !prev)}>
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
                  <strong>Location:</strong> 📍 {job.location}
                </div>
                <div className="mb-2 job-detail-item">
                  <strong>Type:</strong> 💼 {job.type}
                </div>
                {job.experience && (
                  <div className="mb-2 job-detail-item">
                    <strong>Experience:</strong> 📊 {job.experience} level
                  </div>
                )}
                {job.salary && (job.salary.min != null || job.salary.max != null) && (
                  <div className="mb-2 job-detail-item">
                    <strong>Salary:</strong> 💰
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
        <Card className="mt-4 glass-panel border-0">
          <Card.Body className="p-4">
            <h4 className="mb-4 gradient-text">Apply for this position</h4>
            <Form onSubmit={handleApply}>
              <Form.Group className="mb-3">
                <Form.Label className="text-muted">Cover Letter</Form.Label>
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
                <Form.Label className="text-muted">Resume</Form.Label>
                <Form.Control
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleResumeUpload}
                  className="file-input-modern"
                  disabled={resumeUploading}
                  required={!applicationData.resume}
                />
                <Form.Text className="text-muted">Upload a PDF or Word document (max 8MB)</Form.Text>
                {resumeUploading && (
                  <div className="mt-2 text-muted small">
                    <Spinner animation="border" size="sm" className="me-2" /> Uploading resume...
                  </div>
                )}
                {applicationData.resume && !resumeUploading && (
                  <div className="mt-2 small">
                    <strong>Uploaded:</strong>{" "}
                    <a
                      href={applicationData.resume}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-decoration-none gradient-text"
                    >
                      View Resume
                    </a>
                  </div>
                )}
              </Form.Group>

              <div className="d-flex gap-3">
                <Button variant="primary" type="submit" disabled={submitting}>
                  {submitting ? "Submitting..." : "Submit Application"}
                </Button>
                <Button variant="outline-light" type="button" onClick={() => setShowApplicationForm(false)}>
                  Cancel
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      )}

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} className="glass-panel">
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="gradient-text">Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to delete this job posting? This action cannot be undone.</Modal.Body>
        <Modal.Footer className="border-0">
          <Button variant="outline-light" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleDeleteJob}>
            Delete Job
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default JobDetails;

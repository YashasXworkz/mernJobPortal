import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api";
import { Badge, Button, Card, Col, Container, Form, Modal, Row, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import PDFViewer from "./shared/PDFViewer.jsx";

const statusVariants = {
  pending: "warning",
  reviewed: "info",
  shortlisted: "success",
  rejected: "danger",
  accepted: "primary",
};

const MyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [selectedResume, setSelectedResume] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingApplication, setEditingApplication] = useState(null);
  const [editFormData, setEditFormData] = useState({ coverLetter: '', resume: null });
  const [resumeUploading, setResumeUploading] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        const response = await api.get("/api/applications/my-applications");
        setApplications(response.data.applications);
      } catch (err) {
        toast.error(err.response?.data?.error || "Failed to fetch applications");
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  const withdrawApplication = async (applicationId) => {
    try {
      await api.delete(`/api/applications/${applicationId}`);
      setApplications((prev) => prev.filter((application) => application._id !== applicationId));
      toast.success("Application withdrawn successfully");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to withdraw application");
    }
  };

  const getStatusBadge = (status) => {
    return <Badge bg={statusVariants[status] || "secondary"}>{status}</Badge>;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleViewResume = (resumeUrl) => {
    setSelectedResume(resumeUrl);
    setShowResumeModal(true);
  };

  const handleEditApplication = (application) => {
    setEditingApplication(application);
    setEditFormData({
      coverLetter: application.coverLetter,
      resume: null,
      currentResumeUrl: application.resume,
      currentResumeFilename: 'Current Resume'
    });
    setShowEditModal(true);
  };

  const handleResumeUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a PDF or Word document.');
      event.target.value = ''; // Clear the input
      return;
    }

    // Validate file size (8MB limit)
    if (file.size > 8 * 1024 * 1024) {
      toast.error('Resume must be 8MB or smaller.');
      event.target.value = ''; // Clear the input
      return;
    }

    // Validate filename
    if (file.name.length > 100) {
      toast.error('Filename is too long. Please use a shorter filename.');
      event.target.value = ''; // Clear the input
      return;
    }

    setResumeUploading(true);

    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);

      const response = await api.post('/api/upload/document', uploadFormData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setEditFormData((prev) => ({
        ...prev,
        resume: response.data.url,
        resumeFilename: response.data.filename || file.name
      }));
      toast.success('Resume uploaded successfully!');
    } catch (uploadErr) {
      toast.error(uploadErr.response?.data?.error || 'Failed to upload resume.');
    } finally {
      setResumeUploading(false);
    }
  };

  const handleUpdateApplication = async () => {
    if (!editingApplication) return;

    setUpdating(true);
    try {
      const updateData = {
        coverLetter: editFormData.coverLetter
      };

      // Only include resume if a new one was uploaded
      if (editFormData.resume) {
        updateData.resume = editFormData.resume;
      }

      const response = await api.put(`/api/applications/update/${editingApplication._id}`, updateData);
      
      // Update the applications list
      setApplications(prev => 
        prev.map(app => 
          app._id === editingApplication._id 
            ? { ...app, ...response.data.application }
            : app
        )
      );

      setShowEditModal(false);
      toast.success('Application updated successfully!');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update application');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <Container className="py-5">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
        <h1 className="h2 fw-bold gradient-text mb-0">My Applications</h1>
        <Badge bg="primary" className="fs-6 status-pill text-uppercase">
          {applications.length} applications
        </Badge>
      </div>

      {loading && (
        <div className="d-flex flex-column align-items-center justify-content-center py-5">
          <Spinner animation="border" variant="primary" className="mb-3" />
          <div>Loading applications...</div>
        </div>
      )}

      <Row className="g-4">
        {applications.length === 0 && !loading ? (
          <Col className="text-center py-5">
            <i className="fas fa-inbox fa-3x text-muted mb-3"></i>
            <h4 className="text-muted mb-3">No applications yet</h4>
            <p className="text-muted mb-4">You haven't applied to any jobs yet.</p>
            <Button variant="primary" as={Link} to="/jobs">
              Browse Jobs
            </Button>
          </Col>
        ) : (
          applications.map((application) => (
            <Col lg={12} key={application._id}>
              <Card className="application-card glass-panel border-0">
                <Card.Body className="p-4">
                  <div className="d-flex flex-column flex-lg-row justify-content-between align-items-start gap-4 mb-4">
                    <div className="flex-grow-1">
                      <div className="d-flex flex-wrap align-items-center gap-3 mb-3">
                        <h5 className="mb-0">
                          <Link
                            to={`/jobs/${application.job._id}`}
                            className="text-decoration-none fw-bold gradient-text"
                          >
                            {application.job.title}
                          </Link>
                        </h5>
                        <span className="status-pill" style={{ background: "rgba(255,255,255,0.08)" }}>
                          {getStatusBadge(application.status)}
                        </span>
                      </div>

                      <div className="application-meta">
                        <span>
                          <i className="fas fa-building"></i>
                          {application.job.company}
                        </span>
                        <span>
                          <i className="fas fa-map-marker-alt"></i>
                          {application.job.location}
                        </span>
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
                      <Button variant="outline-light" as={Link} to={`/jobs/${application.job._id}`}>
                        View Job Details
                      </Button>

                      {application.status === "pending" && (
                        <>
                          <Button variant="outline-info" onClick={() => handleEditApplication(application)}>
                            Edit Application
                          </Button>
                          <Button variant="outline-light" onClick={() => withdrawApplication(application._id)}>
                            Withdraw Application
                          </Button>
                        </>
                      )}
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
                      <h5 className="mb-3 gradient-text">Application Details</h5>
                      <div className="small d-flex flex-column gap-2">
                        {application.resume && (
                          <div>
                            <strong>Resume:</strong>{" "}
                            <Button
                              variant="link"
                              className="p-0 text-decoration-none gradient-text"
                              style={{ fontSize: "0.875rem" }}
                              onClick={() => handleViewResume(application.resume)}
                            >
                              View Resume
                            </Button>
                          </div>
                        )}
                      </div>
                    </Col>
                  </Row>
                  {application.notes && (
                    <div className="mt-4">
                      <h5 className="mb-2 gradient-text">Employer Notes</h5>
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
      </Row>

      {/* Resume Preview Modal */}
      <Modal
        show={showResumeModal}
        onHide={() => setShowResumeModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Resume Preview</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0">
          {selectedResume && <PDFViewer fileUrl={selectedResume} />}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowResumeModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Application Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg" className="edit-modal">
        <div className="glass-panel border-0 rounded-4">
          <Modal.Header closeButton className="border-0 pb-0">
            <Modal.Title className="gradient-text fw-bold">Edit Application</Modal.Title>
          </Modal.Header>
          <Modal.Body className="border-0">
            <Row className="g-4">
              <Col lg={12}>
                <Form.Group>
                  <Form.Label className="text-muted">Cover Letter</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={6}
                    value={editFormData.coverLetter}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, coverLetter: e.target.value }))}
                    placeholder="Update your cover letter..."
                  />
                </Form.Group>
              </Col>
              <Col lg={12}>
                <Form.Group>
                  <Form.Label className="text-muted">
                    Resume{' '}
                    <small className="text-muted opacity-75">
                      (Optional - Upload new resume)
                    </small>
                  </Form.Label>
                  <Form.Control
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleResumeUpload}
                    className="file-input-modern"
                    disabled={resumeUploading}
                  />
                  {resumeUploading && (
                    <div className="mt-2 text-muted small">
                      <Spinner animation="border" size="sm" className="me-2" /> Uploading resume...
                    </div>
                  )}
                  {editFormData.resume && !resumeUploading && (
                    <div className="mt-2 small">
                      <strong>New resume uploaded:</strong>{' '}
                      <span className="text-muted me-2">
                        {editFormData.resumeFilename}
                      </span>
                    </div>
                  )}
                  {editFormData.currentResumeUrl && !editFormData.resume && (
                    <div className="mt-2 small">
                      <strong>Current resume:</strong>{' '}
                      <Button
                        variant="link"
                        className="p-0 text-decoration-none gradient-text"
                        style={{ fontSize: "0.875rem" }}
                        onClick={() => handleViewResume(editFormData.currentResumeUrl)}
                      >
                        View Current Resume
                      </Button>
                    </div>
                  )}
                  <small className="text-muted mt-2 d-block">Leave empty to keep current resume</small>
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer className="border-0 pt-0">
            <div className="d-flex gap-3 w-100 justify-content-end">
              <Button 
                variant="outline-light" 
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 rounded-3"
              >
                Cancel
              </Button>
              <Button 
                variant="primary" 
                onClick={handleUpdateApplication}
                disabled={updating || resumeUploading}
                className="px-4 py-2 rounded-3"
              >
                {updating ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Updating...
                  </>
                ) : (
                  'Update Application'
                )}
              </Button>
            </div>
          </Modal.Footer>
        </div>
      </Modal>
    </Container>
  );
};

export default MyApplications;

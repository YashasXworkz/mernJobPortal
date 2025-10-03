import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api";
import { Alert, Badge, Button, Card, Col, Container, Row, Spinner } from "react-bootstrap";

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
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        const response = await api.get("/api/applications/my-applications");
        setApplications(response.data.applications);
        setError("");
      } catch (err) {
        setError("Failed to fetch applications");
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
    } catch (err) {
      console.error("Failed to withdraw application", err);
    }
  };

  const getStatusBadge = (status) => {
    return <Badge bg={statusVariants[status] || "secondary"}>{status}</Badge>;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Container className="py-5">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
        <h1 className="h2 fw-bold gradient-text mb-0">My Applications</h1>
        <Badge bg="primary" className="fs-6 status-pill text-uppercase">
          {applications.length} applications
        </Badge>
      </div>

      {error && (
        <Alert variant="danger" className="alert-custom">
          {error}
        </Alert>
      )}

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
                        <Button variant="outline-light" onClick={() => withdrawApplication(application._id)}>
                          Withdraw Application
                        </Button>
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
                            <a
                              href={application.resume}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-decoration-none gradient-text"
                            >
                              View Resume
                            </a>
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
    </Container>
  );
};

export default MyApplications;

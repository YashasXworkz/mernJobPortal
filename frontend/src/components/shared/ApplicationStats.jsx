import { Card, Col, Row } from "react-bootstrap";

const ApplicationStats = ({ applications }) => {
  const pendingCount = applications.filter((app) => app.status === "pending").length;
  const shortlistedCount = applications.filter((app) => app.status === "shortlisted").length;
  const acceptedCount = applications.filter((app) => app.status === "accepted").length;
  const interviewsCount = applications.filter((app) => app.interviewDate).length;

  return (
    <Row className="g-4 mb-4">
      <Col md={3}>
        <Card className="glass-panel border-0 text-center">
          <Card.Body className="py-4">
            <div className="mb-2">
              <i className="fas fa-clock fa-2x text-warning"></i>
            </div>
            <h4 className="mb-1">{pendingCount}</h4>
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
            <h4 className="mb-1">{shortlistedCount}</h4>
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
            <h4 className="mb-1">{acceptedCount}</h4>
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
            <h4 className="mb-1">{interviewsCount}</h4>
            <small className="text-muted">Interviews Scheduled</small>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default ApplicationStats;

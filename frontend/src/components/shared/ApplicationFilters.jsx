import { Card, Col, Form, Row } from "react-bootstrap";
import { APPLICATION_STATUSES } from "../../constants/applicationStatuses.js";

const ApplicationFilters = ({ jobs, selectedJob, statusFilter, onJobChange, onStatusChange }) => {
  return (
    <Card className="glass-panel border-0 mb-4">
      <Card.Body className="p-4">
        <h5 className="gradient-text mb-3">
          <i className="fas fa-filter me-2"></i>
          Filter Applications
        </h5>
        <Row className="g-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label className="text-muted">Filter by Job</Form.Label>
              <Form.Select
                value={selectedJob}
                onChange={onJobChange}
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

          <Col md={6}>
            <Form.Group>
              <Form.Label className="text-muted">Filter by Status</Form.Label>
              <Form.Select
                className="filter-select"
                value={statusFilter}
                onChange={onStatusChange}
                disabled={!selectedJob}
              >
                {APPLICATION_STATUSES.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default ApplicationFilters;

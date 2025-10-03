import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, Button, Card, Col, Container, Form, Row, Spinner } from "react-bootstrap";
import api from "../lib/api";
import { useAuth } from "../contexts/AuthContext.jsx";

const defaultFormState = {
  title: "",
  company: "",
  description: "",
  requirements: "",
  location: "",
  type: "full-time",
  salaryMin: "",
  salaryMax: "",
  skills: "",
  experience: "",
  benefits: "",
  applicationDeadline: "",
};

const PostJob = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState(defaultFormState);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Pre-fill company name from user's profile
  useEffect(() => {
    if (user && user.company && user.company.name) {
      setFormData((prev) => ({
        ...prev,
        company: user.company.name,
      }));
    }
  }, [user]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Process salary data
      const salaryData = {};
      if (formData.salaryMin) {
        salaryData.min = parseInt(formData.salaryMin);
      }
      if (formData.salaryMax) {
        salaryData.max = parseInt(formData.salaryMax);
      }

      const jobData = {
        title: formData.title,
        company: formData.company,
        description: formData.description,
        requirements: formData.requirements,
        location: formData.location,
        type: formData.type,
        experience: formData.experience,
        skills: formData.skills
          .split(",")
          .map((skill) => skill.trim())
          .filter(Boolean),
        benefits: formData.benefits
          .split("\n")
          .map((benefit) => benefit.trim())
          .filter(Boolean),
        applicationDeadline: formData.applicationDeadline || undefined,
      };

      // Add salary data if provided
      if (Object.keys(salaryData).length > 0) {
        jobData.salary = salaryData;
      }

      await api.post("/api/jobs", jobData);
      navigate("/jobs");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to post job");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-4">
      <Row className="justify-content-center">
        <Col lg={10}>
          <Card className="glass-panel border-0">
            <Card.Body className="p-4">
              <div className="text-center mb-4">
                <h2 className="fw-bold gradient-text">Post a New Job</h2>
                <p className="text-muted">Create a job listing to find the perfect candidate</p>
              </div>

              {error && (
                <Alert variant="danger" className="alert-custom">
                  {error}
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                <Row className="g-3">
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="text-muted">Job Title *</Form.Label>
                      <Form.Control
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="e.g. Senior Software Engineer"
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="text-muted">Company *</Form.Label>
                      <Form.Control
                        type="text"
                        name="company"
                        value={formData.company}
                        onChange={handleChange}
                        placeholder="Company name"
                        required
                      />
                      {user && user.company && user.company.name && formData.company === user.company.name && (
                        <Form.Text className="text-muted">
                          Pre-filled from your profile. You can change it if needed.
                        </Form.Text>
                      )}
                    </Form.Group>
                  </Col>
                </Row>

                <Row className="g-3">
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="text-muted">Location *</Form.Label>
                      <Form.Control
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        placeholder="City, State/Country"
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="text-muted">Job Type *</Form.Label>
                      <Form.Select name="type" value={formData.type} onChange={handleChange} required>
                        <option value="full-time">Full Time</option>
                        <option value="part-time">Part Time</option>
                        <option value="contract">Contract</option>
                        <option value="internship">Internship</option>
                        <option value="remote">Remote</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                <Row className="g-3">
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="text-muted">Min Salary (INR)</Form.Label>
                      <Form.Control
                        type="number"
                        name="salaryMin"
                        value={formData.salaryMin}
                        onChange={handleChange}
                        placeholder="50000"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="text-muted">Max Salary (INR)</Form.Label>
                      <Form.Control
                        type="number"
                        name="salaryMax"
                        value={formData.salaryMax}
                        onChange={handleChange}
                        placeholder="100000"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label className="text-muted">Experience Level</Form.Label>
                  <Form.Select name="experience" value={formData.experience} onChange={handleChange}>
                    <option value="">Select experience level</option>
                    <option value="entry">Entry Level</option>
                    <option value="mid">Mid Level</option>
                    <option value="senior">Senior Level</option>
                    <option value="lead">Lead</option>
                    <option value="executive">Executive</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="text-muted">Skills (comma-separated)</Form.Label>
                  <Form.Control
                    type="text"
                    name="skills"
                    value={formData.skills}
                    onChange={handleChange}
                    placeholder="JavaScript, React, Node.js, etc."
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="text-muted">Application Deadline</Form.Label>
                  <Form.Control
                    type="date"
                    name="applicationDeadline"
                    value={formData.applicationDeadline}
                    onChange={handleChange}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="text-muted">Job Description *</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={6}
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe the role, responsibilities, and expectations..."
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="text-muted">Requirements *</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={6}
                    name="requirements"
                    value={formData.requirements}
                    onChange={handleChange}
                    placeholder="List the required skills, qualifications, and experience..."
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="text-muted">Benefits (one per line)</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    name="benefits"
                    value={formData.benefits}
                    onChange={handleChange}
                    placeholder={"Health insurance\nPaid time off\nRemote work\nProfessional development"}
                  />
                </Form.Group>

                <div className="d-grid mt-4">
                  <Button variant="primary" type="submit" size="lg" disabled={loading}>
                    {loading ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Posting Job...
                      </>
                    ) : (
                      "Post Job"
                    )}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default PostJob;

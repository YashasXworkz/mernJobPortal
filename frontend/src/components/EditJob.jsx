import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Alert, Button, Card, Col, Container, Form, Row, Spinner } from "react-bootstrap";
import api from "../lib/api";
import { useAuth } from "../contexts/AuthContext.jsx";

const EditJob = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
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
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        const response = await api.get(`/api/jobs/${id}`);
        const job = response.data.job;

        setFormData({
          title: job.title || "",
          company: job.company || "",
          description: job.description || "",
          requirements: job.requirements || "",
          location: job.location || "",
          type: job.type || "full-time",
          salaryMin: job.salary?.min || "",
          salaryMax: job.salary?.max || "",
          currency: job.salary?.currency || "INR",
          skills: job.skills ? job.skills.join(", ") : "",
          experience: job.experience || "",
          benefits: job.benefits ? job.benefits.join("\n") : "",
          applicationDeadline: job.applicationDeadline ? job.applicationDeadline.split("T")[0] : "",
        });
        setError("");
      } catch (err) {
        setError("Failed to fetch job details");
      } finally {
        setLoading(false);
      }
    };

    fetchJobDetails();
  }, [id]);

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
    setSubmitting(true);

    try {
      // Process salary data
      const salaryData = {};
      if (formData.salaryMin !== "") {
        salaryData.min = formData.salaryMin ? parseInt(formData.salaryMin, 10) : undefined;
      }
      if (formData.salaryMax !== "") {
        salaryData.max = formData.salaryMax ? parseInt(formData.salaryMax, 10) : undefined;
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

      // Remove empty fields
      Object.keys(jobData).forEach((key) => {
        if (jobData[key] === "" || jobData[key] === undefined) {
          delete jobData[key];
        }
      });

      await api.put(`/api/jobs/${id}`, jobData);
      navigate("/jobs");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update job");
      console.error(err);
    } finally {
      setSubmitting(false);
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

  return (
    <Container className="py-4">
      <Row className="justify-content-center">
        <Col lg={10}>
          <Card className="shadow">
            <Card.Body className="p-4">
              <div className="text-center mb-4">
                <h2 className="fw-bold text-primary">Edit Job</h2>
                <p className="text-muted">Update your job listing</p>
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
                      <Form.Label>Job Title *</Form.Label>
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
                      <Form.Label>Company *</Form.Label>
                      <Form.Control
                        type="text"
                        name="company"
                        value={formData.company}
                        onChange={handleChange}
                        placeholder="Company name"
                        required
                      />
                      {user && user.company && user.company.name && formData.company === user.company.name && (
                        <Form.Text className="text-muted">Pre-filled from your profile.</Form.Text>
                      )}
                    </Form.Group>
                  </Col>
                </Row>

                <Row className="g-3">
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Location *</Form.Label>
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
                      <Form.Label>Job Type *</Form.Label>
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
                      <Form.Label>Min Salary (INR)</Form.Label>
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
                      <Form.Label>Max Salary (INR)</Form.Label>
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
                  <Form.Label>Experience Level</Form.Label>
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
                  <Form.Label>Skills (comma-separated)</Form.Label>
                  <Form.Control
                    type="text"
                    name="skills"
                    value={formData.skills}
                    onChange={handleChange}
                    placeholder="JavaScript, React, Node.js, etc."
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Application Deadline</Form.Label>
                  <Form.Control
                    type="date"
                    name="applicationDeadline"
                    value={formData.applicationDeadline}
                    onChange={handleChange}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Job Description *</Form.Label>
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
                  <Form.Label>Requirements *</Form.Label>
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
                  <Form.Label>Benefits (one per line)</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    name="benefits"
                    value={formData.benefits}
                    onChange={handleChange}
                    placeholder={"Health insurance\nPaid time off\nRemote work\nProfessional development"}
                  />
                </Form.Group>

                <div className="d-flex gap-3 mt-4">
                  <Button variant="primary" type="submit" size="lg" disabled={submitting}>
                    {submitting ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Updating Job...
                      </>
                    ) : (
                      "Update Job"
                    )}
                  </Button>
                  <Button variant="secondary" size="lg" onClick={() => navigate(-1)}>
                    Cancel
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

export default EditJob;

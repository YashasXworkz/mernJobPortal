import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Card, Col, Container, Form, Row, Spinner } from "react-bootstrap";
import toast from "react-hot-toast";
import api from "../lib/api";
import { useAuth } from "../contexts/AuthContext.jsx";
import LoadingSpinner from "./shared/LoadingSpinner.jsx";

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
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [fetchError, setFetchError] = useState(false);

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
          skills: job.skills ? job.skills.join(", ") : "",
          experience: job.experience || "",
          benefits: job.benefits ? job.benefits.join("\n") : "",
          applicationDeadline: job.applicationDeadline ? job.applicationDeadline.split("T")[0] : "",
        });
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

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSalaryChange = (event) => {
    const { name, value } = event.target;
    // Remove commas and keep only numbers
    const numericValue = value.replace(/,/g, '');
    if (numericValue === '' || /^\d+$/.test(numericValue)) {
      setFormData((prev) => ({
        ...prev,
        [name]: numericValue,
      }));
    }
  };

  const formatSalary = (value) => {
    if (!value) return '';
    return parseInt(value).toLocaleString('en-IN');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
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
      toast.success("Job updated successfully");
      navigate("/jobs");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to update job");
    } finally {
      setSubmitting(false);
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

              <Form onSubmit={handleSubmit}>
                <Row className="g-3">
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="text-muted">Job Title <span className="text-danger">*</span></Form.Label>
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
                      <Form.Label className="text-muted">Company <span className="text-danger">*</span></Form.Label>
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
                      <Form.Label className="text-muted">Location <span className="text-danger">*</span></Form.Label>
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
                      <Form.Label className="text-muted">Job Type <span className="text-danger">*</span></Form.Label>
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
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label className="text-muted">Min Salary (INR)</Form.Label>
                      <Form.Control
                        type="text"
                        name="salaryMin"
                        value={formatSalary(formData.salaryMin)}
                        onChange={handleSalaryChange}
                        placeholder="20,000"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label className="text-muted">Max Salary (INR)</Form.Label>
                      <Form.Control
                        type="text"
                        name="salaryMax"
                        value={formatSalary(formData.salaryMax)}
                        onChange={handleSalaryChange}
                        placeholder="4,00,000"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
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
                  </Col>
                </Row>

                <Row className="g-3">
                  <Col md={6}>
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
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="text-muted">Application Deadline</Form.Label>
                      <Form.Control
                        type="date"
                        name="applicationDeadline"
                        value={formData.applicationDeadline}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label className="text-muted">Job Description <span className="text-danger">*</span></Form.Label>
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
                  <Form.Label className="text-muted">Requirements <span className="text-danger">*</span></Form.Label>
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

                <div className="d-flex gap-3 mt-4">
                  <Button variant="primary" type="submit" size="lg" disabled={submitting || !formData.title || !formData.company || !formData.location || !formData.description || !formData.requirements}>
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

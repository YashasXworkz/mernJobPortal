import { useEffect, useState } from 'react';
import api from '../lib/api';
import { useAuth } from '../contexts/AuthContext.jsx';
import {
  Button,
  Card,
  Col,
  Container,
  Form,
  Image,
  Row,
  Spinner
} from 'react-bootstrap';
import { toast } from 'react-toastify';

const initialFormState = {
  name: '',
  phone: '',
  bio: '',
  skills: '',
  experience: '',
  location: '',
  resume: '',
  companyName: '',
  companyDescription: '',
  companyWebsite: '',
  companyLocation: '',
  companyLogo: ''
};

const Profile = () => {
  const { user: authUser } = useAuth();
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState(initialFormState);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [resumeUploading, setResumeUploading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await api.get('/api/auth/me');
        setUser(response.data.user);
      } catch (err) {
        toast.error('Failed to load profile data. Please refresh or log in again.');
      } finally {
        setProfileLoading(false);
      }
    };

    if (authUser) {
      fetchUserProfile();
    } else {
      setProfileLoading(false);
    }
  }, [authUser]);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        bio: user.profile?.bio || '',
        skills: user.profile?.skills?.join(', ') || '',
        experience: user.profile?.experience || '',
        location: user.profile?.location || '',
        resume: user.profile?.resume || '',
        companyName: user.company?.name || '',
        companyDescription: user.company?.description || '',
        companyWebsite: user.company?.website || '',
        companyLocation: user.company?.location || '',
        companyLogo: user.company?.logo || ''
      });
    }
  }, [user]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogoUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setUploading(true);

    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);

      const response = await api.post('/api/upload/image', uploadFormData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setFormData((prev) => ({
        ...prev,
        companyLogo: response.data.url
      }));
      toast.success('Company logo uploaded successfully!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const updateData = {
        name: formData.name,
        phone: formData.phone,
        profile: {
          bio: formData.bio,
          skills: formData.skills
            .split(',')
            .map((skill) => skill.trim())
            .filter(Boolean),
          experience: formData.experience,
          location: formData.location,
          resume: formData.resume
        },
        company: {
          name: formData.companyName,
          description: formData.companyDescription,
          website: formData.companyWebsite,
          location: formData.companyLocation,
          logo: formData.companyLogo
        }
      };

      if (user?.role === 'jobseeker') {
        delete updateData.company;
      }

      Object.keys(updateData).forEach((key) => {
        if (updateData[key] === undefined || updateData[key] === '') {
          delete updateData[key];
        }
      });

      const response = await api.put('/api/auth/profile', updateData);
      setUser(response.data.user);
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (profileLoading) {
    return (
      <Container className="py-5">
        <div className="d-flex flex-column align-items-center justify-content-center">
          <Spinner animation="border" variant="primary" className="mb-3" />
          <div>Loading profile...</div>
        </div>
      </Container>
    );
  }

  if (!user) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <p className="text-warning fw-semibold">Unable to load profile data. Please try logging out and logging back in.</p>
          <Button variant="primary" href="/login">
            Go to Login
          </Button>
        </div>
      </Container>
    );
  }

  const handleResumeUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a PDF or Word document.');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      toast.error('Resume must be 8MB or smaller.');
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

      setFormData((prev) => ({
        ...prev,
        resume: response.data.url
      }));
      toast.success('Resume uploaded successfully!');
    } catch (uploadErr) {
      toast.error(uploadErr.response?.data?.error || 'Failed to upload resume.');
    } finally {
      setResumeUploading(false);
    }
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col xl={9}>
          <Card className="glass-panel border-0 p-1">
            <Card.Body className="p-4 p-lg-5">
              <div className="text-center mb-5">
                <span className="hero-eyebrow mb-2 d-inline-block">Manage your journey</span>
                <h2 className="fw-bold gradient-text mb-2">
                  {user.role === 'employer' ? 'Company Profile' : 'Your Profile'}
                </h2>
                <p className="text-muted mb-0">Keep your information fresh to attract the best opportunities.</p>
              </div>

              <Form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <h4 className="profile-section-title">Basic Information</h4>
                  <Row className="g-4">
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="text-muted">Full Name *</Form.Label>
                        <Form.Control
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="Enter your full name"
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="text-muted">Phone Number</Form.Label>
                        <Form.Control
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="Enter your phone number"
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </div>

                {user.role === 'jobseeker' && (
                  <div className="mb-4">
                    <h4 className="profile-section-title">Career Snapshot</h4>
                    <Row className="g-4">
                      <Col lg={6}>
                        <Form.Group className="mb-4 mb-lg-3">
                          <Form.Label className="text-muted">Bio</Form.Label>
                          <Form.Control
                            as="textarea"
                            rows={4}
                            name="bio"
                            value={formData.bio}
                            onChange={handleChange}
                            placeholder="Tell us about yourself..."
                          />
                        </Form.Group>
                      </Col>
                      <Col lg={6}>
                        <Form.Group className="mb-4 mb-lg-3">
                          <Form.Label className="text-muted">Skills</Form.Label>
                          <Form.Control
                            type="text"
                            name="skills"
                            value={formData.skills}
                            onChange={handleChange}
                            placeholder="JavaScript, React, Node.js, etc."
                          />
                        </Form.Group>
                        <Form.Group className="mb-4 mb-lg-3">
                          <Form.Label className="text-muted">Location</Form.Label>
                          <Form.Control
                            type="text"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            placeholder="City, State/Country"
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <Row className="g-4">
                      <Col lg={6}>
                        <Form.Group>
                          <Form.Label className="text-muted">Experience</Form.Label>
                          <Form.Control
                            as="textarea"
                            rows={3}
                            name="experience"
                            value={formData.experience}
                            onChange={handleChange}
                            placeholder="Describe your work experience..."
                          />
                        </Form.Group>
                      </Col>
                      <Col lg={6}>
                        <Form.Group>
                          <Form.Label className="text-muted">Resume</Form.Label>
                          <Form.Control
                            type="file"
                            accept=".pdf,.doc,.docx"
                            onChange={handleResumeUpload}
                            className="file-input-modern"
                            disabled={resumeUploading}
                          />
                          <Form.Text className="text-muted">Upload your resume (PDF or Word, max 8MB)</Form.Text>
                          {resumeUploading && (
                            <div className="mt-2 text-muted small">
                              <Spinner animation="border" size="sm" className="me-2" /> Uploading resume...
                            </div>
                          )}
                          {formData.resume && !resumeUploading && (
                            <div className="mt-2 small">
                              <strong>Current file:</strong>{' '}
                              <a href={formData.resume} target="_blank" rel="noopener noreferrer" className="text-decoration-none gradient-text">
                                View Resume
                              </a>
                            </div>
                          )}
                        </Form.Group>
                      </Col>
                    </Row>
                  </div>
                )}

                {user.role === 'employer' && (
                  <div className="mb-4">
                    <h4 className="profile-section-title">Company Information</h4>
                    <Row className="g-4">
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label className="text-muted">Company Name</Form.Label>
                          <Form.Control
                            type="text"
                            name="companyName"
                            value={formData.companyName}
                            onChange={handleChange}
                            placeholder="Enter company name"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label className="text-muted">Company Website</Form.Label>
                          <Form.Control
                            type="url"
                            name="companyWebsite"
                            value={formData.companyWebsite}
                            onChange={handleChange}
                            placeholder="https://example.com"
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <Row className="g-4">
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label className="text-muted">Company Location</Form.Label>
                          <Form.Control
                            type="text"
                            name="companyLocation"
                            value={formData.companyLocation}
                            onChange={handleChange}
                            placeholder="Company address"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label className="text-muted">Company Logo</Form.Label>
                          <Form.Control
                            type="file"
                            accept="image/*"
                            onChange={handleLogoUpload}
                            className="file-input-modern"
                            disabled={uploading}
                          />
                          <Form.Text className="text-muted">Upload an image file (JPG, PNG, GIF - Max 5MB)</Form.Text>
                          {formData.companyLogo && (
                            <div className="mt-2 d-flex align-items-center gap-3">
                              <Image src={formData.companyLogo} alt="Company Logo" rounded style={{ maxWidth: '120px', maxHeight: '80px' }} />
                              <span className="text-muted small">Current logo</span>
                            </div>
                          )}
                          {uploading && (
                            <div className="mt-2 text-muted small">
                              <Spinner animation="border" size="sm" className="me-2" /> Uploading logo...
                            </div>
                          )}
                        </Form.Group>
                      </Col>
                    </Row>

                    <Form.Group className="mt-4">
                      <Form.Label className="text-muted">Company Description</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={4}
                        name="companyDescription"
                        value={formData.companyDescription}
                        onChange={handleChange}
                        placeholder="Describe your company..."
                      />
                    </Form.Group>
                  </div>
                )}

                <hr className="profile-divider my-4" />

                <div className="d-flex flex-column flex-md-row gap-3 justify-content-between align-items-stretch">
                  <div className="text-muted small">
                    <i className="fas fa-shield-alt me-2"></i>We keep your data secure and never share without permission.
                  </div>
                  <Button variant="primary" type="submit" size="lg" disabled={loading} className="px-4">
                    {loading ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Updating...
                      </>
                    ) : (
                      'Save Changes'
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

export default Profile;

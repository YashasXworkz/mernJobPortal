import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { Button, Card, Col, Container, Form, Row, Spinner } from 'react-bootstrap';
import toast from 'react-hot-toast';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    const result = await login(formData.email, formData.password);

    if (result.success) {
      toast.success('Logged in successfully');
      navigate('/');
    } else {
      toast.error(result.error || 'Failed to sign in');
    }

    setLoading(false);
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={6} lg={4}>
          <Card className="glass-panel border-0">
            <Card.Body className="p-4">
              <div className="text-center mb-4">
                <h2 className="fw-bold gradient-text mb-2">Welcome Back</h2>
                <p className="text-muted">Sign in to continue your journey.</p>
              </div>

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label className="text-muted">Email Address</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label className="text-muted">Password</Form.Label>
                  <div className="position-relative">
                    <Form.Control
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      className="btn btn-link position-absolute end-0 top-50 translate-middle-y text-muted"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ border: 'none', padding: '0.5rem', cursor: 'pointer' }}
                    >
                      <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </button>
                  </div>
                </Form.Group>

                <div className="d-grid mt-4 gap-2">
                  <Button
                    variant="primary"
                    type="submit"
                    size="lg"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Signing in...
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </Button>
                </div>
              </Form>

              <div className="text-center mt-4">
                <p className="mb-0">
                  Don't have an account?{' '}
                  <Link to="/register" className="text-decoration-none fw-semibold gradient-text">
                    Sign up here
                  </Link>
                </p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;

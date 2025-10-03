import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { Button, Card, Col, Container, Row } from 'react-bootstrap';

const Home = () => {
  const { user } = useAuth();

  const heroSubtitle = !user
    ? 'Find your dream job or post openings with a stunning modern experience.'
    : user.role === 'jobseeker'
      ? `Welcome back, ${user.name}! Ready to find your next opportunity?`
      : `Welcome back, ${user.name}! Ready to find great talent?`;

  return (
    <Container className="hero-section text-center">
      <div className="floating-shape" style={{ top: '-60px', left: '-80px' }}></div>
      <div className="floating-shape blue" style={{ top: '-40px', right: '-120px' }}></div>

      <Row className="justify-content-center position-relative">
        <Col lg={10} xl={8}>
          <span className="hero-eyebrow mb-3">Dream bigger careers</span>
          <h1 className="display-4 fw-bold gradient-text mb-3">
            Welcome to JobPortal
          </h1>
          <p className="lead text-muted mb-4">{heroSubtitle}</p>

          {!user ? (
            <div className="d-flex justify-content-center gap-3 mb-4">
              <Button variant="primary" size="lg" as={Link} to="/register">
                Get Started
              </Button>
              <Button variant="outline-light" size="lg" as={Link} to="/jobs">
                Browse Jobs
              </Button>
            </div>
          ) : (
            <div className="mb-4">
              {user.role === 'jobseeker' ? (
                <div>
                  <Button variant="primary" size="lg" as={Link} to="/jobs">
                    Browse Jobs
                  </Button>
                </div>
              ) : (
                <div>
                  <Button variant="primary" size="lg" as={Link} to="/post-job">
                    Post a Job
                  </Button>
                </div>
              )}
            </div>
          )}
        </Col>
      </Row>

      <div className="gradient-divider"></div>

      <Row className="g-4 mt-4 position-relative">
        <Col md={4}>
          <Card className="h-100 border-0 glass-panel feature-card">
            <Card.Body className="text-center p-4">
              <div className="mb-3">
                <i className="fas fa-briefcase fa-3x" style={{ color: '#c4b5fd' }}></i>
              </div>
              <Card.Title className="h5 mb-2">For Job Seekers</Card.Title>
              <Card.Text className="text-muted mb-4">
                Search through thousands of job listings, apply with ease, and track your applications.
              </Card.Text>
              <Button variant="outline-light" as={Link} to="/register">
                Find Jobs
              </Button>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="h-100 border-0 glass-panel feature-card">
            <Card.Body className="text-center p-4">
              <div className="mb-3">
                <i className="fas fa-building fa-3x" style={{ color: '#5eead4' }}></i>
              </div>
              <Card.Title className="h5 mb-2">For Employers</Card.Title>
              <Card.Text className="text-muted mb-4">
                Post job openings, review applications, and find the perfect candidates for your team.
              </Card.Text>
              <Button variant="primary" as={Link} to="/register">
                Hire Talent
              </Button>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="h-100 border-0 glass-panel feature-card">
            <Card.Body className="text-center p-4">
              <div className="mb-3">
                <i className="fas fa-rocket fa-3x" style={{ color: '#38bdf8' }}></i>
              </div>
              <Card.Title className="h5 mb-2">Easy to Use</Card.Title>
              <Card.Text className="text-muted mb-4">
                Our intuitive platform makes job searching and hiring simple and efficient.
              </Card.Text>
              <Button variant="outline-light" as={Link} to="/jobs">
                Explore
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Home;

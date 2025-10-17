import { Container, Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="glass-footer mt-auto py-4">
      <Container>
        <Row className="g-4">
          <Col md={4}>
            <div className="mb-3">
              <h5 className="gradient-text fw-bold mb-3">JobPortal</h5>
              <p className="text-muted small mb-0">
                Connecting talented professionals with amazing opportunities. Build your career or find the perfect
                candidate.
              </p>
            </div>
          </Col>

          <Col md={2}>
            <h6 className="text-secondary mb-3">For Job Seekers</h6>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link to="/jobs" className="text-muted text-decoration-none small footer-link">
                  Browse Jobs
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/register" className="text-muted text-decoration-none small footer-link">
                  Create Account
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/my-applications" className="text-muted text-decoration-none small footer-link">
                  My Applications
                </Link>
              </li>
            </ul>
          </Col>

          <Col md={2}>
            <h6 className="text-secondary mb-3">For Employers</h6>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link to="/post-job" className="text-muted text-decoration-none small footer-link">
                  Post a Job
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/applications" className="text-muted text-decoration-none small footer-link">
                  Manage Applications
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/register" className="text-muted text-decoration-none small footer-link">
                  Employer Signup
                </Link>
              </li>
            </ul>
          </Col>

          <Col md={2}>
            <h6 className="text-secondary mb-3">Company</h6>
            <ul className="list-unstyled">
              <li className="mb-2">
                <a href="/" className="text-muted text-decoration-none small footer-link">
                  About Us
                </a>
              </li>
              <li className="mb-2">
                <a href="mailto:support@jobportal.com" className="text-muted text-decoration-none small footer-link">
                  Contact
                </a>
              </li>
              <li className="mb-2">
                <a href="/" className="text-muted text-decoration-none small footer-link">
                  Privacy Policy
                </a>
              </li>
            </ul>
          </Col>

          <Col md={2}>
            <h6 className="text-secondary mb-3">Connect</h6>
            <div className="d-flex gap-3">
              <button 
                className="text-muted footer-social-link border-0 bg-transparent" 
                disabled
                aria-label="LinkedIn (Coming Soon)"
                style={{ opacity: 0.5, cursor: 'not-allowed' }}
              >
                <i className="fab fa-linkedin-in"></i>
              </button>
              <button 
                className="text-muted footer-social-link border-0 bg-transparent" 
                disabled
                aria-label="Twitter (Coming Soon)"
                style={{ opacity: 0.5, cursor: 'not-allowed' }}
              >
                <i className="fab fa-twitter"></i>
              </button>
              <button 
                className="text-muted footer-social-link border-0 bg-transparent" 
                disabled
                aria-label="Facebook (Coming Soon)"
                style={{ opacity: 0.5, cursor: 'not-allowed' }}
              >
                <i className="fab fa-facebook-f"></i>
              </button>
              <button 
                className="text-muted footer-social-link border-0 bg-transparent" 
                disabled
                aria-label="Instagram (Coming Soon)"
                style={{ opacity: 0.5, cursor: 'not-allowed' }}
              >
                <i className="fab fa-instagram"></i>
              </button>
            </div>
          </Col>
        </Row>

        <hr className="my-4" style={{ borderColor: "rgba(148, 163, 184, 0.2)" }} />

        <Row className="align-items-center">
          <Col md={6}>
            <p className="text-muted small mb-0">© {new Date().getFullYear()} JobPortal. All rights reserved.</p>
          </Col>
          <Col md={6} className="text-md-end">
            <p className="text-muted small mb-0">
              Made with <span className="text-danger">❤</span> for connecting careers
            </p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;


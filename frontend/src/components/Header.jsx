import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";
import { Button, Container, Nav, Navbar, NavDropdown } from "react-bootstrap";

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <Navbar expand="lg" variant="dark" className="glass-nav py-3">
      <Container>
        <Navbar.Brand as={Link} to="/" className="fw-bold fs-3 gradient-text">
          JobPortal
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />

        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/" className="text-uppercase small">
              Home
            </Nav.Link>

            {user && (
              <>
                {user.role === "jobseeker" && (
                  <>
                    <Nav.Link as={Link} to="/jobs">
                      Jobs
                    </Nav.Link>
                    <Nav.Link as={Link} to="/my-applications">
                      My Applications
                    </Nav.Link>
                  </>
                )}

                {user.role === "employer" && (
                  <>
                    <Nav.Link as={Link} to="/post-job">
                      Post Job
                    </Nav.Link>
                    <Nav.Link as={Link} to="/applications">
                      Applications
                    </Nav.Link>
                  </>
                )}

                {user.email && user.email.toLowerCase().includes("admin") && (
                  <Nav.Link as={Link} to="/admin">
                    <i className="fas fa-shield-alt me-1"></i>
                    Admin Panel
                  </Nav.Link>
                )}
              </>
            )}
          </Nav>

          <Nav className="d-flex align-items-center gap-2">
            {user ? (
              <NavDropdown
                title={`Welcome, ${user.name}`}
                id="user-dropdown"
                align="end"
                menuVariant="dark"
                className="fw-semibold nav-dropdown"
              >
                <NavDropdown.Item as={Link} to="/profile" className="nav-dropdown-item">
                  <i className="fas fa-user me-2"></i>
                  Profile
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={handleLogout} className="nav-dropdown-item">
                  <i className="fas fa-sign-out-alt me-2"></i>
                  Logout
                </NavDropdown.Item>
              </NavDropdown>
            ) : (
              <>
                <Button variant="outline-light" as={Link} to="/login" className="me-2">
                  Login
                </Button>
                <Button variant="primary" as={Link} to="/register" className="shadow-lg">
                  Register
                </Button>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;

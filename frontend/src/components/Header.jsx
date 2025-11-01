import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";
import { useNotifications } from "../contexts/NotificationsContext.jsx";
import { Badge, Button, Container, Dropdown, Nav, Navbar, NavDropdown, Spinner } from "react-bootstrap";

const Header = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const { user, logout } = useAuth();
  const {
    notifications,
    notificationsLoading,
    unreadNotificationCount,
    markNotificationRead,
    markAllNotificationsRead,
  } = useNotifications();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      markNotificationRead(notification._id);
    }

    setShowNotifications(false);

    if (notification.metadata?.jobId) {
      navigate(`/my-applications?job=${notification.metadata.jobId}`);
    } else {
      navigate("/my-applications");
    }
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
                    <Nav.Link as={Link} to="/jobs">
                      My Jobs
                    </Nav.Link>
                    <Nav.Link as={Link} to="/post-job">
                      Post Job
                    </Nav.Link>
                    <Nav.Link as={Link} to="/applications">
                      Applications
                    </Nav.Link>
                  </>
                )}

                {user.role === 'admin' && (
                  <Nav.Link as={Link} to="/admin">
                    <i className="fas fa-shield-alt me-1"></i>
                    Admin Panel
                  </Nav.Link>
                )}
              </>
            )}
          </Nav>

          <Nav className="d-flex align-items-center gap-3">
            {user ? (
              <>
                <Dropdown 
                  align="end" 
                  className="notification-dropdown"
                  show={showNotifications}
                  onToggle={(show) => setShowNotifications(show)}
                >
                  <Dropdown.Toggle
                    as={Button}
                    variant="outline-light"
                    className="notification-btn rounded-circle d-flex align-items-center justify-content-center position-relative"
                    aria-label={`Notifications${unreadNotificationCount > 0 ? `, ${unreadNotificationCount} unread` : ''}`}
                  >
                    <i className="fas fa-bell" aria-hidden="true"></i>
                    {unreadNotificationCount > 0 && (
                      <Badge bg="danger" pill className="notification-badge">
                        {unreadNotificationCount}
                      </Badge>
                    )}
                  </Dropdown.Toggle>
                  <Dropdown.Menu className="notification-menu">
                    <div className="d-flex align-items-center justify-content-between px-3 py-2">
                      <span className="fw-semibold">Notifications</span>
                      {notifications.length > 0 && (
                        <Button
                          variant="link"
                          size="sm"
                          className="p-0"
                          onClick={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            markAllNotificationsRead();
                          }}
                        >
                          Mark all read
                        </Button>
                      )}
                    </div>
                    <Dropdown.Divider className="my-0" />
                    <div className="notification-list">
                      {notificationsLoading ? (
                        <div className="px-3 py-4 text-center">
                          <Spinner animation="border" size="sm" className="me-2" />
                          Loading notifications...
                        </div>
                      ) : notifications.length === 0 ? (
                        <div className="px-3 py-4 text-center text-muted small">No notifications yet.</div>
                      ) : (
                        notifications.map((notification) => (
                          <Dropdown.Item
                            key={notification._id}
                            className={`notification-item ${notification.isRead ? "" : "unread"}`}
                            onClick={() => handleNotificationClick(notification)}
                          >
                            <div className="fw-semibold small">{notification.title}</div>
                            <div className="small text-muted">{notification.message}</div>
                          </Dropdown.Item>
                        ))
                      )}
                    </div>
                  </Dropdown.Menu>
                </Dropdown>

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
              </>
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

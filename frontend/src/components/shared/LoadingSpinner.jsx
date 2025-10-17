import { Container, Spinner } from "react-bootstrap";

/**
 * Shared loading spinner component for consistent loading states
 * Used across all pages for uniform user experience
 */
const LoadingSpinner = ({ message = "Loading...", size = "default" }) => {
  if (size === "small") {
    return (
      <div className="d-flex align-items-center justify-content-center py-3">
        <Spinner animation="border" size="sm" variant="primary" className="me-2" />
        <span className="text-muted">{message}</span>
      </div>
    );
  }

  return (
    <Container className="py-5">
      <div className="d-flex flex-column align-items-center justify-content-center">
        <Spinner animation="border" variant="primary" className="mb-3" />
        <div>{message}</div>
      </div>
    </Container>
  );
};

export default LoadingSpinner;

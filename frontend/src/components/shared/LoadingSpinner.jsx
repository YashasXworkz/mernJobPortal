import { Container, Spinner } from "react-bootstrap";

/**
 * Shared loading spinner component for consistent loading states
 * Used across all pages for uniform user experience
 */
const LoadingSpinner = ({ message = "Loading...", size = "default" }) => {
  if (size === "small") {
    return (
      <div 
        className="d-flex align-items-center justify-content-center py-3"
        role="status" 
        aria-live="polite" 
        aria-label={message}
      >
        <Spinner animation="border" size="sm" variant="primary" className="me-2" aria-hidden="true" />
        <span className="text-muted">{message}</span>
      </div>
    );
  }

  return (
    <Container className="py-5">
      <div 
        className="d-flex align-items-center justify-content-center gap-3"
        role="status" 
        aria-live="polite" 
        aria-label={message}
      >
        <Spinner animation="border" variant="primary" aria-hidden="true" />
        <div className="text-muted">{message}</div>
      </div>
    </Container>
  );
};

export default LoadingSpinner;

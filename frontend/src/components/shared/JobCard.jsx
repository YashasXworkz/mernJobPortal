import { memo } from "react";
import { Link } from "react-router-dom";
import { Badge, Button, Card, Image } from "react-bootstrap";
import { formatSalary } from "../../lib/utils.js";

const JobCard = memo(({ job, isEmployer, isJobOwner, onEdit, onDelete, loading }) => {
  const companyInfo = job.postedBy?.company;
  const companyLogo = companyInfo?.logo;
  const companyName = companyInfo?.name || job.company;
  const logoInitials = (companyName || "JP").slice(0, 2).toUpperCase();

  const statusVariants = {
    active: "success",
    inactive: "secondary",
    expired: "danger",
    filled: "info",
  };

  return (
    <Card className="job-card glass-panel border-0">
      <Card.Body className="p-4">
        <div className="d-flex flex-column flex-lg-row align-items-start gap-4">
          <div className="flex-grow-1 w-100">
            <div className="d-flex flex-wrap align-items-center gap-3 mb-3">
              <div
                className="d-flex align-items-center justify-content-center rounded-4 shadow-sm"
                style={{
                  width: "52px",
                  height: "52px",
                  background: "rgba(148, 163, 184, 0.12)",
                  border: "1px solid rgba(148, 163, 184, 0.18)",
                }}
              >
                {companyLogo ? (
                  <Image
                    src={companyLogo}
                    alt={`${companyName || "Company"} logo`}
                    rounded
                    loading="lazy"
                    style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "15px" }}
                  />
                ) : (
                  <span className="fw-bold" style={{ color: "var(--color-primary)" }}>
                    {logoInitials}
                  </span>
                )}
              </div>
              <div className="flex-grow-1">
                <div className="d-flex flex-wrap align-items-center gap-2 gap-md-3">
                  <h5 className="mb-0 me-1">
                    <Link
                      to={`/jobs/${job._id}`}
                      className="text-decoration-none fw-bold gradient-text"
                      style={{ fontSize: "1.35rem" }}
                    >
                      {job.title}
                    </Link>
                  </h5>
                  <Badge bg={statusVariants[job.status] || "secondary"} className="status-pill text-uppercase">
                    {job.status}
                  </Badge>
                  {!loading && isEmployer && isJobOwner && (
                    <Badge bg="success" className="status-pill">
                      <i className="fas fa-user me-1"></i>
                      Your Job
                    </Badge>
                  )}
                </div>
                <p className="text-muted fw-semibold mb-0 mt-2">{companyName}</p>
              </div>
            </div>

            <div className="job-card-meta text-muted mb-3">
              <span>
                <i className="fas fa-map-marker-alt"></i>
                {job.location}
              </span>
              <span>
                <i className="fas fa-briefcase"></i>
                {job.type}
              </span>
              {job.experience && (
                <span>
                  <i className="fas fa-chart-line"></i>
                  {job.experience} level
                </span>
              )}
              {job.salary && (
                <span>
                  <i className="fas fa-rupee-sign"></i>
                  {formatSalary(job.salary)}
                </span>
              )}
            </div>

            <p className="text-muted mb-3">
              {job.description.length > 200 ? `${job.description.substring(0, 200)}...` : job.description}
            </p>

            {job.skills && job.skills.length > 0 && (
              <div className="d-flex flex-wrap gap-2">
                {job.skills.slice(0, 5).map((skill, index) => (
                  <span key={`skill-${index}`} className="skill-tag">
                    {skill}
                  </span>
                ))}
                {job.skills.length > 5 && (
                  <small className="text-muted">+{job.skills.length - 5} more skills</small>
                )}
              </div>
            )}
          </div>

          <div className="job-card-actions text-lg-end d-flex flex-column gap-2 align-items-stretch w-100 w-lg-auto" style={{ maxWidth: '200px' }}>
            <small className="text-muted d-block">Posted {new Date(job.createdAt).toLocaleDateString()}</small>
            <Button variant="primary" as={Link} to={`/jobs/${job._id}`} className="view-details-btn">
              View Details
            </Button>
            {!loading && isEmployer && isJobOwner && (
              <div className="d-flex gap-2">
                <Button
                  variant="outline-success"
                  onClick={() => onEdit(job._id)}
                  title="Edit Job"
                  className="flex-fill"
                >
                  <i className="fas fa-pen"></i>
                </Button>
                <Button
                  variant="outline-danger"
                  onClick={() => onDelete(job)}
                  title="Delete Job"
                  className="flex-fill"
                >
                  <i className="fas fa-trash-alt"></i>
                </Button>
              </div>
            )}
          </div>
        </div>
      </Card.Body>
    </Card>
  );
});

JobCard.displayName = 'JobCard';

export default JobCard;

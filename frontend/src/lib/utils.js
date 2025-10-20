/**
 * Format a date string to DD/MM/YYYY format
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date
 */
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const STATUS_VARIANTS = {
  pending: "warning",
  reviewed: "info",
  shortlisted: "success",
  rejected: "danger",
  accepted: "primary",
};

/**
 * Get status badge variant
 * @param {string} status - Application status
 * @returns {string} Badge variant
 */
export const getStatusBadge = (status) => STATUS_VARIANTS[status] || "secondary";

/**
 * Format salary range for display
 * @param {object} salary - Salary object with min/max
 * @returns {string|null} Formatted salary string
 */
export const formatSalary = (salary) => {
  if (!salary) {
    return null;
  }

  if (salary.min != null && salary.max != null) {
    return `₹${salary.min.toLocaleString()} - ₹${salary.max.toLocaleString()}`;
  } else if (salary.min != null) {
    return `From ₹${salary.min.toLocaleString()}`;
  } else if (salary.max != null) {
    return `Up to ₹${salary.max.toLocaleString()}`;
  }

  return null;
};

/**
 * Application status options for dropdowns and filters
 * Centralized to ensure consistency across components
 */
export const APPLICATION_STATUSES = [
  { value: '', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'reviewed', label: 'Reviewed' },
  { value: 'shortlisted', label: 'Shortlisted' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'accepted', label: 'Accepted' }
];

/**
 * Get status label by value
 * @param {string} value - Status value
 * @returns {string} Status label
 */
export const getStatusLabel = (value) => {
  const status = APPLICATION_STATUSES.find(s => s.value === value);
  return status ? status.label : value;
};

export default APPLICATION_STATUSES;

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

export default APPLICATION_STATUSES;

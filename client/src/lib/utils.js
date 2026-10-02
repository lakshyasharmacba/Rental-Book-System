export const formatPrice = (paise) => {
  if (paise == null) return '₹0';
  const rupees = paise / 100;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(rupees);
};

export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(date);
};

export const diffDays = (start, end) => {
  if (!start || !end) return 0;
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diffTime = Math.abs(endDate - startDate);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const getStatusColor = (status) => {
  switch (status?.toUpperCase()) {
    case 'CONFIRMED': return 'bg-blue-100 text-blue-800';
    case 'ACTIVE': return 'bg-green-100 text-green-800';
    case 'OVERDUE': return 'bg-amber-100 text-amber-800';
    case 'DISPUTED': return 'bg-red-100 text-red-800';
    case 'COMPLETED': return 'bg-gray-100 text-gray-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export const getStatusLabel = (status) => {
  if (!status) return 'Unknown';
  const s = status.toLowerCase();
  return s.charAt(0).toUpperCase() + s.slice(1);
};

export const truncate = (text, n) => {
  if (!text) return '';
  return text.length > n ? text.slice(0, n - 1) + '...' : text;
};

export const Badge = ({ children, variant = 'gray', className = '' }) => {
  const variants = {
    blue: 'bg-blue-100 text-blue-800',
    green: 'bg-green-100 text-green-800',
    amber: 'bg-amber-100 text-amber-800',
    red: 'bg-red-100 text-red-800',
    gray: 'bg-gray-100 text-gray-800',
    primary: 'bg-primary/10 text-primary',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-chip text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

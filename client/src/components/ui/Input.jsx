import React from 'react';

export const Input = React.forwardRef(({ className = '', label, error, ...props }, ref) => {
  return (
    <div className="w-full flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium text-text-main">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={`input-field ${error ? 'border-danger focus:ring-danger' : ''} ${className}`}
        {...props}
      />
      {error && (
        <span className="text-sm text-danger mt-1">{error}</span>
      )}
    </div>
  );
});

Input.displayName = 'Input';

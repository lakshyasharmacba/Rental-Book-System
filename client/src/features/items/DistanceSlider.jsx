import React, { useState, useEffect } from 'react';

export const DistanceSlider = ({ value, onChange }) => {
  const [localValue, setLocalValue] = useState(value);

  // Debounce the actual onChange callback
  useEffect(() => {
    const handler = setTimeout(() => {
      onChange(localValue);
    }, 300);
    return () => clearTimeout(handler);
  }, [localValue, onChange]);

  // Sync with prop if it changes externally
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const getTierColor = (val) => {
    if (val <= 50) return 'text-success bg-success';
    if (val <= 100) return 'text-warning bg-warning';
    return 'text-danger bg-danger';
  };

  const colorClass = getTierColor(localValue);

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium text-text-main">
          Distance Radius
        </label>
        <span className={`text-xs font-bold px-2 py-1 rounded-chip bg-opacity-10 ${colorClass.split(' ')[0]} ${colorClass.split(' ')[1].replace('bg-', 'bg-').concat('/10')}`}>
          Within {localValue} km
        </span>
      </div>
      <input
        type="range"
        min="0"
        max="200"
        step="5"
        value={localValue}
        onChange={(e) => setLocalValue(Number(e.target.value))}
        className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${colorClass.split(' ')[1]}`}
      />
      <div className="flex justify-between text-xs text-text-muted">
        <span>0km</span>
        <span>100km</span>
        <span>200km</span>
      </div>
    </div>
  );
};

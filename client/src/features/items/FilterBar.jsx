import React from 'react';
import { DistanceSlider } from './DistanceSlider';
import { Input } from '@/components/ui/Input';

export const FilterBar = ({ filters, setFilters }) => {
  return (
    <div className="flex flex-col gap-4 p-4 bg-surface rounded-card border border-border">
      <h3 className="font-semibold text-text-main">Filters</h3>
      
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-text-main mb-1 block">City</label>
          <Input 
            placeholder="e.g. Mumbai"
            value={filters.city || ''}
            onChange={(e) => setFilters(prev => ({ ...prev, city: e.target.value }))}
          />
        </div>

        <DistanceSlider 
          value={filters.radius || 50} 
          onChange={(val) => setFilters(prev => ({ ...prev, radius: val }))}
        />

        <div className="pt-2 border-t border-border">
          <label className="text-sm font-medium text-text-main mb-1 block">Price Range (per day)</label>
          <div className="flex items-center gap-2">
            <Input 
              type="number" 
              placeholder="Min" 
              value={filters.minPrice || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, minPrice: e.target.value }))}
            />
            <span className="text-text-muted">-</span>
            <Input 
              type="number" 
              placeholder="Max" 
              value={filters.maxPrice || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: e.target.value }))}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

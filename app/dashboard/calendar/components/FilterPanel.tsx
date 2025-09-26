'use client';

import { useState, useEffect } from 'react';

export type FilterState = {
  status: string;
  stage: string;
  partner: string;
  search: string;
};

interface FilterPanelProps {
  onFilterChange: (filters: FilterState) => void;
}

export function FilterPanel({ onFilterChange }: FilterPanelProps) {
  const [partners, setPartners] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const statuses = ['all', 'on-track', 'at-risk', 'delayed'];
  const stages = ['all', 'Design', 'CAD', 'Casting', 'Setting', 'Polishing', 'QC', 'Delivery'];

  useEffect(() => {
    // Use mock partners for now
    setPartners(['all', 'Alice', 'Bob', 'Charlie', 'David']);
    setLoading(false);
  }, []);

  function handleChange(key: keyof FilterState, value: string) {
    onFilterChange({ status: 'all', stage: 'all', partner: 'all', search: '', [key]: value });
  }

  return (
    <div className="filter-panel">
      <h3 className="filter-panel-header">Filters</h3>
      
      <div className="filter-group">
        <label className="filter-label">Status</label>
        <select
          className="filter-select"
          onChange={(e) => handleChange('status', e.target.value)}
        >
          {statuses.map(status => (
            <option key={status} value={status}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label className="filter-label">Stage</label>
        <select
          className="filter-select"
          onChange={(e) => handleChange('stage', e.target.value)}
        >
          {stages.map(stage => (
            <option key={stage} value={stage}>
              {stage}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label className="filter-label">Partner</label>
        <select
          className="filter-select"
          onChange={(e) => handleChange('partner', e.target.value)}
        >
          {partners.map((partner: string) => (
            <option key={partner} value={partner}>
              {partner}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
} 
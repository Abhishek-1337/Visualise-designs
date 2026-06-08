import React from 'react';
import Icon from '../../../components/AppIcon';
import Select from '../../../components/ui/Select';
import Input from '../../../components/ui/Input';

const FilterBar = ({ filters, onFilterChange, onSearch, searchQuery }) => {
  const leadSourceOptions = [
    { value: 'all', label: 'All Sources' },
    { value: 'website', label: 'Website' },
    { value: 'referral', label: 'Referral' },
    { value: 'linkedin', label: 'LinkedIn' },
    { value: 'email', label: 'Email Campaign' },
    { value: 'event', label: 'Event/Conference' }
  ];

  const projectTypeOptions = [
    { value: 'all', label: 'All Project Types' },
    { value: 'residential', label: 'Residential' },
    { value: 'commercial', label: 'Commercial' },
    { value: 'hospitality', label: 'Hospitality' },
    { value: 'retail', label: 'Retail' },
    { value: 'mixed-use', label: 'Mixed-Use' }
  ];

  const teamMemberOptions = [
    { value: 'all', label: 'All Team Members' },
    { value: 'sarah', label: 'Sarah Mitchell' },
    { value: 'james', label: 'James Chen' },
    { value: 'emily', label: 'Emily Rodriguez' },
    { value: 'michael', label: 'Michael Thompson' }
  ];

  return (
    <div className="bg-card rounded-lg shadow-soft-md p-4 mb-4 lg:mb-6 border border-border/50">
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <Input
            type="search"
            placeholder="Search leads by name, company, or project..."
            value={searchQuery}
            onChange={(e) => onSearch(e?.target?.value)}
            className="w-full"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 lg:w-auto">
          <Select
            options={leadSourceOptions}
            value={filters?.source}
            onChange={(value) => onFilterChange('source', value)}
            placeholder="Lead Source"
            className="w-full sm:w-48"
          />

          <Select
            options={projectTypeOptions}
            value={filters?.projectType}
            onChange={(value) => onFilterChange('projectType', value)}
            placeholder="Project Type"
            className="w-full sm:w-48"
          />

          <Select
            options={teamMemberOptions}
            value={filters?.assignedTo}
            onChange={(value) => onFilterChange('assignedTo', value)}
            placeholder="Team Member"
            className="w-full sm:w-48"
          />
        </div>
      </div>
      {(filters?.source !== 'all' || filters?.projectType !== 'all' || filters?.assignedTo !== 'all' || searchQuery) && (
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
          <Icon name="Filter" size={16} color="var(--color-muted-foreground)" />
          <span className="text-xs text-muted-foreground">Active filters:</span>
          <div className="flex flex-wrap gap-2">
            {filters?.source !== 'all' && (
              <span className="px-2 py-1 bg-primary/10 text-primary rounded-md text-xs font-medium flex items-center gap-1">
                Source: {leadSourceOptions?.find(o => o?.value === filters?.source)?.label}
                <button onClick={() => onFilterChange('source', 'all')} className="hover:opacity-70">
                  <Icon name="X" size={12} color="currentColor" />
                </button>
              </span>
            )}
            {filters?.projectType !== 'all' && (
              <span className="px-2 py-1 bg-secondary/10 text-secondary rounded-md text-xs font-medium flex items-center gap-1">
                Type: {projectTypeOptions?.find(o => o?.value === filters?.projectType)?.label}
                <button onClick={() => onFilterChange('projectType', 'all')} className="hover:opacity-70">
                  <Icon name="X" size={12} color="currentColor" />
                </button>
              </span>
            )}
            {filters?.assignedTo !== 'all' && (
              <span className="px-2 py-1 bg-accent/10 text-accent rounded-md text-xs font-medium flex items-center gap-1">
                Assigned: {teamMemberOptions?.find(o => o?.value === filters?.assignedTo)?.label}
                <button onClick={() => onFilterChange('assignedTo', 'all')} className="hover:opacity-70">
                  <Icon name="X" size={12} color="currentColor" />
                </button>
              </span>
            )}
            {searchQuery && (
              <span className="px-2 py-1 bg-muted text-foreground rounded-md text-xs font-medium flex items-center gap-1">
                Search: "{searchQuery}"
                <button onClick={() => onSearch('')} className="hover:opacity-70">
                  <Icon name="X" size={12} color="currentColor" />
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterBar;
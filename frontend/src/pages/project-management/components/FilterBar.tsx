import React from 'react';
import Icon from '../../../components/AppIcon';
import Select from '../../../components/ui/Select';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';

const FilterBar = ({ filters, onFilterChange, onClearFilters }) => {
  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'In Progress', label: 'In Progress' },
    { value: 'On Hold', label: 'On Hold' },
    { value: 'Completed', label: 'Completed' },
    { value: 'Planning', label: 'Planning' }
  ];

  const sortOptions = [
    { value: 'deadline', label: 'Sort by Deadline' },
    { value: 'progress', label: 'Sort by Progress' },
    { value: 'name', label: 'Sort by Name' },
    { value: 'client', label: 'Sort by Client' }
  ];

  const clientOptions = [
    { value: 'all', label: 'All Clients' },
    { value: 'Skyline Architects', label: 'Skyline Architects' },
    { value: 'Urban Design Co', label: 'Urban Design Co' },
    { value: 'Modern Living Group', label: 'Modern Living Group' },
    { value: 'Heritage Restoration', label: 'Heritage Restoration' },
    { value: 'Green Space Developers', label: 'Green Space Developers' }
  ];

  return (
    <div className="bg-card rounded-lg shadow-soft-md p-5 mb-6 border border-border/50">
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <Input
            type="search"
            placeholder="Search projects by name or client..."
            value={filters?.search}
            onChange={(e) => onFilterChange('search', e?.target?.value)}
            className="w-full"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:w-auto">
          <Select
            options={statusOptions}
            value={filters?.status}
            onChange={(value) => onFilterChange('status', value)}
            placeholder="Status"
            className="w-full sm:w-48"
          />

          <Select
            options={clientOptions}
            value={filters?.client}
            onChange={(value) => onFilterChange('client', value)}
            placeholder="Client"
            className="w-full sm:w-48"
          />

          <Select
            options={sortOptions}
            value={filters?.sort}
            onChange={(value) => onFilterChange('sort', value)}
            placeholder="Sort by"
            className="w-full sm:w-48"
          />
        </div>

        {(filters?.search || filters?.status !== 'all' || filters?.client !== 'all') && (
          <Button
            variant="outline"
            size="default"
            iconName="X"
            iconPosition="left"
            onClick={onClearFilters}
            className="lg:w-auto"
          >
            Clear Filters
          </Button>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-border">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Icon name="Layers" size={16} />
          <span className="font-medium">Quick Filters:</span>
        </div>
        <button
          onClick={() => onFilterChange('status', 'In Progress')}
          className="px-3 py-1 rounded-full text-xs font-medium bg-accent/10 text-accent border border-accent/20 hover:bg-accent/20 transition-smooth"
        >
          Active Projects
        </button>
        <button
          onClick={() => onFilterChange('sort', 'deadline')}
          className="px-3 py-1 rounded-full text-xs font-medium bg-warning/10 text-warning border border-warning/20 hover:bg-warning/20 transition-smooth"
        >
          Due Soon
        </button>
        <button
          onClick={() => onFilterChange('status', 'Completed')}
          className="px-3 py-1 rounded-full text-xs font-medium bg-success/10 text-success border border-success/20 hover:bg-success/20 transition-smooth"
        >
          Completed
        </button>
      </div>
    </div>
  );
};

export default FilterBar;
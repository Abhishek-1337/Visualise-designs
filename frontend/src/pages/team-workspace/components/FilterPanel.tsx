import React from 'react';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';

const FilterPanel = ({ filters, onFilterChange, onReset }) => {
  const projectOptions = [
    { value: 'all', label: 'All Projects' },
    { value: 'luxury-villa', label: 'Luxury Villa Render' },
    { value: 'office-complex', label: 'Office Complex' },
    { value: 'residential-tower', label: 'Residential Tower' },
    { value: 'hotel-interior', label: 'Hotel Interior' }
  ];

  const skillOptions = [
    { value: 'all', label: 'All Skills' },
    { value: '3d-modeling', label: '3D Modeling' },
    { value: 'rendering', label: 'Rendering' },
    { value: 'post-production', label: 'Post Production' },
    { value: 'animation', label: 'Animation' }
  ];

  const deadlineOptions = [
    { value: 'all', label: 'All Deadlines' },
    { value: 'today', label: 'Today' },
    { value: 'this-week', label: 'This Week' },
    { value: 'this-month', label: 'This Month' }
  ];

  return (
    <div className="bg-card rounded-xl shadow-warm p-4 md:p-5 lg:p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-heading font-semibold text-base md:text-lg text-foreground">
          Filter Team View
        </h3>
        <Button
          variant="ghost"
          size="sm"
          iconName="RotateCcw"
          iconPosition="left"
          iconSize={16}
          onClick={onReset}
        >
          Reset
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Select
          label="Project"
          options={projectOptions}
          value={filters?.project}
          onChange={(value) => onFilterChange('project', value)}
        />

        <Select
          label="Skill Set"
          options={skillOptions}
          value={filters?.skill}
          onChange={(value) => onFilterChange('skill', value)}
        />

        <Select
          label="Deadline"
          options={deadlineOptions}
          value={filters?.deadline}
          onChange={(value) => onFilterChange('deadline', value)}
        />
      </div>
    </div>
  );
};

export default FilterPanel;
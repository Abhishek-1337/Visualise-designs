import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const EmptyState = ({ onCreateProject }) => {
  return (
    <div className="bg-card rounded-lg shadow-soft-lg p-8 md:p-12 lg:p-16 text-center border border-border/50">
      <div className="max-w-md mx-auto">
        <div className="w-20 h-20 gradient-primary rounded-full flex items-center justify-center mx-auto mb-6 shadow-soft-lg">
          <Icon name="FolderKanban" size={40} color="#FFFFFF" />
        </div>
        <h3 className="font-heading font-semibold text-2xl md:text-3xl text-foreground mb-3">
          No Projects Found
        </h3>
        <p className="text-base md:text-lg text-muted-foreground mb-6 max-w-sm mx-auto">
          Start tracking your architectural visualization projects by creating your first project or adjust your filters to see existing projects.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            variant="default"
            size="lg"
            iconName="Plus"
            iconPosition="left"
            onClick={onCreateProject}
          >
            Create New Project
          </Button>
          <Button
            variant="outline"
            size="lg"
            iconName="Filter"
            iconPosition="left"
          >
            Clear Filters
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EmptyState;
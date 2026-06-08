import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from 'components/ui/Button';
import Icon from 'components/AppIcon';

const NotFound = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-warm-offwhite to-indigo-50/30 p-4">
      <div className="text-center max-w-md animate-fade-in">
        <div className="flex justify-center mb-8">
          <div className="relative">
            <h1 className="text-9xl font-bold bg-gradient-to-br from-indigo-600 to-indigo-400 bg-clip-text text-transparent opacity-30 select-none">404</h1>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-8 shadow-soft-lg mb-8">
          <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Icon name="Search" size={28} color="var(--color-primary)" />
          </div>
          <h2 className="text-2xl font-heading font-bold text-foreground mb-2">Page Not Found</h2>
          <p className="text-muted-foreground">
            The page you're looking for doesn't exist. Let's get you back!
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            variant="outline"
            iconName="ArrowLeft"
            iconPosition="left"
            onClick={() => window.history?.back()}
          >
            Go Back
          </Button>

          <Button
            variant="default"
            iconName="Home"
            iconPosition="left"
            onClick={handleGoHome}
          >
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;

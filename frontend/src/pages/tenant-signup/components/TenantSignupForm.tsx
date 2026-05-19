import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../../../store';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';
import { authService } from '../../../services';
import { login } from '../../../store/slices/authSlice';

interface FormData {
  companyName: string;
  fullName: string;
  email: string;
  password: string;
  agreeToTerms: boolean;
}

interface FormErrors {
  companyName?: string;
  fullName?: string;
  email?: string;
  password?: string;
  agreeToTerms?: string;
  submit?: string;
}

const TenantSignupForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [formData, setFormData] = useState<FormData>({
    companyName: '',
    fullName: '',
    email: '',
    password: '',
    agreeToTerms: false
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors: FormErrors = {};

    if (!formData.companyName.trim()) {
      newErrors.companyName = 'Company name is required';
    }

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Admin name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    setErrors({});

    try {
      const response = await authService.tenantRegister({
        companyName: formData.companyName.trim(),
        name: formData.fullName.trim(),
        email: formData.email.trim(),
        password: formData.password
      });

      dispatch(login({ token: response.data.token }));
      navigate('/home-dashboard');
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to create tenant account. Please try again.';
      setErrors({ submit: message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errors.submit && (
        <div className="bg-error/10 border border-error/20 rounded-lg p-3">
          <p className="text-sm text-error">{errors.submit}</p>
        </div>
      )}

      <Input
        label="Company Name"
        type="text"
        name="companyName"
        placeholder="Acme Visualization Studio"
        value={formData.companyName}
        onChange={(e) => handleInputChange('companyName', (e.target as HTMLInputElement).value)}
        error={errors.companyName}
        required
      />

      <Input
        label="Admin Full Name"
        type="text"
        name="fullName"
        placeholder="John Doe"
        value={formData.fullName}
        onChange={(e) => handleInputChange('fullName', (e.target as HTMLInputElement).value)}
        error={errors.fullName}
        required
      />

      <Input
        label="Admin Email Address"
        type="email"
        name="email"
        placeholder="admin@company.com"
        value={formData.email}
        onChange={(e) => handleInputChange('email', (e.target as HTMLInputElement).value)}
        error={errors.email}
        required
      />

      <Input
        label="Password"
        type="password"
        name="password"
        placeholder="Create a strong password"
        value={formData.password}
        onChange={(e) => handleInputChange('password', (e.target as HTMLInputElement).value)}
        error={errors.password}
        required
      />

      <div className="flex items-start gap-3 pt-2">
        <Checkbox
          checked={formData.agreeToTerms}
          onChange={(e) => handleInputChange('agreeToTerms', (e.target as HTMLInputElement).checked)}
          size="sm"
        />
        <div className="text-sm">
          <span className="text-muted-foreground">I agree to the </span>
          <a href="#" className="text-primary hover:underline">Terms of Service</a>
          {errors.agreeToTerms && <p className="text-xs text-error mt-1">{errors.agreeToTerms}</p>}
        </div>
      </div>

      <Button type="submit" variant="default" size="lg" fullWidth loading={isSubmitting} iconName="Building" iconPosition="left">
        Sign Up Company
      </Button>
    </form>
  );
};

export default TenantSignupForm;

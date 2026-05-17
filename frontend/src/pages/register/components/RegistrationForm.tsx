import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../../../store';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';
import Icon from '../../../components/AppIcon';
import { authService } from '../../../services';
import { login } from '../../../store/slices/authSlice';

type AccountType = 'client' | 'team';

interface FormData {
  fullName: string;
  email: string;
  password: string;
  accountType: AccountType;
  agreeToTerms: boolean;
}

interface FormErrors {
  fullName?: string;
  email?: string;
  password?: string;
  accountType?: string;
  agreeToTerms?: string;
  submit?: string;
}

interface PasswordStrength {
  strength: number;
  label: string;
  color: string;
}

const RegistrationForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    password: '',
    accountType: 'client',
    agreeToTerms: false
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const passwordStrength = (password: string): PasswordStrength => {
    if (!password) return { strength: 0, label: '', color: '' };
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;

    const levels: PasswordStrength[] = [
      { strength: 1, label: 'Weak', color: 'bg-error' },
      { strength: 2, label: 'Fair', color: 'bg-warning' },
      { strength: 3, label: 'Good', color: 'bg-accent' },
      { strength: 4, label: 'Strong', color: 'bg-success' }
    ];

    return levels.find(l => l.strength === strength) || levels[0];
  };

  const validateForm = () => {
    const newErrors: FormErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Name must be at least 2 characters';
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
      newErrors.agreeToTerms = 'You must agree to the terms and conditions';
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
      const role = formData.accountType === 'team' ? 'EMPLOYEE' : 'CLIENT';
      const response = await authService.register({
        name: formData.fullName.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role
      });

      dispatch(login({ token: response.data.token }));
      navigate('/home-dashboard');
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to create account. Please try again.';
      setErrors({ submit: message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const strength = passwordStrength(formData.password);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errors.submit && (
        <div className="bg-error/10 border border-error/20 rounded-lg p-3">
          <p className="text-sm text-error">{errors.submit}</p>
        </div>
      )}

      <Input
        label="Full Name"
        type="text"
        name="fullName"
        placeholder="John Doe"
        value={formData.fullName}
        onChange={(e) => handleInputChange('fullName', (e.target as HTMLInputElement).value)}
        error={errors.fullName}
        required
      />

      <Input
        label="Email Address"
        type="email"
        name="email"
        placeholder="john@company.com"
        value={formData.email}
        onChange={(e) => handleInputChange('email', (e.target as HTMLInputElement).value)}
        error={errors.email}
        required
      />

      <div className="space-y-2">
        <Input
          label="Password"
          type={showPassword ? 'text' : 'password'}
          name="password"
          placeholder="Create a strong password"
          value={formData.password}
          onChange={(e) => handleInputChange('password', (e.target as HTMLInputElement).value)}
          error={errors.password}
          required
        />
        {formData.password && (
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Password strength</span>
              <span className="text-xs font-medium">{strength.label}</span>
            </div>
            <div className="h-1 bg-muted rounded-full overflow-hidden">
              <div className={`h-full transition-all ${strength.color}`} style={{ width: `${(strength.strength / 4) * 100}%` }} />
            </div>
          </div>
        )}
      </div>

      {/* Account Type Selection */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-foreground">I'm signing up as</label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleInputChange('accountType', 'client')}
            className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
              formData.accountType === 'client'
                ? 'border-primary bg-primary/5 shadow-sm'
                : 'border-border bg-card hover:border-muted-foreground/30'
            }`}
          >
            <Icon name="ExternalLink" size={24} color={formData.accountType === 'client' ? 'var(--color-primary)' : 'var(--color-muted-foreground)'} />
            <span className={`text-sm font-semibold ${formData.accountType === 'client' ? 'text-primary' : 'text-foreground'}`}>A Client</span>
            <span className="text-xs text-muted-foreground text-center">I want to receive services & track projects</span>
          </button>
          <button
            type="button"
            onClick={() => handleInputChange('accountType', 'team')}
            className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
              formData.accountType === 'team'
                ? 'border-primary bg-primary/5 shadow-sm'
                : 'border-border bg-card hover:border-muted-foreground/30'
            }`}
          >
            <Icon name="Users" size={24} color={formData.accountType === 'team' ? 'var(--color-primary)' : 'var(--color-muted-foreground)'} />
            <span className={`text-sm font-semibold ${formData.accountType === 'team' ? 'text-primary' : 'text-foreground'}`}>Team Member</span>
            <span className="text-xs text-muted-foreground text-center">I work here — manage clients & projects</span>
          </button>
        </div>
      </div>

      <div className="flex items-start gap-3 pt-2">
        <Checkbox
          checked={formData.agreeToTerms}
          onChange={(e) => handleInputChange('agreeToTerms', (e.target as HTMLInputElement).checked)}
          size="sm"
        />
        <div className="text-sm">
          <span className="text-muted-foreground">I agree to the </span>
          <a href="#" className="text-primary hover:underline">Terms of Service</a>
          <span className="text-muted-foreground"> and </span>
          <a href="#" className="text-primary hover:underline">Privacy Policy</a>
          {errors.agreeToTerms && <p className="text-xs text-error mt-1">{errors.agreeToTerms}</p>}
        </div>
      </div>

      <Button type="submit" variant="default" size="lg" fullWidth loading={isSubmitting} iconName="UserPlus" iconPosition="left">
        Create Account
      </Button>
    </form>
  );
};

export default RegistrationForm;

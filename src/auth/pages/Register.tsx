
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthForm, AuthFormFooter } from '../components/AuthForm';
import AuthInput from '../components/AuthInput';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useAuth } from '../hooks/useAuth';
import { isValidEmail, isStrongPassword } from '../utils/authUtils';
import { toast } from '@/components/ui/sonner';
import { UserPlus } from 'lucide-react';

const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{ 
    name?: string;
    email?: string; 
    password?: string;
    confirmPassword?: string;
  }>({});
  
  const { register, isLoading } = useAuth();
  const navigate = useNavigate();
  
  const validateForm = () => {
    const newErrors: { 
      name?: string;
      email?: string; 
      password?: string;
      confirmPassword?: string;
    } = {};
    
    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (!isStrongPassword(password)) {
      newErrors.password = 'Password must be at least 8 characters with 1 uppercase, 1 lowercase, and 1 number';
    }
    
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      await register(email, password, name);
      toast.success("Registration successful!");
      navigate('/');
    } catch (error: any) {
      toast.error(error.message || "Registration failed");
    }
  };
  
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Create an account</CardTitle>
          <CardDescription className="text-center">
            Enter your details below to create your account
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <AuthForm onSubmit={handleSubmit}>
            <AuthInput
              label="Name"
              id="name"
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={errors.name}
              disabled={isLoading}
              autoComplete="name"
            />
            
            <AuthInput
              label="Email"
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              disabled={isLoading}
              autoComplete="email"
            />
            
            <AuthInput
              label="Password"
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              disabled={isLoading}
              autoComplete="new-password"
            />
            
            <AuthInput
              label="Confirm Password"
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={errors.confirmPassword}
              disabled={isLoading}
              autoComplete="new-password"
            />
            
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-b-transparent" />
                  Creating account...
                </span>
              ) : (
                <span className="flex items-center">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Create account
                </span>
              )}
            </Button>
            
            <AuthFormFooter>
              <span className="text-sm text-muted-foreground">
                Already have an account?
              </span>
              <Link
                to="/auth/login"
                className="text-sm text-primary hover:text-primary/80"
              >
                Sign in
              </Link>
            </AuthFormFooter>
          </AuthForm>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;

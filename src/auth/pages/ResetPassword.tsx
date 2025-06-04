
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthForm, AuthFormFooter } from '../components/AuthForm';
import AuthInput from '../components/AuthInput';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useAuth } from '../hooks/useAuth';
import { isValidEmail } from '../utils/authUtils';
import { toast } from '@/components/ui/sonner';
import { Lock } from 'lucide-react';

const ResetPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<{ email?: string }>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const { resetPassword, isLoading } = useAuth();
  
  const validateForm = () => {
    const newErrors: { email?: string } = {};
    
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      await resetPassword(email);
      setIsSubmitted(true);
      toast.success("Password reset email sent");
    } catch (error: any) {
      toast.error(error.message || "Failed to send reset email");
    }
  };
  
  if (isSubmitted) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Check your email</CardTitle>
            <CardDescription className="text-center">
              We've sent a password reset link to {email}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <p className="text-center text-muted-foreground mb-6">
              If you don't see it in your inbox, please check your spam folder.
            </p>
            <div className="flex space-x-4">
              <Button variant="outline" asChild>
                <Link to="/auth/login">Back to login</Link>
              </Button>
              <Button onClick={() => setIsSubmitted(false)}>
                Try again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Reset your password</CardTitle>
          <CardDescription className="text-center">
            Enter your email to receive a password reset link
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <AuthForm onSubmit={handleSubmit}>
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
            
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-b-transparent" />
                  Sending...
                </span>
              ) : (
                <span className="flex items-center">
                  <Lock className="mr-2 h-4 w-4" />
                  Reset password
                </span>
              )}
            </Button>
            
            <AuthFormFooter>
              <Link 
                to="/auth/login"
                className="text-sm text-primary hover:text-primary/80"
              >
                Back to login
              </Link>
            </AuthFormFooter>
          </AuthForm>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;

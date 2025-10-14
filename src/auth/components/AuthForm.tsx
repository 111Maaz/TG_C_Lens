
import React from 'react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AuthFormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  children: React.ReactNode;
  loading?: boolean;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

export const AuthForm = React.forwardRef<HTMLFormElement, AuthFormProps>(
  ({ className, children, loading = false, onSubmit, ...props }, ref) => {
    return (
      <form
        ref={ref}
        className={cn("space-y-6", className)}
        onSubmit={onSubmit}
        {...props}
      >
        {children}
      </form>
    );
  }
);

AuthForm.displayName = 'AuthForm';

interface AuthFormFooterProps {
  children: React.ReactNode;
  className?: string;
}

export const AuthFormFooter: React.FC<AuthFormFooterProps> = ({ children, className }) => {
  return (
    <div className={cn("flex items-center justify-between mt-6", className)}>
      {children}
    </div>
  );
};

export default AuthForm;

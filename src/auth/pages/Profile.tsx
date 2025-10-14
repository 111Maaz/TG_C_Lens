
import React, { useState } from 'react';
import { SidebarWrapper } from '@/components/AppSidebar';
import { AuthForm } from '../components/AuthForm';
import AuthInput from '../components/AuthInput';
import UserAvatar from '../components/UserAvatar';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useAuth } from '../hooks/useAuth';
import { toast } from '@/components/ui/sonner';
import { getUserRoleDisplay } from '../utils/authUtils';
import { User } from '../contexts/AuthContext';

const Profile: React.FC = () => {
  const { user, updateProfile, isLoading } = useAuth();
  
  const [profileData, setProfileData] = useState<Partial<User>>({
    name: user?.name || '',
    email: user?.email || '',
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  if (!user) {
    return null; // Will be handled by protected route
  }
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!profileData.name?.trim()) {
      newErrors.name = 'Name is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      await updateProfile({
        name: profileData.name,
      });
      toast.success("Profile updated successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    }
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };
  
  return (
    <SidebarWrapper>
      <div className="container max-w-4xl py-8">
        <h1 className="text-3xl font-bold mb-8">Profile Settings</h1>
        
        <div className="grid gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center mb-6">
                <UserAvatar user={user} size="lg" />
                <div className="ml-4">
                  <h3 className="font-medium">{user.name || 'User'}</h3>
                  <p className="text-sm text-muted-foreground">{getUserRoleDisplay(user)}</p>
                </div>
              </div>
              
              <AuthForm onSubmit={handleSubmit}>
                <AuthInput
                  label="Name"
                  id="name"
                  name="name"
                  value={profileData.name}
                  onChange={handleChange}
                  error={errors.name}
                  disabled={isLoading}
                />
                
                <AuthInput
                  label="Email"
                  id="email"
                  name="email"
                  value={profileData.email}
                  disabled={true}
                  error={errors.email}
                />
                
                <Button
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center">
                      <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-b-transparent" />
                      Saving...
                    </span>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </AuthForm>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Security</CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                onClick={() => toast.info("This feature is not implemented in the demo")}
              >
                Change Password
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </SidebarWrapper>
  );
};

export default Profile;

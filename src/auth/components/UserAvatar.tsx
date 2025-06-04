
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials } from '../utils/authUtils';
import { User } from '../contexts/AuthContext';

interface UserAvatarProps {
  user: User;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const UserAvatar: React.FC<UserAvatarProps> = ({ 
  user,
  className,
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-14 w-14'
  };
  
  const avatarSize = sizeClasses[size];
  const initials = getInitials(user.name || user.email);
  
  return (
    <Avatar className={`${avatarSize} ${className || ''}`}>
      {user.avatar && (
        <AvatarImage 
          src={user.avatar} 
          alt={user.name || user.email} 
        />
      )}
      <AvatarFallback className="bg-primary text-primary-foreground">
        {initials}
      </AvatarFallback>
    </Avatar>
  );
};

export default UserAvatar;

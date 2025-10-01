import React from 'react';
import { Button as AntButton, ButtonProps as AntButtonProps } from 'antd';

interface ButtonProps extends AntButtonProps {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
}

const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary', 
  size = 'medium', 
  children, 
  ...props 
}) => {
  return (
    <AntButton 
      type={variant === 'primary' ? 'primary' : variant === 'danger' ? 'primary' : 'default'}
      danger={variant === 'danger'}
      size={size}
      {...props}
    >
      {children}
    </AntButton>
  );
};

export default Button;
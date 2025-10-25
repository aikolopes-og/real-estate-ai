"use client"

import React from 'react'
import { cn } from '@/utils/design'

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

export default function Button({ 
  variant = 'primary', 
  size = 'md', 
  className, 
  children, 
  ...rest 
}: ButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all focus:outline-none focus:ring-4 disabled:opacity-50'
  
  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-300 shadow-md hover:shadow-lg',
    secondary: 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-300 shadow-md hover:shadow-lg',
    ghost: 'bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-blue-300'
  }
  
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-6 py-4 text-lg'
  }
  
  return (
    <button 
      className={cn(baseClasses, variantClasses[variant], sizeClasses[size], className)} 
      {...rest}
    >
      {children}
    </button>
  )
}

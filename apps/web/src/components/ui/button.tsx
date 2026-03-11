import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  className?: string;
}

const variants = {
  primary: 'bg-[#2F3FBF] text-white hover:bg-[#2535a8] active:bg-[#1e2d96]',
  secondary:
    'bg-white text-[#2F3FBF] border border-[#2F3FBF] hover:bg-[#f0f2fd] active:bg-[#e4e7fb]',
  ghost: 'bg-transparent text-[#2F3FBF] hover:bg-[#f0f2fd] active:bg-[#e4e7fb]',
};

export default function Button({
  children,
  variant = 'primary',
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-medium transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2F3FBF] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

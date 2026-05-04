'use client';

import { useTheme } from '../../contexts/ThemeContext';

interface SkeletonProps {
    className?: string;
    variant?: 'text' | 'circular' | 'rectangular';
    animation?: 'pulse' | 'wave' | 'none';
    width?: string | number;
    height?: string | number;
}

export default function Skeleton({
    className = '',
    variant = 'rectangular',
    animation = 'pulse',
    width,
    height
}: SkeletonProps) {
    const { theme } = useTheme();

    const baseClasses = `
    inline-block 
    ${variant === 'circular' ? 'rounded-full' : 'rounded-md'}
    ${animation === 'pulse' ? 'animate-pulse' : ''}
    ${animation === 'wave' ? 'relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[wave_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent' : ''}
    ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-200'}
    ${className}
  `;

    const style: React.CSSProperties = {
        width: width ? (typeof width === 'number' ? `${width}px` : width) : '100%',
        height: height ? (typeof height === 'number' ? `${height}px` : height) : variant === 'text' ? '1em' : '100%',
    };

    return (
        <div className={baseClasses} style={style}>
            <style jsx>{`
        @keyframes wave {
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
        </div>
    );
}

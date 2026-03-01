'use client';

import { useTheme } from '../../contexts/ThemeContext';

interface LoadingProps {
  size?: number | string;
  fullPage?: boolean;
  text?: string;
}

export default function Loading({ size, fullPage = false, text }: LoadingProps) {
  const { theme } = useTheme();

  // Handle default sizes if string is passed
  const getPixelSize = (s: number | string | undefined) => {
    if (!s) return '250px';
    if (typeof s === 'number') return `${s}px`;
    if (s === 'small') return '40px';
    if (s === 'medium') return '100px';
    if (s === 'large') return '250px';
    return s;
  };

  const finalSize = getPixelSize(size);

  return (
    <div className={`${fullPage ? 'fixed inset-0 z-[9999] flex flex-col items-center justify-center backdrop-blur-md' : 'flex flex-col items-center justify-center'} ${theme === 'dark' ? 'bg-black/80 text-white' : 'bg-white/60 text-blue-600'}`}>
      <div className="loader">
        <div className="box">
          <div className="logo">
            <svg
              width="1235"
              height="1608"
              viewBox="0 0 1235 1608"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="svg"
            >
              <path d="M1169 0H66C29.5492 0 0 29.5493 0 66.0001V582.951C0 627.333 42.9261 659.065 85.3563 646.049L1188.36 307.685C1216.08 299.181 1235 273.582 1235 244.587V66C1235 29.5492 1205.45 0 1169 0Z" fill="currentColor" />
              <path d="M1013.85 903.191L687.371 583.66C652.173 549.211 593.009 564.055 578.243 611.04L292.255 1521C271.752 1586.24 351.795 1635.77 401.025 1588.31L1013.49 997.875C1040.27 972.055 1040.43 929.212 1013.85 903.191Z" fill="currentColor" />
            </svg>
          </div>
        </div>
        <div className="box"></div>
        <div className="box"></div>
        <div className="box"></div>
        <div className="box"></div>

        <style jsx>{`
          .loader {
            --size: ${finalSize};
            --duration: 2s;
            --logo-color: ${theme === 'dark' ? '#1e293b' : '#2563eb'};
            --glow-color: ${theme === 'dark' ? '#3b82f6' : '#60a5fa'};
            --ripple-bg: ${theme === 'dark'
            ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.8) 100%)'
            : 'linear-gradient(135deg, rgba(219, 234, 254, 0.4) 0%, rgba(191, 219, 254, 0.3) 100%)'};
            height: var(--size);
            width: var(--size);
            aspect-ratio: 1;
            position: relative;
          }

          .loader .box {
            position: absolute;
            background: var(--ripple-bg);
            border-radius: 50%;
            border-top: 1.5px solid ${theme === 'dark' ? '#334155' : '#bfdbfe'};
            box-shadow: ${theme === 'dark'
            ? 'rgba(0, 0, 0, 0.5) 0px 10px 20px -5px'
            : 'rgba(37, 99, 235, 0.1) 0px 10px 20px -5px'};
            backdrop-filter: blur(10px);
            animation: ripple var(--duration) infinite ease-in-out;
          }

          .loader .box:nth-child(1) {
            inset: 38%;
            z-index: 99;
            ${theme === 'dark' ? 'border: 1px solid #1e293b;' : 'border: 1px solid #3b82f6; shadow: 0 0 15px #3b82f644;'}
          }

          .loader .box:nth-child(2) {
            inset: 28%;
            z-index: 98;
            border-color: ${theme === 'dark' ? '#33415599' : '#3b82f666'};
            animation-delay: 0.2s;
          }

          .loader .box:nth-child(3) {
            inset: 18%;
            z-index: 97;
            border-color: ${theme === 'dark' ? '#33415566' : '#3b82f644'};
            animation-delay: 0.4s;
          }

          .loader .box:nth-child(4) {
            inset: 8%;
            z-index: 96;
            border-color: ${theme === 'dark' ? '#33415544' : '#3b82f622'};
            animation-delay: 0.6s;
          }

          .loader .box:nth-child(5) {
            inset: -2%;
            z-index: 95;
            border-color: ${theme === 'dark' ? '#33415522' : '#3b82f611'};
            animation-delay: 0.8s;
          }

          .loader .logo {
            position: absolute;
            inset: 0;
            display: grid;
            place-content: center;
            padding: 25%;
          }

          .loader .logo svg {
            fill: var(--logo-color);
            width: 100%;
            height: auto;
            animation: color-change var(--duration) infinite ease-in-out;
            filter: ${theme === 'dark' ? 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.3))' : 'none'};
          }

          @keyframes ripple {
            0% {
              transform: scale(1);
              opacity: 0.8;
            }
            50% {
              transform: scale(1.12);
              opacity: 1;
              ${theme === 'dark' ? 'background: #0f172a;' : 'background: #eff6ff;'}
            }
            100% {
              transform: scale(1);
              opacity: 0.8;
            }
          }

          @keyframes color-change {
            0% {
              fill: var(--logo-color);
            }
            50% {
              fill: var(--glow-color);
              ${theme === 'dark' ? 'filter: drop-shadow(0 0 15px #3b82f6);' : 'filter: drop-shadow(0 0 12px #2563eb66);'}
            }
            100% {
              fill: var(--logo-color);
            }
          }
        `}</style>
      </div>
      {text && (
        <p className={`mt-8 text-lg font-bold tracking-wider uppercase animate-pulse transition-colors ${theme === 'dark' ? 'text-gray-400' : 'text-blue-600'}`}>
          {text}
        </p>
      )}
    </div>
  );
}
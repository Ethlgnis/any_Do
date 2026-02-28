import React from 'react';
import './Logo.scss';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
}

const Logo: React.FC<LogoProps> = ({ className = '', size = 'md', showText = true }) => {
  return (
    <div className={`anydo-logo ${size} ${className}`}>
      <svg
        viewBox="0 0 210 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="logo-svg"
      >
        {/* Futuristic "A" */}
        <path
          d="M5 65L30 15L55 65M17 45H43"
          className="logo-path a-path"
          stroke="currentColor"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <path d="M28 40L32 40" stroke="white" strokeWidth="6" className="gap-path" />

        {/* Futuristic "n" */}
        <path
          d="M62 65V35C62 25 69 20 77 20C85 20 92 25 92 35V65"
          className="logo-path n-path"
          stroke="currentColor"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <path d="M75 30L79 30" stroke="white" strokeWidth="6" className="gap-path" />

        {/* Futuristic "y" */}
        <path
          d="M102 20L117 45L132 20M117 45V70C117 75 112 78 107 78"
          className="logo-path y-path"
          stroke="currentColor"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <path d="M115 55L119 55" stroke="white" strokeWidth="6" className="gap-path" />

        {/* Futuristic "D" */}
        <path
          d="M142 15V65C142 65 167 65 167 40C167 15 142 15 142 15Z"
          className="logo-path d-path"
          stroke="currentColor"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <path d="M165 38L165 42" stroke="white" strokeWidth="6" className="gap-path" />

        {/* Futuristic "o" */}
        <circle
          cx="190"
          cy="40"
          r="16"
          className="logo-path o-path"
          stroke="currentColor"
          strokeWidth="3.5"
        />
        <path d="M178 33L182 37" stroke="white" strokeWidth="6" className="gap-path" />
        <path d="M198 43L202 47" stroke="white" strokeWidth="6" className="gap-path" />
      </svg>
    </div>
  );
};

export default Logo;

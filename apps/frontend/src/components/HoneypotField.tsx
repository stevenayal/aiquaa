import React from 'react';

interface HoneypotFieldProps {
  name?: string;
  className?: string;
}

export const HoneypotField: React.FC<HoneypotFieldProps> = ({
  name = 'website',
  className = '',
}) => {
  return (
    <div
      className={`absolute left-[-9999px] ${className}`}
      aria-hidden="true"
      data-testid="honeypot-field"
    >
      <label htmlFor={name} className="sr-only">
        No llenar este campo
      </label>
      <input
        type="text"
        id={name}
        name={name}
        tabIndex={-1}
        autoComplete="off"
        className="sr-only"
        aria-hidden="true"
      />
    </div>
  );
};

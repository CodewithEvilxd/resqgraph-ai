import React from 'react';

export default function LogoIcon({ className }: { className?: string }) {
  return (
    <img
      src="/logo-128.png"
      alt="ResQGraph Logo"
      className={className || 'w-11 h-11 object-contain'}
    />
  );
}

import React from 'react';

const Logo = ({ className = "" }) => {
  return (
    <div className={`flex items-center gap-1.5 font-black tracking-tighter select-none ${className}`}>
      <span className="text-2xl sm:text-3xl text-white drop-shadow-[0_2px_10px_rgba(255,255,255,0.1)]">
        WAVI
      </span>
      <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse shadow-[0_0_10px_#ffffff]" />
    </div>
  );
};

export default Logo;

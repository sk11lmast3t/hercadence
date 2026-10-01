import React, { useState, useEffect } from 'react';
import { Wifi } from 'lucide-react';

export const MobileStatusBar: React.FC = () => {
  const [timeStr, setTimeStr] = useState<string>('9:41');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours() % 12 || 12;
      const minutes = now.getMinutes();
      setTimeStr(`${hours}:${minutes < 10 ? '0' : ''}${minutes}`);
    };
    updateTime();
    const timer = setInterval(updateTime, 30000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="mobile-status-bar w-full flex items-center justify-between px-6 pt-3 pb-1 text-[#1E191D] z-30 select-none">
      {/* Dynamic Clock */}
      <span className="text-[14.5px] font-semibold tracking-tight">{timeStr}</span>

      {/* Status Icons: Cellular (4 bars), Wi-Fi, Battery */}
      <div className="flex items-center gap-2">
        {/* Cellular 4 bars */}
        <div className="flex items-end gap-[1.5px] h-3">
          <span className="w-[3px] h-[3px] bg-[#1E191D] rounded-[0.5px]" />
          <span className="w-[3px] h-[5.5px] bg-[#1E191D] rounded-[0.5px]" />
          <span className="w-[3px] h-[8px] bg-[#1E191D] rounded-[0.5px]" />
          <span className="w-[3px] h-[11px] bg-[#1E191D] rounded-[0.5px]" />
        </div>

        {/* Wi-Fi Icon */}
        <Wifi size={14} strokeWidth={2.4} className="text-[#1E191D]" />

        {/* Battery Outline with fill */}
        <div className="flex items-center">
          <div className="w-[21px] h-[11.5px] rounded-[3.5px] border-[1.5px] border-[#1E191D] p-[1.5px] flex items-center">
            <div className="w-full h-full bg-[#1E191D] rounded-[1.5px]" />
          </div>
          <div className="w-[1.5px] h-[4px] bg-[#1E191D] rounded-r-[1px] -ml-[0.5px]" />
        </div>
      </div>
    </div>
  );
};

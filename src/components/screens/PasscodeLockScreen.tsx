import React, { useState } from 'react';
import { Delete, ScanFace, ChevronLeft, Check } from 'lucide-react';
import { motion } from 'motion/react';
import { useCycle } from '../../context/CycleContext';

interface PasscodeLockScreenProps {
  onBack: () => void;
  isEnforcingLock?: boolean;
  onUnlocked?: () => void;
}

export const PasscodeLockScreen: React.FC<PasscodeLockScreenProps> = ({
  onBack,
  isEnforcingLock = false,
  onUnlocked
}) => {
  const { settings, updateSettings } = useCycle();
  const [pin, setPin] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleKeyPress = (num: number) => {
    if (pin.length < 4) {
      const nextPin = pin + num;
      setPin(nextPin);
      if (nextPin.length === 4) {
        verifyPin(nextPin);
      }
    }
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
    setErrorMsg(null);
  };

  const verifyPin = (enteredPin: string) => {
    if (isEnforcingLock) {
      if (enteredPin === (settings.passcode || '1234')) {
        if (onUnlocked) onUnlocked();
      } else {
        setErrorMsg('Incorrect Passcode. Try again.');
        setTimeout(() => setPin(''), 600);
      }
    } else {
      updateSettings({
        isPasscodeEnabled: true,
        passcode: enteredPin
      });
      setSuccessMsg('Passcode saved!');
      setTimeout(() => {
        setSuccessMsg(null);
        setPin('');
        onBack();
      }, 1200);
    }
  };

  const simulateFaceId = () => {
    if (isEnforcingLock) {
      if (onUnlocked) onUnlocked();
    } else {
      setSuccessMsg('Biometric authentication verified!');
      setTimeout(() => setSuccessMsg(null), 1500);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between p-6 max-w-md mx-auto overflow-hidden select-none">
      {/* Full-Screen Botanical Background Artwork */}
      <div className="absolute inset-0 z-0">
        <img
          src="/assets/img_passcode_lock_bg_1787818421798.jpg"
          alt="Abstract Passcode Artwork"
          className="w-full h-full object-cover object-center"
        />
        {/* Soft dark/light overlay for text legibility */}
        <div className="absolute inset-0 bg-black/15 backdrop-blur-[2px]" />
      </div>

      {/* Top Header & PIN Bubbles */}
      <div className="relative z-10 pt-12 text-center space-y-8">
        {!isEnforcingLock && (
          <button
            onClick={onBack}
            className="absolute top-2 left-0 w-10 h-10 rounded-full bg-white/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/60 active:scale-95 transition-all"
            title="Go back"
          >
            <ChevronLeft size={22} />
          </button>
        )}

        <div className="space-y-1.5 pt-2">
          <h1 className="text-[34px] sm:text-[38px] font-semibold text-white tracking-tight drop-shadow-sm">
            Enter Passcode
          </h1>
          <p className="text-[17px] sm:text-[18px] text-white/90 font-normal">
            to unlock CycleWell.
          </p>
        </div>

        {/* 4 Large Golden-Rimmed Bubbles */}
        <div className="flex justify-center items-center gap-4.5 pt-2">
          {[0, 1, 2, 3].map((index) => {
            const isFilled = pin.length > index;
            return (
              <div
                key={index}
                className={`w-16 h-16 rounded-full border-2 border-[#E7C698] flex items-center justify-center transition-all ${
                  isFilled
                    ? 'bg-white shadow-[0_0_20px_rgba(231,198,152,0.8)] scale-105'
                    : 'bg-white/60 backdrop-blur-md shadow-md'
                }`}
              >
                {isFilled && (
                  <div className="w-4 h-4 rounded-full bg-[#4A3245]" />
                )}
              </div>
            );
          })}
        </div>

        {errorMsg && (
          <p className="text-sm font-semibold text-rose-300 drop-shadow-md">
            {errorMsg}
          </p>
        )}

        {successMsg && (
          <p className="text-sm font-semibold text-emerald-300 drop-shadow-md flex items-center justify-center gap-1.5">
            <Check size={16} /> {successMsg}
          </p>
        )}
      </div>

      {/* Numeric Keypad */}
      <div className="relative z-10 space-y-6 pb-6">
        <div className="grid grid-cols-3 gap-5 max-w-[280px] sm:max-w-[300px] mx-auto text-center">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => handleKeyPress(num)}
              className="w-18 h-18 sm:w-20 sm:h-20 rounded-full bg-white/75 hover:bg-white border-2 border-[#E7C698]/90 text-[30px] font-medium text-[#20141E] shadow-[0_4px_16px_rgba(0,0,0,0.08)] backdrop-blur-md active:scale-95 transition-all flex items-center justify-center cursor-pointer mx-auto"
            >
              {num}
            </button>
          ))}

          {/* Empty / placeholder for grid alignment */}
          <div className="w-18 h-18 sm:w-20 sm:h-20" />

          {/* 0 */}
          <button
            type="button"
            onClick={() => handleKeyPress(0)}
            className="w-18 h-18 sm:w-20 sm:h-20 rounded-full bg-white/75 hover:bg-white border-2 border-[#E7C698]/90 text-[30px] font-medium text-[#20141E] shadow-[0_4px_16px_rgba(0,0,0,0.08)] backdrop-blur-md active:scale-95 transition-all flex items-center justify-center cursor-pointer mx-auto"
          >
            0
          </button>

          {/* Delete Button */}
          <button
            type="button"
            onClick={handleDelete}
            className="w-18 h-18 sm:w-20 sm:h-20 rounded-full bg-white/75 hover:bg-white border-2 border-[#E7C698]/90 text-[#20141E] shadow-[0_4px_16px_rgba(0,0,0,0.08)] backdrop-blur-md active:scale-95 transition-all flex items-center justify-center cursor-pointer mx-auto"
          >
            <Delete size={26} strokeWidth={2} />
          </button>
        </div>

        {/* Use Face ID Pill */}
        <div className="flex justify-center pt-2">
          <button
            type="button"
            onClick={simulateFaceId}
            className="px-6 py-3 rounded-full bg-white/70 hover:bg-white/85 backdrop-blur-md border border-white/80 shadow-md flex items-center gap-2.5 text-sm font-semibold text-[#20141E] cursor-pointer transition-all active:scale-95"
          >
            <ScanFace size={20} strokeWidth={2} className="text-[#20141E]" />
            <span>Use Face ID</span>
          </button>
        </div>
      </div>
    </div>
  );
};

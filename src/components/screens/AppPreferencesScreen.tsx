import React, { useState } from 'react';
import { ChevronRight, ArrowRight, ChevronLeft } from 'lucide-react';
import { useCycle } from '../../context/CycleContext';
import { useProfile } from '../../hooks/useProfile';

interface AppPreferencesScreenProps {
  onBack: () => void;
}

export const AppPreferencesScreen: React.FC<AppPreferencesScreenProps> = ({ onBack }) => {
  const { settings, updateSettings } = useCycle();
  const { saveProfile } = useProfile();
  const [showWeekNumbers, setShowWeekNumbers] = useState(false);

  const handleUpdateUnit = (unitUpdate: { temperatureUnit?: 'Celsius' | 'Fahrenheit'; weightUnit?: 'kg' | 'lb' }) => {
    updateSettings(unitUpdate);
    saveProfile(unitUpdate);
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#241C22] pb-32 relative overflow-x-hidden selection:bg-[#DE9E8E]/30">
      {/* Top Graphic Header Area */}
      <div className="relative w-full h-[180px] sm:h-[200px] overflow-hidden">
        <img
          src="/assets/img_pref_header_bg_1787818748033.jpg"
          alt="App Preferences botanical background"
          className="w-full h-full object-cover object-top"
        />
        {/* Soft bottom fade */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#FDFBF7]" />

        {/* Back Button */}
        <button
          onClick={onBack}
          id="app_pref_back_btn"
          className="absolute top-4 left-4 z-20 w-10 h-10 rounded-full bg-white/60 backdrop-blur-md border border-white/80 flex items-center justify-center text-[#2A2328] hover:bg-white/90 active:scale-95 transition-all shadow-sm cursor-pointer"
          title="Go back"
        >
          <ChevronLeft size={22} strokeWidth={2.4} />
        </button>

        {/* Title */}
        <div className="absolute inset-0 flex items-center justify-center pt-8 pointer-events-none">
          <h1 className="text-[34px] sm:text-[38px] font-normal text-[#2A2228] tracking-tight font-sans">
            App Preferences
          </h1>
        </div>
      </div>

      {/* Main Settings Content */}
      <main className="max-w-md mx-auto px-5 sm:px-6 space-y-4 -mt-2">
        {/* Card 1: Units */}
        <div className="bg-white/95 backdrop-blur-md rounded-[26px] p-5 border border-[#EDE5DF] shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-4">
          <h2 className="text-[19px] font-semibold text-[#20181F] tracking-tight">Units</h2>

          {/* Temperature */}
          <div className="flex items-center justify-between">
            <span className="text-[15px] font-medium text-[#20181F]">Temperature</span>
            <div className="flex bg-[#EFECE8] p-1 rounded-xl gap-1">
              <button
                type="button"
                onClick={() => handleUpdateUnit({ temperatureUnit: 'Celsius' })}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  settings.temperatureUnit === 'Celsius'
                    ? 'bg-white text-[#20181F] shadow-sm'
                    : 'text-[#6C6369] hover:text-[#20181F]'
                }`}
              >
                Celsius
              </button>
              <button
                type="button"
                onClick={() => handleUpdateUnit({ temperatureUnit: 'Fahrenheit' })}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  settings.temperatureUnit === 'Fahrenheit'
                    ? 'bg-white text-[#20181F] shadow-sm'
                    : 'text-[#6C6369] hover:text-[#20181F]'
                }`}
              >
                Fahrenheit
              </button>
            </div>
          </div>

          <div className="h-px bg-[#F3EFEA]" />

          {/* Weight */}
          <div className="flex items-center justify-between">
            <span className="text-[15px] font-medium text-[#20181F]">Weight</span>
            <div className="flex bg-[#EFECE8] p-1 rounded-xl gap-1">
              <button
                type="button"
                onClick={() => handleUpdateUnit({ weightUnit: 'kg' })}
                className={`px-5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  settings.weightUnit === 'kg'
                    ? 'bg-white text-[#20181F] shadow-sm'
                    : 'text-[#6C6369] hover:text-[#20181F]'
                }`}
              >
                kg
              </button>
              <button
                type="button"
                onClick={() => handleUpdateUnit({ weightUnit: 'lb' })}
                className={`px-5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  settings.weightUnit === 'lb'
                    ? 'bg-white text-[#20181F] shadow-sm'
                    : 'text-[#6C6369] hover:text-[#20181F]'
                }`}
              >
                lb
              </button>
            </div>
          </div>
        </div>

        {/* Card 2: Language & Region */}
        <div className="bg-white/95 backdrop-blur-md rounded-[26px] p-5 border border-[#EDE5DF] shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-4">
          <h2 className="text-[19px] font-semibold text-[#20181F] tracking-tight">Language & Region</h2>

          <div className="flex items-center justify-between">
            <span className="text-[15px] font-medium text-[#20181F]">Language</span>
            <div className="flex items-center gap-1.5 text-sm font-medium text-[#20181F]">
              <ArrowRight size={15} className="text-[#6C6369]" />
              <span>English (US)</span>
            </div>
          </div>

          <div className="h-px bg-[#F3EFEA]" />

          <div className="flex items-center justify-between">
            <span className="text-[15px] font-medium text-[#20181F]">Region</span>
            <div className="flex items-center gap-1.5 text-sm font-medium text-[#20181F]">
              <ArrowRight size={15} className="text-[#6C6369]" />
              <span>United States</span>
            </div>
          </div>
        </div>

        {/* Card 3: Calendar Settings */}
        <div className="bg-white/95 backdrop-blur-md rounded-[26px] p-5 border border-[#EDE5DF] shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-4">
          <h2 className="text-[19px] font-semibold text-[#20181F] tracking-tight">Calendar Settings</h2>

          <div className="flex items-center justify-between">
            <span className="text-[15px] font-medium text-[#20181F]">Start Day of Week</span>
            <div className="flex items-center gap-1.5 text-sm font-medium text-[#20181F]">
              <ArrowRight size={15} className="text-[#6C6369]" />
              <span>Sunday</span>
            </div>
          </div>

          <div className="h-px bg-[#F3EFEA]" />

          <div className="flex items-center justify-between">
            <span className="text-[15px] font-medium text-[#20181F]">Show Week Numbers</span>
            {/* Custom iOS switch */}
            <button
              type="button"
              onClick={() => setShowWeekNumbers(!showWeekNumbers)}
              className={`w-13 h-7 rounded-full p-0.5 transition-colors cursor-pointer flex items-center ${
                showWeekNumbers ? 'bg-[#D6897E]' : 'bg-[#DDD3CB]'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform ${
                  showWeekNumbers ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Card 4: Privacy & Data */}
        <div className="bg-white/95 backdrop-blur-md rounded-[26px] p-5 border border-[#EDE5DF] shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-3">
          <h2 className="text-[19px] font-semibold text-[#20181F] tracking-tight">Privacy & Data</h2>
          <div className="flex items-center justify-between pt-1 cursor-pointer group">
            <span className="text-[15px] font-medium text-[#D6897E] group-hover:text-[#BF746A] transition-colors">
              Manage Permissions & Data
            </span>
            <ChevronRight size={18} className="text-[#D6897E] group-hover:translate-x-0.5 transition-all" />
          </div>
        </div>
      </main>
    </div>
  );
};


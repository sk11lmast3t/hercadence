import React, { useState } from 'react';
import { ChevronLeft, Check, Edit2, Info } from 'lucide-react';
import { useCycle } from '../../context/CycleContext';

interface BbtLogScreenProps {
  onBack: () => void;
}

export const BbtLogScreen: React.FC<BbtLogScreenProps> = ({ onBack }) => {
  const { settings, updateSettings, dayLogs, saveDayLog, currentCycle } = useCycle();
  const isCelsius = settings.temperatureUnit === 'Celsius';
  const unit = isCelsius ? '°C' : '°F';
  
  const todayStr = new Date().toISOString().split('T')[0];
  const todayLog = dayLogs[todayStr];

  // Base default temps for F vs C
  const defaultF = 97.9;
  const defaultC = 36.6;

  const currentNumericTemp = todayLog?.bbt
    ? todayLog.bbt
    : (isCelsius ? defaultC : defaultF);

  const [currentTemp, setCurrentTemp] = useState(currentNumericTemp.toFixed(1));
  const [loggedTime, setLoggedTime] = useState('7:30 AM');
  const [isEditing, setIsEditing] = useState(false);
  const [inputTemp, setInputTemp] = useState(currentNumericTemp.toFixed(1));

  // Compute dynamic gauge angles and coordinates
  // Range: 96.5°F to 99.0°F (or 35.8°C to 37.5°C)
  const minTemp = isCelsius ? 35.8 : 96.5;
  const maxTemp = isCelsius ? 37.5 : 99.0;
  const tempVal = parseFloat(currentTemp) || (isCelsius ? defaultC : defaultF);
  const clampedVal = Math.min(Math.max(tempVal, minTemp), maxTemp);
  const fraction = (clampedVal - minTemp) / (maxTemp - minTemp);

  // SVG Gauge calculations
  // Gauge arc goes from angle 180° (left, x=25, y=120) to 0° (right, x=175, y=120)
  const radius = 75;
  const cx = 100;
  const cy = 120;
  const gaugeAngleRad = Math.PI * (1 - fraction); // from PI down to 0
  const knobX = cx + radius * Math.cos(gaugeAngleRad);
  const knobY = cy - radius * Math.sin(gaugeAngleRad);

  // SVG path for active arc: from (25, 120) to (knobX, knobY)
  const largeArcFlag = fraction > 0.5 ? 0 : 0;
  const activeArcPath = `M 25 120 A ${radius} ${radius} 0 ${largeArcFlag} 1 ${knobX.toFixed(1)} ${knobY.toFixed(1)}`;

  const handleSaveTemp = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const val = parseFloat(inputTemp);
    if (!isNaN(val)) {
      setCurrentTemp(val.toFixed(1));
      setLoggedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      const todayDate = new Date().toISOString().split('T')[0];
      saveDayLog(todayDate, { bbt: val });
    }
    setIsEditing(false);
  };

  const handleToggleUnit = () => {
    const nextUnit = isCelsius ? 'Fahrenheit' : 'Celsius';
    const cur = parseFloat(currentTemp);
    let converted = cur;
    if (nextUnit === 'Celsius') {
      converted = ((cur - 32) * 5) / 9;
    } else {
      converted = (cur * 9) / 5 + 32;
    }
    setCurrentTemp(converted.toFixed(1));
    setInputTemp(converted.toFixed(1));
    updateSettings({ temperatureUnit: nextUnit });
  };

  // 30-day thermal chart polyline data
  const chartPointsF = [
    { x: 10, y: 75, label: 'Oct 1' },
    { x: 30, y: 72 },
    { x: 50, y: 74 },
    { x: 70, y: 85 },
    { x: 90, y: 60, label: 'Oct 8' },
    { x: 110, y: 92 },
    { x: 130, y: 80 },
    { x: 150, y: 58 },
    { x: 170, y: 64 },
    { x: 190, y: 86, label: 'Oct 15' },
    { x: 210, y: 68 },
    { x: 230, y: 72 },
    { x: 250, y: 54 },
    { x: 270, y: 35, label: 'Oct 22' },
    { x: 290, y: 62 },
    { x: 310, y: 22 },
    { x: 330, y: 34 },
    { x: 350, y: 44 },
    { x: 370, y: 56 }
  ];

  const polylineStr = chartPointsF.map((pt) => `${pt.x},${pt.y}`).join(' ');

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#241C22] pb-32 relative overflow-x-hidden selection:bg-[#DE9E8E]/30">
      {/* Top Header Background with Wave Art */}
      <div className="relative w-full h-[180px] sm:h-[200px] overflow-hidden">
        <img
          src="/assets/img_bbt_header_bg_1787903127055.jpg"
          alt="Basal Body Temperature Wave Header"
          className="w-full h-full object-cover object-top"
        />
        {/* Soft bottom fade */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#FDFBF7]" />

        {/* Back Button */}
        <button
          onClick={onBack}
          id="bbt_back_btn"
          className="absolute top-4 left-4 z-20 w-10 h-10 rounded-full bg-white/60 backdrop-blur-md border border-white/80 flex items-center justify-center text-[#2A2328] hover:bg-white/90 active:scale-95 transition-all shadow-sm cursor-pointer"
          title="Go back"
        >
          <ChevronLeft size={22} strokeWidth={2.4} />
        </button>

        {/* Unit Switch Button on Top Right */}
        <button
          onClick={handleToggleUnit}
          id="bbt_unit_toggle_btn"
          className="absolute top-4 right-4 z-20 px-3 py-1.5 rounded-full bg-white/70 backdrop-blur-md border border-white/80 flex items-center gap-1 text-xs font-semibold text-[#523446] hover:bg-white active:scale-95 transition-all shadow-sm cursor-pointer"
          title="Switch temperature unit"
        >
          <span>{isCelsius ? 'Switch to °F' : 'Switch to °C'}</span>
        </button>

        {/* Header Title */}
        <div className="absolute inset-0 flex items-center justify-center pt-8 pointer-events-none">
          <h1 className="font-serif text-[34px] sm:text-[38px] font-normal text-[#20141E] tracking-tight">
            Basal Body Temperature
          </h1>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-md mx-auto px-5 sm:px-6 space-y-4 -mt-2">
        {/* Sub-header Date & Cycle Day */}
        <div className="text-center pb-1">
          <p className="font-serif text-[22px] sm:text-[24px] text-[#241422]">
            Today, Oct 26 - Cycle Day {currentCycle?.currentDayOfCycle || 14}
          </p>
        </div>

        {/* Card 1: Gauge & Current BBT */}
        <div className="bg-white/95 backdrop-blur-md rounded-[32px] p-8 border border-[#EDE5DF] shadow-[0_4px_24px_rgba(0,0,0,0.03)] flex flex-col items-center text-center space-y-4">
          {/* Circular Gauge Graphic with Dynamic Knob */}
          <div className="relative w-64 h-44 flex items-center justify-center">
            <svg className="w-full h-full" viewBox="0 0 200 140">
              {/* Background Arc */}
              <path
                d="M 25 120 A 75 75 0 1 1 175 120"
                fill="none"
                stroke="#EAE0D6"
                strokeWidth="14"
                strokeLinecap="round"
              />
              {/* Active Progress Arc */}
              <path
                d={activeArcPath}
                fill="none"
                stroke="#8EAEC4"
                strokeWidth="14"
                strokeLinecap="round"
              />
              {/* Gauge Knob */}
              <circle
                cx={knobX}
                cy={knobY}
                r="11"
                fill="#FFFFFF"
                stroke="#8EAEC4"
                strokeWidth="3"
                className="shadow-md transition-all duration-300"
              />
            </svg>

            {/* Centered Temperature Value */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pt-8">
              <span className="font-serif text-[44px] font-normal text-[#20141E] leading-none tracking-tight">
                {currentTemp}{unit}
              </span>
            </div>
          </div>

          {/* Action Pills / Inline Input */}
          {isEditing ? (
            <form onSubmit={handleSaveTemp} className="flex items-center gap-2 pt-1">
              <input
                type="number"
                step="0.1"
                value={inputTemp}
                onChange={(e) => setInputTemp(e.target.value)}
                autoFocus
                className="w-24 px-3 py-1.5 bg-[#FAF7F2] border border-[#DDD0C8] rounded-full text-center text-sm font-semibold text-[#20141E] focus:outline-none focus:ring-2 focus:ring-[#523446]"
              />
              <button
                type="submit"
                className="px-4 py-1.5 bg-[#523446] text-white text-xs font-semibold rounded-full shadow-sm hover:bg-[#3E2434] transition-all cursor-pointer flex items-center gap-1"
              >
                <Check size={14} /> Save
              </button>
            </form>
          ) : (
            <div className="flex flex-col items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setInputTemp(currentTemp);
                  setIsEditing(true);
                }}
                className="px-8 py-2 bg-[#F3DDD3] hover:bg-[#EBCEC2] text-[#331C28] text-sm font-semibold rounded-full shadow-sm transition-all cursor-pointer active:scale-95 flex items-center gap-1.5"
              >
                <Edit2 size={14} />
                <span>Log BBT</span>
              </button>

              <div className="px-6 py-1.5 bg-[#EEF2F6] rounded-full text-xs font-semibold text-[#576472]">
                {loggedTime}
              </div>
            </div>
          )}
        </div>

        {/* Card 2: Temperature Trends (Last 30 Days) */}
        <div className="bg-white/95 backdrop-blur-md rounded-[32px] p-6 border border-[#EDE5DF] shadow-[0_4px_24px_rgba(0,0,0,0.03)] space-y-4">
          <h2 className="font-serif text-[21px] text-[#20141E] tracking-tight">
            Temperature Trends (Last 30 Days)
          </h2>

          <div className="relative w-full h-44 pt-2">
            {/* Y-Axis scale lines */}
            <div className="absolute inset-x-0 top-0 text-[11px] text-[#6E646C] flex items-center gap-2">
              <span className="w-8 text-right">{isCelsius ? '36.8' : '97.6'}</span>
              <div className="flex-1 border-t border-[#EFE8E1]" />
            </div>
            <div className="absolute inset-x-0 top-12 text-[11px] text-[#6E646C] flex items-center gap-2">
              <span className="w-8 text-right">{isCelsius ? '36.6' : '97.4'}</span>
              <div className="flex-1 border-t border-[#EFE8E1]" />
            </div>
            <div className="absolute inset-x-0 top-24 text-[11px] text-[#6E646C] flex items-center gap-2">
              <span className="w-8 text-right">{isCelsius ? '36.4' : '97.2'}</span>
              <div className="flex-1 border-t border-[#EFE8E1]" />
            </div>
            <div className="absolute inset-x-0 top-36 text-[11px] text-[#6E646C] flex items-center gap-2">
              <span className="w-8 text-right">{isCelsius ? '36.2' : '97.0'}</span>
              <div className="flex-1 border-t border-[#EFE8E1]" />
            </div>

            {/* SVG Trend Line */}
            <svg className="w-full h-36 pl-8 overflow-visible" viewBox="0 0 380 100">
              <defs>
                <linearGradient id="bbtGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#8EAEC4" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#8EAEC4" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Shaded Area under curve */}
              <polygon
                points={`10,95 ${polylineStr} 370,95`}
                fill="url(#bbtGrad)"
              />

              {/* Line */}
              <polyline
                points={polylineStr}
                fill="none"
                stroke="#7B9BB3"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Dots */}
              {chartPointsF.map((pt, i) => (
                <circle
                  key={i}
                  cx={pt.x}
                  cy={pt.y}
                  r="3.5"
                  fill="#FDFBF7"
                  stroke="#7B9BB3"
                  strokeWidth="2"
                />
              ))}
            </svg>

            {/* X-Axis labels */}
            <div className="flex justify-between pl-8 text-[11px] text-[#20141E] font-medium pt-3">
              <span>Oct 1</span>
              <span>Oct 8</span>
              <span>Oct 15</span>
              <span>Oct 22</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};


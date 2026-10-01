import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Droplets, 
  Sparkles, 
  Smile, 
  Thermometer, 
  Heart, 
  Pill, 
  Plus, 
  Edit3,
  Calendar
} from 'lucide-react';
import { useCycle } from '../../context/CycleContext';
import { formatDateToISO, parseISODate, calculateCycleInfo } from '../../utils/cycleCalculations';

interface CalendarScreenProps {
  onOpenLogModal: (dateStr: string) => void;
  onNavigateToFertilityDetail?: () => void;
  onNavigateToHarmonizedCalendar?: () => void;
}

export const CalendarScreen: React.FC<CalendarScreenProps> = ({ 
  onOpenLogModal,
  onNavigateToFertilityDetail,
  onNavigateToHarmonizedCalendar 
}) => {
  const { 
    selectedDate, 
    setSelectedDate, 
    dayLogs, 
    settings 
  } = useCycle();

  const [currentMonthDate, setCurrentMonthDate] = useState<Date>(() => {
    return parseISODate(selectedDate || formatDateToISO(new Date()));
  });

  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();

  const prevMonth = () => {
    setCurrentMonthDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonthDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentMonthDate(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDate(formatDateToISO(today));
  };

  // Calendar math
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const totalDays = lastDayOfMonth.getDate();

  // Adjust for start day of week
  const startDayOffset = settings.startDayOfWeek === 'Monday'
    ? (firstDayOfMonth.getDay() === 0 ? 6 : firstDayOfMonth.getDay() - 1)
    : firstDayOfMonth.getDay();

  const weekdays = settings.startDayOfWeek === 'Monday'
    ? ['M', 'T', 'W', 'T', 'F', 'S', 'S']
    : ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  // Days grid
  const daysInGrid: (string | null)[] = [];
  for (let i = 0; i < startDayOffset; i++) {
    daysInGrid.push(null);
  }
  for (let d = 1; d <= totalDays; d++) {
    const dStr = formatDateToISO(new Date(year, month, d));
    daysInGrid.push(dStr);
  }

  // Selected date's log
  const selectedLog = dayLogs[selectedDate];
  const selectedCycleInfo = calculateCycleInfo(
    settings.lastPeriodStartDate,
    settings.cycleLengthDays,
    settings.periodLengthDays,
    settings.lutealPhaseDays,
    parseISODate(selectedDate)
  );

  return (
    <div className="min-h-screen pb-28 pt-4 px-4 max-w-lg mx-auto space-y-5">
      {/* Top Bar */}
      <div className="flex items-center justify-between pt-2">
        <h1 className="text-2xl font-serif font-bold text-[#20171D]">Calendar</h1>
        <button
          onClick={goToToday}
          className="px-3.5 py-1.5 rounded-full bg-white border border-[#EDE4DE] text-xs font-semibold text-[#523446] shadow-sm hover:bg-stone-50 transition-colors"
        >
          Today
        </button>
      </div>

      {/* Main Calendar Card */}
      <div className="bg-white rounded-[32px] p-5 sm:p-6 border border-[#EDE4DE] shadow-sm space-y-4">
        {/* Month Navigation */}
        <div className="flex items-center justify-between px-2">
          <h2 className="text-lg font-serif font-semibold text-[#20171D]">
            {currentMonthDate.toLocaleString('default', { month: 'long' })} {year}
          </h2>
          <div className="flex items-center gap-1">
            <button
              onClick={prevMonth}
              className="p-2 rounded-full hover:bg-stone-100 text-stone-600 transition-colors"
              aria-label="Previous Month"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={nextMonth}
              className="p-2 rounded-full hover:bg-stone-100 text-stone-600 transition-colors"
              aria-label="Next Month"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 text-center">
          {weekdays.map((wd, i) => (
            <span key={i} className="text-xs font-semibold text-[#8E7E87] py-1">
              {wd}
            </span>
          ))}
        </div>

        {/* Month Grid */}
        <div className="grid grid-cols-7 gap-y-2 text-center">
          {daysInGrid.map((dateStr, idx) => {
            if (!dateStr) {
              return <div key={`empty_${idx}`} className="h-10" />;
            }

            const dayNum = parseInt(dateStr.split('-')[2], 10);
            const isSelected = dateStr === selectedDate;
            const isToday = dateStr === formatDateToISO(new Date());
            const log = dayLogs[dateStr];

            // Determine if predicted period or fertile
            const dayCycle = calculateCycleInfo(
              settings.lastPeriodStartDate,
              settings.cycleLengthDays,
              settings.periodLengthDays,
              settings.lutealPhaseDays,
              parseISODate(dateStr)
            );

            const isPeriod = log?.flow || dayCycle.currentPhase === 'MENSTRUAL';
            const isOvulation = dayCycle.currentPhase === 'OVULATION';
            const isFertile = dayCycle.chanceOfPregnancy === 'High' || dayCycle.chanceOfPregnancy === 'Very High';

            return (
              <button
                key={dateStr}
                onClick={() => setSelectedDate(dateStr)}
                className={`relative flex flex-col items-center justify-center h-10 w-10 mx-auto rounded-full text-xs transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#523446] text-white font-bold shadow-md scale-105'
                    : isToday
                    ? 'border-2 border-[#523446] text-[#523446] font-bold'
                    : isPeriod
                    ? 'bg-rose-50 text-[#8C3446] font-medium'
                    : isOvulation
                    ? 'bg-amber-50 text-[#966324] font-medium'
                    : 'text-[#20171D] hover:bg-stone-100'
                }`}
              >
                <span>{dayNum}</span>

                {/* Status Dot Indicators */}
                <div className="absolute bottom-1 flex items-center justify-center gap-0.5">
                  {log?.flow && (
                    <span className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-rose-500'}`} />
                  )}
                  {isFertile && !log?.flow && (
                    <span className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-amber-400'}`} />
                  )}
                  {log?.bbt && (
                    <span className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-[#7D9688]'}`} />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-around pt-3 border-t border-[#F0EAE5] text-[11px] text-[#7A6C74]">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#DE9E8E]" />
            <span>Period</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E4B67C]" />
            <span>Fertile</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#7D9688]" />
            <span>BBT Logged</span>
          </div>
        </div>
      </div>

      {/* Selected Day Details Inspector */}
      <div className="bg-white rounded-[32px] p-5 border border-[#EDE4DE] shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-serif font-bold text-[#20171D]">
              {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'short',
                day: 'numeric'
              })}
            </h3>
            <p className="text-xs text-[#7A6C74]">
              Cycle Day {selectedCycleInfo.currentDayOfCycle} • {selectedCycleInfo.phaseDisplayName}
            </p>
          </div>

          <button
            onClick={() => onOpenLogModal(selectedDate)}
            className="px-3.5 py-1.5 bg-[#F2E8EC] text-[#523446] hover:bg-[#523446] hover:text-white rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            <Edit3 size={13} />
            {selectedLog ? 'Edit Log' : 'Log Day'}
          </button>
        </div>

        {selectedLog && (selectedLog.flow || selectedLog.moods.length > 0 || selectedLog.symptoms.length > 0 || selectedLog.bbt || selectedLog.cervicalMucus || selectedLog.notes) ? (
          <div className="space-y-3 pt-1 text-xs">
            {/* Flow & BBT */}
            <div className="grid grid-cols-2 gap-2">
              {selectedLog.flow ? (
                <div className="p-3 bg-[#FDF0EC] rounded-2xl border border-[#F5DDD5] flex items-center gap-2">
                  <Droplets size={16} className="text-[#DE9E8E]" />
                  <div>
                    <span className="text-[10px] text-[#7A6C74] block">Flow</span>
                    <span className="font-semibold capitalize text-[#6E3544]">{selectedLog.flow}</span>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-[#FAF7F2] rounded-2xl border border-[#EDE4DE] text-stone-500">
                  No flow recorded
                </div>
              )}

              {selectedLog.bbt ? (
                <div className="p-3 bg-[#EBF1ED] rounded-2xl border border-[#D5E3DA] flex items-center gap-2">
                  <Thermometer size={16} className="text-[#7D9688]" />
                  <div>
                    <span className="text-[10px] text-[#7A6C74] block">BBT</span>
                    <span className="font-semibold text-[#3B5445]">{selectedLog.bbt}° {settings.temperatureUnit === 'Celsius' ? 'C' : 'F'}</span>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-[#FAF7F2] rounded-2xl border border-[#EDE4DE] text-stone-500">
                  No BBT recorded
                </div>
              )}
            </div>

            {/* Moods */}
            {selectedLog.moods.length > 0 && (
              <div>
                <span className="text-[11px] font-semibold text-[#7A6C74] block mb-1.5">Moods</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedLog.moods.map(m => (
                    <span key={m} className="px-2.5 py-1 bg-[#F2E8EC] text-[#523446] rounded-xl text-xs font-medium">
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Symptoms */}
            {selectedLog.symptoms.length > 0 && (
              <div>
                <span className="text-[11px] font-semibold text-[#7A6C74] block mb-1.5">Symptoms</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedLog.symptoms.map(s => (
                    <span key={s} className="px-2.5 py-1 bg-[#EBF1ED] text-[#415C4C] rounded-xl text-xs font-medium">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Additional Tags (Pill, Intimacy, Cervical fluid) */}
            <div className="flex flex-wrap gap-2 pt-1 text-[11px]">
              {selectedLog.pillTaken && (
                <span className="px-2.5 py-1 bg-purple-50 text-purple-800 rounded-lg flex items-center gap-1">
                  <Pill size={12} /> Pill taken
                </span>
              )}
              {selectedLog.intimacy && (
                <span className="px-2.5 py-1 bg-rose-50 text-rose-800 rounded-lg flex items-center gap-1">
                  <Heart size={12} /> Intimacy logged
                </span>
              )}
              {selectedLog.cervicalMucus && (
                <span className="px-2.5 py-1 bg-teal-50 text-teal-800 rounded-lg capitalize">
                  Fluid: {selectedLog.cervicalMucus.replace('_', ' ')}
                </span>
              )}
            </div>

            {/* Notes */}
            {selectedLog.notes && (
              <div className="p-3 bg-[#FAF7F2] rounded-2xl border border-[#EDE4DE] text-stone-700 italic">
                "{selectedLog.notes}"
              </div>
            )}
          </div>
        ) : (
          <div className="p-6 text-center bg-[#FAF7F2] rounded-2xl border border-dashed border-[#DDD0C8]">
            <p className="text-xs text-stone-500 mb-3">No logs recorded for this day.</p>
            <button
              onClick={() => onOpenLogModal(selectedDate)}
              className="px-4 py-2 bg-[#523446] text-white text-xs font-semibold rounded-full hover:bg-[#432A39] transition-all"
            >
              + Log Symptoms & Mood
            </button>
          </div>
        )}

        {/* Quick Link to Modernized Fertility & Ovulation Detail */}
        {onNavigateToFertilityDetail && (
          <div className="pt-2">
            <button
              type="button"
              onClick={onNavigateToFertilityDetail}
              className="w-full p-4 rounded-2xl bg-gradient-to-r from-[#FAF3F0] to-[#F1F6F2] border border-[#EDE4DE] shadow-xs flex items-center justify-between text-left hover:opacity-90 active:scale-[0.99] transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white text-[#B87383] shadow-2xs flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Heart size={20} />
                </div>
                <div>
                  <h4 className="text-[14px] font-bold text-[#1E191D]">
                    Fertility &amp; Ovulation Forecast
                  </h4>
                  <p className="text-[11px] text-[#7A6C74]">
                    Biomarkers, 85% conception chance, &amp; LH curve
                  </p>
                </div>
              </div>
              <ChevronRight size={18} className="text-[#BCAFB7] group-hover:text-[#543649] transition-colors" />
            </button>
          </div>
        )}

        {/* Quick Link to Harmonized Modernized Calendar */}
        {onNavigateToHarmonizedCalendar && (
          <div className="pt-1">
            <button
              type="button"
              onClick={onNavigateToHarmonizedCalendar}
              className="w-full p-4 rounded-2xl bg-gradient-to-r from-[#EFF6F2] to-[#FAF3F0] border border-[#EDE4DE] shadow-xs flex items-center justify-between text-left hover:opacity-90 active:scale-[0.99] transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white text-[#558269] shadow-2xs flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Calendar size={20} />
                </div>
                <div>
                  <h4 className="text-[14px] font-bold text-[#1E191D]">
                    Harmonized Calendar
                  </h4>
                  <p className="text-[11px] text-[#7A6C74]">
                    Silk wave theme, June phase markers, &amp; daily agenda
                  </p>
                </div>
              </div>
              <ChevronRight size={18} className="text-[#BCAFB7] group-hover:text-[#543649] transition-colors" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

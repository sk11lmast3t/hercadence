import { useCycle } from '../context/CycleContext';

export function useCycleCalendar() {
  const { dayLogs, currentCycle, selectedDate, setSelectedDate, setCurrentView } = useCycle();

  const getLogForDate = (dateStr: string) => {
    return dayLogs[dateStr] || null;
  };

  return {
    currentCycle,
    dayLogs,
    selectedDate,
    setSelectedDate,
    getLogForDate,
    setCurrentView,
  };
}

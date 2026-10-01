import { useCycle } from '../context/CycleContext';

export function useDashboard() {
  const { currentCycle, dayLogs, settings, selectedDate, setSelectedDate, setCurrentView } = useCycle();

  const todayLog = dayLogs[selectedDate] || null;

  return {
    currentCycle,
    todayLog,
    settings,
    selectedDate,
    setSelectedDate,
    setCurrentView,
  };
}

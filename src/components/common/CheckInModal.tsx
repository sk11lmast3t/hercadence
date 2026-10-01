import React, { useState } from 'react';
import { X, Check, Thermometer, Droplet, Sparkles } from 'lucide-react';
import { useCycle } from '../../context/CycleContext';
import { useDailyLog } from '../../hooks/useDailyLog';

interface CheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  date?: string;
  isFertileWindow?: boolean;
  isPeriodWindow?: boolean;
}

export const CheckInModal: React.FC<CheckInModalProps> = ({
  isOpen,
  onClose,
  date,
  isFertileWindow = false,
  isPeriodWindow = true,
}) => {
  const { selectedDate, settings } = useCycle();
  const { logDay } = useDailyLog();

  const targetDate = date || selectedDate;

  const [flow, setFlow] = useState<'light' | 'medium' | 'heavy' | 'spotting' | undefined>(undefined);
  const [cervicalMucus, setCervicalMucus] = useState<'dry' | 'sticky' | 'creamy' | 'egg_white' | undefined>(undefined);
  const [bbt, setBbt] = useState<string>('');
  const [opkResult, setOpkResult] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await logDay(targetDate, {
        flow: flow || null,
        cervicalMucus: cervicalMucus || null,
        bbt: bbt ? parseFloat(bbt) : undefined,
      });

      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        onClose();
      }, 800);
    } catch (err) {
      console.error('CheckInModal save error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Daily Check-In</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">{targetDate}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-5">
          {/* Period Flow Section (always shown or highlighted in period window) */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-rose-500 flex items-center gap-1.5">
              <Droplet className="w-4 h-4" /> Period Flow
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['spotting', 'light', 'medium', 'heavy'] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFlow(flow === f ? undefined : f)}
                  className={`py-2 px-1 text-xs font-medium rounded-xl capitalize border transition-all ${
                    flow === f
                      ? 'bg-rose-500 text-white border-rose-500 shadow-md shadow-rose-500/20'
                      : 'border-slate-200 dark:border-slate-700 hover:border-rose-300 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Fertile Window Section (shown during fertile window) */}
          {(isFertileWindow || !isPeriodWindow) && (
            <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <label className="text-xs font-semibold uppercase tracking-wider text-amber-500 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" /> Cervical Mucus & Ovulation
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(['dry', 'sticky', 'creamy', 'egg_white'] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setCervicalMucus(cervicalMucus === m ? undefined : m)}
                    className={`py-2 px-1 text-xs font-medium rounded-xl capitalize border transition-all ${
                      cervicalMucus === m
                        ? 'bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-500/20'
                        : 'border-slate-200 dark:border-slate-700 hover:border-amber-300 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {m.replace('_', ' ')}
                  </button>
                ))}
              </div>

              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  placeholder="OPK Test Result (e.g. Positive)"
                  value={opkResult}
                  onChange={(e) => setOpkResult(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>
          )}

          {/* BBT Section */}
          <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <label className="text-xs font-semibold uppercase tracking-wider text-indigo-500 flex items-center gap-1.5">
              <Thermometer className="w-4 h-4" /> Basal Body Temp ({settings?.temperatureUnit || '°C'})
            </label>
            <input
              type="number"
              step="0.01"
              placeholder={`e.g. ${settings?.temperatureUnit === 'Fahrenheit' ? '97.8' : '36.5'}`}
              value={bbt}
              onChange={(e) => setBbt(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 text-sm font-medium bg-rose-500 hover:bg-rose-600 active:bg-rose-700 text-white rounded-xl shadow-lg shadow-rose-500/25 flex items-center gap-2 transition-all disabled:opacity-50"
            >
              {saveSuccess ? (
                <>
                  <Check className="w-4 h-4" /> Saved!
                </>
              ) : (
                'Save Log'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

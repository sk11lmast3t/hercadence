// src/components/screens/ModernizedBodyMetricsScreen.tsx
// Body Metrics feature screen.
// Data flows: useBodyMetrics (feature hook) → BodyMetricsRepository → Supabase body_metrics
//
// No fabricated health data is rendered.  The screen derives all displayed
// values from persisted repository results. When no data is present the screen
// shows an honest empty state.

import React, { useMemo, useState } from 'react';
import {
  Signal,
  Wifi,
  Battery,
  Home,
  Calendar as CalendarIcon,
  Plus,
  TrendingUp,
  User,
  ChevronLeft,
  Check,
  X,
  Info,
  Scale,
  Loader,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AppView } from '../../types';
import { useBodyMetrics } from '../../features/bodyMetrics/hooks/useBodyMetrics';
import { useGuideProgress } from '../../guides/useGuideProgress';
import { bodyMetricsGuide } from '../../guides/guideRegistry';

interface ModernizedBodyMetricsScreenProps {
  onBack?: () => void;
  onNavigate?: (view: AppView) => void;
}

export const ModernizedBodyMetricsScreen: React.FC<ModernizedBodyMetricsScreenProps> = ({
  onBack,
  onNavigate,
}) => {
  const {
    logs,
    status,
    error: hookError,
    saveLog,
    todayEntry,
    latestWeight,
    latestWeightUnit,
  } = useBodyMetrics();

  const guide = useGuideProgress(bodyMetricsGuide);

  // ── UI-only state (not persisted health data) ─────────────────────────────
  const [weightUnit, setWeightUnit] = useState<'lbs' | 'kg'>('lbs');
  const [showLogModal, setShowLogModal] = useState(false);
  const [inputWeight, setInputWeight] = useState('');
  const [inputNote, setInputNote] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // ── Derived display values from persisted data ────────────────────────────

  // Convert latest persisted weight to the selected display unit.
  const displayWeight = useMemo(() => {
    if (latestWeight === undefined) return null;
    if (weightUnit === 'kg' && latestWeightUnit === 'lb') {
      return +(latestWeight * 0.453592).toFixed(1);
    }
    if (weightUnit === 'lbs' && latestWeightUnit === 'kg') {
      return +(latestWeight * 2.20462).toFixed(1);
    }
    return +latestWeight.toFixed(1);
  }, [latestWeight, latestWeightUnit, weightUnit]);

  // The last recorded date as a locale string.
  const lastRecordedDate = useMemo(() => {
    const entry = todayEntry ?? logs[0];
    if (!entry) return null;
    const d = new Date(entry.measuredDate + 'T00:00:00');
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }, [todayEntry, logs]);

  // Recent history to display (up to 4 entries, descending by date).
  const recentHistory = useMemo(() => logs.slice(0, 4), [logs]);

  // ── Save handler ──────────────────────────────────────────────────────────

  const handleSaveWeight = async () => {
    const val = parseFloat(inputWeight);
    if (!val || isNaN(val) || val <= 0) {
      showToast('Please enter a valid weight');
      return;
    }
    const today = new Date().toISOString().slice(0, 10);
    setShowLogModal(false);

    const result = await saveLog({
      measuredDate: today,
      weight: val,
      weightUnit: weightUnit === 'lbs' ? 'lb' : 'kg',
      notes: inputNote || undefined,
    });

    if (result.ok) {
      showToast(`Weight logged: ${val.toFixed(1)} ${weightUnit}`);
      setInputWeight('');
      setInputNote('');
    } else {
      showToast(result.errorMessage ?? 'Weight could not be saved');
    }
  };

  // ── Render helpers ────────────────────────────────────────────────────────

  const renderWeightDisplay = () => {
    if (status === 'loading') {
      return (
        <div className="text-center my-4 flex flex-col items-center gap-2">
          <Loader size={28} className="animate-spin text-[#9AB2DC]" />
          <span className="text-[14px] text-[#6F646C]">Loading your metrics…</span>
        </div>
      );
    }
    if (status === 'error') {
      return (
        <div
          role="alert"
          className="text-center my-4 text-[14px] text-[#B05060] bg-[#FFF0F1] rounded-2xl px-4 py-3"
        >
          {hookError ?? 'Body metrics could not be loaded.'}
        </div>
      );
    }
    if (displayWeight !== null) {
      return (
        <div className="text-center my-4">
          <div className="font-serif text-[52px] sm:text-[56px] font-normal text-[#1B141C] tracking-tight leading-none">
            {displayWeight} {weightUnit}
          </div>
          {lastRecordedDate && (
            <div className="text-[14px] font-medium text-[#6F646C] mt-2">
              {lastRecordedDate}
            </div>
          )}
        </div>
      );
    }
    return (
      <div className="text-center my-4">
        <div
          data-testid="empty-weight"
          className="font-serif text-[28px] font-normal text-[#9A8FA0] tracking-tight leading-tight"
        >
          Not recorded
        </div>
        <div className="text-[13px] text-[#7A6C74] mt-2">
          Log your first weight entry below.
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#221B20] flex justify-center selection:bg-[#EAE4DF]">
      <div className="w-full max-w-[420px] min-h-screen flex flex-col justify-between relative bg-[#FAF8F5] pb-24 shadow-2xl overflow-x-hidden">

        {/* Top Banner */}
        <div className="relative w-full h-[180px] bg-[#EDE9F2] overflow-hidden">
          <img
            src="/assets/weight_blue_waves_1788590828692.jpg"
            alt=""
            aria-hidden="true"
            className="w-full h-full object-cover opacity-90 scale-105"
            referrerPolicy="no-referrer"
            onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-[#FAF8F5]" />

          {/* iOS Status Bar */}
          <div className="absolute top-0 left-0 right-0 pt-3 px-6 flex justify-between items-center text-xs font-semibold text-neutral-800 z-20 select-none">
            <span className="tracking-tight text-[14px]">9:41</span>
            <div className="flex items-center space-x-1.5 text-neutral-800">
              <Signal size={13} strokeWidth={2.5} />
              <Wifi size={13} strokeWidth={2.5} />
              <Battery size={18} strokeWidth={2.5} className="rotate-90" />
            </div>
          </div>

          {/* Nav row */}
          <div className="absolute top-11 left-0 right-0 px-6 flex items-center justify-between z-20">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                aria-label="Go back"
                className="w-9 h-9 rounded-full bg-white/70 backdrop-blur-md border border-white/60 flex items-center justify-center text-[#2D2429] hover:bg-white active:scale-95 transition-all shadow-xs"
              >
                <ChevronLeft size={20} strokeWidth={2.2} />
              </button>
            )}

            {/* Unit toggle */}
            <div className="ml-auto flex items-center bg-white/75 backdrop-blur-md border border-white/60 rounded-full p-1 shadow-xs">
              {(['lbs', 'kg'] as const).map((unit) => (
                <button
                  key={unit}
                  type="button"
                  onClick={() => setWeightUnit(unit)}
                  aria-pressed={weightUnit === unit}
                  className={`px-3 py-1 rounded-full text-[12px] font-bold transition-all ${
                    weightUnit === unit ? 'bg-[#3D3652] text-white' : 'text-[#6D6169]'
                  }`}
                >
                  {unit}
                </button>
              ))}
            </div>
          </div>

          {/* Page title */}
          <div className="absolute bottom-2 left-0 right-0 px-6 z-20">
            <h1 className="font-serif text-[34px] sm:text-[36px] font-medium tracking-tight text-[#1E171C] leading-none">
              Body Metrics
            </h1>
          </div>
        </div>

        {/* Content */}
        <div className="px-5 pt-3 space-y-4 flex-1">

          {/* Guide banner */}
          {guide.isVisible && (
            <div
              role="complementary"
              aria-label="Body Metrics guide"
              className="rounded-[20px] border border-[#DFD9E8] bg-[#F4F1F9] px-4 py-3 flex items-start gap-3"
            >
              <Info size={16} className="text-[#7A6FA0] mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-[#3D3652] leading-snug">
                  {bodyMetricsGuide.steps[0]?.title}
                </p>
                <p className="text-[12px] text-[#5D5470] mt-0.5 leading-snug">
                  {bodyMetricsGuide.steps[0]?.body}
                </p>
              </div>
              <button
                type="button"
                aria-label="Dismiss guide"
                onClick={guide.dismiss}
                className="text-[#8E84A0] hover:text-[#5D5470] shrink-0"
              >
                <X size={14} />
              </button>
            </div>
          )}

          {/* Current Weight Card */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full bg-[#FAF5EE] rounded-[28px] p-6 border border-[#EAE1D7] shadow-[0_4px_20px_rgba(0,0,0,0.025)] relative overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <span className="text-[17px] font-medium text-[#1E171C]">Current Weight</span>
              <div className="w-8 h-8 rounded-xl border border-[#D5C9BC] flex items-center justify-center text-[#3D3652]">
                <Scale size={18} strokeWidth={1.8} />
              </div>
            </div>

            {renderWeightDisplay()}

            <button
              type="button"
              data-guide-target="body-metrics-log-action"
              onClick={() => {
                if (latestWeight !== undefined) {
                  const displayVal = weightUnit === 'lbs' && latestWeightUnit === 'kg'
                    ? (latestWeight * 2.20462).toFixed(1)
                    : weightUnit === 'kg' && latestWeightUnit === 'lb'
                    ? (latestWeight * 0.453592).toFixed(1)
                    : latestWeight.toFixed(1);
                  setInputWeight(displayVal);
                }
                setShowLogModal(true);
              }}
              className="w-full py-3.5 rounded-full bg-[#3E3753] text-white text-[15px] font-medium shadow-[0_4px_16px_rgba(62,55,83,0.25)] hover:bg-[#342E46] active:scale-[0.98] transition-all"
            >
              Log Weight
            </button>

            {guide.isVisible && (
              <button
                type="button"
                onClick={guide.replay}
                className="mt-3 w-full text-[12px] text-[#7A6FA0] text-center hover:underline"
              >
                Replay guide
              </button>
            )}
          </motion.div>

          {/* Recent history */}
          {recentHistory.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.08 }}
              className="w-full rounded-[28px] p-5 border border-[#E4DDE8] shadow-[0_4px_22px_rgba(0,0,0,0.03)] bg-gradient-to-b from-[#F7F6FC] via-[#FAF9FD] to-[#F1EEF7]"
            >
              <h2 className="text-[17px] font-semibold text-[#1F1722] tracking-tight mb-3">
                Recent Entries
              </h2>
              <ul className="space-y-2" aria-label="Recent weight entries">
                {recentHistory.map((entry) => {
                  const entryDate = new Date(entry.measuredDate + 'T00:00:00').toLocaleDateString(
                    undefined,
                    { month: 'short', day: 'numeric' }
                  );
                  const entryDisplay =
                    entry.weight !== undefined
                      ? `${entry.weight.toFixed(1)} ${entry.weightUnit ?? 'kg'}`
                      : '—';
                  return (
                    <li
                      key={entry.id ?? entry.measuredDate}
                      className="flex justify-between items-center py-1.5 border-b border-[#EAE3EE] last:border-0"
                    >
                      <span className="text-[13px] text-[#5D5168]">{entryDate}</span>
                      <span className="text-[13px] font-semibold text-[#1F1722]">{entryDisplay}</span>
                      {entry.notes && (
                        <span className="text-[11px] text-[#8E84A0] truncate max-w-[120px] text-right ml-2">
                          {entry.notes}
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>

              {/* Cycle note — informational only, not a health claim */}
              <div className="mt-4 pt-3 border-t border-[#EAE3EE] flex items-start gap-2 text-[12px] text-[#5D5168]">
                <Info size={14} className="text-[#889EC7] shrink-0 mt-0.5" />
                <span>
                  Natural fluid shifts can cause small weight changes throughout your cycle.
                  Logging consistently gives you the most useful picture.
                </span>
              </div>
            </motion.div>
          )}

          {/* Empty history state */}
          {status === 'empty' && recentHistory.length === 0 && (
            <div
              data-testid="no-history"
              className="text-center py-6 text-[13px] text-[#8E848A]"
            >
              No history yet. Log your first entry above.
            </div>
          )}

        </div>

        {/* Bottom Navigation */}
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[420px] bg-white/95 backdrop-blur-md border-t border-[#EDE5DF] px-6 py-2.5 flex justify-between items-center z-30">
          <button
            type="button"
            onClick={() => onNavigate?.('HOME')}
            className="flex flex-col items-center gap-1 text-[#8E848A] hover:text-[#1E191D] transition-colors"
          >
            <Home size={20} strokeWidth={1.8} />
            <span className="text-[11px] font-medium">Home</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate?.('CALENDAR')}
            className="flex flex-col items-center gap-1 text-[#8E848A] hover:text-[#1E191D] transition-colors"
          >
            <CalendarIcon size={20} strokeWidth={1.8} />
            <span className="text-[11px] font-medium">Calendar</span>
          </button>
          <button
            type="button"
            onClick={() => setShowLogModal(true)}
            className="flex flex-col items-center -mt-3"
          >
            <div className="w-11 h-11 rounded-full bg-[#3D3652] text-white flex items-center justify-center shadow-[0_4px_14px_rgba(61,54,82,0.35)] active:scale-95 transition-all">
              <Plus size={22} strokeWidth={2.2} />
            </div>
            <span className="text-[11px] font-medium text-[#736870] mt-0.5">Add</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate?.('INSIGHTS')}
            className="flex flex-col items-center gap-1 text-[#3D3652] font-semibold transition-colors"
          >
            <TrendingUp size={20} strokeWidth={2.2} />
            <span className="text-[11px] font-semibold">Insights</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate?.('PROFILE')}
            className="flex flex-col items-center gap-1 text-[#8E848A] hover:text-[#1E191D] transition-colors"
          >
            <User size={20} strokeWidth={1.8} />
            <span className="text-[11px] font-medium">Profile</span>
          </button>
        </nav>

        {/* iOS home indicator */}
        <div className="w-full pb-2 flex justify-center bg-white">
          <button
            type="button"
            onClick={onBack ?? (() => onNavigate?.('INSIGHTS'))}
            aria-label="Home"
            className="w-36 h-1.5 bg-black/80 hover:bg-black rounded-full active:scale-95 transition-all cursor-pointer"
          />
        </div>

        {/* Log Weight Modal */}
        <AnimatePresence>
          {showLogModal && (
            <div
              className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-xs p-4"
              role="dialog"
              aria-modal="true"
              aria-label="Log weight"
            >
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 40 }}
                className="w-full max-w-[390px] bg-white rounded-3xl p-6 shadow-2xl border border-[#EDE5DF]"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-serif text-[22px] font-bold text-[#1E181D]">Log Weight</h3>
                  <button
                    type="button"
                    aria-label="Close"
                    onClick={() => setShowLogModal(false)}
                    className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500 hover:bg-neutral-200"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="weight-input"
                      className="text-[11px] font-bold text-[#7E717A] uppercase tracking-wider block mb-1"
                    >
                      Weight ({weightUnit})
                    </label>
                    <div className="relative">
                      <input
                        id="weight-input"
                        type="number"
                        step="0.1"
                        min="0"
                        max="500"
                        value={inputWeight}
                        onChange={(e) => setInputWeight(e.target.value)}
                        className="w-full px-4 py-3 rounded-2xl border border-[#E3D9D1] bg-[#FAF8F6] text-[20px] font-bold text-[#221B20] focus:outline-none focus:border-[#3E3753]"
                        placeholder="e.g. 65.0"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[14px] font-bold text-[#7A6C74]">
                        {weightUnit}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="weight-note"
                      className="text-[11px] font-bold text-[#7E717A] uppercase tracking-wider block mb-1"
                    >
                      Note (optional)
                    </label>
                    <input
                      id="weight-note"
                      type="text"
                      placeholder="e.g. Morning, before breakfast"
                      value={inputNote}
                      onChange={(e) => setInputNote(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#E3D9D1] bg-[#FAF8F6] text-[14px] text-[#221B20] focus:outline-none focus:border-[#3E3753]"
                    />
                  </div>
                </div>

                <div className="mt-6 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowLogModal(false)}
                    className="flex-1 py-3 rounded-2xl border border-[#DDD3CB] text-[14px] font-semibold text-[#665A63]"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveWeight}
                    className="flex-1 py-3 rounded-2xl bg-[#3E3753] text-white text-[14px] font-bold shadow-[0_4px_14px_rgba(62,55,83,0.3)] active:scale-[0.98]"
                  >
                    Save Entry
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Feedback Toast */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              role="status"
              aria-live="polite"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed bottom-24 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-[#1E191D] text-white text-[12.5px] font-medium shadow-lg z-50 flex items-center gap-2"
            >
              <Check size={14} className="text-[#96D6A6]" />
              <span>{toastMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};

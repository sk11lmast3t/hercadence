// src/components/screens/ModernizedPhysicalActivityScreen.tsx
// Physical Activity feature screen.
// Migrated in Part 3D from legacy body-metrics facade to feature-owned architecture.

import React, { useState } from 'react';
import {
  ChevronLeft,
  Plus,
  Activity,
  Flame,
  Footprints,
  Clock,
  Calendar,
  Trash2,
  AlertCircle,
  Sparkles,
  CheckCircle2,
  X,
} from 'lucide-react';
import { usePhysicalActivity } from '../../features/physicalActivity/hooks/usePhysicalActivity';
import { ActivityIntensity } from '../../features/physicalActivity/physicalActivity.types';
import { useGuideProgress } from '../../guides/useGuideProgress';
import { physicalActivityGuide } from '../../guides/guideRegistry';
import { AppView } from '../../types';

interface ModernizedPhysicalActivityScreenProps {
  onBack: () => void;
  onNavigate?: (view: AppView) => void;
}

export const ModernizedPhysicalActivityScreen: React.FC<ModernizedPhysicalActivityScreenProps> = ({
  onBack,
  onNavigate,
}) => {
  const {
    logs,
    isLoading,
    error,
    status,
    saveLog,
    deleteLog,
    todayEntry,
    recentHistory,
  } = usePhysicalActivity();

  // Guide integration
  const guide = useGuideProgress(physicalActivityGuide);
  const currentStep = physicalActivityGuide.steps[0];

  // Modal and form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [logDate, setLogDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [activityType, setActivityType] = useState<string>('Walking');
  const [durationMins, setDurationMins] = useState<string>('30');
  const [intensity, setIntensity] = useState<ActivityIntensity>('moderate');
  const [caloriesBurned, setCaloriesBurned] = useState<string>('');
  const [steps, setSteps] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // UI state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleOpenModal = () => {
    setLogDate(new Date().toISOString().slice(0, 10));
    setActivityType('Walking');
    setDurationMins('30');
    setIntensity('moderate');
    setCaloriesBurned('');
    setSteps('');
    setNotes('');
    setValidationError(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setValidationError(null);
  };

  const handleSaveWorkout = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const parsedDuration = parseInt(durationMins, 10);
    if (isNaN(parsedDuration) || parsedDuration < 0 || parsedDuration > 1440) {
      setValidationError('Duration must be between 0 and 1440 minutes');
      return;
    }

    const parsedCalories = caloriesBurned !== '' ? parseInt(caloriesBurned, 10) : undefined;
    if (parsedCalories !== undefined && (isNaN(parsedCalories) || parsedCalories < 0)) {
      setValidationError('Calories burned must be a positive number');
      return;
    }

    const parsedSteps = steps !== '' ? parseInt(steps, 10) : undefined;
    if (parsedSteps !== undefined && (isNaN(parsedSteps) || parsedSteps < 0)) {
      setValidationError('Steps must be a positive number');
      return;
    }

    const entry = {
      logDate,
      activityType: activityType.trim() || 'General Activity',
      durationMins: parsedDuration,
      intensity,
      caloriesBurned: parsedCalories,
      steps: parsedSteps,
      notes: notes.trim() || undefined,
    };

    const result = await saveLog(entry);

    if (result.ok) {
      setIsModalOpen(false);
      showToast('Workout saved successfully!');
    } else {
      setValidationError(result.errorMessage || 'Failed to save workout');
    }
  };

  const handleDelete = async (dateStr: string) => {
    const ok = await deleteLog(dateStr);
    if (ok) {
      showToast('Activity log deleted');
    } else {
      showToast('Failed to delete activity log');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Toast notification */}
      {toastMessage && (
        <div
          role="status"
          className="fixed top-4 right-4 z-50 bg-emerald-600 text-white px-4 py-2 rounded-xl shadow-lg flex items-center gap-2 text-sm animate-fade-in"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <header className="p-4 flex items-center justify-between border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors"
            aria-label="Go back"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-rose-400 to-pink-300 bg-clip-text text-transparent">
              Physical Activity
            </h1>
            <p className="text-xs text-slate-400">Track movement & workouts</p>
          </div>
        </div>
        <button
          onClick={handleOpenModal}
          data-guide-target="physical-activity-log-action"
          className="rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white px-4 py-2 text-sm font-semibold flex items-center gap-2 shadow-md transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Workout</span>
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-4 max-w-xl w-full mx-auto space-y-6">
        {/* Guide banner */}
        {guide.isVisible && currentStep && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-pink-900/40 to-rose-900/40 border border-pink-500/30 flex items-start justify-between gap-3">
            <div className="flex gap-3">
              <Sparkles className="w-5 h-5 text-pink-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-sm text-pink-200">{currentStep.title}</h3>
                <p className="text-xs text-slate-300 mt-1">{currentStep.body}</p>
              </div>
            </div>
            <button
              onClick={guide.dismiss}
              className="text-slate-400 hover:text-white text-xs p-1"
              aria-label="Dismiss guide"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Global Error Banner */}
        {error && (
          <div role="alert" className="p-4 rounded-2xl bg-rose-950/60 border border-rose-800 text-rose-200 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Real Data Today Overview Cards */}
        <section className="space-y-3">
          <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wider">
            Today's Summary
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {/* Steps Card */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800/80 flex flex-col justify-between">
              <div className="flex items-center gap-2 text-emerald-400 mb-2">
                <Footprints className="w-4 h-4" />
                <span className="text-xs font-semibold text-slate-300">Steps</span>
              </div>
              <p className="text-lg font-bold text-slate-100">
                {todayEntry?.steps !== undefined
                  ? todayEntry.steps.toLocaleString()
                  : 'Not recorded'}
              </p>
            </div>

            {/* Duration Card */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800/80 flex flex-col justify-between">
              <div className="flex items-center gap-2 text-rose-400 mb-2">
                <Clock className="w-4 h-4" />
                <span className="text-xs font-semibold text-slate-300">Active Time</span>
              </div>
              <p className="text-lg font-bold text-slate-100">
                {todayEntry?.durationMins !== undefined
                  ? `${todayEntry.durationMins} m`
                  : 'Not recorded'}
              </p>
            </div>

            {/* Calories Card */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800/80 flex flex-col justify-between">
              <div className="flex items-center gap-2 text-amber-400 mb-2">
                <Flame className="w-4 h-4" />
                <span className="text-xs font-semibold text-slate-300">Calories</span>
              </div>
              <p className="text-lg font-bold text-slate-100">
                {todayEntry?.caloriesBurned !== undefined
                  ? `${todayEntry.caloriesBurned} kcal`
                  : 'Not recorded'}
              </p>
            </div>
          </div>
        </section>

        {/* Workout History */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wider">
              Activity History
            </h2>
            <span className="text-xs text-slate-500">
              {logs.length} {logs.length === 1 ? 'entry' : 'entries'}
            </span>
          </div>

          {isLoading ? (
            <div role="status" className="p-8 text-center text-slate-400 bg-slate-900/40 rounded-2xl border border-slate-800">
              <div className="inline-block w-6 h-6 border-2 border-pink-400 border-t-transparent rounded-full animate-spin mb-2" />
              <p className="text-xs">Loading activity logs...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="p-8 text-center bg-slate-900/40 rounded-2xl border border-slate-800/60">
              <Activity className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-300">No activity recorded yet</p>
              <p className="text-xs text-slate-500 mt-1">
                Tap "Add Workout" to log your first physical activity entry.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {logs.map((entry) => (
                <div
                  key={entry.id || entry.logDate}
                  className="p-4 rounded-2xl bg-slate-900 border border-slate-800/80 hover:border-slate-700 transition-all flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-pink-950/40 border border-pink-800/40 text-pink-400">
                      <Activity className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-200 text-sm">
                        {entry.activityType || 'Activity'}
                      </h4>
                      <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                        <span>{entry.logDate}</span>
                        {entry.durationMins !== undefined && (
                          <>
                            <span>•</span>
                            <span>{entry.durationMins} mins</span>
                          </>
                        )}
                        {entry.intensity && (
                          <>
                            <span>•</span>
                            <span className="capitalize">{entry.intensity}</span>
                          </>
                        )}
                      </p>
                      {entry.notes && (
                        <p className="text-xs text-slate-400 italic mt-1 bg-slate-950/40 px-2 py-1 rounded">
                          "{entry.notes}"
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right text-xs">
                      {entry.steps !== undefined && (
                        <p className="text-slate-300 font-medium">{entry.steps.toLocaleString()} steps</p>
                      )}
                      {entry.caloriesBurned !== undefined && (
                        <p className="text-slate-400">{entry.caloriesBurned} kcal</p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDelete(entry.logDate)}
                      className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 rounded-xl transition-colors"
                      title="Delete log"
                      aria-label={`Delete activity for ${entry.logDate}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Add Workout Modal */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 animate-scale-in">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 id="modal-title" className="text-lg font-bold text-slate-100">
                Log Physical Activity
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-slate-400 hover:text-slate-200 p-1"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {validationError && (
              <div role="alert" className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{validationError}</span>
              </div>
            )}

            <form onSubmit={handleSaveWorkout} className="space-y-4">
              {/* Log Date */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={logDate}
                  onChange={(e) => setLogDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-pink-500"
                  required
                />
              </div>

              {/* Activity Type */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Activity Type
                </label>
                <select
                  value={activityType}
                  onChange={(e) => setActivityType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-pink-500"
                >
                  <option value="Walking">Walking</option>
                  <option value="Running">Running</option>
                  <option value="Yoga">Yoga</option>
                  <option value="Cycling">Cycling</option>
                  <option value="Strength Training">Strength Training</option>
                  <option value="Swimming">Swimming</option>
                  <option value="Pilates">Pilates</option>
                  <option value="Stretching">Stretching</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Duration (mins) */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  min="0"
                  max="1440"
                  value={durationMins}
                  onChange={(e) => setDurationMins(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-pink-500"
                  placeholder="30"
                  required
                />
              </div>

              {/* Intensity */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Intensity
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['low', 'moderate', 'high'] as ActivityIntensity[]).map((level) => (
                    <button
                      type="button"
                      key={level}
                      onClick={() => setIntensity(level)}
                      className={`py-2 px-3 text-xs font-medium rounded-xl capitalize border transition-all ${
                        intensity === level
                          ? 'bg-pink-600 border-pink-500 text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              {/* Optional Steps */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Steps (optional)
                </label>
                <input
                  type="number"
                  min="0"
                  value={steps}
                  onChange={(e) => setSteps(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-pink-500"
                  placeholder="e.g. 5000"
                />
              </div>

              {/* Optional Calories */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Calories Burned (optional)
                </label>
                <input
                  type="number"
                  min="0"
                  value={caloriesBurned}
                  onChange={(e) => setCaloriesBurned(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-pink-500"
                  placeholder="e.g. 200"
                />
              </div>

              {/* Optional Notes */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Notes (optional)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-pink-500"
                  placeholder="How did it feel?"
                />
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 rounded-xl shadow-md transition-all"
                >
                  Save Workout
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

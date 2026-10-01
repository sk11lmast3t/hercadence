import React from 'react';
import { Lock, ChevronLeft } from 'lucide-react';
import { useCycle } from '../../context/CycleContext';

export const PrivacyPolicyScreen: React.FC = () => {
  const { setCurrentView } = useCycle();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 md:p-8">
      <div className="max-w-3xl mx-auto bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 shadow-xl border border-slate-100 dark:border-slate-800">
        <button
          onClick={() => setCurrentView('PROFILE')}
          className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 mb-6 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Profile
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/50 rounded-2xl text-indigo-500">
            <Lock className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Privacy Policy</h1>
            <p className="text-xs text-slate-400">Last updated: September 2026</p>
          </div>
        </div>

        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 p-4 rounded-2xl text-sm mb-6 font-semibold">
          [PLACEHOLDER — replace with real legal copy reviewed by a lawyer before launch]
        </div>

        <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">1. Data Ownership & Encryption</h2>
          <p>
            Your health entries (period flow, symptoms, BBT, mood) are treated with maximum privacy. Session tokens are encrypted and sensitive health data is never sold or shared with third parties.
          </p>

          <h2 className="text-base font-semibold text-slate-900 dark:text-white">2. Right to Export & Deletion</h2>
          <p>
            You retain 100% control over your information. You may export a full machine-readable JSON copy of your health records or permanently purge your account and data at any time.
          </p>

          <h2 className="text-base font-semibold text-slate-900 dark:text-white">3. Third-Party Analytics</h2>
          <p>
            HerCadence does not transmit raw personal health logs to third-party tracking or advertising services.
          </p>
        </div>
      </div>
    </div>
  );
};

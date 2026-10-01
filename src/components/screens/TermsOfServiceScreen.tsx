import React from 'react';
import { ShieldCheck, ChevronLeft } from 'lucide-react';
import { useCycle } from '../../context/CycleContext';

export const TermsOfServiceScreen: React.FC = () => {
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
          <div className="p-3 bg-rose-50 dark:bg-rose-950/50 rounded-2xl text-rose-500">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Terms of Service</h1>
            <p className="text-xs text-slate-400">Last updated: September 2026</p>
          </div>
        </div>

        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 p-4 rounded-2xl text-sm mb-6 font-semibold">
          [PLACEHOLDER — replace with real legal copy reviewed by a lawyer before launch]
        </div>

        <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">1. Overview & Acceptable Use</h2>
          <p>
            HerCadence is a cycle tracking and wellness journal designed for personal informational purposes. The application does not provide medical advice or diagnosis.
          </p>

          <h2 className="text-base font-semibold text-slate-900 dark:text-white">2. Health Data Privacy & Security</h2>
          <p>
            Your health and cycle data belong entirely to you. HerCadence stores your sensitive records securely and allows full data export and permanent account deletion at any time.
          </p>

          <h2 className="text-base font-semibold text-slate-900 dark:text-white">3. Disclaimers</h2>
          <p>
            Predictions provided by HerCadence are estimates based on standard clinical algorithms and user-entered logs. Always consult a qualified healthcare provider for medical concerns.
          </p>
        </div>
      </div>
    </div>
  );
};

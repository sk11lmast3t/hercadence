import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { useCycle } from '../../context/CycleContext';
import { AppView } from '../../types';
import { useEdgeFunction } from '../../hooks/useSupabase';
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
  useUser
} from '@clerk/clerk-react';

interface LoginGatewayScreenProps {
  onSuccess: () => void;
  onNavigate?: (view: AppView) => void;
}

export const LoginGatewayScreen: React.FC<LoginGatewayScreenProps> = ({ onSuccess, onNavigate }) => {
  const { updateSettings } = useCycle();
  const { user, isSignedIn } = useUser();
  const { invoke } = useEdgeFunction();
  const [isEntering, setIsEntering] = useState(false);

  // Sync Clerk user data into local context when signed in
  React.useEffect(() => {
    if (isSignedIn && user) {
      updateSettings({
        userName: user.fullName || user.firstName || user.username || '',
        email: user.primaryEmailAddress?.emailAddress || '',
        avatarUrl: user.imageUrl || ''
      });
    }
  }, [isSignedIn, user]);

  // complete-onboarding auto-fire now lives in App.tsx so it fires
  // even after a full-page reload when LoginGatewayScreen doesn't mount.

  /**
   * Trigger complete-onboarding Edge Function atomically, then enter the app.
   * Failure is non-fatal — user always gets in; sync retries on next open.
   */
  const handleEnter = useCallback(async () => {
    setIsEntering(true);
    try {
      const pending = localStorage.getItem('pendingOnboardingData');
      await invoke('complete-onboarding', {
        pendingData: pending ? JSON.parse(pending) : null,
      });
      localStorage.removeItem('pendingOnboardingData');
    } catch {
      // Non-fatal: let user through regardless
    } finally {
      setIsEntering(false);
      onSuccess();
    }
  }, [invoke, onSuccess]);

  return (
    <div className="w-full min-h-full bg-[#FAF9F7] flex flex-col justify-between relative selection:bg-[#DE9E8E]/30 pb-6">
      {/* Top Brand Logo */}
      <div className="relative w-full pt-8 pb-4 flex flex-col items-center justify-center flex-shrink-0">
        <div className="w-36 h-36 rounded-[36px] overflow-hidden shadow-[0_12px_36px_rgba(82,52,70,0.18)] border-4 border-white bg-white p-0.5">
          <img
            src="/assets/hercadence_logo.jpg"
            alt="HerCadence Brand Logo"
            className="w-full h-full object-cover rounded-[32px]"
            referrerPolicy="no-referrer"
          />
        </div>
        <span className="text-[12px] font-bold text-[#523446] tracking-widest uppercase mt-3">HerCadence</span>
      </div>

      {/* Content Section */}
      <div className="flex-1 px-7 sm:px-8 pt-3 pb-6 flex flex-col justify-between text-center">
        {/* Typography */}
        <div className="space-y-3.5 my-auto">
          <SignedIn>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium mx-auto mb-2">
              <CheckCircle2 size={13} className="text-emerald-600" />
              <span>Signed in with Clerk</span>
            </div>
            <h1 className="font-serif text-[36px] sm:text-[40px] font-normal text-[#1E191D] leading-[1.15] tracking-tight">
              Welcome back,<br />
              {user?.firstName || user?.fullName || 'there'}!
            </h1>
            <p className="text-[16px] sm:text-[17px] text-[#4A3D47] font-normal leading-snug max-w-xs mx-auto">
              Your personalized cycle sync and holistic wellness journey is ready.
            </p>
          </SignedIn>

          <SignedOut>
            <h1 className="font-serif text-[40px] sm:text-[44px] font-normal text-[#1E191D] leading-[1.15] tracking-tight">
              Join our<br />community.
            </h1>
            <p className="text-[17px] sm:text-[18px] text-[#4A3D47] font-normal leading-snug max-w-xs mx-auto">
              Discover a supportive space<br />for your wellness journey.
            </p>
          </SignedOut>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4 pt-6">
          <SignedIn>
            <div className="flex flex-col items-center gap-3">
              <button
                type="button"
                onClick={handleEnter}
                disabled={isEntering}
                className="w-full py-4.5 bg-[#543649] hover:bg-[#432939] active:scale-[0.98] text-white font-sans font-medium text-[18px] rounded-full shadow-[0_10px_28px_rgba(84,54,73,0.32)] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {isEntering ? (
                  <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Enter HerCadence</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
              <div className="flex items-center gap-2 pt-1 text-xs text-[#7A6C74]">
                <span>Manage account:</span>
                <UserButton showName />
              </div>
            </div>
          </SignedIn>

          <SignedOut>
            <SignUpButton mode="modal">
              <button
                type="button"
                id="create_account_btn"
                className="w-full py-4.5 bg-[#543649] hover:bg-[#432939] active:scale-[0.98] text-white font-sans font-medium text-[18px] rounded-full shadow-[0_10px_28px_rgba(84,54,73,0.32)] transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Sparkles size={18} className="text-rose-200" />
                <span>Create Account</span>
              </button>
            </SignUpButton>

            <div className="flex items-center justify-center gap-3">
              <SignInButton mode="modal">
                <button
                  type="button"
                  id="sign_in_link_btn"
                  className="text-[17px] sm:text-[18px] font-medium text-[#1E191D] hover:text-[#543649] hover:underline cursor-pointer py-1 transition-colors"
                >
                  Sign In
                </button>
              </SignInButton>
            </div>
          </SignedOut>
        </div>
      </div>
    </div>
  );
};

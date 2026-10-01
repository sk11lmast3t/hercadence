import React, { useState, useEffect } from 'react';
import { ChevronLeft, Check, UserCheck, ArrowRight, Crown, Sparkles, Lock } from 'lucide-react';
import { useCycle } from '../../context/CycleContext';
import { AppView } from '../../types';
import { usePartnerPermissions } from '../../hooks/usePartnerPermissions';

interface PartnerSyncScreenProps {
  onBack: () => void;
  onNavigate?: (view: AppView) => void;
}

export const PartnerSyncScreen: React.FC<PartnerSyncScreenProps> = ({ onBack, onNavigate }) => {
  const { settings, updateSettings } = useCycle();
  const { load: loadPermissions, save: savePermissions } = usePartnerPermissions();
  const ps = settings.partnerSync;

  const [phaseName, setPhaseName] = useState(ps.sharePhase ?? true);
  const [symptoms, setSymptoms] = useState(ps.shareSymptoms ?? true);
  const [mood, setMood] = useState(ps.shareMoods ?? true);
  const [insights, setInsights] = useState(true);
  const [inviteSent, setInviteSent] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);

  useEffect(() => {
    loadPermissions();
  }, [loadPermissions]);

  const handleToggle = (
    key: 'phase' | 'symptoms' | 'mood' | 'insights',
    current: boolean,
    setter: (val: boolean) => void
  ) => {
    const nextVal = !current;
    setter(nextVal);
    const newPhase = key === 'phase' ? nextVal : phaseName;
    const newSymptoms = key === 'symptoms' ? nextVal : symptoms;
    const newMood = key === 'mood' ? nextVal : mood;
    const newInsights = key === 'insights' ? nextVal : insights;

    if (key === 'phase') updateSettings({ partnerSync: { ...ps, sharePhase: nextVal } });
    if (key === 'symptoms') updateSettings({ partnerSync: { ...ps, shareSymptoms: nextVal } });
    if (key === 'mood') updateSettings({ partnerSync: { ...ps, shareMoods: nextVal } });

    savePermissions({
      partner_clerk_user_id: ps.connectedPartnerName || 'partner_default',
      share_phase: newPhase,
      share_symptoms: newSymptoms,
      share_moods: newMood,
      share_notes: newInsights,
    }).catch(err => console.error('Failed to sync partner permissions:', err));
  };

  const handleInvite = () => {
    if (!settings.isPremium) {
      if (onNavigate) {
        onNavigate('TRIAL_PAYWALL');
      }
      return;
    }
    if (navigator.clipboard) {
      navigator.clipboard.writeText(
        `Hey! Join me on HerCadence with my sync pairing code: ${ps.partnerCode || 'SYNC-7824'}`
      );
    }
    setInviteSent(true);
    setShowInviteModal(true);
  };

  return (
    <div className="min-h-screen bg-[#FAF9F7] text-[#1E191D] pb-32 relative overflow-x-hidden selection:bg-[#DE9E8E]/30">
      {/* Top Header Background Art with Organic Ribbons & Bird Motif */}
      <div className="relative w-full h-[360px] sm:h-[400px] overflow-hidden">
        <img
          src="/assets/partner_sync_exact_art_match_1787935660515.jpg"
          alt="Partner sync fluid artwork"
          className="w-full h-full object-cover object-center"
        />

        {/* Back Button */}
        <button
          onClick={onBack}
          id="partner_sync_back_btn"
          className="absolute top-4 left-4 z-20 w-10 h-10 rounded-full bg-white/50 backdrop-blur-md border border-white/70 flex items-center justify-center text-[#2A2328] hover:bg-white/80 active:scale-95 transition-all shadow-sm cursor-pointer"
          title="Go back"
        >
          <ChevronLeft size={22} strokeWidth={2.4} />
        </button>
      </div>

      {/* Floating Translucent Card */}
      <main className="max-w-md mx-auto px-5 sm:px-6 -mt-36 relative z-10">
        <div className="bg-white/85 backdrop-blur-xl rounded-[32px] p-6 sm:p-7 border border-white/80 shadow-[0_10px_35px_rgba(0,0,0,0.06)] space-y-6">
          {/* Title & Description */}
          <div className="space-y-2">
            <h1 className="font-serif text-[32px] sm:text-[34px] font-normal text-[#1E191D] tracking-tight leading-tight">
              Sync with Partner
            </h1>
            <p className="text-[13.5px] text-[#4A4348] font-normal leading-relaxed">
              Share your cycle data with your partner to enhance understanding and support.
            </p>
          </div>

          {/* Invite Partner Button */}
          <button
            type="button"
            onClick={handleInvite}
            id="partner_sync_invite_btn"
            className="w-full py-3.5 px-6 bg-[#523446] hover:bg-[#412737] text-white font-medium text-[15px] rounded-full shadow-[0_8px_20px_rgba(82,52,70,0.25)] flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98"
          >
            {inviteSent ? 'Invite Code Copied!' : (
              <span className="flex items-center gap-2">
                <span>Invite Partner</span>
                {!settings.isPremium && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-400/25 text-amber-200 border border-amber-300/30">
                    <Crown className="w-3 h-3 text-amber-300" />
                    Premium
                  </span>
                )}
              </span>
            )}
          </button>

          {/* Divider */}
          <div className="h-px bg-[#EAE3DC]" />

          {/* Shared Data Permissions Section */}
          <div className="space-y-4">
            <h2 className="font-bold text-[15px] text-[#1E191D] tracking-tight">
              Shared Data Permissions
            </h2>

            <div className="space-y-3.5 pt-1">
              {/* Row 1: Phase Name */}
              <div className="flex items-center justify-between">
                <span className="text-[15px] font-medium text-[#1E191D]">
                  Phase Name
                </span>
                <button
                  type="button"
                  onClick={() => handleToggle('phase', phaseName, setPhaseName)}
                  aria-label="Toggle Phase Name Sharing"
                  className={`w-12 h-7 rounded-full p-0.5 transition-colors cursor-pointer flex items-center flex-shrink-0 ${
                    phaseName ? 'bg-[#58A366]' : 'bg-[#DDD3CB]'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform ${
                      phaseName ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Row 2: Symptoms */}
              <div className="flex items-center justify-between">
                <span className="text-[15px] font-medium text-[#1E191D]">
                  Symptoms
                </span>
                <button
                  type="button"
                  onClick={() => handleToggle('symptoms', symptoms, setSymptoms)}
                  aria-label="Toggle Symptoms Sharing"
                  className={`w-12 h-7 rounded-full p-0.5 transition-colors cursor-pointer flex items-center flex-shrink-0 ${
                    symptoms ? 'bg-[#58A366]' : 'bg-[#DDD3CB]'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform ${
                      symptoms ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Row 3: Mood */}
              <div className="flex items-center justify-between">
                <span className="text-[15px] font-medium text-[#1E191D]">
                  Mood
                </span>
                <button
                  type="button"
                  onClick={() => handleToggle('mood', mood, setMood)}
                  aria-label="Toggle Mood Sharing"
                  className={`w-12 h-7 rounded-full p-0.5 transition-colors cursor-pointer flex items-center flex-shrink-0 ${
                    mood ? 'bg-[#58A366]' : 'bg-[#DDD3CB]'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform ${
                      mood ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Row 4: Insights */}
              <div className="flex items-center justify-between">
                <span className="text-[15px] font-medium text-[#1E191D]">
                  Insights
                </span>
                <button
                  type="button"
                  onClick={() => handleToggle('insights', insights, setInsights)}
                  aria-label="Toggle Insights Sharing"
                  className={`w-12 h-7 rounded-full p-0.5 transition-colors cursor-pointer flex items-center flex-shrink-0 ${
                    insights ? 'bg-[#58A366]' : 'bg-[#DDD3CB]'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform ${
                      insights ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* View Connected Partner Profile Shortcut */}
            {onNavigate && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => onNavigate('PARTNER_SYNC_DETAILS')}
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-[#523446] to-[#6A435B] hover:opacity-95 text-white font-medium text-[14px] rounded-2xl flex items-center justify-between shadow-md active:scale-98 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <UserCheck size={18} className="text-emerald-300" />
                    <span>View Connected Partner Profile {ps.connectedPartnerName ? `(${ps.connectedPartnerName})` : ''}</span>
                  </div>
                  <ArrowRight size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 border border-[#EDE4DE] shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <Check size={24} />
            </div>
            <h3 className="text-lg font-serif font-bold text-[#20141E]">
              Partner Invite Ready!
            </h3>
            <p className="text-xs text-[#52444F]">
              Your pairing code has been copied to your clipboard:
            </p>
            <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#EDE4DE] font-mono font-bold text-sm tracking-wider text-[#523446]">
              {ps.partnerCode || 'SYNC-7824'}
            </div>
            <p className="text-[11px] text-[#7A6C74]">
              Share this code with your partner to connect and sync your shared data permissions.
            </p>
            <button
              onClick={() => setShowInviteModal(false)}
              className="w-full py-2.5 bg-[#523446] text-white text-xs font-semibold rounded-full hover:bg-[#412737] transition-all"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};


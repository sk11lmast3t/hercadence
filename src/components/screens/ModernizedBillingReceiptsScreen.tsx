import React, { useState } from 'react';
import { 
  Signal, 
  Wifi, 
  Battery, 
  ChevronLeft, 
  CreditCard, 
  Sparkles, 
  Download, 
  Calendar, 
  AlertCircle, 
  Check, 
  ExternalLink,
  ShieldCheck,
  Receipt
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AppView } from '../../types';

interface ModernizedBillingReceiptsScreenProps {
  onBack?: () => void;
  onNavigate?: (view: AppView) => void;
}

export const ModernizedBillingReceiptsScreen: React.FC<ModernizedBillingReceiptsScreenProps> = ({
  onBack,
  onNavigate
}) => {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState<boolean>(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const receipts = [
    {
      id: 'inv-2023-10',
      date: 'Oct 28, 2023',
      amount: '$39.99',
      description: 'Luna Premium Annual Membership',
      status: 'Paid'
    },
    {
      id: 'inv-2023-trial',
      date: 'Oct 21, 2023',
      amount: '$0.00',
      description: '7-Day Free Trial Promotion',
      status: 'Completed'
    }
  ];

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#221B20] flex justify-center selection:bg-[#EAE4DF]">
      <div className="w-full max-w-[420px] min-h-screen flex flex-col justify-between relative bg-[#FAF8F5] pb-8 shadow-2xl overflow-x-hidden">
        
        {/* Top Plum Ribbons Banner */}
        <div className="relative w-full h-[180px] bg-[#3C2048] overflow-hidden">
          <img 
            src="/assets/luna_wellness_purple_header_1788590868601.jpg" 
            alt="Luna Plum Waves" 
            className="w-full h-full object-cover opacity-90 scale-105"
            referrerPolicy="no-referrer"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-[#FAF8F5]" />

          {/* iOS Status Bar */}
          <div className="absolute top-0 left-0 right-0 pt-3 px-6 flex justify-between items-center text-xs font-semibold text-white/90 z-20 select-none">
            <span className="tracking-tight text-[14px]">9:41</span>
            <div className="flex items-center space-x-1.5 text-white/90">
              <Signal size={13} strokeWidth={2.5} />
              <Wifi size={13} strokeWidth={2.5} />
              <Battery size={18} strokeWidth={2.5} className="rotate-90" />
            </div>
          </div>

          {/* Back Button */}
          <div className="absolute top-11 left-6 z-20">
            <button
              type="button"
              onClick={onBack || (() => onNavigate && onNavigate('PROFILE'))}
              className="w-9 h-9 rounded-full bg-white/30 backdrop-blur-md border border-white/40 flex items-center justify-center text-white hover:bg-white/50 active:scale-95 transition-all shadow-xs cursor-pointer"
            >
              <ChevronLeft size={20} strokeWidth={2.2} />
            </button>
          </div>

          <div className="absolute inset-0 flex flex-col items-center justify-center pt-5 z-20 pointer-events-none">
            <div className="w-8 h-8 text-[#E8D0E2] mb-1 flex items-center justify-center">
              <Receipt size={24} strokeWidth={1.8} />
            </div>
            <span className="text-[12px] font-bold tracking-[0.22em] text-[#F3E6F0] uppercase">
              Subscription &amp; Billing
            </span>
          </div>
        </div>

        {/* Content Section */}
        <div className="px-5 -mt-3 space-y-4 flex-1">
          
          {/* Active Plan Card */}
          <div className="bg-white rounded-[26px] p-5 border border-[#ECE2DB] shadow-[0_4px_18px_rgba(0,0,0,0.02)] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#422247] text-[#F4D77A] flex items-center justify-center">
                  <Sparkles size={15} />
                </div>
                <div>
                  <h3 className="text-[16px] font-bold text-[#2A1535]">
                    HerCadence Premium
                  </h3>
                  <span className="text-[11px] font-semibold text-[#866F81]">
                    Lifetime Access ($245.00)
                  </span>
                </div>
              </div>
              <span className="text-[11.5px] font-bold text-[#3B6E47] bg-[#EAF5ED] px-2.5 py-0.5 rounded-full border border-[#D5EADB]">
                Active
              </span>
            </div>

            <div className="pt-2 border-t border-[#F2ECE6] text-[13px] text-[#554752] flex items-center justify-between">
              <span>Next Renewal Date:</span>
              <span className="font-semibold text-[#2A1535]">October 28, 2024</span>
            </div>

            <button
              type="button"
              onClick={() => onNavigate && onNavigate('TRIAL_PAYWALL')}
              className="w-full py-2.5 rounded-xl bg-[#FAF6F9] border border-[#E5D7E2] text-[#422247] text-[13px] font-semibold flex items-center justify-center gap-1.5 hover:bg-[#F3EAF2] transition-colors cursor-pointer"
            >
              <span>View Premium Benefits</span>
              <ExternalLink size={14} />
            </button>
          </div>

          {/* Payment Method Card */}
          <div className="bg-white rounded-[26px] p-5 border border-[#ECE2DB] shadow-[0_4px_18px_rgba(0,0,0,0.02)] space-y-3">
            <span className="text-[11px] font-bold text-[#867683] uppercase tracking-wider block">
              Payment Method
            </span>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-8 rounded-xl bg-[#231E22] text-white flex items-center justify-center font-bold text-[12px] shadow-2xs">
                  Pay
                </div>
                <div>
                  <div className="text-[13.5px] font-bold text-[#2A1535]">
                    Apple Pay (Visa •••• 4242)
                  </div>
                  <div className="text-[11px] text-[#7A6A78]">
                    Billed via App Store account
                  </div>
                </div>
              </div>
              <span className="text-[12px] font-semibold text-[#5B4257]">
                Default
              </span>
            </div>
          </div>

          {/* Billing Receipts History */}
          <div className="bg-white rounded-[26px] p-5 border border-[#ECE2DB] shadow-[0_4px_18px_rgba(0,0,0,0.02)] space-y-3">
            <span className="text-[11px] font-bold text-[#867683] uppercase tracking-wider block">
              Invoices &amp; Rec  eipts
            </span>

            <div className="space-y-2.5">
              {receipts.map(rec => (
                <div 
                  key={rec.id}
                  className="p-3 rounded-2xl bg-[#FAF8FA] border border-[#EAE0E7] flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-white text-[#422247] flex items-center justify-center border border-[#EDE2EA]">
                      <Receipt size={15} />
                    </div>
                    <div>
                      <div className="text-[13px] font-bold text-[#2A1535]">
                        {rec.amount} • {rec.status}
                      </div>
                      <div className="text-[11px] text-[#7A6A78]">
                        {rec.date} — {rec.description}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => showToast(`Downloaded invoice ${rec.id}.pdf`)}
                    className="p-1.5 rounded-lg text-[#695566] hover:bg-white hover:text-[#422247] transition-all cursor-pointer"
                    title="Download Receipt"
                  >
                    <Download size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Cancel Subscription link */}
          <div className="text-center pt-1">
            <button
              type="button"
              onClick={() => setShowCancelModal(true)}
              className="text-[12.5px] font-semibold text-[#8B7888] hover:text-[#B04C58] transition-colors"
            >
              Cancel or Manage Subscription
            </button>
          </div>

        </div>

        {/* Bottom iOS Bar */}
        <div className="pt-4 pb-2 flex justify-center">
          <button
            type="button"
            onClick={onBack || (() => onNavigate && onNavigate('HOME'))}
            className="w-36 h-1.5 bg-black/80 hover:bg-black rounded-full active:scale-95 transition-all cursor-pointer"
            title="Home Bar - Tap to return"
            aria-label="Home"
          />
        </div>

        {/* Cancel Confirmation Modal */}
        <AnimatePresence>
          {showCancelModal && (
            <div className="fixed inset-0 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4 z-50">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl border border-[#EDE5DF]"
              >
                <div className="flex items-center gap-2.5 text-[#B04C58] mb-3">
                  <AlertCircle size={22} />
                  <h3 className="text-[18px] font-serif font-bold text-[#1E191D]">
                    Manage Subscription
                  </h3>
                </div>

                <p className="text-[13px] text-[#6E646A] leading-relaxed mb-4">
                  Apple manages all iOS App Store billing. If you cancel, you will retain full Luna Premium access until <strong className="text-[#1E191D]">October 28, 2024</strong>.
                </p>

                <div className="flex gap-2.5">
                  <button
                    type="button"
                    onClick={() => setShowCancelModal(false)}
                    className="flex-1 py-3 rounded-full bg-[#F0EAE5] text-[#554C53] font-semibold text-[13.5px] hover:bg-[#E5DCD6] cursor-pointer"
                  >
                    Keep Premium
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCancelModal(false);
                      showToast('Opening iOS Subscription Settings...');
                    }}
                    className="flex-1 py-3 rounded-full bg-[#422247] text-white font-semibold text-[13.5px] cursor-pointer shadow-xs"
                  >
                    Open App Store
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Toast */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed bottom-14 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-[#1E191D] text-white text-[12.5px] font-medium shadow-lg z-50 flex items-center gap-2"
            >
              <Check size={14} className="text-[#8BE1A5]" />
              <span>{toastMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};

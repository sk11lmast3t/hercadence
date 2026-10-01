import React, { useState } from 'react';
import { 
  Signal, 
  Wifi, 
  Battery, 
  ChevronLeft, 
  Mail, 
  KeyRound, 
  CheckCircle2, 
  Eye, 
  EyeOff, 
  ArrowRight,
  ShieldCheck,
  Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AppView } from '../../types';

interface ModernizedForgotPasswordScreenProps {
  onBack?: () => void;
  onNavigate?: (view: AppView) => void;
  onSuccess?: () => void;
}

export const ModernizedForgotPasswordScreen: React.FC<ModernizedForgotPasswordScreenProps> = ({
  onBack,
  onNavigate,
  onSuccess
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [email, setEmail] = useState<string>('jane.doe@example.com');
  const [otpCode, setOtpCode] = useState<string[]>(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleOtpChange = (index: number, val: string) => {
    if (val.length > 1) val = val.slice(-1);
    const newOtp = [...otpCode];
    newOtp[index] = val;
    setOtpCode(newOtp);

    // Auto focus next input
    if (val && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleSendCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address');
      return;
    }
    setErrorMsg(null);
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setStep(2);
    }, 800);
  };

  const handleVerifyOtp = () => {
    const code = otpCode.join('');
    if (code.length < 6) {
      setErrorMsg('Please enter the complete 6-digit verification code');
      return;
    }
    setErrorMsg(null);
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setStep(3);
    }, 700);
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      setErrorMsg('Password must be at least 8 characters long');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }
    setErrorMsg(null);
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setStep(4);
    }, 900);
  };

  // Password strength check
  const hasMinLength = newPassword.length >= 8;
  const hasNumber = /\d/.test(newPassword);
  const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);
  const strengthScore = [hasMinLength, hasNumber, hasSymbol].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#221B20] flex justify-center selection:bg-[#EAE4DF]">
      <div className="w-full max-w-[420px] min-h-screen flex flex-col justify-between relative bg-[#FAF8F5] pb-8 shadow-2xl overflow-x-hidden">
        
        {/* Top Plum Silk Wave Banner with Luna Wellness Inscription */}
        <div className="relative w-full h-[190px] bg-[#3C2048] overflow-hidden">
          <img 
            src="/assets/luna_wellness_purple_header_1788590868601.jpg" 
            alt="Luna Wellness Silk Ribbon" 
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

          {/* Top Bar with Back Button */}
          <div className="absolute top-11 left-6 z-20">
            <button
              type="button"
              onClick={() => {
                if (step > 1 && step < 4) {
                  setStep((prev) => (prev - 1) as any);
                } else if (onBack) {
                  onBack();
                } else if (onNavigate) {
                  onNavigate('LOGIN_GATEWAY');
                }
              }}
              className="w-9 h-9 rounded-full bg-white/30 backdrop-blur-md border border-white/40 flex items-center justify-center text-white hover:bg-white/50 active:scale-95 transition-all shadow-xs cursor-pointer"
            >
              <ChevronLeft size={20} strokeWidth={2.2} />
            </button>
          </div>

          {/* Lotus Icon & Brand Inscription */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pt-5 z-20 pointer-events-none">
            <div className="w-8 h-8 text-[#E8D0E2] mb-1 flex items-center justify-center">
              <KeyRound size={24} strokeWidth={1.8} />
            </div>
            <span className="text-[12px] font-bold tracking-[0.22em] text-[#F3E6F0] uppercase">
              Luna Security
            </span>
          </div>
        </div>

        {/* Content Card */}
        <div className="px-5 -mt-4 z-20 flex-1 flex flex-col justify-center">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="w-full bg-white rounded-[32px] p-6 sm:p-7 border border-[#EFE5DE] shadow-[0_8px_30px_rgba(59,30,72,0.06)]"
          >
            {/* Step Indicator */}
            {step < 4 && (
              <div className="flex items-center justify-center gap-1.5 mb-5">
                {[1, 2, 3].map((s) => (
                  <div
                    key={s}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      step === s 
                        ? 'w-8 bg-[#422247]' 
                        : step > s 
                        ? 'w-3 bg-[#A4809F]' 
                        : 'w-3 bg-[#E9DFE5]'
                    }`}
                  />
                ))}
              </div>
            )}

            {/* Error Banner */}
            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-[#FDF0F2] border border-[#F4CDD2] text-[#B04C58] text-[12.5px] font-medium text-center">
                {errorMsg}
              </div>
            )}

            {/* STEP 1: Enter Email */}
            {step === 1 && (
              <form onSubmit={handleSendCode} className="space-y-4">
                <div className="text-center mb-5">
                  <h2 className="font-bold text-[24px] text-[#281533] tracking-tight">
                    Reset Password
                  </h2>
                  <p className="text-[14px] text-[#695867] mt-1.5 leading-relaxed">
                    Enter the email linked to your Luna account. We'll send a 6-digit verification code.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11.5px] font-bold text-[#745E6F] uppercase tracking-wider block">
                    Account Email
                  </label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9A8696]" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      required
                      className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-[#E4D5DF] bg-[#FAF8FA] text-[15px] text-[#2B1733] font-medium focus:outline-none focus:border-[#422247] transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-2 py-3.5 rounded-full bg-[#422247] hover:bg-[#341838] active:scale-[0.98] text-white text-[15px] font-semibold flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(66,34,71,0.35)] transition-all cursor-pointer"
                >
                  <span>{isSubmitting ? 'Sending Code...' : 'Send Verification Code'}</span>
                  <ArrowRight size={17} />
                </button>

                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={() => onNavigate ? onNavigate('LOGIN_GATEWAY') : (onBack && onBack())}
                    className="text-[13px] font-semibold text-[#664C61] hover:underline"
                  >
                    Remember your password? Sign In
                  </button>
                </div>
              </form>
            )}

            {/* STEP 2: 6-Digit Code */}
            {step === 2 && (
              <div className="space-y-5">
                <div className="text-center">
                  <h2 className="font-bold text-[24px] text-[#281533] tracking-tight">
                    Check Your Inbox
                  </h2>
                  <p className="text-[13.5px] text-[#695867] mt-1.5 leading-relaxed">
                    We sent a 6-digit verification code to <span className="font-semibold text-[#291435]">{email}</span>
                  </p>
                </div>

                {/* 6 Inputs Grid */}
                <div className="flex justify-center gap-2 sm:gap-2.5 my-2">
                  {otpCode.map((digit, idx) => (
                    <input
                      key={idx}
                      id={`otp-${idx}`}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      className="w-11 h-13 sm:w-12 sm:h-14 rounded-2xl border border-[#E0D0DC] bg-[#FAF7F9] text-center text-[22px] font-bold text-[#2A1535] focus:outline-none focus:border-[#422247] focus:ring-2 focus:ring-[#422247]/15 transition-all"
                    />
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-full bg-[#422247] hover:bg-[#341838] active:scale-[0.98] text-white text-[15px] font-semibold flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(66,34,71,0.35)] transition-all cursor-pointer"
                >
                  <span>{isSubmitting ? 'Verifying...' : 'Verify Code'}</span>
                  <ArrowRight size={17} />
                </button>

                <div className="text-center text-[12.5px] text-[#786675]">
                  Didn't receive it?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setOtpCode(['9', '4', '1', '2', '0', '8']);
                    }}
                    className="font-bold text-[#422247] hover:underline"
                  >
                    Auto-fill demo code (941208)
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Create New Password */}
            {step === 3 && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="text-center mb-3">
                  <h2 className="font-bold text-[24px] text-[#281533] tracking-tight">
                    Set New Password
                  </h2>
                  <p className="text-[13.5px] text-[#695867] mt-1">
                    Choose a strong, unique password for your account.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11.5px] font-bold text-[#745E6F] uppercase tracking-wider block">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9A8696]" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimum 8 characters"
                      required
                      className="w-full pl-11 pr-11 py-3.5 rounded-2xl border border-[#E4D5DF] bg-[#FAF8FA] text-[15px] text-[#2B1733] font-medium focus:outline-none focus:border-[#422247]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9A8696] hover:text-[#422247]"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Strength Meter */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex gap-1.5">
                    <div className={`h-1.5 flex-1 rounded-full ${strengthScore >= 1 ? 'bg-[#D66D75]' : 'bg-[#EDE4EB]'}`} />
                    <div className={`h-1.5 flex-1 rounded-full ${strengthScore >= 2 ? 'bg-[#E29578]' : 'bg-[#EDE4EB]'}`} />
                    <div className={`h-1.5 flex-1 rounded-full ${strengthScore >= 3 ? 'bg-[#6D9F71]' : 'bg-[#EDE4EB]'}`} />
                  </div>
                  <div className="text-[11px] text-[#7A6877] flex justify-between">
                    <span>At least 8 chars, 1 number &amp; symbol</span>
                    <span className="font-semibold">
                      {strengthScore === 3 ? 'Strong' : strengthScore === 2 ? 'Medium' : 'Weak'}
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 pt-1">
                  <label className="text-[11.5px] font-bold text-[#745E6F] uppercase tracking-wider block">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9A8696]" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat new password"
                      required
                      className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-[#E4D5DF] bg-[#FAF8FA] text-[15px] text-[#2B1733] font-medium focus:outline-none focus:border-[#422247]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-3 py-3.5 rounded-full bg-[#422247] hover:bg-[#341838] active:scale-[0.98] text-white text-[15px] font-semibold flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(66,34,71,0.35)] transition-all cursor-pointer"
                >
                  <span>{isSubmitting ? 'Updating...' : 'Update Password & Sign In'}</span>
                  <CheckCircle2 size={17} />
                </button>
              </form>
            )}

            {/* STEP 4: Success */}
            {step === 4 && (
              <div className="text-center py-4 space-y-4">
                <div className="w-16 h-16 mx-auto rounded-3xl bg-[#F5ECF4] text-[#422247] flex items-center justify-center shadow-inner">
                  <CheckCircle2 size={36} strokeWidth={2.2} />
                </div>
                <div>
                  <h2 className="font-bold text-[24px] text-[#281533] tracking-tight">
                    Password Reset!
                  </h2>
                  <p className="text-[14px] text-[#695867] mt-1.5 leading-relaxed">
                    Your password has been updated securely. You can now access your health journal and cycle predictions.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (onSuccess) onSuccess();
                    else if (onNavigate) onNavigate('HOME');
                  }}
                  className="w-full py-3.5 rounded-full bg-[#422247] text-white text-[15px] font-semibold shadow-md active:scale-95 cursor-pointer"
                >
                  Go to My Dashboard →
                </button>
              </div>
            )}

          </motion.div>
        </div>

        {/* Bottom iOS Indicator */}
        <div className="pt-6 pb-2 flex justify-center">
          <button
            type="button"
            onClick={onBack || (() => onNavigate && onNavigate('HOME'))}
            className="w-36 h-1.5 bg-black/80 hover:bg-black rounded-full active:scale-95 transition-all cursor-pointer"
            title="Home Bar - Tap to return"
            aria-label="Home"
          />
        </div>

      </div>
    </div>
  );
};

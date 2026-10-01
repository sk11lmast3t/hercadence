import React, { useState, useEffect, useRef } from 'react';
import { 
  Wifi, 
  Battery, 
  Smartphone, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Lock, 
  Maximize2, 
  Minimize2, 
  Share2, 
  Download, 
  X, 
  ChevronRight, 
  Droplet, 
  Heart, 
  Check, 
  Activity,
  RotateCcw,
  Moon,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AppView, CycleCalculationResult, UserSettings } from '../../types';
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from '@clerk/clerk-react';

export type DeviceModel = 'iphone' | 'pixel' | 'frameless' | 'fullscreen';

interface MobileAppShellProps {
  children: React.ReactNode;
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  onOpenLogModal: () => void;
  onOpenDirectory: () => void;
  cycleInfo: CycleCalculationResult;
  settings: UserSettings;
}

export const MobileAppShell: React.FC<MobileAppShellProps> = ({
  children,
  currentView,
  onNavigate,
  onOpenLogModal,
  onOpenDirectory,
  cycleInfo,
  settings,
}) => {
  // Device frame selection
  const [deviceModel, setDeviceModel] = useState<DeviceModel>('iphone');
  const [isMobileViewport, setIsMobileViewport] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<string>('9:41');
  const [batteryLevel, setBatteryLevel] = useState<number>(98);
  const [isCharging, setIsCharging] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Dynamic Island interactive state
  const [isIslandExpanded, setIsIslandExpanded] = useState<boolean>(false);

  // Side Hardware Button Feedback
  const [volumeLevel, setVolumeLevel] = useState<number>(75);
  const [showVolumeHud, setShowVolumeHud] = useState<boolean>(false);
  const volumeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Screen Sleep / Lock effect
  const [isSleeping, setIsSleeping] = useState<boolean>(false);

  // Install Modal
  const [showInstallSheet, setShowInstallSheet] = useState<boolean>(false);

  // Audio Context for native tactile haptics
  const audioContextRef = useRef<AudioContext | null>(null);

  const playHaptic = (freq = 420, duration = 0.018) => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioCtx();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + duration);

      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Audio context might be restricted before user interaction
    }
  };

  // Detect real mobile screen sizes
  useEffect(() => {
    const checkViewport = () => {
      const isMobile = window.innerWidth <= 640;
      setIsMobileViewport(isMobile);
    };
    checkViewport();
    window.addEventListener('resize', checkViewport);
    return () => window.removeEventListener('resize', checkViewport);
  }, []);

  // Update real-time clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const formattedMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
      // In 12-hour format or standard phone status bar format
      const formattedHours = hours % 12 || 12;
      setCurrentTime(`${formattedHours}:${formattedMinutes}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  // Battery status API if supported
  useEffect(() => {
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        setBatteryLevel(Math.round(battery.level * 100));
        setIsCharging(battery.charging);
        battery.addEventListener('levelchange', () => {
          setBatteryLevel(Math.round(battery.level * 100));
        });
        battery.addEventListener('chargingchange', () => {
          setIsCharging(battery.charging);
        });
      }).catch(() => {});
    }
  }, []);

  const triggerVolumeChange = (delta: number) => {
    playHaptic(delta > 0 ? 520 : 380);
    setVolumeLevel((prev) => Math.min(100, Math.max(0, prev + delta)));
    setShowVolumeHud(true);
    if (volumeTimeoutRef.current) clearTimeout(volumeTimeoutRef.current);
    volumeTimeoutRef.current = setTimeout(() => {
      setShowVolumeHud(false);
    }, 1800);
  };

  const togglePower = () => {
    playHaptic(280);
    setIsSleeping((prev) => !prev);
  };

  const handleHomeSwipe = () => {
    playHaptic(440);
    onNavigate('HOME');
  };

  // Phase color & text for dynamic island
  const getPhaseDetails = () => {
    switch (cycleInfo.currentPhase) {
      case 'MENSTRUAL':
        return { label: 'Period', icon: Droplet, color: 'text-rose-400', bg: 'bg-rose-500/20' };
      case 'OVULATION':
        return { label: 'Ovulation', icon: Sparkles, color: 'text-amber-400', bg: 'bg-amber-500/20' };
      case 'LUTEAL':
        return { label: 'Luteal', icon: Moon, color: 'text-purple-400', bg: 'bg-purple-500/20' };
      default:
        return { label: 'Follicular', icon: Activity, color: 'text-emerald-400', bg: 'bg-emerald-500/20' };
    }
  };

  const phaseDetails = getPhaseDetails();
  const PhaseIcon = phaseDetails.icon;

  // Render pure mobile layout without outer frame if on small mobile screen or fullscreen mode
  if (isMobileViewport || deviceModel === 'fullscreen') {
    return (
      <div 
        id="native_mobile_app_root"
        className="w-full min-h-screen min-h-[100dvh] bg-[#FAF7F2] text-[#20171D] relative font-sans overflow-x-hidden selection:bg-[#EBD7D9] selection:text-[#523446]"
      >
        {/* On native mobile devices, render directly full-screen edge-to-edge */}
        <div className="w-full min-h-screen min-h-[100dvh] relative flex flex-col">
          {children}
        </div>

        {/* Floating Mobile Mode indicator on mobile web */}
        {deviceModel === 'fullscreen' && !isMobileViewport && (
          <button
            type="button"
            onClick={() => setDeviceModel('iphone')}
            className="fixed top-4 right-4 z-50 px-3 py-1.5 rounded-full bg-[#3D2232]/85 text-white/90 text-xs backdrop-blur-md shadow-lg border border-white/20 flex items-center gap-1.5 hover:bg-[#3D2232] cursor-pointer"
          >
            <Smartphone size={13} />
            <span>Mobile Device Frame</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div 
      id="mobile_application_workspace"
      className="min-h-screen w-full bg-[#171316] flex flex-col items-center justify-center p-3 sm:p-6 lg:p-8 font-sans select-none overflow-x-hidden relative"
      style={{
        backgroundImage: 'radial-gradient(ellipse at 50% 15%, rgba(84, 54, 73, 0.45) 0%, rgba(23, 19, 22, 0.98) 75%)'
      }}
    >
      {/* Desktop Top Control Bar for Mobile App */}
      <header className="w-full max-w-4xl flex items-center justify-between py-2 px-4 mb-4 z-40 text-xs text-stone-300">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 shadow-xs">
            <img
              src="/assets/hercadence_logo.jpg"
              alt="HerCadence Logo"
              className="w-5 h-5 rounded-full object-cover shadow-xs border border-white/30"
              referrerPolicy="no-referrer"
            />
            <span className="font-medium text-white tracking-tight">HerCadence Mobile OS</span>
            <span className="text-[10px] text-stone-400 font-mono">v2.4</span>
          </div>

          <button
            type="button"
            onClick={onOpenDirectory}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/15 text-stone-300 hover:text-white transition-all border border-white/10 cursor-pointer"
            title="Open all 45+ Mobile Screens Directory"
          >
            <Sparkles size={13} className="text-rose-300" />
            <span>All 45+ Screens</span>
          </button>
        </div>

        {/* Model Switcher & Tool Controls */}
        <div className="flex items-center gap-2">
          {/* Frame selector pills */}
          <div className="flex items-center bg-black/40 p-1 rounded-full border border-white/10 shadow-inner">
            <button
              type="button"
              onClick={() => { playHaptic(480); setDeviceModel('iphone'); }}
              className={`px-3 py-1 rounded-full text-[11px] font-medium transition-all cursor-pointer ${
                deviceModel === 'iphone'
                  ? 'bg-gradient-to-r from-[#DE9E8E] to-[#FAF7F2] text-[#3D2232] font-semibold shadow-xs'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              iPhone 16 Pro
            </button>
            <button
              type="button"
              onClick={() => { playHaptic(480); setDeviceModel('pixel'); }}
              className={`px-3 py-1 rounded-full text-[11px] font-medium transition-all cursor-pointer ${
                deviceModel === 'pixel'
                  ? 'bg-gradient-to-r from-[#DE9E8E] to-[#FAF7F2] text-[#3D2232] font-semibold shadow-xs'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              Pixel 9
            </button>
            <button
              type="button"
              onClick={() => { playHaptic(480); setDeviceModel('frameless'); }}
              className={`px-3 py-1 rounded-full text-[11px] font-medium transition-all cursor-pointer ${
                deviceModel === 'frameless'
                  ? 'bg-gradient-to-r from-[#DE9E8E] to-[#FAF7F2] text-[#3D2232] font-semibold shadow-xs'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              Frameless
            </button>
          </div>

          {/* Sound toggle */}
          <button
            type="button"
            onClick={() => {
              setSoundEnabled(!soundEnabled);
              if (!soundEnabled) playHaptic(550);
            }}
            className={`p-2 rounded-full border transition-all cursor-pointer ${
              soundEnabled 
                ? 'bg-white/15 border-white/20 text-white' 
                : 'bg-black/30 border-white/5 text-stone-500'
            }`}
            title={soundEnabled ? 'Mute Mobile Haptics' : 'Enable Mobile Haptics'}
          >
            {soundEnabled ? <Volume2 size={13} /> : <VolumeX size={13} />}
          </button>

          {/* Install as App button */}
          <button
            type="button"
            onClick={() => { playHaptic(450); setShowInstallSheet(true); }}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-500/30 transition-all cursor-pointer font-medium"
            title="Install Mobile App on Phone"
          >
            <Download size={12} />
            <span className="hidden md:inline">Install on Phone</span>
          </button>

          {/* Full View toggle */}
          <button
            type="button"
            onClick={() => { playHaptic(400); setDeviceModel('fullscreen'); }}
            className="p-2 rounded-full bg-white/5 hover:bg-white/15 text-stone-400 hover:text-white border border-white/10 transition-all cursor-pointer"
            title="Expand Fullscreen Mobile"
          >
            <Maximize2 size={13} />
          </button>

          {/* Clerk Auth Controls */}
          <div className="flex items-center gap-1.5 ml-1 pl-2 border-l border-white/15">
            <SignedOut>
              <SignInButton mode="modal">
                <button
                  type="button"
                  className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white text-[11px] font-medium transition-all cursor-pointer border border-white/15"
                >
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button
                  type="button"
                  className="px-2.5 py-1 rounded-full bg-gradient-to-r from-[#DE9E8E] to-[#FAF7F2] text-[#3D2232] text-[11px] font-semibold transition-all cursor-pointer shadow-xs"
                >
                  Sign Up
                </button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/10 border border-white/15">
                <UserButton />
              </div>
            </SignedIn>
          </div>
        </div>
      </header>

      {/* Main Device Chassis Area */}
      <div className="relative flex items-center justify-center my-auto">
        {/* Hardware Buttons on Phone Chassis */}
        {deviceModel !== 'frameless' && (
          <>
            {/* Left Buttons: Action Button + Volume Up + Volume Down */}
            <div className="absolute -left-[14px] top-[108px] flex flex-col gap-3.5 z-0">
              {/* Action Button (opens daily log) */}
              <button
                type="button"
                onClick={() => {
                  playHaptic(580);
                  onOpenLogModal();
                }}
                className="w-[14px] h-[26px] bg-[#61545A] hover:bg-[#DE9E8E] rounded-l-[4px] shadow-md transition-all active:translate-x-1 cursor-pointer"
                title="Action Button (Quick Log Today)"
              />

              {/* Volume Up */}
              <button
                type="button"
                onClick={() => triggerVolumeChange(10)}
                className="w-[14px] h-[46px] bg-[#52464D] hover:bg-[#6E5F67] rounded-l-[4px] shadow-md transition-all active:translate-x-1 cursor-pointer"
                title="Volume Up"
              />

              {/* Volume Down */}
              <button
                type="button"
                onClick={() => triggerVolumeChange(-10)}
                className="w-[14px] h-[46px] bg-[#52464D] hover:bg-[#6E5F67] rounded-l-[4px] shadow-md transition-all active:translate-x-1 cursor-pointer"
                title="Volume Down"
              />
            </div>

            {/* Right Button: Power / Lock Button */}
            <div className="absolute -right-[14px] top-[150px] z-0">
              <button
                type="button"
                onClick={togglePower}
                className="w-[14px] h-[72px] bg-[#52464D] hover:bg-[#6E5F67] rounded-r-[4px] shadow-md transition-all active:-translate-x-1 cursor-pointer"
                title="Side Button (Lock / Sleep Screen)"
              />
            </div>
          </>
        )}

        {/* Outer Phone Case / Bezel Frame */}
        <div 
          className={`relative transition-all duration-300 ${
            deviceModel === 'iphone'
              ? 'p-[13px] bg-gradient-to-b from-[#7A6A74] via-[#483B43] to-[#34272F] rounded-[56px] shadow-[0_25px_70px_rgba(0,0,0,0.7),0_0_0_1px_rgba(255,255,255,0.15)] ring-1 ring-black/80'
              : deviceModel === 'pixel'
              ? 'p-[11px] bg-gradient-to-b from-[#696168] via-[#453D43] to-[#2B242A] rounded-[48px] shadow-[0_25px_70px_rgba(0,0,0,0.7),0_0_0_1px_rgba(255,255,255,0.12)]'
              : 'p-0 rounded-[40px] shadow-[0_25px_60px_rgba(0,0,0,0.6)]'
          }`}
        >
          {/* Subtle Titanium Inner Chamfer Highlight */}
          {deviceModel === 'iphone' && (
            <div className="absolute inset-[3px] rounded-[53px] pointer-events-none border border-white/15" />
          )}

          {/* Inner Phone Screen Display */}
          <div 
            id="mobile_phone_screen"
            className={`w-[390px] sm:w-[402px] h-[844px] max-h-[min(870px,90vh)] bg-[#FAF7F2] text-[#20171D] relative flex flex-col overflow-hidden select-none transition-all ${
              deviceModel === 'iphone'
                ? 'rounded-[46px]'
                : deviceModel === 'pixel'
                ? 'rounded-[38px]'
                : 'rounded-[36px]'
            }`}
            style={{
              // Establish isolated coordinate system so fixed elements stay bound to phone screen
              transform: 'translate3d(0, 0, 0)',
              isolation: 'isolate'
            }}
          >
            {/* Native Hardware Status Bar at Top */}
            <div className="w-full pt-3 px-7 flex items-center justify-between text-xs font-semibold text-[#20171D] z-40 select-none bg-transparent">
              {/* Clock */}
              <span className="text-[14px] font-semibold tracking-tight">{currentTime}</span>

              {/* Dynamic Island (iPhone) or Punch Hole (Pixel) */}
              {deviceModel === 'iphone' && (
                <div className="relative">
                  <motion.div
                    onClick={() => {
                      playHaptic(420);
                      setIsIslandExpanded(!isIslandExpanded);
                    }}
                    className="h-[29px] bg-black text-white px-3 rounded-full flex items-center gap-2 cursor-pointer shadow-md hover:scale-[1.03] active:scale-95 transition-all"
                    animate={{
                      width: isIslandExpanded ? 240 : 124,
                    }}
                    transition={{ type: 'spring', damping: 22, stiffness: 300 }}
                  >
                    {/* Front Camera Lens Dot */}
                    <span className="w-2.5 h-2.5 rounded-full bg-[#121214] ring-1 ring-white/10 shrink-0" />
                    
                    {!isIslandExpanded ? (
                      <div className="flex items-center gap-1.5 overflow-hidden">
                        <PhaseIcon size={11} className={phaseDetails.color} />
                        <span className="text-[10.5px] font-medium text-stone-200 truncate">
                          Day {cycleInfo.currentDayOfCycle}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between w-full pr-1 overflow-hidden">
                        <div className="flex items-center gap-1.5">
                          <PhaseIcon size={12} className={phaseDetails.color} />
                          <span className="text-[11px] font-semibold text-white">
                            {phaseDetails.label}
                          </span>
                        </div>
                        <span className="text-[10px] text-stone-300 font-mono">
                          {cycleInfo.daysUntilNextPeriod}d left
                        </span>
                      </div>
                    )}
                  </motion.div>

                  {/* Expanded Dynamic Island Live Activity Overlay */}
                  <AnimatePresence>
                    {isIslandExpanded && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        className="absolute left-1/2 -translate-x-1/2 top-9 w-[280px] bg-black/95 text-white backdrop-blur-xl rounded-2xl p-3 shadow-2xl border border-white/15 z-50 flex flex-col gap-2.5"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`w-6 h-6 rounded-full ${phaseDetails.bg} flex items-center justify-center`}>
                              <PhaseIcon size={13} className={phaseDetails.color} />
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-white leading-tight">Cycle Phase Live</p>
                              <p className="text-[10.5px] text-stone-400">Day {cycleInfo.currentDayOfCycle} of {settings.cycleLengthDays}</p>
                            </div>
                          </div>
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-white font-mono">
                            {cycleInfo.daysUntilNextPeriod}d to period
                          </span>
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-white/10">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              playHaptic(500);
                              setIsIslandExpanded(false);
                              onOpenLogModal();
                            }}
                            className="w-full py-1.5 rounded-xl bg-gradient-to-r from-[#DE9E8E] to-[#FAF7F2] text-[#3D2232] font-semibold text-[11px] flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
                          >
                            <Droplet size={12} />
                            <span>Quick Daily Log</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Pixel Hole Punch */}
              {deviceModel === 'pixel' && (
                <div className="w-3.5 h-3.5 rounded-full bg-black ring-1 ring-white/10" />
              )}

              {/* Frameless minimal pill */}
              {deviceModel === 'frameless' && (
                <div className="h-1.5 w-16 rounded-full bg-black/20" />
              )}

              {/* Cellular, Wi-Fi & Battery Status Icons */}
              <div className="flex items-center gap-1.5">
                {/* 5G Label */}
                <span className="text-[10px] font-bold text-[#20171D]/90">5G</span>

                {/* Cellular 4 signal bars */}
                <div className="flex items-end gap-[1.5px] h-3">
                  <span className="w-[2.5px] h-[3px] bg-[#20171D] rounded-[0.5px]" />
                  <span className="w-[2.5px] h-[5px] bg-[#20171D] rounded-[0.5px]" />
                  <span className="w-[2.5px] h-[7px] bg-[#20171D] rounded-[0.5px]" />
                  <span className="w-[2.5px] h-[10px] bg-[#20171D] rounded-[0.5px]" />
                </div>

                {/* Wi-Fi */}
                <Wifi size={13} strokeWidth={2.4} className="text-[#20171D]" />

                {/* Battery with real percentage */}
                <div className="flex items-center gap-1">
                  <div className="w-[19px] h-[10.5px] rounded-[3px] border-[1.2px] border-[#20171D] p-[1.5px] flex items-center">
                    <div 
                      className={`h-full rounded-[1px] transition-all ${
                        batteryLevel <= 20 ? 'bg-rose-500' : 'bg-[#20171D]'
                      }`}
                      style={{ width: `${batteryLevel}%` }}
                    />
                  </div>
                  <div className="w-[1.2px] h-[3.5px] bg-[#20171D] rounded-r-[0.8px] -ml-[1.5px]" />
                </div>
              </div>
            </div>

            {/* Native Volume HUD Indicator (Pops up from side) */}
            <AnimatePresence>
              {showVolumeHud && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="absolute left-3 top-20 z-50 bg-black/85 backdrop-blur-xl border border-white/20 text-white rounded-2xl p-2.5 flex flex-col items-center gap-2 shadow-2xl"
                >
                  <Volume2 size={16} className="text-stone-300" />
                  <div className="w-1.5 h-20 bg-white/20 rounded-full overflow-hidden flex flex-col justify-end">
                    <div 
                      className="w-full bg-white rounded-full transition-all duration-100" 
                      style={{ height: `${volumeLevel}%` }}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Screen Sleep / Lock Mode */}
            <AnimatePresence>
              {isSleeping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={togglePower}
                  className="absolute inset-0 bg-black/95 z-50 flex flex-col items-center justify-between py-16 px-6 text-white cursor-pointer select-none"
                >
                  <div className="flex flex-col items-center gap-1 pt-6">
                    <Lock size={18} className="text-stone-400 mb-1" />
                    <span className="text-5xl font-light tracking-tight">{currentTime}</span>
                    <span className="text-sm text-stone-300 font-medium">
                      {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                    </span>
                  </div>

                  <div className="w-full max-w-[280px] bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/10 flex items-center gap-3">
                    <img
                      src="/assets/hercadence_logo.jpg"
                      alt="HerCadence"
                      className="w-9 h-9 rounded-full object-cover shrink-0 shadow-xs border border-white/30"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <p className="text-xs font-semibold text-white">HerCadence</p>
                      <p className="text-[11px] text-stone-300">{phaseDetails.label} Phase • Day {cycleInfo.currentDayOfCycle}</p>
                    </div>
                  </div>

                  <div className="flex flex-col items-center gap-2">
                    <p className="text-xs text-stone-400 animate-pulse">Tap or click power button to unlock</p>
                    <div className="w-32 h-1 bg-white/40 rounded-full" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* The Actual Screen Content Container */}
            <div 
              id="mobile_screen_viewport"
              className="flex-1 w-full overflow-y-auto overscroll-none relative custom-smooth-scroll"
            >
              {children}
            </div>

            {/* Bottom iOS / Android Home Swipe Indicator Bar */}
            <div 
              id="mobile_home_bar_container"
              className="w-full pb-1 pt-1.5 flex items-center justify-center bg-transparent z-40 pointer-events-auto"
            >
              <button
                type="button"
                onClick={handleHomeSwipe}
                className="w-36 h-1.5 bg-[#20171D]/40 hover:bg-[#20171D]/80 rounded-full transition-all cursor-pointer active:scale-95"
                title="Swipe / Click Home Indicator to Return to Home View"
                aria-label="Home Bar"
              />
            </div>
          </div>
        </div>
      </div>

      {/* "Install Mobile App" Modal Sheet */}
      <AnimatePresence>
        {showInstallSheet && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-[#FAF7F2] rounded-[32px] p-6 text-[#20171D] border border-[#E8DDD5] shadow-2xl relative"
            >
              <button
                type="button"
                onClick={() => setShowInstallSheet(false)}
                className="absolute top-5 right-5 w-8 h-8 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center text-[#543649] transition-all cursor-pointer"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-[#523446] text-white flex items-center justify-center shadow-md">
                  <Smartphone size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-serif font-bold text-[#3D2232]">Run as Mobile App</h3>
                  <p className="text-xs text-stone-500">Add directly to your iPhone or Android home screen</p>
                </div>
              </div>

              <div className="space-y-3.5 my-5 text-xs text-stone-700">
                <div className="p-3.5 rounded-2xl bg-white border border-[#EBE3DC] flex items-start gap-3 shadow-2xs">
                  <div className="w-6 h-6 rounded-full bg-rose-100 text-rose-800 font-bold flex items-center justify-center shrink-0">
                    1
                  </div>
                  <div>
                    <strong className="block text-[#3D2232] font-semibold text-sm mb-0.5">On iPhone (Safari)</strong>
                    <span>Tap the <strong>Share</strong> button (box with arrow pointing up) at the bottom of Safari, then tap <strong>&quot;Add to Home Screen&quot;</strong>.</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-[#EBE3DC] flex items-start gap-3 shadow-2xs">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0">
                    2
                  </div>
                  <div>
                    <strong className="block text-[#3D2232] font-semibold text-sm mb-0.5">On Android (Chrome)</strong>
                    <span>Tap the <strong>three dots menu (⋮)</strong> at the top right, then tap <strong>&quot;Install app&quot;</strong> or <strong>&quot;Add to Home screen&quot;</strong>.</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-rose-50/60 border border-rose-100 text-stone-600 flex items-center gap-2.5">
                  <Check size={16} className="text-rose-600 shrink-0" />
                  <span>Provides full-screen native mobile feel, offline storage, and zero web browser toolbars!</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowInstallSheet(false)}
                className="w-full py-3 rounded-2xl bg-[#523446] hover:bg-[#3D2232] text-white font-semibold text-sm shadow-md transition-all active:scale-98 cursor-pointer"
              >
                Got It, Thanks!
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

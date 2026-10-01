import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  Compass, 
  Home, 
  Search, 
  Calendar, 
  ArrowRight,
  WifiOff,
  Wifi,
  RefreshCw,
  ShieldCheck,
  Database,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AppView } from '../../types';
import { useCycle } from '../../context/CycleContext';

interface ModernizedNotFoundScreenProps {
  onBack?: () => void;
  onNavigate?: (view: AppView) => void;
  initialReason?: 'offline' | 'not_found';
}

export const ModernizedNotFoundScreen: React.FC<ModernizedNotFoundScreenProps> = ({
  onBack,
  onNavigate,
  initialReason
}) => {
  const { dayLogs } = useCycle();
  const [isOffline, setIsOffline] = useState<boolean>(
    typeof navigator !== 'undefined' ? !navigator.onLine : false
  );
  const [activeTab, setActiveTab] = useState<'offline' | '404'>(
    initialReason === 'offline' ? 'offline' : (typeof navigator !== 'undefined' && !navigator.onLine ? 'offline' : '404')
  );
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [checkStatus, setCheckStatus] = useState<'idle' | 'success' | 'failed'>('idle');
  const [statusMessage, setStatusMessage] = useState<string>('');

  // Count local stored logs
  const totalLogsSaved = Object.keys(dayLogs || {}).length;

  // Listen to browser network changes
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      setCheckStatus('success');
      setStatusMessage('Internet connection restored!');
    };
    const handleOffline = () => {
      setIsOffline(true);
      setActiveTab('offline');
      setCheckStatus('idle');
      setStatusMessage('Internet connection lost. Local offline mode is active.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleTestConnection = async () => {
    setIsChecking(true);
    setCheckStatus('idle');
    setStatusMessage('Pinging server...');

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const res = await fetch('/api/health?t=' + Date.now(), {
        signal: controller.signal,
        cache: 'no-store'
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        setIsOffline(false);
        setCheckStatus('success');
        setStatusMessage('Internet connection verified and server is reachable!');
      } else {
        setIsOffline(true);
        setCheckStatus('failed');
        setStatusMessage('Server replied with an error. Running in offline protection mode.');
      }
    } catch {
      setIsOffline(true);
      setCheckStatus('failed');
      setStatusMessage('Unable to reach network. You are currently offline.');
    } finally {
      setIsChecking(false);
    }
  };

  const handleGoHome = () => {
    if (onNavigate) {
      onNavigate('HOME');
    } else if (onBack) {
      onBack();
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#FAF7F2] text-[#20171D] pb-24">
      {/* Top Header */}
      <header className="sticky top-0 z-20 bg-[#FAF7F2]/90 backdrop-blur-md border-b border-[#EDE4DE] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleGoHome}
            className="w-9 h-9 rounded-full bg-white border border-[#E5DCD5] flex items-center justify-center text-[#523446] hover:bg-[#F5ECE8] active:scale-95 transition-all shadow-xs"
            aria-label="Back to previous page"
          >
            <ChevronLeft size={20} strokeWidth={2.2} />
          </button>
          <div>
            <div className="flex items-center gap-1.5">
              <img
                src="/assets/hercadence_logo.jpg"
                alt="HerCadence"
                className="w-4 h-4 rounded-full object-cover shadow-2xs border border-[#E5DCD5]"
                referrerPolicy="no-referrer"
              />
              <h1 className="text-base font-bold text-[#20171D] leading-tight">
                {activeTab === 'offline' ? 'Network Connection' : 'Page Not Found'}
              </h1>
            </div>
            <p className="text-[11px] text-[#7A6C74]">
              {activeTab === 'offline' ? 'Offline State &amp; Recovery' : 'Error 404 Navigation'}
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-[#ECE3DC] p-1 rounded-full text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('offline')}
            className={`px-3 py-1 rounded-full transition-all flex items-center gap-1.5 ${
              activeTab === 'offline'
                ? 'bg-white text-[#523446] shadow-2xs font-bold'
                : 'text-[#6E5D67] hover:text-[#20171D]'
            }`}
          >
            <WifiOff size={13} />
            <span>Offline</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('404')}
            className={`px-3 py-1 rounded-full transition-all flex items-center gap-1.5 ${
              activeTab === '404'
                ? 'bg-white text-[#523446] shadow-2xs font-bold'
                : 'text-[#6E5D67] hover:text-[#20171D]'
            }`}
          >
            <Compass size={13} />
            <span>404</span>
          </button>
        </div>
      </header>

      <div className="max-w-xl mx-auto px-4 py-6 space-y-5">
        {/* Banner Card */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#F5ECE8] via-[#EDE4DF] to-[#E5DBD4] border border-[#E3D4CB] p-6 shadow-sm">
          <div className="flex items-start justify-between relative z-10">
            <div className="space-y-2 max-w-[80%]">
              <span className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                activeTab === 'offline' || isOffline
                  ? 'bg-amber-100/90 text-amber-900 border border-amber-300/50'
                  : 'bg-rose-100/90 text-rose-900 border border-rose-300/50'
              }`}>
                {activeTab === 'offline' || isOffline ? (
                  <>
                    <WifiOff size={12} />
                    <span>Internet Cut Out</span>
                  </>
                ) : (
                  <>
                    <Compass size={12} />
                    <span>Error 404</span>
                  </>
                )}
              </span>

              <h2 className="text-xl sm:text-2xl font-bold font-serif text-[#20171D] tracking-tight">
                {activeTab === 'offline' || isOffline
                  ? 'No Internet Connection'
                  : 'Page or Resource Not Found'}
              </h2>

              <p className="text-xs sm:text-sm text-[#5E5159] leading-relaxed">
                {activeTab === 'offline' || isOffline
                  ? 'Your internet connection cut out or is temporarily unavailable. Don’t worry — HerCadence operates with on-device storage, so your period tracking, logs, and calendar are fully preserved.'
                  : 'The cycle log, article, or screen you are looking for may have been moved, renamed, or is temporarily unavailable.'}
              </p>
            </div>

            <div className="w-12 h-12 rounded-2xl bg-white/80 backdrop-blur-sm border border-white flex items-center justify-center text-[#523446] shadow-sm shrink-0">
              {activeTab === 'offline' || isOffline ? (
                <WifiOff size={24} />
              ) : (
                <Compass size={24} />
              )}
            </div>
          </div>
        </div>

        {/* Network Diagnostic & Test Card */}
        <div className="bg-white rounded-3xl p-5 border border-[#EDE4DE] shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#F5EFEB]">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[#F4EBE7] text-[#523446]">
                <Database size={18} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[#20171D]">On-Device Protection</h3>
                <p className="text-[11px] text-[#7A6C74]">Local storage &amp; offline resilience</p>
              </div>
            </div>

            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              <ShieldCheck size={13} />
              <span>Encrypted Local</span>
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-[#FAF7F2] rounded-2xl border border-[#ECE2DA]">
              <span className="text-[11px] text-[#7A6C74] block">Saved Logs</span>
              <span className="text-base font-bold text-[#20171D]">{totalLogsSaved} Days</span>
              <p className="text-[10px] text-emerald-700 mt-0.5">Stored safely offline</p>
            </div>

            <div className="p-3 bg-[#FAF7F2] rounded-2xl border border-[#ECE2DA]">
              <span className="text-[11px] text-[#7A6C74] block">Network State</span>
              <span className={`text-base font-bold flex items-center gap-1.5 ${isOffline ? 'text-amber-700' : 'text-emerald-700'}`}>
                {isOffline ? <WifiOff size={15} /> : <Wifi size={15} />}
                {isOffline ? 'Offline' : 'Online'}
              </span>
              <p className="text-[10px] text-[#7A6C74] mt-0.5">
                {isOffline ? 'Internet cut out' : 'Connected to server'}
              </p>
            </div>
          </div>

          {/* Test connection action */}
          <div className="space-y-2 pt-1">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={isChecking}
              className="w-full py-3 px-4 rounded-2xl bg-[#523446] hover:bg-[#432938] active:scale-[0.98] text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer disabled:opacity-75"
            >
              <RefreshCw size={15} className={isChecking ? 'animate-spin' : ''} />
              <span>{isChecking ? 'Testing Internet Connection...' : 'Test Internet Connection & Recheck'}</span>
            </button>

            {statusMessage && (
              <div className={`p-3 rounded-2xl text-xs flex items-center gap-2 ${
                checkStatus === 'success'
                  ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                  : checkStatus === 'failed'
                  ? 'bg-amber-50 text-amber-900 border border-amber-200'
                  : 'bg-stone-50 text-stone-800 border border-stone-200'
              }`}>
                {checkStatus === 'success' ? (
                  <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                ) : checkStatus === 'failed' ? (
                  <AlertCircle size={15} className="text-amber-600 shrink-0" />
                ) : (
                  <Clock size={15} className="text-stone-500 shrink-0" />
                )}
                <span className="leading-snug">{statusMessage}</span>
              </div>
            )}
          </div>
        </div>

        {/* Helpful Shortcuts Card */}
        <div className="bg-white rounded-3xl p-5 border border-[#EDE4DE] shadow-sm space-y-3">
          <h3 className="text-xs font-bold text-[#7A6C74] uppercase tracking-wider">
            Safe Navigation Shortcuts
          </h3>

          <div className="space-y-2">
            {/* Dashboard shortcut */}
            <div
              onClick={() => onNavigate && onNavigate('HOME')}
              className="p-3.5 rounded-2xl bg-[#FAF7F2] hover:bg-[#F5ECE8] border border-[#EDE4DE] transition-all cursor-pointer flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-white text-[#523446] border border-[#EDE4DE] flex items-center justify-center shadow-2xs">
                  <Home size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#20171D]">Cycle Dashboard</h4>
                  <p className="text-[11px] text-[#7A6C74]">Return to daily phases &amp; forecasts</p>
                </div>
              </div>
              <ArrowRight size={15} className="text-[#8E7E87]" />
            </div>

            {/* Calendar shortcut */}
            <div
              onClick={() => onNavigate && onNavigate('CALENDAR')}
              className="p-3.5 rounded-2xl bg-[#FAF7F2] hover:bg-[#F5ECE8] border border-[#EDE4DE] transition-all cursor-pointer flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-white text-[#523446] border border-[#EDE4DE] flex items-center justify-center shadow-2xs">
                  <Calendar size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#20171D]">Cycle Calendar &amp; Logs</h4>
                  <p className="text-[11px] text-[#7A6C74]">View past periods and fertile windows</p>
                </div>
              </div>
              <ArrowRight size={15} className="text-[#8E7E87]" />
            </div>

            {/* Offline sync details shortcut */}
            <div
              onClick={() => onNavigate && onNavigate('OFFLINE_SYNC')}
              className="p-3.5 rounded-2xl bg-[#FAF7F2] hover:bg-[#F5ECE8] border border-[#EDE4DE] transition-all cursor-pointer flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-white text-[#523446] border border-[#EDE4DE] flex items-center justify-center shadow-2xs">
                  <WifiOff size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#20171D]">Offline Sync &amp; Protection</h4>
                  <p className="text-[11px] text-[#7A6C74]">Inspect pending offline records &amp; sync cache</p>
                </div>
              </div>
              <ArrowRight size={15} className="text-[#8E7E87]" />
            </div>

            {/* Search Hub */}
            <div
              onClick={() => onNavigate && onNavigate('SEARCH_HUB')}
              className="p-3.5 rounded-2xl bg-[#FAF7F2] hover:bg-[#F5ECE8] border border-[#EDE4DE] transition-all cursor-pointer flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-white text-[#523446] border border-[#EDE4DE] flex items-center justify-center shadow-2xs">
                  <Search size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#20171D]">Health Search Hub</h4>
                  <p className="text-[11px] text-[#7A6C74]">Browse offline health terms &amp; guides</p>
                </div>
              </div>
              <ArrowRight size={15} className="text-[#8E7E87]" />
            </div>
          </div>
        </div>

        {/* Primary Return Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleGoHome}
            className="w-full py-3.5 rounded-2xl bg-[#523446] hover:bg-[#432938] active:scale-[0.98] text-white text-sm font-semibold shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Home size={16} />
            <span>Continue in Offline Mode (Return to Dashboard)</span>
          </button>
        </div>
      </div>
    </div>
  );
};

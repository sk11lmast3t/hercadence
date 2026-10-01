import React, { useState } from 'react';
import { 
  ChevronLeft, 
  User, 
  Calendar, 
  Frown, 
  Pill, 
  FileText, 
  Download, 
  Check, 
  X, 
  Share2, 
  Printer, 
  FileCheck,
  Crown,
  Sparkles
} from 'lucide-react';
import { useCycle } from '../../context/CycleContext';
import { useHealthExport } from '../../hooks/useHealthExport';

interface ExportHealthReportScreenProps {
  onBack: () => void;
  onNavigateToProfile?: () => void;
  onExportSuccess?: () => void;
  onNavigateToPremium?: () => void;
}

export const ExportHealthReportScreen: React.FC<ExportHealthReportScreenProps> = ({ 
  onBack,
  onNavigateToProfile,
  onExportSuccess,
  onNavigateToPremium 
}) => {
  const { dayLogs, settings, currentCycle } = useCycle();
  const { exportReport, isExporting, error: exportError } = useHealthExport();

  // Toggle states matching the mockup
  const [includeCycleHistory, setIncludeCycleHistory] = useState(true);
  const [includeLoggedSymptoms, setIncludeLoggedSymptoms] = useState(true);
  const [includeMedicationList, setIncludeMedicationList] = useState(true);
  const [includeDoctorsNotes, setIncludeDoctorsNotes] = useState(false);

  const [showPdfModal, setShowPdfModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleGenerateReport = async () => {
    try {
      await exportReport({
        includeCycleHistory,
        includeSymptoms: includeLoggedSymptoms,
        includeMedications: includeMedicationList,
        includeDoctorsNotes,
      });
      if (onExportSuccess) {
        onExportSuccess();
      } else {
        setShowPdfModal(true);
      }
    } catch {
      // exportError is shown in UI below
    }
  };

  const handleCopySummary = () => {
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };


  return (
    <div className="min-h-screen bg-[#FAF9F7] text-[#1E191D] pb-12 relative font-sans overflow-x-hidden">
      {/* Mobile Screen Container */}
      <div className="w-full max-w-[430px] mx-auto min-h-screen bg-[#FAF9F7] shadow-[0_10px_40px_rgba(0,0,0,0.06)] border-x border-[#EDE6E1] flex flex-col justify-between relative pb-6">
        
        {/* Top Header with Back Arrow, Centered Title, and Profile Icon */}
        <div className="pt-4 px-5 pb-3 flex items-center justify-between border-b border-[#EDE6E1]/60 bg-white/70 backdrop-blur-xs flex-shrink-0">
          <button
            onClick={onBack}
            className="p-1 -ml-1 text-[#543649] hover:opacity-75 transition-opacity cursor-pointer"
            aria-label="Back"
          >
            <ChevronLeft size={24} strokeWidth={2.2} />
          </button>

          <h1 className="font-serif text-[19px] sm:text-[20px] font-bold text-[#543649] tracking-tight">
            Export Health Report
          </h1>

          <button
            onClick={onNavigateToProfile || onBack}
            className="w-8 h-8 rounded-full bg-[#F2E8EC] text-[#543649] flex items-center justify-center hover:bg-[#EAE0E5] transition-colors cursor-pointer"
            aria-label="Profile"
          >
            <User size={18} />
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 px-5 pt-5 pb-4 flex flex-col justify-between space-y-4 overflow-y-auto no-scrollbar">
          
          {/* Section Heading */}
          <div className="space-y-1">
            <h2 className="text-[19px] sm:text-[20px] font-bold text-[#1E191D] tracking-tight">
              Customize Your Report
            </h2>
            <p className="text-[13px] sm:text-[13.5px] text-[#7A6C74] font-medium leading-snug">
              Select the data you want to share with your healthcare provider.
            </p>
          </div>

          {/* Toggle Option Cards matching mockup */}
          <div className="space-y-3 pt-1">
            
            {/* Card 1: Cycle History */}
            <div className="bg-white rounded-[24px] p-4 border border-[#EDE6E1] shadow-[0_4px_16px_rgba(0,0,0,0.03)] flex items-center justify-between gap-3">
              <div className="flex items-start gap-3.5 flex-1 pr-2">
                <div className="w-10 h-10 rounded-2xl bg-[#F7F2F5] text-[#543649] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Calendar size={20} strokeWidth={1.9} />
                </div>
                <div>
                  <h3 className="text-[15px] sm:text-[16px] font-bold text-[#1E191D]">
                    Cycle History
                  </h3>
                  <p className="text-[12px] text-[#7A6C74] leading-tight mt-0.5">
                    Includes start dates, length, and flow intensity for the last 6 months.
                  </p>
                </div>
              </div>

              {/* iOS Toggle Switch */}
              <button
                type="button"
                onClick={() => setIncludeCycleHistory(!includeCycleHistory)}
                className={`w-12 h-7 flex items-center rounded-full p-1 transition-colors duration-200 cursor-pointer flex-shrink-0 ${
                  includeCycleHistory ? 'bg-[#543649]' : 'bg-[#E5DFD9]'
                }`}
                aria-label="Toggle Cycle History"
              >
                <div
                  className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-200 ${
                    includeCycleHistory ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Card 2: Logged Symptoms */}
            <div className="bg-white rounded-[24px] p-4 border border-[#EDE6E1] shadow-[0_4px_16px_rgba(0,0,0,0.03)] flex items-center justify-between gap-3">
              <div className="flex items-start gap-3.5 flex-1 pr-2">
                <div className="w-10 h-10 rounded-2xl bg-[#F7F2F5] text-[#543649] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Frown size={20} strokeWidth={1.9} />
                </div>
                <div>
                  <h3 className="text-[15px] sm:text-[16px] font-bold text-[#1E191D]">
                    Logged Symptoms
                  </h3>
                  <p className="text-[12px] text-[#7A6C74] leading-tight mt-0.5">
                    Mood, pain, digestion, and other tracked symptoms.
                  </p>
                </div>
              </div>

              {/* iOS Toggle Switch */}
              <button
                type="button"
                onClick={() => setIncludeLoggedSymptoms(!includeLoggedSymptoms)}
                className={`w-12 h-7 flex items-center rounded-full p-1 transition-colors duration-200 cursor-pointer flex-shrink-0 ${
                  includeLoggedSymptoms ? 'bg-[#543649]' : 'bg-[#E5DFD9]'
                }`}
                aria-label="Toggle Logged Symptoms"
              >
                <div
                  className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-200 ${
                    includeLoggedSymptoms ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Card 3: Medication List */}
            <div className="bg-white rounded-[24px] p-4 border border-[#EDE6E1] shadow-[0_4px_16px_rgba(0,0,0,0.03)] flex items-center justify-between gap-3">
              <div className="flex items-start gap-3.5 flex-1 pr-2">
                <div className="w-10 h-10 rounded-2xl bg-[#F7F2F5] text-[#543649] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Pill size={20} strokeWidth={1.9} />
                </div>
                <div>
                  <h3 className="text-[15px] sm:text-[16px] font-bold text-[#1E191D]">
                    Medication List
                  </h3>
                  <p className="text-[12px] text-[#7A6C74] leading-tight mt-0.5">
                    Current supplements and medications.
                  </p>
                </div>
              </div>

              {/* iOS Toggle Switch */}
              <button
                type="button"
                onClick={() => setIncludeMedicationList(!includeMedicationList)}
                className={`w-12 h-7 flex items-center rounded-full p-1 transition-colors duration-200 cursor-pointer flex-shrink-0 ${
                  includeMedicationList ? 'bg-[#543649]' : 'bg-[#E5DFD9]'
                }`}
                aria-label="Toggle Medication List"
              >
                <div
                  className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-200 ${
                    includeMedicationList ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Card 4: Doctor's Notes */}
            <div className="bg-white rounded-[24px] p-4 border border-[#EDE6E1] shadow-[0_4px_16px_rgba(0,0,0,0.03)] flex items-center justify-between gap-3">
              <div className="flex items-start gap-3.5 flex-1 pr-2">
                <div className="w-10 h-10 rounded-2xl bg-[#F7F2F5] text-[#543649] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <FileText size={20} strokeWidth={1.9} />
                </div>
                <div>
                  <h3 className="text-[15px] sm:text-[16px] font-bold text-[#1E191D]">
                    Doctor's Notes
                  </h3>
                  <p className="text-[12px] text-[#7A6C74] leading-tight mt-0.5">
                    Personal notes and observations from consultations.
                  </p>
                </div>
              </div>

              {/* iOS Toggle Switch (Default OFF as in mockup) */}
              <button
                type="button"
                onClick={() => setIncludeDoctorsNotes(!includeDoctorsNotes)}
                className={`w-12 h-7 flex items-center rounded-full p-1 transition-colors duration-200 cursor-pointer flex-shrink-0 ${
                  includeDoctorsNotes ? 'bg-[#543649]' : 'bg-[#E5DFD9]'
                }`}
                aria-label="Toggle Doctor's Notes"
              >
                <div
                  className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-200 ${
                    includeDoctorsNotes ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Primary Action Button matching mockup */}
          <div className="pt-2">
            <button
              onClick={handleGenerateReport}
              disabled={isExporting}
              className="w-full py-4 rounded-full bg-[#543649] text-white text-[15px] font-semibold shadow-[0_8px_24px_rgba(84,54,73,0.3)] hover:bg-[#432939] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
            >
              {isExporting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  <span>Compiling Health Records...</span>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <span>Generate PDF Report</span>
                  {!settings.isPremium && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-200 border border-amber-300/30">
                      <Crown className="w-3 h-3 text-amber-300" />
                      Premium
                    </span>
                  )}
                </div>
              )}
            </button>
            {exportError && (
              <p className="text-center text-[12px] text-red-600 mt-2">{exportError}</p>
            )}
          </div>
        </div>
      </div>

      {/* PDF Export Preview Modal */}
      {showPdfModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] max-w-md w-full max-h-[90vh] overflow-hidden border border-[#EDE6E1] shadow-2xl flex flex-col animate-in fade-in zoom-in-95">
            
            {/* Header */}
            <div className="p-5 border-b border-[#EDE6E1] flex items-center justify-between bg-[#FAF9F7]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#F2E8EC] text-[#543649] flex items-center justify-center">
                  <FileCheck size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#1E191D]">Clinical Health Report</h3>
                  <p className="text-[11px] text-[#7A6C74]">Generated on {new Date().toLocaleDateString()}</p>
                </div>
              </div>
              <button 
                onClick={() => setShowPdfModal(false)}
                className="p-1 rounded-full text-stone-500 hover:bg-stone-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Simulated Medical Document Body */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs text-stone-700 bg-white">
              <div className="p-3.5 rounded-2xl bg-[#FBF9F7] border border-[#EBE4DE] space-y-2">
                <div className="flex justify-between items-center text-[11px] text-[#7A6C74]">
                  <span>PATIENT: {settings.userName || 'Member'}</span>
                  <span>RECORD ID: #CR-{Math.floor(100000 + Math.random() * 900000)}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-stone-800 font-medium">
                  <div>Average Cycle: <span className="font-bold text-[#543649]">{settings.cycleLengthDays} Days</span></div>
                  <div>Period Duration: <span className="font-bold text-[#543649]">{settings.periodLengthDays} Days</span></div>
                </div>
              </div>

              {includeCycleHistory && (
                <div className="space-y-1.5">
                  <h4 className="font-bold text-stone-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <Calendar size={13} className="text-[#543649]" /> 1. Cycle Status & History
                  </h4>
                  <p className="text-stone-600 leading-relaxed">
                    Current Cycle Day {currentCycle.currentDayOfCycle} • {currentCycle.phaseDisplayName}. Standard cycle configuration set to {settings.cycleLengthDays} days with {settings.periodLengthDays}-day menstruation period.
                  </p>
                </div>
              )}

              {includeLoggedSymptoms && (
                <div className="space-y-1.5 pt-1">
                  <h4 className="font-bold text-stone-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <Frown size={13} className="text-[#543649]" /> 2. Logged Symptomatology & Trends
                  </h4>
                  <p className="text-stone-600 leading-relaxed">
                    {Object.keys(dayLogs).length > 0 
                      ? `${Object.keys(dayLogs).length} cycle log entries recorded. Logged data includes real user entries for energy, focus, and physical sensations.`
                      : 'No symptoms or physical comfort entries recorded for this current reporting period.'}
                  </p>
                </div>
              )}

              {includeMedicationList && (
                <div className="space-y-1.5 pt-1">
                  <h4 className="font-bold text-stone-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <Pill size={13} className="text-[#543649]" /> 3. Daily Supplements & Regimen
                  </h4>
                  <p className="text-stone-600 leading-relaxed">
                    Daily hydration tracking active. Personal supplement schedule can be managed directly in the cycle nutrition tracker.
                  </p>
                </div>
              )}

              {includeDoctorsNotes && (
                <div className="space-y-1.5 pt-1">
                  <h4 className="font-bold text-stone-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <FileText size={13} className="text-[#543649]" /> 4. Clinical Observations
                  </h4>
                  <p className="text-stone-600 leading-relaxed">
                    Personal cycle notes export compiled from member self-monitoring entries. Ready for consultation review.
                  </p>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="p-4 border-t border-[#EDE6E1] bg-[#FAF9F7] flex items-center justify-between gap-3">
              <button
                onClick={handleCopySummary}
                className="px-4 py-2.5 rounded-full border border-[#EDE6E1] bg-white text-[#543649] text-xs font-semibold hover:bg-stone-50 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                {copiedLink ? <Check size={14} className="text-green-600" /> : <Share2 size={14} />}
                <span>{copiedLink ? 'Link Copied' : 'Share'}</span>
              </button>

              <button
                onClick={() => {
                  setShowPdfModal(false);
                }}
                className="px-6 py-2.5 rounded-full bg-[#543649] text-white text-xs font-semibold hover:bg-[#432939] transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Download size={14} />
                <span>Save PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

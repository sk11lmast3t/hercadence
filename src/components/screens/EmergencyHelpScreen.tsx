import React, { useState } from 'react';
import { 
  ChevronLeft, 
  Phone, 
  Heart, 
  Plus, 
  Contact, 
  MapPin, 
  ExternalLink, 
  ShieldAlert, 
  X, 
  Check, 
  Activity, 
  AlertCircle 
} from 'lucide-react';
import { useCycle } from '../../context/CycleContext';

interface EmergencyHelpScreenProps {
  onBack: () => void;
  onOpenHealthProfile?: () => void;
}

export const EmergencyHelpScreen: React.FC<EmergencyHelpScreenProps> = ({
  onBack,
  onOpenHealthProfile
}) => {
  const { settings, appointment } = useCycle();
  const [callingNumber, setCallingNumber] = useState<string | null>(null);
  const [showMedicalIdModal, setShowMedicalIdModal] = useState(false);
  const [showHospitalMapModal, setShowHospitalMapModal] = useState(false);

  const handleCall = (name: string, number: string) => {
    setCallingNumber(`${name} (${number})`);
  };

  return (
    <div className="min-h-screen bg-[#FAF9F7] text-[#1E191D] pb-12 relative font-sans overflow-x-hidden">
      {/* Mobile Screen Container */}
      <div className="w-full max-w-[430px] mx-auto min-h-screen bg-[#FAF9F7] shadow-[0_10px_40px_rgba(0,0,0,0.06)] border-x border-[#EDE6E1] flex flex-col justify-between relative pb-6">
        
        {/* Top Header Section with Sage Wave Artwork */}
        <div className="relative w-full h-[140px] sm:h-[150px] overflow-hidden flex-shrink-0 bg-[#7B9E89]">
          <img
            src="/assets/emergency_sage_waves_header_1788069199491.jpg"
            alt="Emergency & Help Sage Green Curved Waves"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-top"
          />

          {/* Navigation Bar inside Header */}
          <div className="absolute inset-x-5 top-5 flex items-center justify-between text-white z-10">
            <button
              onClick={onBack}
              className="p-1 -ml-1 text-white hover:opacity-80 transition-opacity cursor-pointer"
              aria-label="Back"
            >
              <ChevronLeft size={24} strokeWidth={2.4} />
            </button>

            <h1 className="font-sans text-[18px] sm:text-[19px] font-bold text-white tracking-tight drop-shadow-2xs">
              Emergency & Help
            </h1>

            {/* Empty balance spacer */}
            <div className="w-6" />
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 px-4 sm:px-5 -mt-6 z-20 flex flex-col space-y-4 overflow-y-auto no-scrollbar">
          
          {/* Top Hero Card: Emergency Contacts */}
          <div className="bg-white rounded-[28px] p-4 sm:p-5 border border-[#EDE6E1] shadow-[0_6px_24px_rgba(0,0,0,0.04)] space-y-4">
            <h2 className="text-[17px] sm:text-[18px] font-bold text-[#1E191D] tracking-tight">
              Emergency Contacts
            </h2>

            {/* Doctor Contact Row */}
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-full bg-[#EAEFEA] text-[#557A64] flex items-center justify-center flex-shrink-0">
                <Phone size={20} strokeWidth={2.2} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-[15px] font-bold text-[#1E191D] truncate">
                  {appointment?.doctorName ? `${appointment.doctorName} (Physician)` : 'Primary Care / OB-GYN'}
                </h3>
                <p className="text-[13px] text-[#7A6C74] font-medium mt-0.5 truncate">
                  {appointment?.clinic || 'Emergency Care Line: 911'}
                </p>
              </div>
            </div>

            {/* Call Now Full-Width Sage Green Button matching mockup */}
            <button
              onClick={() => handleCall(appointment?.doctorName || 'Emergency Medical Services', appointment?.doctorName ? 'Direct Office' : '911')}
              className="w-full py-3.5 rounded-full bg-[#759A83] text-white text-[15px] font-semibold hover:bg-[#648771] active:scale-[0.99] transition-all shadow-[0_4px_14px_rgba(117,154,131,0.35)] flex items-center justify-center gap-2 cursor-pointer"
            >
              <Phone size={18} fill="currentColor" />
              <span>{appointment?.doctorName ? `Call ${appointment.doctorName}` : 'Call Emergency Services (911)'}</span>
            </button>
          </div>

          {/* Bottom 3-Card Bento Grid matching mockup */}
          <div className="grid grid-cols-2 gap-3 flex-1">
            
            {/* Card 1 (Left Tall Card): Crisis Hotlines */}
            <div className="bg-white rounded-[26px] p-4 sm:p-4.5 border border-[#EDE6E1] shadow-[0_4px_16px_rgba(0,0,0,0.03)] flex flex-col justify-between space-y-3">
              <div className="space-y-2">
                <div className="w-9 h-9 rounded-full bg-[#FBF1F1] text-[#D86969] flex items-center justify-center">
                  <Heart size={19} strokeWidth={2.2} />
                </div>
                <h3 className="text-[15px] sm:text-[16px] font-bold text-[#1E191D] leading-snug">
                  Crisis Hotlines
                </h3>
              </div>

              <div className="space-y-2">
                <p className="text-[12px] sm:text-[12.5px] text-[#7A6C74] leading-snug">
                  <span className="font-semibold text-[#1E191D] block">National Domestic Violence Hotline:</span>
                  1-800-799-SAFE
                </p>
                <button
                  onClick={() => handleCall('National Crisis Line', '1-800-799-7233')}
                  className="w-full py-1.5 px-2.5 rounded-full bg-[#F7EBEB] text-[#B84E4E] text-[11px] font-bold hover:bg-[#F2DFDF] transition-colors text-center cursor-pointer"
                >
                  Dial 24/7
                </button>
              </div>
            </div>

            {/* Right Column: 2 Stacked Cards */}
            <div className="flex flex-col gap-3">
              
              {/* Card 2 (Top Right): Nearest Hospital */}
              <div 
                onClick={() => setShowHospitalMapModal(true)}
                className="bg-white rounded-[26px] p-3.5 sm:p-4 border border-[#EDE6E1] shadow-[0_4px_16px_rgba(0,0,0,0.03)] space-y-1.5 cursor-pointer hover:shadow-md transition-all group"
              >
                <div className="w-8 h-8 rounded-full bg-[#EAEFEA] text-[#557A64] flex items-center justify-center">
                  <Plus size={18} strokeWidth={2.6} />
                </div>
                <h3 className="text-[14.5px] font-bold text-[#1E191D] leading-tight">
                  Nearest Hospital
                </h3>
                <p className="text-[11.5px] text-[#7A6C74] leading-tight">
                  St. Mary's Hospital (1.2 mi) -{' '}
                  <span className="text-[#557A64] font-bold underline decoration-[#557A64]/40 group-hover:text-[#41624F]">
                    Directions
                  </span>
                </p>
              </div>

              {/* Card 3 (Bottom Right): Emergency Medical ID */}
              <div 
                onClick={() => setShowMedicalIdModal(true)}
                className="bg-white rounded-[26px] p-3.5 sm:p-4 border border-[#EDE6E1] shadow-[0_4px_16px_rgba(0,0,0,0.03)] space-y-1.5 cursor-pointer hover:shadow-md transition-all group"
              >
                <div className="w-8 h-8 rounded-full bg-[#F4EFF3] text-[#543649] flex items-center justify-center">
                  <Contact size={18} strokeWidth={2.2} />
                </div>
                <h3 className="text-[14.5px] font-bold text-[#1E191D] leading-tight">
                  Emergency Medical ID
                </h3>
                <p className="text-[11.5px] text-[#7A6C74] leading-tight group-hover:text-[#543649] transition-colors">
                  View & Edit Your Medical Profile
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Simulated Dialing Modal */}
      {callingNumber && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] max-w-xs w-full p-6 text-center space-y-4 border border-[#EDE6E1] shadow-2xl animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-[#EAEFEA] text-[#557A64] mx-auto flex items-center justify-center animate-pulse">
              <Phone size={28} />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#1E191D]">Connecting Call...</h3>
              <p className="text-xs text-[#7A6C74] mt-1 font-medium">{callingNumber}</p>
            </div>
            <button
              onClick={() => setCallingNumber(null)}
              className="w-full py-2.5 rounded-full bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition-colors"
            >
              End Call
            </button>
          </div>
        </div>
      )}

      {/* Emergency Medical ID Modal */}
      {showMedicalIdModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] max-w-sm w-full p-6 border border-[#EDE6E1] shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert size={20} className="text-[#D86969]" />
                <h3 className="text-base font-bold text-[#1E191D]">Emergency Medical ID</h3>
              </div>
              <button 
                onClick={() => setShowMedicalIdModal(false)}
                className="p-1 text-stone-400 hover:text-stone-700"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-2.5 text-xs text-stone-700">
              <div className="p-3 bg-[#FAF9F7] rounded-2xl border border-[#EDE6E1] flex justify-between">
                <span className="text-[#7A6C74]">Full Name:</span>
                <span className="font-bold text-[#1E191D]">{settings.userName || 'Not set'}</span>
              </div>
              <div className="p-3 bg-[#FAF9F7] rounded-2xl border border-[#EDE6E1] flex justify-between">
                <span className="text-[#7A6C74]">Blood Type:</span>
                <span className="font-bold text-[#543649]">Not specified</span>
              </div>
              <div className="p-3 bg-[#FAF9F7] rounded-2xl border border-[#EDE6E1] flex justify-between">
                <span className="text-[#7A6C74]">Allergies:</span>
                <span className="font-bold text-[#1E191D]">None reported</span>
              </div>
              <div className="p-3 bg-[#FAF9F7] rounded-2xl border border-[#EDE6E1] flex justify-between">
                <span className="text-[#7A6C74]">Primary Contact:</span>
                <span className="font-bold text-[#1E191D]">Emergency Services (911)</span>
              </div>
            </div>

            <button
              onClick={() => {
                setShowMedicalIdModal(false);
                if (onOpenHealthProfile) onOpenHealthProfile();
              }}
              className="w-full py-3 bg-[#759A83] text-white text-xs font-semibold rounded-full hover:bg-[#648771] transition-all cursor-pointer"
            >
              Edit Medical Details
            </button>
          </div>
        </div>
      )}

      {/* Hospital Location Modal */}
      {showHospitalMapModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] max-w-sm w-full p-6 border border-[#EDE6E1] shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin size={20} className="text-[#557A64]" />
                <h3 className="text-base font-bold text-[#1E191D]">St. Mary's Hospital</h3>
              </div>
              <button 
                onClick={() => setShowHospitalMapModal(false)}
                className="p-1 text-stone-400 hover:text-stone-700"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-[#7A6C74]">
              450 Medical Center Blvd, Floor 1 Emergency Wing (1.2 miles away • 4 min drive)
            </p>

            <div className="p-4 bg-[#EAEFEA] rounded-2xl text-center text-xs font-medium text-[#557A64] space-y-1">
              <Activity size={22} className="mx-auto" />
              <p>Emergency Department Open 24/7</p>
              <p className="text-[11px] text-[#7A6C74]">Current ER Wait Time: ~12 mins</p>
            </div>

            <button
              onClick={() => setShowHospitalMapModal(false)}
              className="w-full py-3 bg-[#759A83] text-white text-xs font-semibold rounded-full hover:bg-[#648771] transition-all cursor-pointer"
            >
              Start GPS Navigation
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

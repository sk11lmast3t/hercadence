import React, { useState } from 'react';
import { ChevronLeft, Clock, MapPin, Check, Calendar, Trash2, Plus, UserPlus, Stethoscope } from 'lucide-react';
import { useCycle } from '../../context/CycleContext';

interface AppointmentDetailScreenProps {
  onBack: () => void;
  onNavigateToCareTeam?: () => void;
}

export const AppointmentDetailScreen: React.FC<AppointmentDetailScreenProps> = ({ 
  onBack,
  onNavigateToCareTeam 
}) => {
  const { appointment, updateAppointment } = useCycle();
  const [noteInput, setNoteInput] = useState('');
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);

  // New booking form states
  const [bookDoctor, setBookDoctor] = useState('');
  const [bookSpecialty, setBookSpecialty] = useState('OB/GYN & Women\'s Health Specialist');
  const [bookClinic, setBookClinic] = useState('');
  const [tempDate, setTempDate] = useState(appointment?.date || new Date().toISOString().split('T')[0]);
  const [tempTime, setTempTime] = useState(appointment?.time || '10:00 AM');

  const hasAppointment = Boolean(appointment?.doctorName && appointment.doctorName.trim());

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (noteInput.trim()) {
      const existing = appointment?.notes ? `${appointment.notes}\n• ${noteInput.trim()}` : `• ${noteInput.trim()}`;
      updateAppointment({ notes: existing });
      setNoteInput('');
    }
  };

  const handleSaveReschedule = () => {
    updateAppointment({
      date: tempDate,
      time: tempTime,
      status: 'Confirmed'
    });
    setShowRescheduleModal(false);
  };

  const handleCancelAppt = () => {
    updateAppointment({
      doctorName: '',
      specialty: '',
      clinic: '',
      date: '',
      time: '',
      status: 'Pending',
      notes: ''
    });
    setShowRescheduleModal(false);
  };

  const handleCreateAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookDoctor.trim()) return;
    updateAppointment({
      doctorName: bookDoctor.trim(),
      specialty: bookSpecialty.trim(),
      clinic: bookClinic.trim() || 'Women\'s Wellness Center',
      date: tempDate,
      time: tempTime,
      status: 'Confirmed',
      avatarUrl: ''
    });
    setShowBookingModal(false);
  };

  const doctorName = appointment?.doctorName || '';
  const specialty = appointment?.specialty || 'Specialist Consultation';
  const clinic = appointment?.clinic || 'Clinic Location';
  const dateStr = appointment?.date || 'Date TBD';
  const timeStr = appointment?.time || 'Time TBD';

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#241C22] pb-32 relative overflow-x-hidden selection:bg-[#DE9E8E]/30">
      {/* Top Header Background with Golden Foliage & Wave Art */}
      <div className="relative w-full h-[180px] sm:h-[200px] overflow-hidden">
        <img
          src="/assets/img_appt_header_bg_1787819183710.jpg"
          alt="Appointment Botanical Header Artwork"
          className="w-full h-full object-cover object-top"
        />
        {/* Soft bottom fade */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#FDFBF7]" />

        {/* Circular Back Button */}
        <button
          onClick={onBack}
          id="appt_detail_back_btn"
          className="absolute top-4 left-4 z-20 w-10 h-10 rounded-full bg-white/70 backdrop-blur-md border border-white/80 flex items-center justify-center text-[#2A2328] hover:bg-white/90 active:scale-95 transition-all shadow-sm cursor-pointer"
          title="Go back"
        >
          <ChevronLeft size={22} strokeWidth={2.4} />
        </button>
      </div>

      {/* Main Content Area */}
      <main className="max-w-md mx-auto px-5 sm:px-6 space-y-4 -mt-16 relative z-10">
        {/* Title */}
        <h1 className="font-serif text-[34px] sm:text-[38px] text-[#20141E] leading-tight tracking-tight text-left pb-1">
          Specialist Consultations
        </h1>

        {hasAppointment ? (
          <>
            {/* Card 1: Doctor Profile & Appointment Logistics */}
            <div className="bg-white/95 backdrop-blur-md rounded-[32px] p-6 border border-[#EDE4DE] shadow-[0_4px_24px_rgba(0,0,0,0.04)] space-y-5">
              {/* Doctor Header */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-[#FAF0E6] text-[#523446] flex items-center justify-center font-serif text-2xl font-bold shadow-xs border border-[#F0EAE5] shrink-0">
                  {appointment?.avatarUrl ? (
                    <img
                      src={appointment.avatarUrl}
                      alt={doctorName}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    doctorName.slice(0, 2).toUpperCase()
                  )}
                </div>
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="text-[20px] font-semibold text-[#20141E] leading-snug truncate">
                      {doctorName}
                    </h2>
                    <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                      {appointment?.status || 'Confirmed'}
                    </span>
                  </div>
                  <p className="text-xs text-[#52444F] font-normal leading-relaxed truncate">
                    {specialty}
                  </p>
                </div>
              </div>

              {/* Specialty Subtitle & Clinic Floor */}
              <div className="text-center pb-1 space-y-1 border-t border-[#F5EFEA] pt-4">
                <p className="text-[14.5px] font-normal text-[#20141E]">
                  {specialty}
                </p>
                <p className="text-xs text-[#6E606B]">
                  {clinic}
                </p>
              </div>

              {/* Date & Time Row */}
              <div className="flex items-center justify-between pt-2 border-t border-[#F5EFEA]">
                <span className="font-serif text-[22px] font-normal text-[#20141E]">
                  {dateStr}
                </span>
                <div className="flex items-center gap-2 text-right">
                  <Clock size={18} className="text-[#4A3845] flex-shrink-0" />
                  <div className="text-xs text-[#20141E] font-medium leading-tight text-left">
                    <span>Time</span>
                    <span className="block font-semibold">{timeStr}</span>
                  </div>
                </div>
              </div>

              {/* Location Row */}
              <div className="flex items-center gap-2 text-xs font-normal text-[#4A3A46] pt-1">
                <MapPin size={16} className="text-[#4A3845] flex-shrink-0" />
                <span>{clinic}</span>
              </div>
            </div>

            {/* Card 2: Notes for Doctor */}
            <div className="bg-white/95 backdrop-blur-md rounded-[28px] p-5 border border-[#EDE4DE] shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-3">
              <h3 className="text-[17px] font-semibold text-[#20141E] tracking-tight">
                Notes for Doctor
              </h3>

              <form onSubmit={handleAddNote} className="relative flex items-center">
                <input
                  type="text"
                  placeholder="Add questions or symptoms for this visit..."
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  className="w-full bg-white border border-[#DDD4CC] rounded-xl px-4 py-3 text-xs text-[#20141E] placeholder:text-[#8E808A] focus:outline-none focus:ring-1 focus:ring-[#523446] pr-20"
                />
                <button
                  type="submit"
                  className="absolute right-1.5 px-4 py-1.5 bg-[#523446] hover:bg-[#3E2434] text-white text-xs font-semibold rounded-lg shadow-sm transition-all cursor-pointer"
                >
                  Add
                </button>
              </form>

              {appointment?.notes && (
                <div className="space-y-1 bg-[#FAF8F5] p-3 rounded-xl border border-[#EDE4DE]">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-[#523446]">Saved Notes:</span>
                    <button
                      onClick={() => updateAppointment({ notes: '' })}
                      className="text-stone-400 hover:text-rose-600 transition-colors cursor-pointer"
                      title="Clear notes"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                  <p className="text-xs text-[#52444F] whitespace-pre-line leading-relaxed">
                    {appointment.notes}
                  </p>
                </div>
              )}
            </div>

            {/* Reschedule / Cancel Button & Care Team Link */}
            <div className="pt-2 space-y-2.5">
              <button
                type="button"
                onClick={() => setShowRescheduleModal(true)}
                className="w-full py-3.5 bg-[#523446] hover:bg-[#3F2535] text-white font-medium text-[15px] rounded-full shadow-[0_8px_20px_rgba(82,52,70,0.25)] flex items-center justify-center transition-all cursor-pointer active:scale-98"
              >
                Reschedule or Cancel Visit
              </button>

              {onNavigateToCareTeam && (
                <button
                  type="button"
                  onClick={onNavigateToCareTeam}
                  className="w-full py-3 bg-white hover:bg-[#FDFCFB] text-[#523446] border border-[#EDE6E1] font-medium text-[14px] rounded-full shadow-xs flex items-center justify-center transition-all cursor-pointer"
                >
                  Browse Care Team Directory
                </button>
              )}
            </div>
          </>
        ) : (
          /* Empty State for Real User */
          <div className="bg-white/95 backdrop-blur-md rounded-[32px] p-6 sm:p-7 border border-[#EDE4DE] shadow-[0_4px_24px_rgba(0,0,0,0.04)] text-center space-y-5">
            <div className="w-16 h-16 mx-auto rounded-full bg-[#FAF0E8] border border-[#ECD9CC] flex items-center justify-center text-[#523446]">
              <Calendar size={28} strokeWidth={1.8} />
            </div>

            <div className="space-y-1.5">
              <h2 className="font-serif text-[22px] font-bold text-[#20141E]">
                No Upcoming Appointments
              </h2>
              <p className="text-[13.5px] text-[#6E606B] max-w-xs mx-auto leading-relaxed">
                You haven't scheduled any consultations yet. Add your doctor or browse healthcare providers.
              </p>
            </div>

            <div className="flex flex-col gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowBookingModal(true)}
                className="w-full py-3.5 bg-[#523446] hover:bg-[#3F2535] text-white font-semibold text-[14px] rounded-full shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98"
              >
                <Plus size={18} />
                <span>Log an Appointment</span>
              </button>

              {onNavigateToCareTeam && (
                <button
                  type="button"
                  onClick={onNavigateToCareTeam}
                  className="w-full py-3 bg-white hover:bg-[#FAF8F6] text-[#523446] border border-[#EDE4DE] font-semibold text-[14px] rounded-full flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
                >
                  <Stethoscope size={16} />
                  <span>Browse Specialist Directory</span>
                </button>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Book Appointment Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 border border-[#EDE4DE] shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-1 border-b border-[#F0EAE5]">
              <h3 className="text-lg font-serif font-bold text-[#20141E]">
                Schedule Specialist
              </h3>
              <button
                onClick={() => setShowBookingModal(false)}
                className="w-7 h-7 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500 hover:text-neutral-800"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAppointment} className="space-y-3 text-xs">
              <div>
                <label className="text-[11px] font-semibold text-[#6E606B] block mb-1">
                  Doctor or Clinician Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Emily Carter"
                  value={bookDoctor}
                  onChange={(e) => setBookDoctor(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#DDD4CC] rounded-xl px-3 py-2 text-sm text-[#20141E] focus:outline-none focus:border-[#523446]"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#6E606B] block mb-1">
                  Specialty
                </label>
                <input
                  type="text"
                  placeholder="e.g. OB/GYN, Midwife, Endocrinologist"
                  value={bookSpecialty}
                  onChange={(e) => setBookSpecialty(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#DDD4CC] rounded-xl px-3 py-2 text-sm text-[#20141E] focus:outline-none focus:border-[#523446]"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#6E606B] block mb-1">
                  Clinic or Hospital Location
                </label>
                <input
                  type="text"
                  placeholder="e.g. City Women's Health, Suite 300"
                  value={bookClinic}
                  onChange={(e) => setBookClinic(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#DDD4CC] rounded-xl px-3 py-2 text-sm text-[#20141E] focus:outline-none focus:border-[#523446]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-[#6E606B] block mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={tempDate}
                    onChange={(e) => setTempDate(e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-[#DDD4CC] rounded-xl px-3 py-2 text-xs text-[#20141E]"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-[#6E606B] block mb-1">
                    Time
                  </label>
                  <input
                    type="text"
                    value={tempTime}
                    placeholder="10:00 AM"
                    onChange={(e) => setTempTime(e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-[#DDD4CC] rounded-xl px-3 py-2 text-xs text-[#20141E]"
                  />
                </div>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#523446] text-white text-xs font-semibold rounded-full hover:bg-[#3E2434] transition-all cursor-pointer shadow-sm"
                >
                  Save Consultation
                </button>
                <button
                  type="button"
                  onClick={() => setShowBookingModal(false)}
                  className="w-full py-1 text-stone-500 text-xs hover:text-stone-700 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reschedule / Cancel Modal */}
      {showRescheduleModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 border border-[#EDE4DE] shadow-2xl space-y-4">
            <h3 className="text-lg font-serif font-bold text-[#20141E]">
              Manage Appointment
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[11px] font-medium text-[#7A6C74] block mb-1">
                  Appointment Date
                </label>
                <input
                  type="date"
                  value={tempDate}
                  onChange={(e) => setTempDate(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#DDD4CC] rounded-xl px-3 py-2 text-sm text-[#20141E]"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-[#7A6C74] block mb-1">
                  Time Slot
                </label>
                <select
                  value={tempTime}
                  onChange={(e) => setTempTime(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#DDD4CC] rounded-xl px-3 py-2 text-sm text-[#20141E]"
                >
                  <option value="9:00 AM">9:00 AM</option>
                  <option value="10:00 AM">10:00 AM</option>
                  <option value="11:30 AM">11:30 AM</option>
                  <option value="2:00 PM">2:00 PM</option>
                  <option value="3:30 PM">3:30 PM</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                type="button"
                onClick={handleSaveReschedule}
                className="w-full py-2.5 bg-[#523446] text-white text-xs font-semibold rounded-full hover:bg-[#3E2434] transition-all cursor-pointer"
              >
                Confirm New Date & Time
              </button>
              <button
                type="button"
                onClick={handleCancelAppt}
                className="w-full py-2 text-rose-600 text-xs font-semibold hover:underline cursor-pointer"
              >
                Remove Appointment
              </button>
              <button
                type="button"
                onClick={() => setShowRescheduleModal(false)}
                className="w-full py-2 text-stone-500 text-xs hover:text-stone-700 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

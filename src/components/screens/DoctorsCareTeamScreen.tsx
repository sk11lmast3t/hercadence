import React, { useState } from 'react';
import { 
  Signal, 
  Wifi, 
  Battery, 
  Search, 
  Mic, 
  Tag, 
  Heart, 
  ChevronLeft, 
  Calendar, 
  Check, 
  X, 
  Clock, 
  MapPin, 
  Phone,
  Navigation2,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { Geolocation } from '@capacitor/geolocation';
import { Capacitor } from '@capacitor/core';
import { NearbyCareError, useNearbyCare, DoctorPlace } from '../../hooks/useNearbyCare';

interface DoctorProfile {
  id: string;
  name: string;
  specialty: string;
  role: string;
  avatarUrl: string;
  isFavorite?: boolean;
  rating?: number;
  availableSlot?: string;
  location?: string;
  bio?: string;
}

interface DoctorsCareTeamScreenProps {
  onBack: () => void;
  onSelectDoctorAppointment?: (doctorId: string) => void;
}

export const DoctorsCareTeamScreen: React.FC<DoctorsCareTeamScreenProps> = ({
  onBack,
  onSelectDoctorAppointment
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set(['dr_anya']));
  const [selectedDoctorForBooking, setSelectedDoctorForBooking] = useState<DoctorProfile | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [showNearbyOnly, setShowNearbyOnly] = useState(false);

  const { doctors: nearbyDoctors, isLoading: nearbyLoading, error: nearbyError, searchNearby } = useNearbyCare();

  const tags = ['OB-GYN', 'Endocrinologist', 'Nutritionist'];

  // Static informational care-team examples; never use these as nearby lookup results.
  const doctors: DoctorProfile[] = [
    {
      id: 'dr_anya',
      name: 'Dr. Anya Sharma',
      specialty: 'OB-GYN',
      role: 'OB-GYN & Fertility Specialist',
      avatarUrl: '/assets/img_doctor_anya_1787819162193.jpg',
      rating: 4.9,
      availableSlot: 'Tomorrow, 10:30 AM',
      location: 'Women\'s Wellness Pavilion, Ste 402',
      bio: 'Board-certified OB-GYN with 12+ years specializing in hormone optimization, fertility planning, and PCOS care.'
    },
    {
      id: 'dr_david',
      name: 'Dr. David Chen',
      specialty: 'Endocrinologist',
      role: 'Endocrinologist & Hormone Health',
      avatarUrl: '/assets/doctor_david_chen_avatar_1788069218263.jpg',
      rating: 4.95,
      availableSlot: 'Thursday, 2:00 PM',
      location: 'Metabolic & Endocrine Center',
      bio: 'Specialist in thyroid regulation, insulin sensitivity, and luteal phase progesterone balance.'
    },
    {
      id: 'dr_maria',
      name: 'Dr. Maria Rodriguez',
      specialty: 'Nutritionist',
      role: 'Holistic Nutritionist',
      avatarUrl: '/assets/doctor_maria_avatar_1788069233195.jpg',
      rating: 4.88,
      availableSlot: 'Friday, 11:00 AM',
      location: 'Integrative Nutrition Clinic',
      bio: 'Clinical nutritionist focusing on cycle-synced meal plans, anti-inflammatory whole foods, and gut microbiome health.'
    }
  ];

  const toggleFavorite = (id: string) => {
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleFindNearbyCare = async () => {
    setGeoError(null);
    try {
      const platform = Capacitor.getPlatform();
      if (platform === 'ios' || platform === 'android') {
        const perm = await Geolocation.requestPermissions();
        if (perm.location === 'denied') {
          setGeoError('Location permission denied. Please enable location access in Settings to find nearby care providers.');
          return;
        }
      }
      const pos = await Geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 10000 });
      await searchNearby(pos.coords.latitude, pos.coords.longitude);
      setShowNearbyOnly(true);
    } catch (err: any) {
      console.error('Geolocation/nearby-care error:', err);
      if (err instanceof NearbyCareError) {
        setShowNearbyOnly(true);
        setGeoError(`Nearby care is unavailable: ${err.message}`);
      } else if (err.code === 'PERMISSION_DENIED' || err.message?.includes('permission')) {
        setShowNearbyOnly(false);
        setGeoError('Location permission denied. Please enable location access in Settings to find nearby care providers.');
      } else if (err.code === 'TIMEOUT') {
        setShowNearbyOnly(false);
        setGeoError('Location request timed out. Please try again.');
      } else {
        setShowNearbyOnly(false);
        setGeoError('Unable to get your location. Please check your GPS and try again.');
      }
    }
  };

  const filteredDoctors = doctors.filter((doc) => {
    const matchesSearch = 
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.role.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = !selectedTag || doc.specialty.toLowerCase() === selectedTag.toLowerCase();
    return matchesSearch && matchesTag;
  });

  // Combine local doctors with nearby doctors from API
  const allDoctors = showNearbyOnly
    ? nearbyDoctors.map((d: DoctorPlace) => ({
        id: d.place_id,
        name: d.name,
        specialty: 'Nearby Care',
        role: d.vicinity || 'Nearby provider',
        avatarUrl: '',
        rating: d.rating,
        location: d.vicinity,
        bio: `${d.user_ratings_total || 0} reviews`
      }))
    : doctors;

  const filteredAllDoctors = allDoctors.filter((doc) => {
    const matchesSearch = 
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.role || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = !selectedTag || (doc.specialty || '').toLowerCase() === selectedTag.toLowerCase();
    return matchesSearch && matchesTag;
  });

  const handleConfirmBooking = () => {
    setBookingSuccess(true);
    setTimeout(() => {
      setBookingSuccess(false);
      setSelectedDoctorForBooking(null);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#FAF9F7] text-[#1E191D] pb-12 relative font-sans overflow-x-hidden">
      {/* Mobile Screen Container */}
      <div className="w-full max-w-[430px] mx-auto min-h-screen bg-[#FAF9F7] shadow-[0_10px_40px_rgba(0,0,0,0.06)] border-x border-[#EDE6E1] flex flex-col justify-between relative pb-6">
        
        {/* Top Header Section with Art, Status Bar, and Title */}
        <div className="relative w-full h-[220px] sm:h-[230px] overflow-hidden flex-shrink-0 bg-[#F4EDE8]">
          <img
            src="/assets/doctors_care_team_header_1788069180748.jpg"
            alt="Doctors & Care Team Floral and Silhouette Artwork"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-top"
          />

          {/* iOS Status Bar Overlay */}
          <div className="absolute top-3 inset-x-6 flex items-center justify-between text-[#1E191D] text-xs font-semibold select-none z-10">
            <span>9:41</span>
            <div className="flex items-center gap-1.5">
              <Signal size={13} strokeWidth={2.4} />
              <Wifi size={13} strokeWidth={2.4} />
              <Battery size={16} strokeWidth={2.4} />
            </div>
          </div>

          {/* Back button if opened as subview */}
          <button
            onClick={onBack}
            className="absolute top-10 left-5 p-1.5 rounded-full bg-white/70 backdrop-blur-md text-[#543649] hover:bg-white transition-all shadow-xs cursor-pointer z-10"
            aria-label="Back"
          >
            <ChevronLeft size={20} />
          </button>

          {/* Display Header Title matching mockup */}
          <div className="absolute bottom-4 left-6 right-6 z-10">
            <h1 className="text-[32px] sm:text-[34px] font-bold text-[#543649] leading-tight tracking-tight drop-shadow-2xs">
              Doctors <span className="font-serif italic font-normal text-[#C4935B]">&</span>
            </h1>
            <h2 className="font-serif text-[32px] sm:text-[34px] font-normal text-[#C4935B] leading-none tracking-tight -mt-1">
              Care Team
            </h2>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 px-4 sm:px-5 pt-3 pb-4 flex flex-col justify-between space-y-4 overflow-y-auto no-scrollbar">
          
          {/* Frosted Search and Filter Bar Card */}
          <div className="bg-white/80 backdrop-blur-md rounded-[26px] p-3 border border-[#EDE6E1] shadow-[0_4px_16px_rgba(0,0,0,0.03)] space-y-2.5">
            {/* Search Input */}
            <div className="relative flex items-center">
              <Search size={17} className="absolute left-3.5 text-[#9A8992]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search doctors, specialists..."
                className="w-full bg-[#F5EFEA]/80 pl-10 pr-10 py-2.5 rounded-full text-xs sm:text-[13px] text-[#1E191D] placeholder:text-[#9A8992] focus:outline-none focus:ring-1.5 focus:ring-[#543649]/30 transition-all"
              />
              <button 
                type="button" 
                className="absolute right-3.5 text-[#9A8992] hover:text-[#543649] transition-colors"
                aria-label="Voice search"
              >
                <Mic size={16} />
              </button>
            </div>

            {/* Find Nearby Care Button */}
            <button
              onClick={handleFindNearbyCare}
              disabled={nearbyLoading}
              className="w-full py-2.5 rounded-full bg-[#543649] text-white text-[13px] font-semibold hover:bg-[#432939] active:scale-[0.99] transition-all shadow-[0_4px_12px_rgba(84,54,73,0.25)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {nearbyLoading ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  <span>Finding nearby care...</span>
                </>
              ) : (
                <>
                  <Navigation2 size={14} />
                  <span>Find Nearby Care</span>
                </>
              )}
            </button>

            {/* Geolocation Error Message */}
            {geoError && (
              <div className="p-3 bg-[#FFF0F0] border border-[#F5C6CB] rounded-xl text-[12px] text-[#C53030] flex items-start gap-2">
                <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                <span>{geoError}</span>
              </div>
            )}

            {/* Nearby Results Info */}
            {showNearbyOnly && nearbyDoctors.length > 0 && !nearbyLoading && !geoError && (
              <div className="p-3 bg-[#F0FFF4] border border-[#9AE6B4] rounded-xl text-[12px] text-[#276749] flex items-center justify-between">
                <span>Found {nearbyDoctors.length} nearby care providers</span>
                <button
                  onClick={() => setShowNearbyOnly(false)}
                  className="text-[#276749] hover:underline text-sm"
                >
                  Show my care team
                </button>
              </div>
            )}
            {showNearbyOnly && !nearbyLoading && nearbyDoctors.length === 0 && nearbyError && (
              <div className="p-3 bg-[#FFF0F0] border border-[#F5C6CB] rounded-xl text-[12px] text-[#C53030] flex items-center gap-2">
                <AlertCircle size={14} className="flex-shrink-0" />
                <span>No nearby providers are available because the lookup failed.</span>
              </div>
            )}

            {/* Specialty Tag Pills */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
              {tags.map((tag) => {
                const isSelected = selectedTag === tag;
                return (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(isSelected ? null : tag)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all cursor-pointer flex-shrink-0 ${
                      isSelected
                        ? 'bg-[#543649] text-white shadow-xs'
                        : 'bg-[#F2EAE5] text-[#695460] hover:bg-[#EBE2DC]'
                    }`}
                  >
                    <Tag size={11} />
                    <span>{tag}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Doctor Cards List matching mockup */}
          <div className="space-y-3">
            {filteredAllDoctors.map((doc) => {
              const isFav = favoriteIds.has(doc.id);
              return (
                <div
                  key={doc.id}
                  className="bg-white rounded-[26px] p-3.5 sm:p-4 border border-[#EDE6E1] shadow-[0_4px_16px_rgba(0,0,0,0.03)] space-y-3 transition-all hover:shadow-[0_6px_20px_rgba(0,0,0,0.05)]"
                >
                  <div className="flex items-start gap-3.5">
                    {/* Round Doctor Avatar */}
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-white shadow-sm flex-shrink-0 flex items-center justify-center bg-[#E8DDD5] overflow-hidden">
                      {doc.avatarUrl ? (
                        <img
                          src={doc.avatarUrl}
                          alt={doc.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#543649]">
                          <Heart size={24} />
                        </div>
                      )}
                    </div>

                    {/* Doctor Info */}
                    <div className="flex-1 min-w-0 pr-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-[15px] sm:text-[16px] font-bold text-[#1E191D] leading-snug">
                            {doc.name}
                          </h3>
                          <p className="text-[12px] sm:text-[12.5px] text-[#7A6C74] font-medium leading-tight mt-0.5">
                            {doc.role}
                          </p>
                        </div>

                        {/* Favorite Heart Outline / Solid */}
                        <button
                          onClick={() => toggleFavorite(doc.id)}
                          className="p-1 text-[#8F7D88] hover:text-[#543649] transition-colors cursor-pointer"
                          aria-label="Favorite doctor"
                        >
                          <Heart 
                            size={19} 
                            className={isFav ? 'fill-[#E25C80] text-[#E25C80]' : 'text-[#8F7D88]'} 
                          />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Book Appointment Pill Button matching mockup */}
                  <button
                    onClick={() => {
                      if (onSelectDoctorAppointment) {
                        onSelectDoctorAppointment(doc.id);
                      } else {
                        setSelectedDoctorForBooking(doc);
                      }
                    }}
                    className="w-full py-2.5 rounded-full bg-[#543649] text-white text-[13px] font-semibold hover:bg-[#432939] active:scale-[0.99] transition-all shadow-[0_4px_12px_rgba(84,54,73,0.25)] flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Calendar size={14} />
                    <span>Book Appointment</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Appointment Booking Modal */}
      {selectedDoctorForBooking && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] max-w-sm w-full p-6 border border-[#EDE6E1] shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={selectedDoctorForBooking.avatarUrl}
                  alt={selectedDoctorForBooking.name}
                  referrerPolicy="no-referrer"
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <h3 className="text-base font-bold text-[#1E191D]">
                    {selectedDoctorForBooking.name}
                  </h3>
                  <p className="text-xs text-[#7A6C74]">{selectedDoctorForBooking.role}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedDoctorForBooking(null)}
                className="p-1 text-stone-400 hover:text-stone-700"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-2 text-xs text-stone-600">
              <div className="flex items-center gap-2 text-stone-700 font-medium">
                <Clock size={14} className="text-[#543649]" />
                <span>Next Slot: {selectedDoctorForBooking.availableSlot}</span>
              </div>
              <div className="flex items-center gap-2 text-stone-700 font-medium">
                <MapPin size={14} className="text-[#543649]" />
                <span>{selectedDoctorForBooking.location}</span>
              </div>
            </div>

            <div className="p-3 bg-[#FAF9F7] rounded-2xl border border-[#EDE6E1] text-[11px] text-[#7A6C74]">
              {selectedDoctorForBooking.bio}
            </div>

            <button
              onClick={handleConfirmBooking}
              disabled={bookingSuccess}
              className="w-full py-3 bg-[#543649] text-white text-xs font-semibold rounded-full hover:bg-[#432939] transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
            >
              {bookingSuccess ? (
                <>
                  <Check size={16} className="text-emerald-300" />
                  <span>Appointment Confirmed!</span>
                </>
              ) : (
                <span>Confirm Telehealth / In-Clinic Visit</span>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

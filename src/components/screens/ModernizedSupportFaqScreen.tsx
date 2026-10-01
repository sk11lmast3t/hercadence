import React, { useState } from 'react';
import { 
  Signal, 
  Wifi, 
  Battery, 
  HelpCircle, 
  MessageSquare, 
  Mail, 
  Search, 
  ChevronRight, 
  ChevronLeft, 
  Home, 
  Calendar as CalendarIcon, 
  Plus, 
  BarChart2, 
  User, 
  Send, 
  X, 
  Check, 
  ChevronDown, 
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AppView } from '../../types';
import { useCycle } from '../../context/CycleContext';

interface ModernizedSupportFaqScreenProps {
  onBack?: () => void;
  onNavigate?: (view: AppView) => void;
}

interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: 'Predictions' | 'Privacy' | 'Symptoms' | 'Sync';
}

export const ModernizedSupportFaqScreen: React.FC<ModernizedSupportFaqScreenProps> = ({
  onBack,
  onNavigate
}) => {
  const { settings } = useCycle();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeModal, setActiveModal] = useState<'FAQ' | 'CHAT' | 'EMAIL' | null>(null);
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>('faq-1');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Email form state
  const [emailSubject, setEmailSubject] = useState<string>('Cycle Prediction Adjustment');
  const [emailMessage, setEmailMessage] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>(settings.email || '');

  // Live chat state
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'agent' | 'user'; text: string; time: string }>>([
    {
      sender: 'agent',
      text: settings.userName
        ? `Hi ${settings.userName}! Welcome to our wellness support desk. How can we assist you with your cycle or app setup today?`
        : 'Welcome to our wellness support desk. How can we assist you with your cycle or app setup today?',
      time: '9:41 AM'
    }
  ]);
  const [chatInput, setChatInput] = useState<string>('');

  const faqs: FaqItem[] = [
    {
      id: 'faq-1',
      category: 'Predictions',
      question: 'How does the app forecast my next period and fertile window?',
      answer: 'Our algorithm utilizes a Bayesian statistical model calibrated with your past 6 completed cycles, luteal phase length, basal body temperature (BBT), and cervical fluid markers to calculate probabilistic windows.'
    },
    {
      id: 'faq-2',
      category: 'Privacy',
      question: 'Is my reproductive health data private and encrypted?',
      answer: 'Yes. All data stored on your device uses AES-256 zero-knowledge encryption. We never sell, monetize, or disclose your cycle logs, symptoms, or sexual wellness data to any advertisers or third parties.'
    },
    {
      id: 'faq-3',
      category: 'Symptoms',
      question: 'What do the symptom intensity dots mean in my history?',
      answer: 'One dot indicates mild or noticeable sensations; two dots denote moderate symptoms that affect your day; three dots represent severe or acute discomfort.'
    },
    {
      id: 'faq-4',
      category: 'Sync',
      question: 'How do I safely share my cycle phase with my partner?',
      answer: 'Navigate to Profile > Partner Sync. You can generate a private invite PIN that only shares your high-level cycle phase and daily energy level without disclosing personal symptom details.'
    }
  ];

  const filteredFaqs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput.trim();
    setChatMessages(prev => [...prev, { sender: 'user', text: userMsg, time: 'Just now' }]);
    setChatInput('');

    setTimeout(() => {
      setChatMessages(prev => [
        ...prev,
        {
          sender: 'agent',
          text: `Thank you for asking about "${userMsg}". A clinical wellness specialist has received your note and will review your question. In the meantime, you can check our FAQs for instant tips.`,
          time: 'Just now'
        }
      ]);
    }, 900);
  };

  const handleSendEmail = () => {
    if (!emailMessage.trim()) return;
    setActiveModal(null);
    setEmailMessage('');
    showToast('Support ticket submitted (Ref #8491)');
  };

  return (
    <div className="min-h-screen bg-[#FBF8F5] text-[#221B20] flex justify-center selection:bg-[#F3E2D8]">
      <div className="w-full max-w-[420px] min-h-screen flex flex-col justify-between relative bg-[#FBF8F5] pb-24 shadow-2xl overflow-x-hidden">
        
        {/* Top Gold & Terracotta Ribbon Header */}
        <div className="relative w-full h-[210px] bg-[#FAF5EE] overflow-hidden">
          <img 
            src="/assets/support_gold_ribbons_1788590039804.jpg" 
            alt="Support Gold Ribbon Banner" 
            className="w-full h-full object-cover opacity-90 scale-105"
            referrerPolicy="no-referrer"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-[#FBF8F5]" />

          {/* iOS Status Bar */}
          <div className="absolute top-0 left-0 right-0 pt-3 px-6 flex justify-between items-center text-xs font-semibold text-neutral-800 z-20 select-none">
            <span className="tracking-tight text-[14px]">9:41</span>
            <div className="flex items-center space-x-1.5 text-neutral-800">
              <Signal size={13} strokeWidth={2.5} />
              <Wifi size={13} strokeWidth={2.5} />
              <Battery size={18} strokeWidth={2.5} className="rotate-90" />
            </div>
          </div>

          {/* Optional Back Button */}
          {onBack && (
            <div className="absolute top-11 left-6 z-20">
              <button
                type="button"
                onClick={onBack}
                className="w-8 h-8 rounded-full bg-white/70 backdrop-blur-md border border-white/60 flex items-center justify-center text-[#2D2429] hover:bg-white active:scale-95 transition-all shadow-xs"
              >
                <ChevronLeft size={18} />
              </button>
            </div>
          )}

          {/* Banner Title & Subtitle */}
          <div className="absolute bottom-4 left-0 right-0 px-6 z-20">
            <h1 className="font-serif text-[34px] sm:text-[36px] font-medium tracking-tight text-[#1E171C] leading-tight">
              How can we help?
            </h1>
            <p className="text-[14.5px] font-medium text-[#6C5F67] mt-0.5">
              Find answers and get support.
            </p>
          </div>
        </div>

        {/* Content Area */}
        <div className="px-5 space-y-4 flex-1">
          
          {/* Search FAQs Bar */}
          <div className="relative mt-1">
            <input
              type="text"
              placeholder="Search FAQs or help topics"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 rounded-full bg-white border border-[#E9DFD8] text-[14.5px] placeholder-[#8F838C] text-[#221B20] shadow-[0_2px_12px_rgba(0,0,0,0.02)] focus:outline-none focus:border-[#B57C70] transition-all"
            />
            <Search 
              size={18} 
              strokeWidth={2} 
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8F838C]" 
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Card 1: FAQs */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setActiveModal('FAQ')}
            className="w-full bg-white rounded-[24px] p-5 border border-[#EBE3DC] shadow-[0_4px_18px_rgba(0,0,0,0.025)] flex items-start gap-4 cursor-pointer hover:border-[#D5C6BD] active:scale-[0.99] transition-all group"
          >
            <div className="w-11 h-11 rounded-full bg-[#FAF5EF] text-[#2B2328] flex items-center justify-center shrink-0 mt-0.5 border border-[#EDE3DC] group-hover:scale-105 transition-transform">
              <HelpCircle size={22} strokeWidth={1.8} />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="font-serif text-[22px] font-medium text-[#1E171C] tracking-tight leading-snug">
                FAQs
              </h2>
              <p className="text-[13.5px] text-[#6B5F66] mt-1 leading-relaxed">
                Browse our frequently asked questions. Quick answers to common topics.
              </p>
            </div>
          </motion.div>

          {/* Card 2: Live Chat */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.08 }}
            onClick={() => setActiveModal('CHAT')}
            className="w-full bg-white rounded-[24px] p-5 border border-[#EBE3DC] shadow-[0_4px_18px_rgba(0,0,0,0.025)] flex items-start gap-4 cursor-pointer hover:border-[#D5C6BD] active:scale-[0.99] transition-all group"
          >
            <div className="w-11 h-11 rounded-full bg-[#FAF5EF] text-[#2B2328] flex items-center justify-center shrink-0 mt-0.5 border border-[#EDE3DC] group-hover:scale-105 transition-transform">
              <MessageSquare size={22} strokeWidth={1.8} />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="font-serif text-[22px] font-medium text-[#1E171C] tracking-tight leading-snug">
                Live Chat
              </h2>
              <p className="text-[13.5px] text-[#6B5F66] mt-1 leading-relaxed">
                Chat with our wellness support team. Available 9 AM - 5 PM EST.
              </p>
            </div>
          </motion.div>

          {/* Card 3: Email Support */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.16 }}
            onClick={() => setActiveModal('EMAIL')}
            className="w-full bg-white rounded-[24px] p-5 border border-[#EBE3DC] shadow-[0_4px_18px_rgba(0,0,0,0.025)] flex items-start gap-4 cursor-pointer hover:border-[#D5C6BD] active:scale-[0.99] transition-all group"
          >
            <div className="w-11 h-11 rounded-full bg-[#FAF5EF] text-[#2B2328] flex items-center justify-center shrink-0 mt-0.5 border border-[#EDE3DC] group-hover:scale-105 transition-transform">
              <Mail size={22} strokeWidth={1.8} />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="font-serif text-[22px] font-medium text-[#1E171C] tracking-tight leading-snug">
                Email Support
              </h2>
              <p className="text-[13.5px] text-[#6B5F66] mt-1 leading-relaxed">
                Send us a detailed query. We typically reply within 24 hours.
              </p>
            </div>
          </motion.div>

        </div>

        {/* Bottom Navigation Bar */}
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[420px] bg-transparent px-6 py-2.5 flex justify-between items-center z-30">
          <button
            type="button"
            onClick={() => onNavigate && onNavigate('HOME')}
            className="flex flex-col items-center gap-1 text-[#8E848A] hover:text-[#1E191D] transition-colors"
          >
            <Home size={20} strokeWidth={1.8} />
            <span className="text-[11px] font-medium">Home</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate && onNavigate('CALENDAR')}
            className="flex flex-col items-center gap-1 text-[#8E848A] hover:text-[#1E191D] transition-colors"
          >
            <CalendarIcon size={20} strokeWidth={1.8} />
            <span className="text-[11px] font-medium">Calendar</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate && onNavigate('FEELING_TODAY')}
            className="flex flex-col items-center -mt-3"
          >
            <div className="w-11 h-11 rounded-full bg-[#1E191D] text-white flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.25)] active:scale-95 transition-all">
              <Plus size={22} strokeWidth={2.2} />
            </div>
            <span className="text-[11px] font-medium text-[#736870] mt-0.5">Add</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate && onNavigate('INSIGHTS')}
            className="flex flex-col items-center gap-1 text-[#8E848A] hover:text-[#1E191D] transition-colors"
          >
            <BarChart2 size={20} strokeWidth={1.8} />
            <span className="text-[11px] font-medium">Insights</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate && onNavigate('PROFILE')}
            className="flex flex-col items-center gap-1 text-[#8E848A] hover:text-[#1E191D] transition-colors"
          >
            <User size={20} strokeWidth={1.8} />
            <span className="text-[11px] font-medium">Profile</span>
          </button>
        </nav>

        {/* iOS Home Indicator bar */}
        <div className="w-full pb-2 flex justify-center bg-white">
          <button
            type="button"
            onClick={onBack || (() => onNavigate && onNavigate('PROFILE'))}
            className="w-36 h-1.5 bg-black/80 hover:bg-black rounded-full active:scale-95 transition-all cursor-pointer"
            title="Home Bar - Tap to return"
            aria-label="Home"
          />
        </div>

        {/* Modal: FAQs */}
        <AnimatePresence>
          {activeModal === 'FAQ' && (
            <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-xs p-4">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 40 }}
                className="w-full max-w-[390px] max-h-[85vh] overflow-y-auto bg-white rounded-3xl p-6 shadow-2xl border border-[#EDE5DF]"
              >
                <div className="flex items-center justify-between mb-4 sticky top-0 bg-white pb-2 border-b border-[#F2ECE6]">
                  <div>
                    <h3 className="font-serif text-[22px] font-bold text-[#1E181D]">
                      Frequently Asked Questions
                    </h3>
                    <p className="text-[12px] text-[#7A6E77]">Answers curated by our clinical team</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveModal(null)}
                    className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500 hover:bg-neutral-200 shrink-0"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="space-y-3">
                  {filteredFaqs.map((faq) => {
                    const isExpanded = expandedFaqId === faq.id;
                    return (
                      <div 
                        key={faq.id}
                        className="rounded-2xl border border-[#ECE4DD] bg-[#FAF8F5] overflow-hidden transition-colors"
                      >
                        <button
                          type="button"
                          onClick={() => setExpandedFaqId(isExpanded ? null : faq.id)}
                          className="w-full px-4 py-3 text-left flex items-center justify-between gap-2"
                        >
                          <span className="text-[14px] font-bold text-[#231A21] leading-snug">
                            {faq.question}
                          </span>
                          <ChevronDown
                            size={16}
                            className={`shrink-0 text-[#8C7D88] transition-transform ${
                              isExpanded ? 'rotate-180' : ''
                            }`}
                          />
                        </button>
                        {isExpanded && (
                          <div className="px-4 pb-3.5 pt-1 text-[13px] text-[#554751] leading-relaxed border-t border-[#EFE8E1]">
                            {faq.answer}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="mt-6 pt-3 border-t border-[#F2ECE6] text-center">
                  <button
                    type="button"
                    onClick={() => setActiveModal('CHAT')}
                    className="text-[13px] font-bold text-[#965A68] hover:underline"
                  >
                    Can&apos;t find what you need? Talk to live support →
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Modal: Live Chat */}
        <AnimatePresence>
          {activeModal === 'CHAT' && (
            <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-xs p-4">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 40 }}
                className="w-full max-w-[390px] h-[540px] flex flex-col bg-white rounded-3xl shadow-2xl border border-[#EDE5DF] overflow-hidden"
              >
                {/* Chat Header */}
                <div className="px-5 py-3.5 bg-[#FAF6F2] border-b border-[#EFE7E0] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-3 h-3 rounded-full bg-[#52A36B] ring-4 ring-[#DFF1E4]" />
                    <div>
                      <h4 className="font-serif text-[16.5px] font-bold text-[#1E171C]">
                        Wellness Support
                      </h4>
                      <p className="text-[11px] text-[#7A6C76]">Online · Typical reply in 2 min</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveModal(null)}
                    className="w-8 h-8 rounded-full bg-neutral-200/60 flex items-center justify-center text-neutral-600 hover:bg-neutral-200"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Messages Container */}
                <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#FAF8F6]">
                  {chatMessages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex flex-col ${
                        msg.sender === 'user' ? 'items-end' : 'items-start'
                      }`}
                    >
                      <div
                        className={`max-w-[82%] px-3.5 py-2.5 rounded-2xl text-[13.5px] leading-relaxed ${
                          msg.sender === 'user'
                            ? 'bg-[#1E191D] text-white rounded-br-xs'
                            : 'bg-white text-[#231A21] border border-[#ECE3DC] shadow-xs rounded-bl-xs'
                        }`}
                      >
                        {msg.text}
                      </div>
                      <span className="text-[10px] text-[#A2949E] mt-1 px-1">
                        {msg.time}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Chat Input */}
                <div className="p-3 bg-white border-t border-[#EFE7E0] flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Type your question..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1 px-3.5 py-2.5 rounded-full border border-[#E3D9D1] bg-[#FAF8F6] text-[13.5px] text-[#221B20] focus:outline-none focus:border-[#965A68]"
                  />
                  <button
                    type="button"
                    onClick={handleSendMessage}
                    className="w-10 h-10 rounded-full bg-[#1E191D] text-white flex items-center justify-center hover:bg-black active:scale-95 transition-all shrink-0"
                  >
                    <Send size={16} />
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Modal: Email Support */}
        <AnimatePresence>
          {activeModal === 'EMAIL' && (
            <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-xs p-4">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 40 }}
                className="w-full max-w-[390px] bg-white rounded-3xl p-6 shadow-2xl border border-[#EDE5DF]"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-serif text-[20px] font-bold text-[#1E181D]">
                    Email Support
                  </h3>
                  <button
                    type="button"
                    onClick={() => setActiveModal(null)}
                    className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500 hover:bg-neutral-200"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="space-y-3.5">
                  <div>
                    <label className="text-[11px] font-bold text-[#7E717A] uppercase tracking-wider block mb-1">
                      Your Email
                    </label>
                    <input
                      type="email"
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-[#E3D9D1] bg-[#FAF8F6] text-[13.5px] text-[#221B20]"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-[#7E717A] uppercase tracking-wider block mb-1">
                      Topic
                    </label>
                    <input
                      type="text"
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-[#E3D9D1] bg-[#FAF8F6] text-[13.5px] text-[#221B20]"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-[#7E717A] uppercase tracking-wider block mb-1">
                      Message
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Please describe what you are experiencing or what you need help with..."
                      value={emailMessage}
                      onChange={(e) => setEmailMessage(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E3D9D1] bg-[#FAF8F6] text-[13.5px] text-[#221B20] focus:outline-none focus:border-[#965A68]"
                    />
                  </div>

                  <div className="text-[11px] text-[#867A83] bg-[#FAF7F4] p-2.5 rounded-xl">
                    Diagnostics: iOS 17.5 · App Version 2.4.0 · Local Timezone America/New_York
                  </div>
                </div>

                <div className="mt-5 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveModal(null)}
                    className="flex-1 py-3 rounded-2xl border border-[#DDD3CB] text-[14px] font-semibold text-[#665A63]"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSendEmail}
                    disabled={!emailMessage.trim()}
                    className="flex-1 py-3 rounded-2xl bg-[#1E191D] text-white text-[14px] font-bold disabled:opacity-50 active:scale-[0.98] shadow-xs"
                  >
                    Send Ticket
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Feedback Toast */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed bottom-24 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-[#1E191D] text-white text-[12.5px] font-medium shadow-lg z-50 flex items-center gap-2"
            >
              <Check size={14} className="text-[#96D6A6]" />
              <span>{toastMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};

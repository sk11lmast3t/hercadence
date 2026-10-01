import React from 'react';
import { Home, Calendar, PieChart, User, Plus } from 'lucide-react';
import { motion } from 'motion/react';
import { AppView } from '../../types';

interface BottomNavBarProps {
  currentView: AppView;
  onSelectView: (view: AppView) => void;
  onOpenLogModal: () => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  currentView,
  onSelectView,
  onOpenLogModal
}) => {
  // Only show on the primary tab root views
  const primaryTabViews: AppView[] = [
    'HOME',
    'CLASSIC_HOME',
    'HARMONIZED_HOME',
    'HARMONIZED_DASHBOARD',
    'CALENDAR',
    'HARMONIZED_CALENDAR',
    'INSIGHTS',
    'CLASSIC_INSIGHTS',
    'HARMONIZED_INSIGHTS',
    'PROFILE',
    'CLASSIC_PROFILE'
  ];

  if (!primaryTabViews.includes(currentView)) {
    return null;
  }

  // Active tab determination supporting subviews
  const getActiveTab = (view: AppView): AppView => {
    if ([
      'PROFILE', 
      'EXPORT_HEALTH_REPORT', 
      'HEALTH_PROFILE', 
      'APP_PREFERENCES', 
      'NOTIFICATIONS', 
      'CUSTOM_TAGS', 
      'PASSCODE_LOCK', 
      'PREMIUM',
      'EMERGENCY_HELP',
      'EXPORT_SUCCESS',
      'CONNECTED_DEVICES'
    ].includes(view)) {
      return 'PROFILE';
    }
    if ([
      'INSIGHTS', 
      'HARMONIZED_INSIGHTS',
      'DOCTORS_CARE_TEAM', 
      'VIDEO_LIBRARY', 
      'LUTEAL_ARTICLE', 
      'PERSONALIZED_INSIGHTS', 
      'APPOINTMENT_DETAIL', 
      'COMMUNITY', 
      'CREATE_POST', 
      'POST_DETAIL'
    ].includes(view)) {
      return 'INSIGHTS';
    }
    if ([
      'CALENDAR', 
      'HARMONIZED_CALENDAR',
      'BBT_LOG', 
      'BIRTH_CONTROL', 
      'PARTNER_SYNC',
      'FERTILITY_DETAIL',
      'MEDICATION_TRACKER'
    ].includes(view)) {
      return 'CALENDAR';
    }
    return 'HOME';
  };

  const activeTab = getActiveTab(currentView);

  const navItems = [
    { id: 'HOME' as AppView, label: 'Home', icon: Home },
    { id: 'CALENDAR' as AppView, label: 'Calendar', icon: Calendar },
    { id: 'ADD' as any, label: 'Add', icon: null, isAction: true },
    { id: 'INSIGHTS' as AppView, label: 'Insights', icon: PieChart },
    { id: 'PROFILE' as AppView, label: 'Profile', icon: User }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 flex justify-center pointer-events-none">
      <nav
        id="app_bottom_nav_bar"
        className="w-full max-w-[430px] bg-transparent px-3 pt-2 pb-[max(1.25rem,env(safe-area-inset-bottom))] flex items-center justify-around pointer-events-auto transition-all"
      >
        {navItems.map((item) => {
          if (item.isAction) {
            return (
              <motion.button
                key="add_action"
                id="bottom_nav_add_button"
                onClick={onOpenLogModal}
                whileHover={{ scale: 1.12, y: -2 }}
                whileTap={{ scale: 0.88, rotate: 45 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-tr from-[#DE687F] via-[#E87A90] to-[#F294A5] text-white shadow-[0_6px_20px_rgba(222,104,127,0.45)] ring-4 ring-[#FAF6F8]/80 focus:outline-none cursor-pointer -mt-4 group"
                aria-label="Add Daily Log"
              >
                <Plus size={24} strokeWidth={2.6} className="group-hover:rotate-90 transition-transform duration-200" />
              </motion.button>
            );
          }

          const IconComponent = item.icon!;
          const isActive = activeTab === item.id;

          return (
            <motion.button
              key={item.id}
              id={`nav_tab_${item.id.toLowerCase()}`}
              onClick={() => onSelectView(item.id)}
              whileHover={{ scale: 1.08, y: -2 }}
              whileTap={{ scale: 0.92 }}
              transition={{ type: 'spring', stiffness: 450, damping: 25 }}
              className={`relative flex flex-col items-center justify-center py-1 px-3 transition-colors cursor-pointer select-none ${
                isActive
                  ? 'text-[#D05670] font-bold'
                  : 'text-[#9E8B94] hover:text-[#D05670]'
              }`}
            >
              {/* Smoothly animated top indicator bar with spring layout transition */}
              {isActive && (
                <motion.span
                  layoutId="activeTabIndicator"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  className="absolute -top-2 w-8 h-[3.5px] bg-gradient-to-r from-[#E87A90] to-[#D05670] rounded-full shadow-[0_1px_6px_rgba(232,122,144,0.5)]"
                />
              )}
              <motion.div
                animate={{ scale: isActive ? 1.1 : 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                className={`p-1 transition-colors ${isActive ? 'text-[#D05670]' : 'text-[#9E8B94]'}`}
              >
                <IconComponent size={22} strokeWidth={isActive ? 2.3 : 1.7} />
              </motion.div>
              <span className="text-[11px] font-sans tracking-tight">{item.label}</span>
            </motion.button>
          );
        })}
      </nav>
    </div>
  );
};

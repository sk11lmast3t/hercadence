import React, { useState, useEffect, useRef } from 'react';
import { WifiOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '@clerk/clerk-react';
import { useEdgeFunction } from './hooks/useSupabase';
import { usePremiumEntitlement } from './hooks/usePremiumEntitlement';
import { CycleProvider, useCycle } from './context/CycleContext';
import { BottomNavBar } from './components/common/BottomNavBar';
import { LogEntryModal } from './components/common/LogEntryModal';
import { HomeScreen } from './components/screens/HomeScreen';
import { CalendarScreen } from './components/screens/CalendarScreen';
import { InsightsScreen } from './components/screens/InsightsScreen';
import { ProfileScreen } from './components/screens/ProfileScreen';
import { BbtLogScreen } from './components/screens/BbtLogScreen';
import { BirthControlScreen } from './components/screens/BirthControlScreen';
import { PartnerSyncScreen } from './components/screens/PartnerSyncScreen';
import { PasscodeLockScreen } from './components/screens/PasscodeLockScreen';
import { PremiumSubscriptionScreen } from './components/screens/PremiumSubscriptionScreen';
import { AppointmentDetailScreen } from './components/screens/AppointmentDetailScreen';
import { DoctorsCareTeamScreen } from './components/screens/DoctorsCareTeamScreen';
import { EmergencyHelpScreen } from './components/screens/EmergencyHelpScreen';
import { ExportHealthReportScreen } from './components/screens/ExportHealthReportScreen';
import { ExportSuccessScreen } from './components/screens/ExportSuccessScreen';
import { FertilityDetailScreen } from './components/screens/FertilityDetailScreen';
import { ConnectedDevicesScreen } from './components/screens/ConnectedDevicesScreen';
import { HarmonizedDashboardScreen } from './components/screens/HarmonizedDashboardScreen';
import { HarmonizedHomeScreen } from './components/screens/HarmonizedHomeScreen';
import { HarmonizedCalendarScreen } from './components/screens/HarmonizedCalendarScreen';
import { HarmonizedInsightsScreen } from './components/screens/HarmonizedInsightsScreen';
import { HarmonizedForecastHomeScreen } from './components/screens/HarmonizedForecastHomeScreen';
import { ModernizedInsightsScreen } from './components/screens/ModernizedInsightsScreen';
import { ModernizedProfileScreen } from './components/screens/ModernizedProfileScreen';
import { CustomTagsScreen } from './components/screens/CustomTagsScreen';
import { HealthProfileScreen } from './components/screens/HealthProfileScreen';
import { NotificationAlertsScreen } from './components/screens/NotificationAlertsScreen';
import { DiscoveryVideoLibraryScreen } from './components/screens/DiscoveryVideoLibraryScreen';
import { LutealNutritionArticleScreen } from './components/screens/LutealNutritionArticleScreen';
import { PersonalizedInsightsScreen } from './components/screens/PersonalizedInsightsScreen';
import { CommunityGatewayScreen } from './components/screens/CommunityGatewayScreen';
import { CreatePostScreen } from './components/screens/CreatePostScreen';
import { CommunityPostDetailScreen } from './components/screens/CommunityPostDetailScreen';
import { HowAreYouFeelingScreen } from './components/screens/HowAreYouFeelingScreen';
import { AppPreferencesScreen } from './components/screens/AppPreferencesScreen';
import { EmpowerWelcomeScreen } from './components/screens/EmpowerWelcomeScreen';
import { YourCycleUnderstoodScreen } from './components/screens/YourCycleUnderstoodScreen';
import { TrackWithEaseScreen } from './components/screens/TrackWithEaseScreen';
import { OnboardingSuccessScreen } from './components/screens/OnboardingSuccessScreen';
import { LoginGatewayScreen } from './components/screens/LoginGatewayScreen';
import { ModernizedMedicationTrackerScreen } from './components/screens/ModernizedMedicationTrackerScreen';
import { ModernizedHydrationTrackerScreen } from './components/screens/ModernizedHydrationTrackerScreen';
import { ModernizedMedicationHistoryScreen } from './components/screens/ModernizedMedicationHistoryScreen';
import { ModernizedWellnessPermissionScreen } from './components/screens/ModernizedWellnessPermissionScreen';
import { ModernizedMucusLogScreen } from './components/screens/ModernizedMucusLogScreen';
import { ModernizedNutritionCategoryScreen } from './components/screens/ModernizedNutritionCategoryScreen';
import { ModernizedPartnerSyncDetailsScreen } from './components/screens/ModernizedPartnerSyncDetailsScreen';
import { ModernizedPhysicalActivityScreen } from './components/screens/ModernizedPhysicalActivityScreen';
import { ModernizedPregnancyModeScreen } from './components/screens/ModernizedPregnancyModeScreen';
import { ModernizedPrivacySecurityScreen } from './components/screens/ModernizedPrivacySecurityScreen';
import { ModernizedSearchScreen } from './components/screens/ModernizedSearchScreen';
import { ModernizedSymptomHistoryScreen } from './components/screens/ModernizedSymptomHistoryScreen';
import { ModernizedSleepInsightsScreen } from './components/screens/ModernizedSleepInsightsScreen';
import { ModernizedSupplementTrackerScreen } from './components/screens/ModernizedSupplementTrackerScreen';
import { ModernizedSupportFaqScreen } from './components/screens/ModernizedSupportFaqScreen';
import { ModernizedBodyMetricsScreen } from './components/screens/ModernizedBodyMetricsScreen';
import { ModernizedSymptomIntensityLogScreen } from './components/screens/ModernizedSymptomIntensityLogScreen';
import { CycleSyncedFitnessScreen } from './components/screens/CycleSyncedFitnessScreen';
import { ModernizedDeleteAccountScreen } from './components/screens/ModernizedDeleteAccountScreen';
import { ModernizedForgotPasswordScreen } from './components/screens/ModernizedForgotPasswordScreen';
import { ModernizedEditProfileScreen } from './components/screens/ModernizedEditProfileScreen';
import { ModernizedNotificationInboxScreen } from './components/screens/ModernizedNotificationInboxScreen';
import { ModernizedOfflineStateScreen } from './components/screens/ModernizedOfflineStateScreen';
import { ModernizedNotFoundScreen } from './components/screens/ModernizedNotFoundScreen';
import { ModernizedTrialPaywallScreen } from './components/screens/ModernizedTrialPaywallScreen';
import { ModernizedBillingReceiptsScreen } from './components/screens/ModernizedBillingReceiptsScreen';
import { ModernizedAppReviewScreen } from './components/screens/ModernizedAppReviewScreen';
import { ModernizedWhatsNewScreen } from './components/screens/ModernizedWhatsNewScreen';
import { ModernizedLegalDisclaimerScreen } from './components/screens/ModernizedLegalDisclaimerScreen';
import { FocusEnergyTrackerScreen } from './components/screens/FocusEnergyTrackerScreen';
import { PhysicalComfortTrackerScreen } from './components/screens/PhysicalComfortTrackerScreen';
import { InitialBaselineSetupScreen } from './components/screens/InitialBaselineSetupScreen';
import { KotlinAndroidCodeViewerScreen } from './components/screens/KotlinAndroidCodeViewerScreen';
import { TermsOfServiceScreen } from './components/screens/TermsOfServiceScreen';
import { PrivacyPolicyScreen } from './components/screens/PrivacyPolicyScreen';
import { ScreenDirectoryModal } from './components/common/ScreenDirectoryModal';
import { MobileAppShell } from './components/common/MobileAppShell';

import { AppView } from './types';
import { formatDateToISO } from './utils/cycleCalculations';

const UNENTITLED_ALLOWLIST: AppView[] = [
  'TRIAL_PAYWALL',
  'PREMIUM',
  'MANAGE_BILLING',
  'DELETE_ACCOUNT',
  'TERMS_OF_SERVICE',
  'PRIVACY_POLICY',
  'TERMS_CLINICAL_DISCLAIMER',
  'DATA_PRIVACY_SECURITY',
  'PASSCODE_LOCK',
  'LOGIN_GATEWAY',
  'ONBOARDING_WELCOME',
  'INITIAL_BASELINE_SETUP',
  'ONBOARDING_SUCCESS',
  'FORGOT_PASSWORD'
];

const MainAppContent: React.FC = () => {
  const { currentView, setCurrentView, selectedDate, setSelectedDate, settings, currentCycle } = useCycle();
  const { isSignedIn, isLoaded } = useAuth();
  const { invoke } = useEdgeFunction();
  const { isPremium, loading: isEntitlementLoading, checkEntitlement } = usePremiumEntitlement();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      checkEntitlement();
    }
  }, [isLoaded, isSignedIn, checkEntitlement]);

  const effectiveView = React.useMemo(() => {
    if (!isLoaded) return currentView;
    if (!isSignedIn && !['ONBOARDING_WELCOME', 'INITIAL_BASELINE_SETUP', 'LOGIN_GATEWAY'].includes(currentView)) {
      return 'LOGIN_GATEWAY';
    }
    if (isSignedIn && !isEntitlementLoading && !isPremium && !UNENTITLED_ALLOWLIST.includes(currentView)) {
      return 'TRIAL_PAYWALL';
    }
    return currentView;
  }, [isLoaded, isSignedIn, isEntitlementLoading, isPremium, currentView]);

  // Auto-fire complete-onboarding on every fresh sign-in, regardless of current view.
  // This is in App.tsx (not LoginGatewayScreen) because a full-page reload after
  // OTP verification can bypass LoginGatewayScreen entirely and land on HOME.
  const hadFiredOnboarding = useRef(false);
  useEffect(() => {
    console.log('[App] auth state effect:', { isSignedIn, isLoaded });
    if (isLoaded && isSignedIn && !hadFiredOnboarding.current) {
      hadFiredOnboarding.current = true;
      const pending = localStorage.getItem('pendingOnboardingData');
      console.log('[App] firing complete-onboarding:', { pending: pending ? JSON.parse(pending) : null });
      invoke('complete-onboarding', {
        pendingData: pending ? JSON.parse(pending) : null,
      })
        .then(() => {
          console.log('[App] complete-onboarding .then()');
          localStorage.removeItem('pendingOnboardingData');
        })
        .catch((err) => {
          console.log('[App] complete-onboarding .catch():', err);
        })
        .finally(() => {
          checkEntitlement();
          setCurrentView('HOME');
        });
    } else if (!isSignedIn) {
      hadFiredOnboarding.current = false;
    }
  }, [isSignedIn, isLoaded, invoke, checkEntitlement, setCurrentView]);

  const [modalDate, setModalDate] = useState<string>(formatDateToISO(new Date()));
  const [isLogModalOpen, setIsLogModalOpen] = useState<boolean>(false);
  const [isDirectoryOpen, setIsDirectoryOpen] = useState<boolean>(false);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [showOfflineAlert, setShowOfflineAlert] = useState<boolean>(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineAlert(false);
    };
    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineAlert(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setIsOnline(false);
      setShowOfflineAlert(true);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const openLogForDate = (dateStr: string) => {
    setModalDate(dateStr);
    setIsLogModalOpen(true);
  };

  const openLogForToday = () => {
    setModalDate(formatDateToISO(new Date()));
    setIsLogModalOpen(true);
  };

  // If passcode is enabled and locked, display passcode screen
  if (settings.isPasscodeEnabled && isLocked) {
    return (
      <MobileAppShell
        currentView={currentView}
        onNavigate={(view) => setCurrentView(view)}
        onOpenLogModal={openLogForToday}
        onOpenDirectory={() => setIsDirectoryOpen(true)}
        cycleInfo={currentCycle}
        settings={settings}
      >
        <PasscodeLockScreen
          onBack={() => {}}
          isEnforcingLock={true}
          onUnlocked={() => setIsLocked(false)}
        />
      </MobileAppShell>
    );
  }

  const renderCurrentView = () => {
    switch (effectiveView) {
      case 'HOME':
        return (
          <HarmonizedForecastHomeScreen
            onNavigate={(view) => setCurrentView(view)}
            onOpenLogModal={openLogForToday}
          />
        );

      case 'CLASSIC_HOME':
        return (
          <HomeScreen
            onNavigate={(view) => setCurrentView(view)}
            onOpenLogModal={openLogForToday}
          />
        );

      case 'CALENDAR':
        return (
          <HarmonizedCalendarScreen
            onNavigate={(v) => setCurrentView(v)}
            onOpenLogModal={(dStr) => openLogForDate(dStr)}
          />
        );

      case 'INSIGHTS':
        return (
          <ModernizedInsightsScreen
            onNavigate={(view) => setCurrentView(view)}
          />
        );

      case 'CLASSIC_INSIGHTS':
        return (
          <InsightsScreen
            onNavigate={(view) => setCurrentView(view)}
          />
        );

      case 'PROFILE':
        return (
          <ModernizedProfileScreen
            onNavigate={(view) => setCurrentView(view)}
            onOpenDirectory={() => setIsDirectoryOpen(true)}
          />
        );

      case 'CLASSIC_PROFILE':
        return (
          <ProfileScreen
            onNavigate={(view) => setCurrentView(view)}
          />
        );

      case 'BBT_LOG':
        return (
          <BbtLogScreen
            onBack={() => setCurrentView('HOME')}
          />
        );

      case 'BIRTH_CONTROL':
        return (
          <BirthControlScreen
            onBack={() => setCurrentView('PROFILE')}
          />
        );

      case 'PARTNER_SYNC':
        return (
          <PartnerSyncScreen
            onBack={() => setCurrentView('PROFILE')}
            onNavigate={(view) => setCurrentView(view)}
          />
        );

      case 'PASSCODE_LOCK':
        return (
          <PasscodeLockScreen
            onBack={() => setCurrentView('PROFILE')}
            isEnforcingLock={false}
          />
        );

      case 'PREMIUM':
        return (
          <PremiumSubscriptionScreen
            onBack={() => setCurrentView('PROFILE')}
          />
        );

      case 'APPOINTMENT_DETAIL':
        return (
          <AppointmentDetailScreen
            onBack={() => setCurrentView('INSIGHTS')}
            onNavigateToCareTeam={() => setCurrentView('DOCTORS_CARE_TEAM')}
          />
        );

      case 'DOCTORS_CARE_TEAM':
        return (
          <DoctorsCareTeamScreen
            onBack={() => setCurrentView('INSIGHTS')}
            onSelectDoctorAppointment={() => setCurrentView('APPOINTMENT_DETAIL')}
          />
        );

      case 'EMERGENCY_HELP':
        return (
          <EmergencyHelpScreen
            onBack={() => setCurrentView('PROFILE')}
            onOpenHealthProfile={() => setCurrentView('HEALTH_PROFILE')}
          />
        );

      case 'EXPORT_HEALTH_REPORT':
        return (
          <ExportHealthReportScreen
            onBack={() => setCurrentView('PROFILE')}
            onNavigateToProfile={() => setCurrentView('PROFILE')}
            onExportSuccess={() => setCurrentView('EXPORT_SUCCESS')}
            onNavigateToPremium={() => setCurrentView('TRIAL_PAYWALL')}
          />
        );

      case 'EXPORT_SUCCESS':
        return (
          <ExportSuccessScreen
            onDone={() => setCurrentView('PROFILE')}
          />
        );

      case 'FERTILITY_DETAIL':
        return (
          <FertilityDetailScreen
            onBack={() => setCurrentView('CALENDAR')}
            onNavigateToCalendar={() => setCurrentView('CALENDAR')}
            onNavigateToBBT={() => setCurrentView('BBT_LOG')}
          />
        );

      case 'CONNECTED_DEVICES':
        return (
          <ConnectedDevicesScreen
            onBack={() => setCurrentView('PROFILE')}
            onNavigate={(view) => setCurrentView(view)}
          />
        );

      case 'CYCLE_AI_ASSISTANT':
        return (
          <CycleSyncedFitnessScreen
            onBack={() => setCurrentView('PROFILE')}
            onNavigate={(view) => setCurrentView(view)}
          />
        );

      case 'CYCLE_SYNCED_FITNESS':
        return (
          <CycleSyncedFitnessScreen
            onBack={() => setCurrentView('PROFILE')}
            onNavigate={(view) => setCurrentView(view)}
          />
        );

      case 'HARMONIZED_DASHBOARD':
        return (
          <HarmonizedDashboardScreen
            onNavigate={(v) => setCurrentView(v)}
            onOpenLogModal={openLogForToday}
          />
        );

      case 'HARMONIZED_HOME':
        return (
          <HarmonizedHomeScreen
            onNavigate={(v) => setCurrentView(v)}
            onOpenLogModal={openLogForToday}
          />
        );

      case 'HARMONIZED_CALENDAR':
        return (
          <HarmonizedCalendarScreen
            onNavigate={(v) => setCurrentView(v)}
            onOpenLogModal={(dStr) => openLogForDate(dStr)}
          />
        );

      case 'HARMONIZED_INSIGHTS':
        return (
          <HarmonizedInsightsScreen
            onNavigate={(v) => setCurrentView(v)}
          />
        );

      case 'CUSTOM_TAGS':
        return (
          <CustomTagsScreen
            onBack={() => setCurrentView('PROFILE')}
          />
        );

      case 'HEALTH_PROFILE':
        return (
          <HealthProfileScreen
            onBack={() => setCurrentView('PROFILE')}
            onNavigateToExportReport={() => setCurrentView('EXPORT_HEALTH_REPORT')}
            onNavigateToConnectedDevices={() => setCurrentView('CONNECTED_DEVICES')}
          />
        );

      case 'NOTIFICATIONS':
        return (
          <NotificationAlertsScreen
            onBack={() => setCurrentView('PROFILE')}
            onNavigate={(v) => setCurrentView(v)}
          />
        );

      case 'VIDEO_LIBRARY':
        return (
          <DiscoveryVideoLibraryScreen
            onBack={() => setCurrentView('INSIGHTS')}
          />
        );

      case 'LUTEAL_ARTICLE':
        return (
          <LutealNutritionArticleScreen
            onBack={() => setCurrentView('INSIGHTS')}
          />
        );

      case 'PERSONALIZED_INSIGHTS':
        return (
          <PersonalizedInsightsScreen
            onBack={() => setCurrentView('INSIGHTS')}
          />
        );

      case 'COMMUNITY':
        return (
          <CommunityGatewayScreen
            onBack={() => setCurrentView('INSIGHTS')}
            onNavigate={(v) => setCurrentView(v)}
          />
        );

      case 'CREATE_POST':
        return (
          <CreatePostScreen
            onBack={() => setCurrentView('COMMUNITY')}
          />
        );

      case 'POST_DETAIL':
        return (
          <CommunityPostDetailScreen
            onBack={() => setCurrentView('COMMUNITY')}
          />
        );

      case 'FEELING_TODAY':
        return (
          <HowAreYouFeelingScreen
            onBack={() => setCurrentView('HOME')}
          />
        );

      case 'APP_PREFERENCES':
        return (
          <AppPreferencesScreen
            onBack={() => setCurrentView('PROFILE')}
          />
        );

      case 'ONBOARDING_WELCOME':
        return (
          <EmpowerWelcomeScreen
            onNext={() => setCurrentView('ONBOARDING_UNDERSTOOD')}
          />
        );

      case 'ONBOARDING_UNDERSTOOD':
        return (
          <YourCycleUnderstoodScreen
            onNext={() => setCurrentView('ONBOARDING_TRACK_EASE')}
            onBack={() => setCurrentView('ONBOARDING_WELCOME')}
          />
        );

      case 'ONBOARDING_TRACK_EASE':
        return (
          <TrackWithEaseScreen
            onNext={() => setCurrentView('ONBOARDING_SUCCESS')}
            onBack={() => setCurrentView('ONBOARDING_UNDERSTOOD')}
          />
        );

      case 'ONBOARDING_SUCCESS':
        return (
          <OnboardingSuccessScreen
            onFinish={() => setCurrentView('HOME')}
          />
        );

      case 'LOGIN_GATEWAY':
        return (
          <LoginGatewayScreen
            onSuccess={() => setCurrentView('HOME')}
            onNavigate={(view) => setCurrentView(view)}
          />
        );

      case 'MEDICATION_TRACKER':
        return (
          <ModernizedMedicationTrackerScreen
            onBack={() => setCurrentView('HOME')}
            onNavigate={(view) => setCurrentView(view)}
          />
        );

      case 'HYDRATION_TRACKER':
        return (
          <ModernizedHydrationTrackerScreen
            onBack={() => setCurrentView('HOME')}
            onNavigate={(view) => setCurrentView(view)}
          />
        );

      case 'MEDICATION_HISTORY':
        return (
          <ModernizedMedicationHistoryScreen
            onBack={() => setCurrentView('MEDICATION_TRACKER')}
            onNavigate={(view) => setCurrentView(view)}
          />
        );

      case 'WELLNESS_REMINDERS_PERMISSION':
        return (
          <ModernizedWellnessPermissionScreen
            onBack={() => setCurrentView('HOME')}
            onNavigate={(view) => setCurrentView(view)}
          />
        );

      case 'MUCUS_LOG':
        return (
          <ModernizedMucusLogScreen
            onBack={() => setCurrentView('CALENDAR')}
            onNavigate={(view) => setCurrentView(view)}
          />
        );

      case 'NUTRITION_CYCLE':
        return (
          <ModernizedNutritionCategoryScreen
            onBack={() => setCurrentView('INSIGHTS')}
            onNavigate={(view) => setCurrentView(view)}
          />
        );

      case 'PARTNER_SYNC_DETAILS':
        return (
          <ModernizedPartnerSyncDetailsScreen
            onBack={() => setCurrentView('PROFILE')}
            onNavigate={(view) => setCurrentView(view)}
          />
        );

      case 'PHYSICAL_ACTIVITY':
        return (
          <ModernizedPhysicalActivityScreen
            onBack={() => setCurrentView('HOME')}
            onNavigate={(view) => setCurrentView(view)}
          />
        );

      case 'PREGNANCY_MODE':
        return (
          <ModernizedPregnancyModeScreen
            onBack={() => setCurrentView('PROFILE')}
            onNavigate={(view) => setCurrentView(view)}
          />
        );

      case 'DATA_PRIVACY_SECURITY':
        return (
          <ModernizedPrivacySecurityScreen
            onBack={() => setCurrentView('PROFILE')}
            onNavigate={(view) => setCurrentView(view)}
          />
        );

      case 'SEARCH_HUB':
        return (
          <ModernizedSearchScreen
            onBack={() => setCurrentView('HOME')}
            onNavigate={(view) => setCurrentView(view)}
          />
        );

      case 'SYMPTOM_HISTORY':
        return (
          <ModernizedSymptomHistoryScreen
            onBack={() => setCurrentView('CALENDAR')}
            onNavigate={(view) => setCurrentView(view)}
          />
        );

      case 'SLEEP_INSIGHTS':
        return (
          <ModernizedSleepInsightsScreen
            onBack={() => setCurrentView('INSIGHTS')}
            onNavigate={(view) => setCurrentView(view)}
          />
        );

      case 'SUPPLEMENT_TRACKER':
        return (
          <ModernizedSupplementTrackerScreen
            onBack={() => setCurrentView('HOME')}
            onNavigate={(view) => setCurrentView(view)}
          />
        );

      case 'SUPPORT_FAQ':
        return (
          <ModernizedSupportFaqScreen
            onBack={() => setCurrentView('PROFILE')}
            onNavigate={(view) => setCurrentView(view)}
          />
        );

      case 'BODY_METRICS':
        return (
          <ModernizedBodyMetricsScreen
            onBack={() => setCurrentView('INSIGHTS')}
            onNavigate={(view) => setCurrentView(view)}
          />
        );

      case 'SYMPTOM_INTENSITY_LOG':
        return (
          <ModernizedSymptomIntensityLogScreen
            onBack={() => setCurrentView('CALENDAR')}
            onNavigate={(view) => setCurrentView(view)}
          />
        );

      case 'DELETE_ACCOUNT':
        return (
          <ModernizedDeleteAccountScreen
            onBack={() => setCurrentView('DATA_PRIVACY_SECURITY')}
            onNavigate={(view) => setCurrentView(view)}
            onAccountDeleted={() => setCurrentView('ONBOARDING_WELCOME')}
          />
        );

      case 'TERMS_OF_SERVICE':
        return <TermsOfServiceScreen />;

      case 'PRIVACY_POLICY':
        return <PrivacyPolicyScreen />;


      case 'FORGOT_PASSWORD':
        return (
          <ModernizedForgotPasswordScreen
            onBack={() => setCurrentView('LOGIN_GATEWAY')}
            onNavigate={(view) => setCurrentView(view)}
          />
        );

      case 'EDIT_PROFILE':
        return (
          <ModernizedEditProfileScreen
            onBack={() => setCurrentView('PROFILE')}
            onNavigate={(view) => setCurrentView(view)}
          />
        );

      case 'NOTIFICATION_INBOX':
        return (
          <ModernizedNotificationInboxScreen
            onBack={() => setCurrentView('HOME')}
            onNavigate={(view) => setCurrentView(view)}
          />
        );

      case 'OFFLINE_SYNC':
        return (
          <ModernizedOfflineStateScreen
            onBack={() => setCurrentView('HOME')}
            onNavigate={(view) => setCurrentView(view)}
          />
        );

      case 'NOT_FOUND_404':
        return (
          <ModernizedNotFoundScreen
            onBack={() => setCurrentView('HOME')}
            onNavigate={(view) => setCurrentView(view)}
          />
        );

      case 'TRIAL_PAYWALL':
        return (
          <ModernizedTrialPaywallScreen
            onBack={() => setCurrentView('HOME')}
            onNavigate={(view) => setCurrentView(view)}
          />
        );

      case 'MANAGE_BILLING':
        return (
          <ModernizedBillingReceiptsScreen
            onBack={() => setCurrentView('PROFILE')}
            onNavigate={(view) => setCurrentView(view)}
          />
        );

      case 'APP_REVIEW':
        return (
          <ModernizedAppReviewScreen
            onBack={() => setCurrentView('PROFILE')}
            onNavigate={(view) => setCurrentView(view)}
          />
        );

      case 'WHATS_NEW':
        return (
          <ModernizedWhatsNewScreen
            onBack={() => setCurrentView('HOME')}
            onNavigate={(view) => setCurrentView(view)}
          />
        );

      case 'TERMS_CLINICAL_DISCLAIMER':
        return (
          <ModernizedLegalDisclaimerScreen
            onBack={() => setCurrentView('PROFILE')}
            onNavigate={(view) => setCurrentView(view)}
          />
        );

      case 'FOCUS_ENERGY_TRACKER':
        return (
          <FocusEnergyTrackerScreen
            onBack={() => setCurrentView('HOME')}
          />
        );

      case 'PHYSICAL_COMFORT_TRACKER':
        return (
          <PhysicalComfortTrackerScreen
            onBack={() => setCurrentView('HOME')}
          />
        );

      case 'INITIAL_BASELINE_SETUP':
        return (
          <InitialBaselineSetupScreen
            onBack={() => setCurrentView('PROFILE')}
            onComplete={() => setCurrentView('LOGIN_GATEWAY')}
          />
        );

      case 'KOTLIN_ANDROID_CODE':
        return (
          <KotlinAndroidCodeViewerScreen
            onBack={() => setCurrentView('PROFILE')}
          />
        );

      default:
        return (
          <ModernizedNotFoundScreen
            onBack={() => setCurrentView('HOME')}
            onNavigate={(view) => setCurrentView(view)}
          />
        );
    }
  };

  return (
    <MobileAppShell
      currentView={effectiveView}
      onNavigate={(view) => setCurrentView(view)}
      onOpenLogModal={openLogForToday}
      onOpenDirectory={() => setIsDirectoryOpen(true)}
      cycleInfo={currentCycle}
      settings={settings}
    >
      <main className="w-full min-h-full bg-[#FAF7F2] text-[#20171D] relative font-sans selection:bg-[#EBD7D9] selection:text-[#523446]">
        {/* Network offline alert banner */}
        <AnimatePresence>
          {showOfflineAlert && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-[#3D2534] text-white px-4 py-2.5 text-xs flex items-center justify-between shadow-md z-30 sticky top-0 border-b border-[#523446]"
            >
              <div className="flex items-center gap-2 pr-2">
                <WifiOff size={15} className="text-amber-300 shrink-0" />
                <span className="font-medium text-[11.5px] leading-tight">
                  Internet cut out • Secure offline mode active
                </span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setCurrentView('NOT_FOUND_404')}
                  className="px-2.5 py-1 bg-white/20 hover:bg-white/30 text-white rounded-full text-[11px] font-semibold whitespace-nowrap transition-colors"
                >
                  View 404 / Offline
                </button>
                <button
                  type="button"
                  onClick={() => setShowOfflineAlert(false)}
                  className="w-6 h-6 flex items-center justify-center hover:bg-white/20 rounded-full text-white/80"
                  aria-label="Dismiss offline banner"
                >
                  ✕
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {renderCurrentView()}

        {/* Floating Bottom Navigation Bar */}
        <BottomNavBar
          currentView={effectiveView}
          onSelectView={(v) => setCurrentView(v)}
          onOpenLogModal={openLogForToday}
        />

        {/* Global Log Entry Bottom Sheet Modal */}
        <LogEntryModal
          isOpen={isLogModalOpen}
          onClose={() => setIsLogModalOpen(false)}
          dateStr={modalDate}
        />

        {/* All Screens Directory Modal */}
        <ScreenDirectoryModal
          isOpen={isDirectoryOpen}
          onClose={() => setIsDirectoryOpen(false)}
          onSelectView={(v) => setCurrentView(v)}
          currentView={effectiveView}
        />
      </main>
    </MobileAppShell>
  );
};

export default function App() {
  return (
    <CycleProvider>
      <MainAppContent />
    </CycleProvider>
  );
}

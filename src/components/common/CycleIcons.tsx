import React from 'react';

interface IconProps {
  size?: number;
  className?: string;
  color?: string;
}

export const PeriodDropIcon: React.FC<IconProps> = ({ size = 24, className = '', color = '#A84357' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path
      d="M12 2.5C12 2.5 5 11 5 15.5C5 19.0899 8.13401 22 12 22C15.866 22 19 19.0899 19 15.5C19 11 12 2.5 12 2.5Z"
      fill={color}
    />
    <path
      d="M10 13C10 13 8 15.5 8 17C8 18.1046 8.89543 19 10 19"
      stroke="white"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeOpacity="0.6"
    />
  </svg>
);

export const OvulationPhaseIcon: React.FC<IconProps> = ({ size = 24, className = '', color = '#D9822B' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="12" r="5" fill={color} />
    <circle cx="12" cy="12" r="8.5" stroke={color} strokeWidth="1.5" strokeDasharray="3 3" />
    <circle cx="12" cy="4" r="1.5" fill={color} />
    <circle cx="20" cy="12" r="1.5" fill={color} />
    <circle cx="12" cy="20" r="1.5" fill={color} />
    <circle cx="4" cy="12" r="1.5" fill={color} />
  </svg>
);

export const WellnessLotusIcon: React.FC<IconProps> = ({ size = 24, className = '', color = '#5C8A70' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path
      d="M12 3C12 3 14.5 8.5 14.5 13C14.5 16 13.5 19 12 20C10.5 19 9.5 16 9.5 13C9.5 8.5 12 3 12 3Z"
      fill={color}
    />
    <path
      d="M12 13C13.5 9 19 8.5 21 11C23 13.5 20.5 18 16 18C14 18 12.5 15.5 12 13Z"
      fill={color}
      fillOpacity="0.75"
    />
    <path
      d="M12 13C10.5 9 5 8.5 3 11C1 13.5 3.5 18 8 18C10 18 11.5 15.5 12 13Z"
      fill={color}
      fillOpacity="0.75"
    />
  </svg>
);

export const PregnancySilhouetteIcon: React.FC<IconProps> = ({ size = 24, className = '', color = '#BA6881' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="5" r="2.5" fill={color} />
    <path
      d="M9 10C10.5 10 11 11 11 12C11 13 13.5 13.5 14.5 15.5C15.5 17.5 14.5 20 12.5 20.5C10.5 21 9 19.5 9 17L9 10Z"
      fill={color}
    />
    <path
      d="M13 15C13.5 15 14 15.5 14 16.5C14 17.5 13 18 12 18"
      stroke="white"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeOpacity="0.7"
    />
  </svg>
);

export const GoldCheckIcon: React.FC<IconProps> = ({ size = 24, className = '', color = '#BCA188' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="1.8" />
    <path
      d="M7.5 12L10.5 15.5L16.5 8.5"
      stroke={color}
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const FaceIdIcon: React.FC<IconProps> = ({ size = 28, className = '', color = '#7D9688' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M4 8V5C4 4.44772 4.44772 4 5 4H8" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <path d="M16 4H19C19.5523 4 20 4.44772 20 5V8" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <path d="M20 16V19C20 19.5523 19.5523 20 19 20H16" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <path d="M8 20H5C4.44772 20 4 19.5523 4 19V16" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <circle cx="9" cy="9.5" r="1.2" fill={color} />
    <circle cx="15" cy="9.5" r="1.2" fill={color} />
    <path d="M12 11.5V13.5H11" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9 16C10 17 14 17 15 16" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const GoogleLogoIcon: React.FC<IconProps> = ({ size = 20, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);

export const AppleLogoIcon: React.FC<IconProps> = ({ size = 20, className = '', color = '#000000' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} className={className}>
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.87c.65-.79 1.1-1.89.98-2.99-.95.04-2.1.63-2.77 1.42-.59.68-1.12 1.79-.98 2.87 1.06.08 2.13-.53 2.77-1.3" />
  </svg>
);

export const OutlinedFlowerSunIcon: React.FC<IconProps> = ({ size = 24, className = '', color = '#FFFFFF' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" className={className}>
    <circle cx="12" cy="12" r="3.5" />
    <path d="M12 2V5M12 19V22M2 12H5M19 12H22M4.93 4.93L7.05 7.05M16.95 16.95L19.07 19.07M4.93 19.07L7.05 16.95M16.95 7.05L19.07 4.93" strokeLinecap="round" />
  </svg>
);

export const OutlinedPregnancyIcon: React.FC<IconProps> = ({ size = 24, className = '', color = '#FFFFFF' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" className={className}>
    <circle cx="12" cy="5" r="2.2" />
    <path d="M9 10C10.5 10 11 11 11 12C11 13 13.5 13.5 14.5 15.5C15.5 17.5 14.5 20 12.5 20.5C10.5 21 9 19.5 9 17L9 10Z" />
  </svg>
);

export const OutlinedHealthInsightsIcon: React.FC<IconProps> = ({ size = 24, className = '', color = '#FFFFFF' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" className={className}>
    <path d="M3 12H7L10 4L14 20L17 12H21" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const WelcomeLinearDropIcon: React.FC<IconProps> = ({ size = 24, className = '', color = '#FFFFFF' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" className={className}>
    <path d="M12 2.5C12 2.5 5 11 5 15.5C5 19.0899 8.13401 22 12 22C15.866 22 19 19.0899 19 15.5C19 11 12 2.5 12 2.5Z" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const UterusReproductiveIcon: React.FC<IconProps> = ({ size = 24, className = '', color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className}>
    {/* Stylized Uterus with Fallopian Tubes and Ovaries */}
    <path d="M12 11c-2.5 0-4.5 2-4.5 5 0 2.5 2 4.5 4.5 4.5s4.5-2 4.5-4.5c0-3-2-5-4.5-5z" />
    <path d="M7.5 12C6 10 4 8 2.5 8c-1 0-1.5.5-1.5 1.5 0 1.5 1 2.5 2.5 3 2 .8 4 1 4 1" />
    <path d="M16.5 12c1.5-2 3.5-4 5-4 1 0 1.5.5 1.5 1.5 0 1.5-1 2.5-2.5 3-2 .8-4 1-4 1" />
    <circle cx="2" cy="8" r="1.5" />
    <circle cx="22" cy="8" r="1.5" />
  </svg>
);

export const SeatedMeditationIcon: React.FC<IconProps> = ({ size = 24, className = '', color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className}>
    {/* Seated meditating yogi outline */}
    <circle cx="12" cy="5" r="2.5" />
    <path d="M12 8v5" />
    <path d="M8 11.5l4 2 4-2" />
    <path d="M6 18c1-2 3-3.5 6-3.5s5 1.5 6 3.5" />
    <path d="M4 19.5c1-1 3-1.5 5-1.5h6c2 0 4 .5 5 1.5" />
  </svg>
);


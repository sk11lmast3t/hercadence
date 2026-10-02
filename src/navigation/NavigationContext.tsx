import React, { createContext, useContext, useState } from 'react';
import { AppView } from '../types';

interface NavigationContextType {
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const NavigationProvider: React.FC<{
  children: React.ReactNode;
  initialView?: AppView;
}> = ({ children, initialView = 'HOME' }) => {
  const [currentView, setCurrentView] = useState<AppView>(initialView);

  return (
    <NavigationContext.Provider value={{ currentView, setCurrentView }}>
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};

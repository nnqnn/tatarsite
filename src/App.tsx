import React, { useState } from 'react';
import Onboarding from './components/Onboarding';
import MainScreen from './components/MainScreen';
import RouteBuilder from './components/RouteBuilder';
import EventsCalendar from './components/EventsCalendar';
import MarketPlace from './components/MarketPlace';
import UserProfile from './components/UserProfile';

type Screen = 'onboarding' | 'main' | 'route-builder' | 'events' | 'market' | 'profile';

interface UserProfile {
  name: string;
  interests: string[];
  language: string;
}

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('onboarding');
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: 'Егор',
    interests: ['culture', 'food'],
    language: 'ru'
  });

  const handleOnboardingComplete = (data: { interests: string[]; language: string }) => {
    setUserProfile(prev => ({
      ...prev,
      interests: data.interests,
      language: data.language
    }));
    setCurrentScreen('main');
  };

  const navigateToScreen = (screen: Screen) => {
    setCurrentScreen(screen);
  };

  const goBackToMain = () => {
    setCurrentScreen('main');
  };

  return (
    <div className="min-h-screen bg-background">
      {currentScreen === 'onboarding' && (
        <Onboarding onComplete={handleOnboardingComplete} />
      )}
      
      {currentScreen === 'main' && (
        <MainScreen 
          userProfile={userProfile}
          onNavigate={navigateToScreen}
        />
      )}
      
      {currentScreen === 'route-builder' && (
        <RouteBuilder 
          userProfile={userProfile}
          onBack={goBackToMain}
        />
      )}
      
      {currentScreen === 'events' && (
        <EventsCalendar 
          onBack={goBackToMain}
          userInterests={userProfile.interests}
        />
      )}
      
      {currentScreen === 'market' && (
        <MarketPlace 
          onBack={goBackToMain}
        />
      )}
      
      {currentScreen === 'profile' && (
        <UserProfile 
          userProfile={userProfile}
          onBack={goBackToMain}
        />
      )}
    </div>
  );
}
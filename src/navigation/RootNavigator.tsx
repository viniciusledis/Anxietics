import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import { SplashScreen } from '../screens/auth/SplashScreen';
import { AppNavigator } from './AppNavigator';

type PublicScreen = 'login' | 'register';

export function RootNavigator() {
  const { loading, session } = useAuth();
  const [publicScreen, setPublicScreen] = useState<PublicScreen>('login');

  useEffect(() => {
    if (!session) setPublicScreen('login');
  }, [session]);

  const showLogin = useCallback(() => setPublicScreen('login'), []);
  const showRegister = useCallback(() => setPublicScreen('register'), []);

  if (loading) return <SplashScreen />;
  if (session) return <AppNavigator />;
  if (publicScreen === 'register')
    return <RegisterScreen onLogin={showLogin} />;
  return <LoginScreen onRegister={showRegister} />;
}

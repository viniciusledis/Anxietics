import type { Session, User } from '@supabase/supabase-js';
import {
  createContext,
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { AppState, Platform } from 'react-native';
import { authErrorMessage } from '../auth/errors';
import { normalizeEmail } from '../auth/validation';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

export type AuthActionResult = { error: string | null };
export type SignUpResult = AuthActionResult & {
  needsEmailConfirmation: boolean;
};

export type AuthContextValue = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  initializationError: string | null;
  signIn(email: string, password: string): Promise<AuthActionResult>;
  signUp(name: string, email: string, password: string): Promise<SignUpResult>;
  signOut(): Promise<AuthActionResult>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

const missingConfigurationMessage =
  'Configure EXPO_PUBLIC_SUPABASE_URL e EXPO_PUBLIC_SUPABASE_ANON_KEY para acessar sua conta.';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [initializationError, setInitializationError] = useState<string | null>(
    null,
  );
  const signInRequest = useRef<Promise<AuthActionResult> | null>(null);
  const signUpRequest = useRef<Promise<SignUpResult> | null>(null);
  const signOutRequest = useRef<Promise<AuthActionResult> | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setInitializationError(missingConfigurationMessage);
      setLoading(false);
      return;
    }

    let mounted = true;
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!mounted) return;
      setSession(nextSession);
      setInitializationError(null);
      setLoading(false);
    });

    void (async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (!mounted) return;
        if (error) {
          setInitializationError(authErrorMessage(error, 'initialize'));
          setSession(null);
        } else {
          setInitializationError(null);
          setSession(data.session);
        }
      } catch (error) {
        if (!mounted) return;
        setInitializationError(
          authErrorMessage(error as Error, 'initialize'),
        );
        setSession(null);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    let appStateSubscription: { remove(): void } | undefined;
    if (Platform.OS !== 'web') {
      if (AppState.currentState === 'active') supabase.auth.startAutoRefresh();
      else supabase.auth.stopAutoRefresh();

      appStateSubscription = AppState.addEventListener('change', (state) => {
        if (state === 'active') supabase.auth.startAutoRefresh();
        else supabase.auth.stopAutoRefresh();
      });
    }

    return () => {
      mounted = false;
      subscription.unsubscribe();
      appStateSubscription?.remove();
      if (Platform.OS !== 'web') supabase.auth.stopAutoRefresh();
    };
  }, []);

  const signIn = useCallback((email: string, password: string) => {
    if (signInRequest.current) return signInRequest.current;
    if (!isSupabaseConfigured)
      return Promise.resolve({ error: missingConfigurationMessage });

    const request = supabase.auth
      .signInWithPassword({ email: normalizeEmail(email), password })
      .then(({ error }) => ({
        error: error ? authErrorMessage(error, 'signIn') : null,
      }))
      .catch((error: unknown) => ({
        error: authErrorMessage(error as Error, 'signIn'),
      }))
      .finally(() => {
        signInRequest.current = null;
      });
    signInRequest.current = request;
    return request;
  }, []);

  const signUp = useCallback(
    (name: string, email: string, password: string) => {
      if (signUpRequest.current) return signUpRequest.current;
      if (!isSupabaseConfigured)
        return Promise.resolve({
          error: missingConfigurationMessage,
          needsEmailConfirmation: false,
        });

      const request = supabase.auth
        .signUp({
          email: normalizeEmail(email),
          password,
          options: { data: { name: name.trim() } },
        })
        .then(({ data, error }) => {
          if (error)
            return {
              error: authErrorMessage(error, 'signUp'),
              needsEmailConfirmation: false,
            };

          // Com confirmação ativa, o Supabase pode ofuscar um e-mail já usado.
          if (data.user && data.user.identities?.length === 0) {
            return {
              error:
                'Não foi possível criar a conta com este e-mail. Entre ou use outro endereço.',
              needsEmailConfirmation: false,
            };
          }

          if (!data.user) {
            return {
              error: 'Não foi possível criar sua conta agora. Tente novamente.',
              needsEmailConfirmation: false,
            };
          }

          return {
            error: null,
            needsEmailConfirmation: Boolean(data.user && !data.session),
          };
        })
        .catch((error: unknown) => ({
          error: authErrorMessage(error as Error, 'signUp'),
          needsEmailConfirmation: false,
        }))
        .finally(() => {
          signUpRequest.current = null;
        });
      signUpRequest.current = request;
      return request;
    },
    [],
  );

  const signOut = useCallback(() => {
    if (signOutRequest.current) return signOutRequest.current;
    if (!isSupabaseConfigured)
      return Promise.resolve({ error: missingConfigurationMessage });

    const request = supabase.auth
      .signOut()
      .then(({ error }) => ({
        error: error ? authErrorMessage(error, 'signOut') : null,
      }))
      .catch((error: unknown) => ({
        error: authErrorMessage(error as Error, 'signOut'),
      }))
      .finally(() => {
        signOutRequest.current = null;
      });
    signOutRequest.current = request;
    return request;
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user: session?.user ?? null,
        session,
        loading,
        initializationError,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useSignalStore } from '../store/signalStore';
import { AuthService } from '../services/authService';
import { supabase } from '../config/supabase';

export const useAuth = () => {
  const { setUser, clearUser } = useAuthStore();
  const { initialize, cleanup } = useSignalStore();

  useEffect(() => {
    let authSubscription: { unsubscribe: () => void } | null = null;

    const initializeAuth = async () => {
      try {
        // Check initial session
        const user = await AuthService.getCurrentSession();
        if (user) {
          setUser(user);
          await initialize();
        } else {
          clearUser();
          cleanup();
        }

        // Subscribe to auth changes
        const { data } = supabase.auth.onAuthStateChange(async (event) => {
          if (event === 'SIGNED_IN') {
            const user = await AuthService.getCurrentSession();
            if (user) {
              setUser(user);
              await initialize();
            }
          } else if (event === 'SIGNED_OUT') {
            clearUser();
            cleanup();
          }
        });

        authSubscription = data.subscription;
      } catch (error) {
        console.error('Error initializing auth:', error);
        clearUser();
        cleanup();
      }
    };

    initializeAuth();

    return () => {
      if (authSubscription?.unsubscribe) {
        authSubscription.unsubscribe();
      }
      cleanup();
    };
  }, [setUser, clearUser, initialize, cleanup]);

  return useAuthStore.getState();
};
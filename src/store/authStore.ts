import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, LoginCredentials } from '../types/auth';
import { AuthService } from '../services/authService';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUsername: (username: string) => Promise<boolean>;
  setUser: (user: User) => void;
  clearUser: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,

      setUser: (user: User) => {
        set({ user, isAuthenticated: true });
      },

      clearUser: () => {
        set({ user: null, isAuthenticated: false });
      },

      login: async (credentials: LoginCredentials) => {
        const result = await AuthService.signIn(credentials);
        if (result.success && result.user) {
          set({ user: result.user, isAuthenticated: true });
          return true;
        }
        return false;
      },

      logout: async () => {
        await AuthService.signOut();
        set({ user: null, isAuthenticated: false });
      },

      updateUsername: async (username: string) => {
        const user = get().user;
        if (!user) return false;

        const result = await AuthService.updateUsername(user.id, username);
        if (result.success && result.user) {
          set({ user: result.user });
          return true;
        }
        return false;
      }
    }),
    {
      name: 'auth-storage',
      version: 1
    }
  )
);
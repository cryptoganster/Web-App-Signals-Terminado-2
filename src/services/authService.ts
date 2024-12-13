import { supabase } from '../config/supabase';
import { AuthResponse, LoginCredentials, User } from '../types/auth';

export class AuthService {
  static async signIn({ email, password }: LoginCredentials): Promise<AuthResponse> {
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError) throw authError;

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', authData.user.id)
        .single();

      if (profileError) throw profileError;

      return {
        success: true,
        user: {
          id: authData.user.id,
          username: profileData.username || authData.user.email!.split('@')[0]
        }
      };
    } catch (error) {
      console.error('Error signing in:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Invalid credentials'
      };
    }
  }

  static async signOut(): Promise<void> {
    await supabase.auth.signOut();
  }

  static async getCurrentSession(): Promise<User | null> {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) return null;

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', session.user.id)
        .single();

      if (profileError) throw profileError;

      return {
        id: session.user.id,
        username: profile.username || session.user.email!.split('@')[0]
      };
    } catch (error) {
      console.error('Error getting current session:', error);
      return null;
    }
  }

  static async updateUsername(userId: string, username: string): Promise<AuthResponse> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ username })
        .eq('id', userId);

      if (error) throw error;

      return {
        success: true,
        user: { id: userId, username }
      };
    } catch (error) {
      console.error('Error updating username:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error updating username'
      };
    }
  }
}
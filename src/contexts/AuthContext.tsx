import React, { createContext, useContext, useState, useEffect, useRef, useCallback, ReactNode } from 'react';
import { User, UserRole } from '../types';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { sendRoleNotification } from '../lib/notifications';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role?: UserRole) => Promise<void>;
  register: (email: string, password: string, name: string, role: UserRole, phone: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  loading: boolean;
  getAccessibleClinics: () => string[];
  isMultiClinicOwner: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);
  const fetchingRef = useRef(false); // Prevent concurrent fetchProfile calls

  // Build user object from profile DB row
  const buildUserFromProfile = (data: any, email: string): User => ({
    id: data.id,
    email: data.email || email,
    name: data.full_name || email.split('@')[0],
    role: data.role as UserRole,
    phone: data.phone || '',
    avatar: data.avatar_url || ''
  });

  // Build user from auth metadata (fallback)
  const buildUserFromMeta = (userId: string, email: string, meta?: any): User => ({
    id: userId,
    email: email,
    name: meta?.full_name || email.split('@')[0],
    role: (meta?.role as UserRole) || null,
    phone: meta?.phone || '',
    avatar: ''
  });

  const fetchProfile = useCallback(async (userId: string, email: string) => {
    // Prevent concurrent fetches (race between login + onAuthStateChange)
    if (fetchingRef.current) return;
    fetchingRef.current = true;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, full_name, role, phone, avatar_url')
        .eq('id', userId)
        .single();

      if (!mountedRef.current) return;

      if (!error && data) {
        setUser(buildUserFromProfile(data, email));
      } else {
        // Profile query failed or no row → fallback to auth metadata
        if (error && !error.message?.includes('AbortError')) {
          console.warn('[Auth] Profile fetch error, using metadata fallback:', error.message);
        }
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (!mountedRef.current) return;
        setUser(buildUserFromMeta(userId, email, authUser?.user_metadata));
      }
    } catch (err: any) {
      if (err?.name === 'AbortError' || err?.message?.includes('AbortError')) return;
      console.error('[Auth] Unexpected error fetching profile:', err);
      if (mountedRef.current) {
        setUser(buildUserFromMeta(userId, email));
      }
    } finally {
      fetchingRef.current = false;
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;

    // 1. Initial Session Check
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!mountedRef.current) return;

        if (session?.user) {
          await fetchProfile(session.user.id, session.user.email!);
        } else {
          setUser(null);
          setLoading(false);
        }
      } catch (error: any) {
        if (error?.name === 'AbortError' || error?.message?.includes('AbortError')) return;
        console.error('Error checking auth session:', error);
        if (mountedRef.current) setLoading(false);
      }
    };

    initializeAuth();

    // 2. Auth State Listener — handles login/logout/token refresh
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mountedRef.current) return;

      if (session?.user) {
        // Small delay to avoid racing with initial getSession
        setTimeout(() => {
          if (mountedRef.current) {
            fetchProfile(session.user.id, session.user.email!);
          }
        }, 100);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => {
      mountedRef.current = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const login = async (email: string, password: string, _role?: UserRole) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Don't call fetchProfile here — onAuthStateChange handles it.
      // This prevents the race condition (two concurrent fetchProfile calls).
      if (data.user) {
        toast.success('تم تسجيل الدخول بنجاح');
      }
    } catch (error: any) {
      console.error('[Auth] Login error:', error);
      if (mountedRef.current) setLoading(false);
      toast.error(error.message || 'فشل تسجيل الدخول');
      throw error;
    }
  };

  const register = async (email: string, password: string, name: string, role: UserRole, phone: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            role,
            phone
          }
        }
      });

      if (error) throw error;

      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: data.user.id,
              email,
              full_name: name,
              role,
              phone
            }
          ]);

        if (profileError && !profileError.message.includes('duplicate')) {
          console.error('Error creating profile row:', profileError);
        }

        toast.success('تم إنشاء الحساب بنجاح');

        // Notify Admins about new professional accounts
        if (role === 'supplier') {
          await sendRoleNotification('admin', 'طلب انضمام مورد جديد', `قام ${name} بالتسجيل كمورد جديد بانتظار المراجعة.`, '/admin/suppliers');
        } else if (role === 'laboratory') {
          await sendRoleNotification('admin', 'طلب انضمام مختبر جديد', `قام ${name} بالتسجيل كمختبر جديد بانتظار المراجعة.`, '/admin/labs');
        }

        // onAuthStateChange will handle fetchProfile
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error(error.message || 'فشل إنشاء الحساب');
      throw error;
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      toast.success('تم تسجيل الخروج');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getAccessibleClinics = () => {
    if (user?.role === 'doctor') return [user.id];
    return [];
  };

  const isMultiClinicOwner = () => {
    return false;
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      register,
      logout,
      isAuthenticated: !!user,
      loading,
      getAccessibleClinics,
      isMultiClinicOwner
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

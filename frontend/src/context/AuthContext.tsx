'use client';

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { AuthState, AuthAction, User, initialAuthState, authReducer } from '@/lib/auth';

// ─── Context Interface ────────────────────────────────────

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<User>;
  register: (data: RegisterData) => Promise<User>;
  logout: () => Promise<void>;
}

interface RegisterData {
  name: string;
  email: string;
  phone: string;
  password: string;
}

// ─── Context ──────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ─── Provider ─────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialAuthState);
  const router = useRouter();

  // On mount: check for stored access token and restore session
  useEffect(() => {
    const restore = async () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        const storedToken = localStorage.getItem('accessToken');
        if (!storedToken) {
          // Try refreshing via httpOnly cookie
          const { data } = await api.post('/auth/refresh');
          localStorage.setItem('accessToken', data.accessToken);
        }

        // Fetch user info
        const { data } = await api.get('/auth/me');
        const token = localStorage.getItem('accessToken') || '';
        dispatch({ type: 'LOGIN', payload: { user: data.user, accessToken: token } });
      } catch {
        dispatch({ type: 'LOGOUT' });
      }
    };
    restore();
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<User> => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('accessToken', data.accessToken);
    dispatch({ type: 'LOGIN', payload: { user: data.user, accessToken: data.accessToken } });
    return data.user;
  }, []);

  const register = useCallback(async (registerData: RegisterData): Promise<User> => {
    const { data } = await api.post('/auth/register', registerData);
    localStorage.setItem('accessToken', data.accessToken);
    dispatch({ type: 'LOGIN', payload: { user: data.user, accessToken: data.accessToken } });
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // ignore errors
    } finally {
      localStorage.removeItem('accessToken');
      dispatch({ type: 'LOGOUT' });
      router.push('/auth/login');
    }
  }, [router]);

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

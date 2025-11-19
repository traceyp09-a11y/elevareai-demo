import React, { createContext, useContext, useState, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      // Demo credentials - bypass API for testing
      const demoUsers: { [key: string]: { password: string; user: User } } = {
        'admin@elevareai.com': {
          password: 'Admin123!',
          user: { id: '1', email: 'admin@elevareai.com', name: 'Admin User', role: 'admin' }
        },
        'manager@company.com': {
          password: 'Manager123!',
          user: { id: '2', email: 'manager@company.com', name: 'Manager User', role: 'manager' }
        }
      };

      // Check demo credentials first
      const demoUser = demoUsers[email.toLowerCase()];
      if (demoUser && demoUser.password === password) {
        setUser(demoUser.user);
        localStorage.setItem('authToken', 'demo-token-' + demoUser.user.id);
        return { success: true };
      }

      // Try API call for non-demo users
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return { success: false, error: errorData.message || 'Invalid email or password' };
      }

      const data = await response.json();
      setUser(data.user);
      localStorage.setItem('authToken', data.token);
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Invalid email or password' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('authToken');
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;

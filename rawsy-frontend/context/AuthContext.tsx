import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/auth.service';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import api from '../services/api';

interface User {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  role: 'manufacturer' | 'supplier' | 'admin';
  status: string;
  companyName?: string;
  profileImage?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (emailOrPhone: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const token = await authService.getToken();
      if (token) {
        const response = await api.get('/auth/me');
        const currentUser = response.data.profile;
        setUser(currentUser);
        await authService.updateStoredUser(currentUser);
      }
    } catch (error) {
      console.error('Error loading user:', error);
      await authService.clearAuth();
    } finally {
      setLoading(false);
    }
  };

  const registerDeviceToken = async () => {
    try {
      if (!Device.isDevice) {
        console.log('Push notifications only work on physical devices');
        return;
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for notifications');
        return;
      }

      let tokenData;
      try {
        tokenData = await Notifications.getExpoPushTokenAsync();
      } catch (err) {
        console.log('Could not get Expo push token, using device ID as fallback');
        const deviceId = await Device.osBuildId || 'device-' + Date.now();
        await api.post('/auth/save-device-token', { deviceToken: deviceId });
        return;
      }

      const deviceToken = tokenData.data;
      await api.post('/auth/save-device-token', { deviceToken });
      console.log('Device token registered:', deviceToken);
    } catch (error) {
      console.error('Error registering device token:', error);
    }
  };

  const login = async (emailOrPhone: string, password: string) => {
    try {
      const { user: loggedInUser } = await authService.login({ emailOrPhone, password });
      setUser(loggedInUser);
      await registerDeviceToken();
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Login failed');
    }
  };

  const register = async (data: any) => {
    try {
      const { user: registeredUser } = await authService.register(data);
      setUser(registeredUser);
      await registerDeviceToken();
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Registration failed');
    }
  };

  const refreshUser = async () => {
    try {
      const response = await api.get('/auth/me');
      const currentUser = response.data.profile;
      setUser(currentUser);
      await authService.updateStoredUser(currentUser);
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

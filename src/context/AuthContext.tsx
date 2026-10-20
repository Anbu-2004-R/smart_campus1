import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, StudentProfile, FacultyProfile } from '../types/erp';
import { INITIAL_USERS, INITIAL_STUDENT_PROFILES, INITIAL_FACULTY_PROFILES } from '../services/mockData';

interface AuthContextType {
  currentUser: User | null;
  currentRole: UserRole;
  currentStudentProfile: StudentProfile | null;
  currentFacultyProfile: FacultyProfile | null;
  switchUser: (userId: string) => void;
  login: (loginId: string, password?: string) => { success: boolean; error?: string };
  logout: () => void;
  availableUsers: User[];
  isDemoMode: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'smart_campus_auth_user_id';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    return localStorage.getItem(AUTH_STORAGE_KEY) || 'unauthenticated';
  });

  const currentUser =
    currentUserId === 'unauthenticated'
      ? null
      : INITIAL_USERS.find((u) => u.id === currentUserId) || null;

  const currentRole: UserRole = currentUser ? currentUser.role : 'STUDENT';

  const currentStudentProfile =
    currentUser?.role === 'STUDENT'
      ? INITIAL_STUDENT_PROFILES.find((s) => s.userId === currentUser.id) || INITIAL_STUDENT_PROFILES[0]
      : null;

  const currentFacultyProfile =
    currentUser?.role === 'FACULTY'
      ? INITIAL_FACULTY_PROFILES.find((f) => f.userId === currentUser.id) || INITIAL_FACULTY_PROFILES[0]
      : null;

  const switchUser = (userId: string) => {
    setCurrentUserId(userId);
    localStorage.setItem(AUTH_STORAGE_KEY, userId);
  };

  const login = (loginId: string, password?: string): { success: boolean; error?: string } => {
    const user = INITIAL_USERS.find(
      (u) =>
        u.loginId.toLowerCase() === loginId.trim().toLowerCase() ||
        u.email.toLowerCase() === loginId.trim().toLowerCase()
    );
    if (!user) {
      return { success: false, error: 'User account not found. Please verify your login ID or select a demo account.' };
    }
    if (user.status === 'INACTIVE') {
      return { success: false, error: 'Account is currently deactivated. Contact the Office of the Registrar.' };
    }

    const expectedPassword =
      user.role === 'ADMIN'
        ? 'admin123'
        : user.role === 'FACULTY'
        ? 'faculty123'
        : 'student123';

    if (password && password.trim() !== '' && password !== expectedPassword && password !== 'demo123') {
      return {
        success: false,
        error: `Invalid password. For this demo persona (${user.loginId}), use password "${expectedPassword}".`,
      };
    }

    switchUser(user.id);
    return { success: true };
  };

  const logout = () => {
    setCurrentUserId('unauthenticated');
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentRole,
        currentStudentProfile,
        currentFacultyProfile,
        switchUser,
        login,
        logout,
        availableUsers: INITIAL_USERS,
        isDemoMode: true,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

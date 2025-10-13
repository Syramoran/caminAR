import React, { createContext, useState, useContext, ReactNode } from 'react';

// Un tipo para agrupar las configuraciones de notificación
interface NotificationSettings {
  push: boolean;
  newChallenges: boolean;
  upcomingEvents: boolean;
  friendActivity: boolean;
  challengeReminders: boolean;
}

// 1. Ampliamos la "forma" de los datos para incluir todas las configuraciones
interface UserState {
  profileImage: string | null;
  setProfileImage: (image: string | null) => void;
  userName: string;
  setUserName: (name: string) => void;
  userHandle: string;
  setUserHandle: (handle: string) => void;
  age: number;
  setAge: (age: number) => void;

  profileType: 'common' | 'company';
  setProfileType: (type: 'common' | 'company') => void;
  isPrivate: boolean;
  setIsPrivate: (isPrivate: boolean) => void;
  notifications: NotificationSettings;
  setNotifications: (settings: NotificationSettings) => void;

  logout: () => void;
}

const UserContext = createContext<UserState | undefined>(undefined);

// Valores iniciales para un usuario nuevo o al cerrar sesión
const INITIAL_STATE = {
  userName: 'Invitado',
  userHandle: '@invitado',
  age: 0,
  profileImage: null,
  profileType: 'common' as const,
  isPrivate: false,
  notifications: {
    push: true,
    newChallenges: true,
    upcomingEvents: true,
    friendActivity: false,
    challengeReminders: true,
  },
};

export const UserProvider = ({ children }: { children: ReactNode }) => {
  // 2. Creamos los estados para las nuevas configuraciones
  const [profileImage, setProfileImage] = useState<string | null>(INITIAL_STATE.profileImage);
  const [userName, setUserName] = useState(INITIAL_STATE.userName);
  const [userHandle, setUserHandle] = useState(INITIAL_STATE.userHandle);
  const [age, setAge] = useState(INITIAL_STATE.age);
  const [profileType, setProfileType] = useState<'common' | 'company'>(INITIAL_STATE.profileType);
  const [isPrivate, setIsPrivate] = useState(INITIAL_STATE.isPrivate);
  const [notifications, setNotifications] = useState<NotificationSettings>(INITIAL_STATE.notifications);

  const logout = () => {
    // 3. La función de logout ahora resetea TODAS las configuraciones
    setProfileImage(INITIAL_STATE.profileImage);
    setUserName(INITIAL_STATE.userName);
    setUserHandle(INITIAL_STATE.userHandle);
    setAge(INITIAL_STATE.age);
    setProfileType(INITIAL_STATE.profileType);
    setIsPrivate(INITIAL_STATE.isPrivate);
    setNotifications(INITIAL_STATE.notifications);
  };

  const value = {
    profileImage, setProfileImage,
    userName, setUserName,
    userHandle, setUserHandle,
    age, setAge,
    profileType, setProfileType,
    isPrivate, setIsPrivate,
    notifications, setNotifications,
    logout,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser debe ser usado dentro de un UserProvider');
  }
  return context;
};


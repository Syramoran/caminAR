import React, { createContext, useState, useContext, ReactNode } from 'react';

// 1. Definimos la forma que tendrá la información del usuario en nuestro contexto.
// Esto ayuda a TypeScript a saber qué datos estamos manejando.
interface UserState {
  profileImage: string | null;
  setProfileImage: (image: string | null) => void;
  // En el futuro, podrías añadir más datos aquí:
  // userName: string;
  // points: number;
}

// 2. Creamos el Contexto. Es como crear una "caja" vacía para nuestros datos.
const UserContext = createContext<UserState | undefined>(undefined);

// 3. Creamos el "Proveedor". Este es el componente que "llena la caja" con
//    los datos y la pone a disposición de toda la aplicación.
export const UserProvider = ({ children }: { children: ReactNode }) => {
  // Aquí es donde vive realmente el estado.
  const [profileImage, setProfileImage] = useState<string | null>(null);

  // Preparamos el valor que será compartido.
  const value = {
    profileImage,
    setProfileImage,
  };

  // El .Provider hace que el "value" sea accesible para todos los componentes hijos (children).
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

// 4. Creamos un "Hook" personalizado. Esto es para no tener que escribir
//    `useContext(UserContext)` en cada archivo. Es un atajo muy útil.
export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    // Esta línea es una medida de seguridad. Si intentas usar este hook
    // fuera del UserProvider, la app te avisará con un error.
    throw new Error('useUser debe ser usado dentro de un UserProvider');
  }
  return context;
};

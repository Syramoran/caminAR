import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase'; // Asegúrate que la ruta sea correcta
import { useAuth } from './AuthContext'; // Importamos el hook de autenticación

// --- Interfaces ---

// Interfaz para los datos del perfil que vienen/van a Supabase (tabla 'usuarios')
// ESTRICTAMENTE las columnas existentes (más updated_at opcional para updates)
export interface UserProfileData {
  auth_user_id?: string; // Clave para buscar/actualizar
  usuario: string;
  nombre?: string | null;
  apellido?: string | null;
  tipo_perfil?: 'usuario' | 'organizacion';
  avatar_url?: string | null;
  updated_at?: string; // Para la función de update
  // Los campos locales (age, user_handle, is_private, notifications) NO se incluyen aquí
  // porque esta interfaz representa los datos de la DB
}


// Estado INTERNO del contexto: Incluye datos de DB y locales si se necesitan en la UI
interface UserStateInternal {
  username: string | null; // Corresponde a 'usuario' en DB
  nombre?: string | null; // Corresponde a 'nombre' en DB
  apellido?: string | null; // Corresponde a 'apellido' en DB
  profileImageUrl: string | null; // Corresponde a 'avatar_url' en DB
  profileType: 'common' | 'company' | null; // Corresponde a 'tipo_perfil' en DB
  loadingProfile: boolean;
  // Campos puramente locales (si se necesitan en algún componente vía useUser)
  userHandle: string;
  age: number;
  isPrivate: boolean;
}

// Estado EXPUESTO por el hook useUser (puede ser un subconjunto o tener mapeos)
// Eliminamos los campos que no existen en DB y no son necesarios localmente
interface UserStatePublic {
    username: string; // Mapeado desde 'usuario' o email
    nombre?: string | null;
    apellido?: string | null;
    profileImage: string | null; // Mapeado desde 'avatar_url'
    profileType: 'common' | 'company'; // Mapeado desde 'tipo_perfil'
    loadingProfile: boolean;
    updateProfile: (updates: Partial<UserProfileData>) => Promise<boolean>; // Solo acepta datos de DB válidos
    // Campos locales expuestos (si son necesarios)
    userHandle: string;
    age: number;
    isPrivate: boolean;
}


const UserContext = createContext<UserStateInternal & { updateProfile: (updates: Partial<UserProfileData>) => Promise<boolean> } | undefined>(undefined);


// Valores iniciales solo para campos locales y placeholders
const INITIAL_STATE: UserStateInternal = {
  username: null,
  nombre: null,
  apellido: null,
  profileImageUrl: null,
  profileType: null,
  loadingProfile: true,
  // Locales con valores por defecto
  userHandle: '@invitado',
  age: 0,
  isPrivate: false,
};

// --- Mapeo de tipos de perfil (sin cambios) ---
const profileTypeToSupabase = (type: 'common' | 'company'): 'usuario' | 'organizacion' => {
    return type === 'company' ? 'organizacion' : 'usuario';
};
const profileTypeFromSupabase = (type: 'usuario' | 'organizacion' | undefined | null): 'common' | 'company' => {
    // Si viene null o undefined de la DB, default a 'common'
    return type === 'organizacion' ? 'company' : 'common';
}


export const UserProvider = ({ children }: { children: ReactNode }) => {
  const { user, session, loading: loadingAuth } = useAuth();
  const [profile, setProfile] = useState<UserStateInternal>(INITIAL_STATE);


  // Función para cargar el perfil desde Supabase
  const fetchProfile = useCallback(async () => {
    if (!user) {
      setProfile({...INITIAL_STATE, loadingProfile: false }); // Reset completo
      return;
    }

    // Mantiene los valores locales mientras carga
    setProfile(prev => ({ ...prev, loadingProfile: true }));

    try {
      // SELECT solo con columnas existentes de la tabla 'usuarios'
      const { data, error, status } = await supabase
        .from('usuarios')
        .select(`usuario, nombre, apellido, avatar_url, tipo_perfil`) // Estrictamente las columnas existentes
        .eq('auth_user_id', user.id)
        .single();

      // Si hay un error diferente a "no encontrado" (406), lánzalo
      if (error && status !== 406) {
        console.error("Supabase fetch error:", error); // Log detallado del error
        throw error;
      }

      // Determina el username a usar (DB > email > por defecto 'Invitado')
      const currentUsername = data?.usuario || user.email?.split('@')[0] || 'Invitado';

      // Construye el estado INTERNO final, mezclando datos de DB con locales existentes o por defecto
      const finalProfileState: UserStateInternal = {
        username: currentUsername,
        nombre: data?.nombre,
        apellido: data?.apellido,
        profileImageUrl: data?.avatar_url || INITIAL_STATE.profileImageUrl, // Carga de DB o usa inicial
        profileType: profileTypeFromSupabase(data?.tipo_perfil), // Carga de DB o usa inicial ('common')
        loadingProfile: false,
        // Mantiene los valores locales que ya tenía el estado o usa los iniciales si no había
        userHandle: profile.userHandle || `@${currentUsername.toLowerCase()}` || INITIAL_STATE.userHandle,
        age: profile.age || INITIAL_STATE.age,
        isPrivate: profile.isPrivate === null ? INITIAL_STATE.isPrivate : profile.isPrivate,
      };

      setProfile(finalProfileState);
      if (data) {
        console.log("Profile loaded/merged from Supabase:", finalProfileState);
      } else {
        console.log("No profile data found, using defaults/locals:", finalProfileState);
      }

    } catch (error) {
      console.error('Error fetching profile:', error);
      // En caso de error, resetea loading y mantiene los valores locales como estaban
      setProfile(prev => ({ ...prev, loadingProfile: false }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]); // Depende solo del user object de Auth


  // Efecto para cargar perfil o resetear en cambio de sesión/auth
  useEffect(() => {
     if (!loadingAuth) { // Solo actuar cuando el estado de Auth esté listo
       if (session && user) {
         fetchProfile(); // Carga si hay sesión y usuario
       } else {
         // Resetea a estado inicial si no hay sesión
          setProfile({...INITIAL_STATE, loadingProfile: false });
       }
     }
  }, [session, user, loadingAuth, fetchProfile]); // Dependencias correctas

  // Función para actualizar el perfil en Supabase
  const updateProfileInSupabase = async (updates: Partial<UserProfileData>): Promise<boolean> => {
     if (!user) {
       console.error("No user logged in to update profile.");
       return false;
     }

     // Filtra solo los campos que existen en la DB para enviar
     const updatesForSupabase: Partial<UserProfileData> = {};
     // Lista EXPLICITA y CORRECTA de columnas que SÍ existen en tu tabla 'usuarios'
     const dbColumns: (keyof UserProfileData)[] = ['usuario', 'nombre', 'apellido', 'tipo_perfil', 'avatar_url'];
     let hasDbUpdates = false;

     for (const key in updates) {
         const typedKey = key as keyof UserProfileData;
         // Solo incluye la key si es una de las columnas válidas de la DB
         if (dbColumns.includes(typedKey)) {
             updatesForSupabase[typedKey] = updates[typedKey];
             hasDbUpdates = true;
         }
     }

      // Actualiza el estado INTERNO inmediatamente para los campos LOCALES si vienen en 'updates'
      const localUpdatesToApply: Partial<UserStateInternal> = {};
      if (updates.age !== undefined) localUpdatesToApply.age = updates.age;
      if (updates.user_handle !== undefined) localUpdatesToApply.userHandle = updates.user_handle;
      if (updates.is_private !== undefined) localUpdatesToApply.isPrivate = updates.is_private;
      // No se actualiza 'notifications' porque ya no existe en el estado

      if (Object.keys(localUpdatesToApply).length > 0) {
        setProfile(prev => ({ ...prev, ...localUpdatesToApply }));
        console.log("Local state updated immediately for:", Object.keys(localUpdatesToApply).join(', '));
      }


     // Si hay actualizaciones para la DB, procede a guardarlas
     if (hasDbUpdates) {
        setProfile(prev => ({ ...prev, loadingProfile: true })); // Inicia loading solo si hay cambios en DB
        try {
            const finalUpdates = {
                ...updatesForSupabase,
                auth_user_id: user.id, // Asegura que auth_user_id esté presente
                updated_at: new Date().toISOString(),
            };
            // Quitamos undefineds antes de enviar
             Object.keys(finalUpdates).forEach(key => {
                const typedKey = key as keyof typeof finalUpdates;
                if (finalUpdates[typedKey] === undefined) {
                    delete finalUpdates[typedKey];
                }
            });

            // No enviar auth_user_id en el payload de update si no es necesario/permitido por RLS
            const { auth_user_id, ...updatePayload } = finalUpdates;


            console.log("Attempting to update profile in Supabase with data:", updatePayload);
            const { error } = await supabase
                 .from('usuarios')
                 .update(updatePayload) // Usa el payload sin auth_user_id
                 .eq('auth_user_id', user.id); // Filtra por auth_user_id

            if (error) {
              console.error("Supabase update error:", error);
              throw error;
            }
             console.log("Profile updated successfully in Supabase.");
             // Actualiza el estado INTERNO local con los datos guardados en DB
             setProfile(prev => ({
                ...prev, // Mantiene locales (age, userHandle, isPrivate)
                // Actualiza los que sí se guardaron en DB
                username: updatesForSupabase.usuario !== undefined ? updatesForSupabase.usuario : prev.username,
                nombre: updatesForSupabase.nombre !== undefined ? updatesForSupabase.nombre : prev.nombre,
                apellido: updatesForSupabase.apellido !== undefined ? updatesForSupabase.apellido : prev.apellido,
                profileImageUrl: updatesForSupabase.avatar_url !== undefined ? updatesForSupabase.avatar_url : prev.profileImageUrl,
                profileType: updatesForSupabase.tipo_perfil !== undefined ? profileTypeFromSupabase(updatesForSupabase.tipo_perfil) : prev.profileType,
                loadingProfile: false // Termina loading
             }));

        } catch (error) {
            console.error('Error updating profile:', error);
            setProfile(prev => ({ ...prev, loadingProfile: false })); // Termina loading en error
            return false; // Indica fallo
        }
     } else {
         // Si solo hubo cambios locales, ya se actualizaron, solo quitamos el loading
         setProfile(prev => ({...prev, loadingProfile: false}));
     }

     return true; // Indica éxito (incluso si solo fueron cambios locales)
  };


  // El valor del contexto INTERNO
  const internalValue = {
      ...profile,
      updateProfile: updateProfileInSupabase,
  };

  return <UserContext.Provider value={internalValue}>{children}</UserContext.Provider>;
};

// Hook PÚBLICO (expone solo los campos necesarios y mapeados)
export const useUser = (): UserStatePublic => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser debe ser usado dentro de un UserProvider');
  }
  // Mapeamos los nombres y exponemos solo lo necesario
  return {
      username: context.username || 'Invitado', // Asegura que nunca sea null
      nombre: context.nombre,
      apellido: context.apellido,
      profileImage: context.profileImageUrl, // Mapeado
      profileType: context.profileType || 'common', // Asegura que nunca sea null
      loadingProfile: context.loadingProfile,
      updateProfile: context.updateProfile,
      // Locales expuestos
      userHandle: context.userHandle,
      age: context.age,
      isPrivate: context.isPrivate,
  };
};


import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase'; // Asegúrate que la ruta sea correcta
import { useAuth } from './AuthContext'; // Importamos el hook de autenticación

// --- Interfaces ---

// Interfaz para la tabla 'retos' (Asegúrate que coincida con tu tabla)
export interface Reto {
  id: number;
  titulo: string;
  descripcion: string;
  puntos_otorgados: number;
  latitud?: number | null;
  longitud?: number | null;
  direccion?: string | null;
  fecha_inicio?: string | null;
  fecha_fin?: string | null;
  usuario_creador_id?: number | null;
  max_completaciones?: number | null;
  completaciones_actuales?: number | null;
  activo?: boolean | null;
  creado_en?: string | null;
}

// Interfaz para los datos del perfil que vienen/van a Supabase (tabla 'usuarios')
export interface UserProfileData {
  auth_user_id?: string;
  usuario: string;
  nombre?: string | null;
  apellido?: string | null;
  tipo_perfil?: 'usuario' | 'organizacion';
  avatar_url?: string | null;
  puntaje_total?: number;
}


// Estado INTERNO del contexto
interface UserStateInternal {
  username: string | null;
  nombre?: string | null;
  apellido?: string | null;
  profileImageUrl: string | null;
  profileType: 'common' | 'company' | null;
  totalScore: number;
  loadingProfile: boolean;
  challenges: Reto[];
  loadingChallenges: boolean;
  // Campos puramente locales (si se necesitan)
  userHandle: string;
  age: number;
  isPrivate: boolean;
}

// Estado EXPUESTO por el hook useUser
interface UserStatePublic {
    username: string;
    nombre?: string | null;
    apellido?: string | null;
    profileImage: string | null;
    profileType: 'common' | 'company';
    totalScore: number;
    loadingProfile: boolean;
    challenges: Reto[];
    loadingChallenges: boolean;
    updateProfile: (updates: Partial<UserProfileData & { age?: number; user_handle?: string; is_private?: boolean }>) => Promise<boolean>;
    // Campos locales expuestos (si son necesarios)
    userHandle: string;
    age: number;
    isPrivate: boolean;
}

const UserContext = createContext<UserStateInternal & { updateProfile: (updates: Partial<UserProfileData & { age?: number; user_handle?: string; is_private?: boolean }>) => Promise<boolean> } | undefined>(undefined);

// Valores iniciales
const INITIAL_STATE: UserStateInternal = {
  username: null,
  nombre: null,
  apellido: null,
  profileImageUrl: null,
  profileType: null,
  totalScore: 0,
  loadingProfile: true,
  challenges: [],
  loadingChallenges: true,
  // Locales
  userHandle: '@invitado',
  age: 0,
  isPrivate: false,
};

// --- Mapeo de tipos de perfil ---
const profileTypeToSupabase = (type: 'common' | 'company'): 'usuario' | 'organizacion' => {
    return type === 'company' ? 'organizacion' : 'usuario';
};
const profileTypeFromSupabase = (type: 'usuario' | 'organizacion' | undefined | null): 'common' | 'company' => {
    return type === 'organizacion' ? 'company' : 'common';
}

// --- Provider ---
export const UserProvider = ({ children }: { children: ReactNode }) => {
  const { user, session, loading: loadingAuth } = useAuth();
  const [profile, setProfile] = useState<UserStateInternal>(INITIAL_STATE);

  // Función para cargar el perfil desde Supabase (MODIFICADA en la llamada a setProfile)
  const fetchProfile = useCallback(async () => {
    if (!user) {
      // Usa actualización funcional para resetear, manteniendo consistencia
      setProfile(prev => ({...INITIAL_STATE, loadingProfile: false, loadingChallenges: prev.loadingChallenges }));
      return;
    }
    // Establece loadingProfile a true usando actualización funcional
    setProfile(prev => ({ ...prev, loadingProfile: true }));

    try {
      const { data, error, status } = await supabase
        .from('usuarios')
        .select(`usuario, nombre, apellido, avatar_url, tipo_perfil, puntaje_total`)
        .eq('auth_user_id', user.id)
        .single();

      if (error && status !== 406) {
        console.error("Supabase fetch error:", error);
        throw error;
      }

      const currentUsername = data?.usuario || user.email?.split('@')[0] || 'Invitado';

      // 1. Prepara solo los datos del perfil que esta función obtuvo
      const profileData = {
        username: currentUsername,
        nombre: data?.nombre,
        apellido: data?.apellido,
        profileImageUrl: data?.avatar_url || INITIAL_STATE.profileImageUrl,
        profileType: profileTypeFromSupabase(data?.tipo_perfil),
        totalScore: data?.puntaje_total ?? INITIAL_STATE.totalScore,
        loadingProfile: false,
        // Actualiza locales basados en el nuevo username (si es necesario)
        // Usa el 'prev' de la función de actualización para el userHandle, age, isPrivate
        userHandle: profile.userHandle || `@${currentUsername.toLowerCase()}` || INITIAL_STATE.userHandle,
        age: profile.age || INITIAL_STATE.age,
        isPrivate: profile.isPrivate === null ? INITIAL_STATE.isPrivate : profile.isPrivate,
      };

      // 2. Usa la actualización funcional de 'setProfile'
      setProfile(prev => ({
        ...prev, // Mantén todo lo anterior (incluyendo challenges y loadingChallenges)
        ...profileData, // Sobrescribe solo los campos del perfil
      }));

      // Loguea solo los datos del perfil que se cargaron/fusionaron
      if (data) console.log("Profile loaded/merged from Supabase:", profileData);
      else console.log("No profile data found, using defaults/locals:", profileData);

    } catch (error) {
      console.error('Error fetching profile:', error);
      // Mantiene locales y retos en caso de error, solo detiene la carga del perfil
      setProfile(prev => ({
          ...prev, // Mantén todo lo anterior
          loadingProfile: false // Solo cambia el estado de carga del perfil
      }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]); // Dependencia clave es 'user'


  // Función para cargar los retos desde Supabase (usando actualización funcional)
  const fetchChallenges = useCallback(async () => {
    if (!user) {
        // Usa actualización funcional
        setProfile(prev => ({ ...prev, challenges: [], loadingChallenges: false }));
        return;
    };

    console.log("Fetching challenges...");
    // Usa actualización funcional
    setProfile(prev => ({ ...prev, loadingChallenges: true }));
    try {
      const { data, error } = await supabase
        .from('retos')
        .select('*')
        .eq('activo', true)
        .limit(100); // Límite añadido

      if (error) {
        console.error("Supabase challenges fetch error:", error);
        throw error;
      }

      // Usa actualización funcional
      setProfile(prev => ({ ...prev, challenges: (data as Reto[]) || [], loadingChallenges: false }));
      console.log("Challenges loaded:", data?.length || 0);

    } catch (error) {
      console.error('Error fetching challenges:', error);
      // Usa actualización funcional
      setProfile(prev => ({ ...prev, challenges: [], loadingChallenges: false }));
    }
  }, [user]); // Depende de 'user'


  // Efecto para cargar perfil/retos o resetear (usando actualización funcional)
  useEffect(() => {
     if (!loadingAuth) {
       if (session && user) {
         fetchProfile();
         fetchChallenges();
       } else {
          // Resetea a estado inicial usando actualización funcional
          setProfile(prev => ({...INITIAL_STATE, loadingProfile: false, loadingChallenges: false }));
       }
     }
  }, [session, user, loadingAuth, fetchProfile, fetchChallenges]);

  // Función para actualizar el perfil en Supabase (usando actualización funcional)
  const updateProfileInSupabase = async (updates: Partial<UserProfileData & { age?: number; user_handle?: string; is_private?: boolean }>): Promise<boolean> => {
     if (!user) {
       console.error("No user logged in to update profile.");
       return false;
     }

     const updatesForSupabase: Partial<UserProfileData> = {};
     const dbColumns: (keyof UserProfileData)[] = ['usuario', 'nombre', 'apellido', 'tipo_perfil', 'avatar_url', 'puntaje_total'];
     let hasDbUpdates = false;

     for (const key in updates) {
         const typedKey = key as keyof UserProfileData;
         if (dbColumns.includes(typedKey)) {
             if (typedKey === 'tipo_perfil') {
                 // @ts-ignore
                 updatesForSupabase[typedKey] = profileTypeToSupabase(updates[typedKey]);
             } else {
                 updatesForSupabase[typedKey] = updates[typedKey];
             }
             hasDbUpdates = true;
         }
     }

     const localUpdatesToApply: Partial<UserStateInternal> = {};
     // @ts-ignore
     if (updates.age !== undefined) localUpdatesToApply.age = updates.age;
     // @ts-ignore
     if (updates.user_handle !== undefined) localUpdatesToApply.userHandle = updates.user_handle;
      // @ts-ignore
     if (updates.is_private !== undefined) localUpdatesToApply.isPrivate = updates.is_private;


      if (Object.keys(localUpdatesToApply).length > 0) {
        // Usa actualización funcional
        setProfile(prev => ({ ...prev, ...localUpdatesToApply }));
        console.log("Local state updated immediately for:", Object.keys(localUpdatesToApply).join(', '));
      }

     if (hasDbUpdates) {
        // Usa actualización funcional
        setProfile(prev => ({ ...prev, loadingProfile: true }));
        try {
            const finalUpdates = { ...updatesForSupabase, auth_user_id: user.id };
             Object.keys(finalUpdates).forEach(key => {
                const typedKey = key as keyof typeof finalUpdates;
                if (finalUpdates[typedKey] === undefined) delete finalUpdates[typedKey];
            });
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { auth_user_id, ...updatePayload } = finalUpdates;

            console.log("Attempting to update profile in Supabase with data:", updatePayload);
            const { error } = await supabase
                 .from('usuarios')
                 .update(updatePayload)
                 .eq('auth_user_id', user.id);

            if (error) {
              console.error("Supabase update error:", error);
              throw error;
            }
             console.log("Profile updated successfully in Supabase.");
             // Usa actualización funcional para fusionar cambios
             setProfile(prev => ({
                ...prev, // Mantiene locales y retos
                // Actualiza los que sí se guardaron en DB
                username: updatesForSupabase.usuario !== undefined ? updatesForSupabase.usuario : prev.username,
                nombre: updatesForSupabase.nombre !== undefined ? updatesForSupabase.nombre : prev.nombre,
                apellido: updatesForSupabase.apellido !== undefined ? updatesForSupabase.apellido : prev.apellido,
                profileImageUrl: updatesForSupabase.avatar_url !== undefined ? updatesForSupabase.avatar_url : prev.profileImageUrl,
                profileType: updatesForSupabase.tipo_perfil !== undefined ? profileTypeFromSupabase(updatesForSupabase.tipo_perfil) : prev.profileType,
                totalScore: updatesForSupabase.puntaje_total !== undefined ? updatesForSupabase.puntaje_total : prev.totalScore,
                loadingProfile: false
             }));

        } catch (error) {
            console.error('Error updating profile:', error);
            // Usa actualización funcional
            setProfile(prev => ({ ...prev, loadingProfile: false }));
            return false;
        }
     } else {
         // Si no hubo updates para DB, pero sí locales, ya se aplicaron
         // Si no hubo updates locales tampoco, solo aseguramos que loadingProfile sea false
         if (profile.loadingProfile) {
            // Usa actualización funcional
            setProfile(prev => ({...prev, loadingProfile: false}));
         }
     }

     return true;
  };

  const internalValue = { ...profile, updateProfile: updateProfileInSupabase };

  return <UserContext.Provider value={internalValue}>{children}</UserContext.Provider>;
};

// Hook PÚBLICO
export const useUser = (): UserStatePublic => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser debe ser usado dentro de un UserProvider');
  }
  // Mapea el estado interno al público
  return {
      username: context.username || 'Invitado',
      nombre: context.nombre,
      apellido: context.apellido,
      profileImage: context.profileImageUrl,
      profileType: context.profileType || 'common',
      totalScore: context.totalScore,
      loadingProfile: context.loadingProfile,
      challenges: context.challenges,
      loadingChallenges: context.loadingChallenges,
      updateProfile: context.updateProfile,
      // Locales
      userHandle: context.userHandle,
      age: context.age,
      isPrivate: context.isPrivate,
  };
};


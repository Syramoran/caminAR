import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { uploadImage } from '../lib/storage'; // Usará la versión actualizada de ImgBB
import { Alert } from 'react-native'; // Importar Alert para mensajes

// --- Interfaces ---
// ... (Interfaces Reto, UserProfileData no cambian) ...

// Interfaz para la tabla 'retos'
export interface Reto {
  id: number; // Numérico según schema
  titulo: string;
  descripcion: string;
  puntos_otorgados: number;
  latitud?: number | null;
  longitud?: number | null;
  direccion?: string | null;
  fecha_inicio?: string | null;
  fecha_fin?: string | null;
  usuario_creador_id?: number | null; // Numérico según schema
  max_completaciones?: number | null;
  completaciones_actuales?: number | null;
  activo?: boolean | null;
  creado_en?: string | null;
}

// Interfaz para los datos del perfil de la tabla 'usuarios'
export interface UserProfileData {
  id?: number; // Añadimos el ID numérico
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
  userId: number | null; // ID numérico de la tabla usuarios
  username: string | null;
  nombre?: string | null;
  apellido?: string | null;
  profileImageUrl: string | null;
  profileType: 'common' | 'company' | null;
  totalScore: number;
  loadingProfile: boolean;
  challenges: Reto[];
  loadingChallenges: boolean;
  completedChallengeIds: Set<number>; // *** NUEVO: IDs de retos completados ***
  loadingCompletedChallenges: boolean; // *** NUEVO: Estado de carga ***
  // Campos locales
  userHandle: string;
  age: number;
  isPrivate: boolean;
}

// Estado EXPUESTO por el hook useUser
interface UserStatePublic {
    userId: number | null;
    username: string;
    nombre?: string | null;
    apellido?: string | null;
    profileImage: string | null;
    profileType: 'common' | 'company';
    totalScore: number;
    loadingProfile: boolean;
    challenges: Reto[];
    loadingChallenges: boolean;
    completedChallengeIds: Set<number>; // *** NUEVO: Exponer IDs completados ***
    loadingCompletedChallenges: boolean; // *** NUEVO: Exponer estado de carga ***
    updateProfile: (updates: Partial<UserProfileData & { age?: number; user_handle?: string; is_private?: boolean }>) => Promise<boolean>;
    // *** Modificado: Añadir parámetro opcional 'description' ***
    completeChallenge: (reto: Reto, photoUri: string, description?: string | null) => Promise<{ success: boolean; message?: string }>;
    // Campos locales
    userHandle: string;
    age: number;
    isPrivate: boolean;
}

const UserContext = createContext<(UserStateInternal & {
    updateProfile: (updates: Partial<UserProfileData & { age?: number; user_handle?: string; is_private?: boolean }>) => Promise<boolean>;
    // *** Modificado: Añadir parámetro opcional 'description' ***
    completeChallenge: (reto: Reto, photoUri: string, description?: string | null) => Promise<{ success: boolean; message?: string }>;
}) | undefined>(undefined);


const INITIAL_STATE: UserStateInternal = {
  userId: null,
  username: null,
  nombre: null,
  apellido: null,
  profileImageUrl: null,
  profileType: null,
  totalScore: 0,
  loadingProfile: true,
  challenges: [],
  loadingChallenges: true,
  completedChallengeIds: new Set(), // *** NUEVO: Inicializar Set vacío ***
  loadingCompletedChallenges: true, // *** NUEVO: Iniciar cargando ***
  userHandle: '@invitado',
  age: 0,
  isPrivate: false,
};

// Mapeos de tipo de perfil (sin cambios)
const profileTypeToSupabase = (type: 'common' | 'company'): 'usuario' | 'organizacion' => type === 'company' ? 'organizacion' : 'usuario';
const profileTypeFromSupabase = (type: 'usuario' | 'organizacion' | undefined | null): 'common' | 'company' => type === 'organizacion' ? 'company' : 'common';

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const { user, session, loading: loadingAuth } = useAuth();
  const [profile, setProfile] = useState<UserStateInternal>(INITIAL_STATE);

  // --- fetchProfile (sin cambios respecto a la versión anterior) ---
  const fetchProfile = useCallback(async () => {
      // ... código existente ...
      if (!user) {
        setProfile(prev => ({...INITIAL_STATE, loadingProfile: false, loadingCompletedChallenges: false, loadingChallenges: prev.loadingChallenges })); // Resetear completed
        return;
      }
      setProfile(prev => ({ ...prev, loadingProfile: true }));

      try {
        const { data, error, status } = await supabase
          .from('usuarios')
          .select(`id, usuario, nombre, apellido, avatar_url, tipo_perfil, puntaje_total`)
          .eq('auth_user_id', user.id)
          .single();

        if (error && status !== 406) {
          console.error("Supabase fetch profile error:", error);
          if (status === 406) {
             console.warn("User profile not found in 'usuarios' table for auth_user_id:", user.id);
          } else {
              throw error;
          }
        }

        const currentUsername = data?.usuario || user.email?.split('@')[0] || 'Invitado';
        const currentUserId = data?.id || null;

        const profileData = {
          userId: currentUserId,
          username: currentUsername,
          nombre: data?.nombre,
          apellido: data?.apellido,
          profileImageUrl: data?.avatar_url || INITIAL_STATE.profileImageUrl,
          profileType: profileTypeFromSupabase(data?.tipo_perfil),
          totalScore: data?.puntaje_total ?? INITIAL_STATE.totalScore,
          loadingProfile: false,
          userHandle: profile.userHandle || `@${currentUsername.toLowerCase()}` || INITIAL_STATE.userHandle,
          age: profile.age || INITIAL_STATE.age,
          isPrivate: profile.isPrivate === null ? INITIAL_STATE.isPrivate : profile.isPrivate,
        };

        setProfile(prev => ({ ...prev, ...profileData }));

        if (data) console.log("[UserContext] Profile loaded/merged:", profileData.username, "Numeric ID:", profileData.userId);
        else console.log("[UserContext] No profile data, using defaults:", profileData.username);

      } catch (error) {
        console.error('[UserContext] Error fetching profile:', error);
        setProfile(prev => ({ ...prev, loadingProfile: false }));
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // --- fetchChallenges (sin cambios) ---
  const fetchChallenges = useCallback(async () => {
    // ... código existente ...
     console.log("[UserContext] Fetching challenges...");
    setProfile(prev => ({ ...prev, loadingChallenges: true }));
    try {
      const { data, error } = await supabase
        .from('retos')
        .select('*')
        .eq('activo', true)
        .limit(100);

      if (error) {
        console.error("[UserContext] Supabase challenges fetch error:", error);
        throw error;
      }
      setProfile(prev => ({ ...prev, challenges: (data as Reto[]) || [], loadingChallenges: false }));
      console.log("[UserContext] Challenges loaded:", data?.length || 0);
    } catch (error) {
      console.error('[UserContext] Error fetching challenges:', error);
      setProfile(prev => ({ ...prev, challenges: [], loadingChallenges: false }));
    }
  }, []);

  // *** NUEVA FUNCIÓN: fetchCompletedChallenges ***
  const fetchCompletedChallenges = useCallback(async () => {
      const numericUserId = profile.userId; // Usar el ID numérico del estado
      if (!user || !numericUserId) {
          setProfile(prev => ({ ...prev, completedChallengeIds: new Set(), loadingCompletedChallenges: false }));
          return;
      }
      console.log(`[UserContext] Fetching completed challenges for user ${numericUserId}...`);
      setProfile(prev => ({ ...prev, loadingCompletedChallenges: true }));
      try {
          const { data, error } = await supabase
              .from('retos_completados')
              .select('reto_id') // Solo necesitamos el ID del reto
              .eq('usuario_id', numericUserId); // Filtrar por ID numérico del usuario

          if (error) {
              console.error("[UserContext] Supabase completed challenges fetch error:", error);
              throw error;
          }

          const completedIds = new Set(data?.map(item => item.reto_id) || []);
          setProfile(prev => ({ ...prev, completedChallengeIds: completedIds, loadingCompletedChallenges: false }));
          console.log(`[UserContext] Found ${completedIds.size} completed challenges.`);

      } catch (error) {
          console.error('[UserContext] Error fetching completed challenges:', error);
          setProfile(prev => ({ ...prev, completedChallengeIds: new Set(), loadingCompletedChallenges: false }));
      }
  }, [user, profile.userId]); // Depende del UUID de auth y del ID numérico del perfil


  // --- useEffect para cargar datos (ahora también llama a fetchCompletedChallenges) ---
  useEffect(() => {
     if (!loadingAuth) {
       if (session && user) {
         // Carga el perfil primero para obtener el userId numérico
         fetchProfile().then(() => {
            // Una vez que tenemos el perfil (y userId), cargamos los completados
            fetchCompletedChallenges();
         });
         fetchChallenges(); // Los retos generales se pueden cargar en paralelo
       } else {
          setProfile(prev => ({...INITIAL_STATE, loadingProfile: false, loadingChallenges: false, loadingCompletedChallenges: false }));
       }
     }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, user, loadingAuth, fetchProfile, fetchChallenges, fetchCompletedChallenges]); // Añadir fetchCompletedChallenges

  // --- updateProfileInSupabase (sin cambios) ---
  const updateProfileInSupabase = async (updates: Partial<UserProfileData & { age?: number; user_handle?: string; is_private?: boolean }>): Promise<boolean> => {
      // ... código existente ...
      if (!user) {
       console.error("[UserContext] No user logged in to update profile.");
       return false;
     }
     // ... resto del código sin cambios ...
     const updatesForSupabase: Partial<UserProfileData> = {};
     const dbColumns: (keyof Omit<UserProfileData, 'id'>)[] = ['usuario', 'nombre', 'apellido', 'tipo_perfil', 'avatar_url', 'puntaje_total'];
     let hasDbUpdates = false;

     for (const key in updates) {
         const typedKey = key as keyof UserProfileData;
         // @ts-ignore Check if key is in dbColumns
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
        setProfile(prev => ({ ...prev, ...localUpdatesToApply }));
        console.log("[UserContext] Local state updated immediately for:", Object.keys(localUpdatesToApply).join(', '));
      }

     if (hasDbUpdates) {
        setProfile(prev => ({ ...prev, loadingProfile: true }));
        try {
            const { auth_user_id, ...updatePayload } = updatesForSupabase;

            console.log("[UserContext] Attempting to update profile in Supabase with data:", updatePayload);
            const { error } = await supabase
                 .from('usuarios')
                 .update(updatePayload)
                 .eq('auth_user_id', user.id);

            if (error) {
              console.error("[UserContext] Supabase update profile error:", error);
              throw error;
            }
             console.log("[UserContext] Profile updated successfully in Supabase.");
             setProfile(prev => ({
                ...prev,
                username: updatesForSupabase.usuario !== undefined ? updatesForSupabase.usuario : prev.username,
                nombre: updatesForSupabase.nombre !== undefined ? updatesForSupabase.nombre : prev.nombre,
                apellido: updatesForSupabase.apellido !== undefined ? updatesForSupabase.apellido : prev.apellido,
                profileImageUrl: updatesForSupabase.avatar_url !== undefined ? updatesForSupabase.avatar_url : prev.profileImageUrl,
                profileType: updatesForSupabase.tipo_perfil !== undefined ? profileTypeFromSupabase(updatesForSupabase.tipo_perfil) : prev.profileType,
                totalScore: updatesForSupabase.puntaje_total !== undefined ? updatesForSupabase.puntaje_total : prev.totalScore,
                loadingProfile: false
             }));

        } catch (error) {
            console.error('[UserContext] Error updating profile:', error);
            setProfile(prev => ({ ...prev, loadingProfile: false }));
            return false;
        }
     } else {
         if (profile.loadingProfile) {
            setProfile(prev => ({...prev, loadingProfile: false}));
         }
     }
      return true;
  };

  // --- completeChallenge ---
  // Modificado para checkear si ya está completado, guardar hora y descripción
  const completeChallenge = async (
      reto: Reto,
      photoUri: string,
      description?: string | null // *** Nuevo parámetro opcional ***
  ): Promise<{ success: boolean; message?: string }> => { // *** Devuelve objeto con mensaje ***
    const numericUserId = profile.userId;

    if (!user || !numericUserId) {
      console.error("[UserContext] No user logged in or numeric user ID not found to complete challenge.");
      return { success: false, message: "Usuario no autenticado." };
    }

    // *** NUEVO: Verificar si el reto ya está completado (usando el estado local) ***
    if (profile.completedChallengeIds.has(reto.id)) {
        console.log(`[UserContext] Reto ${reto.id} ya completado por usuario ${numericUserId}. Abortando.`);
        return { success: false, message: "Ya has completado este reto anteriormente." };
    }

    // *** Opcional: Verificar también contra la BD por si el estado local no está sincronizado ***
    /*
    const { data: existingCompletion, error: checkError } = await supabase
        .from('retos_completados')
        .select('id')
        .eq('usuario_id', numericUserId)
        .eq('reto_id', reto.id)
        .limit(1);

    if (checkError) {
        console.error("[UserContext] Error checking existing completion:", checkError);
        return { success: false, message: "Error al verificar el estado del reto." };
    }
    if (existingCompletion && existingCompletion.length > 0) {
        console.log(`[UserContext] Reto ${reto.id} ya completado por usuario ${numericUserId} (verificado en BD). Abortando.`);
        // Sincronizar estado local si hay discrepancia
        if (!profile.completedChallengeIds.has(reto.id)) {
             setProfile(prev => ({...prev, completedChallengeIds: new Set(prev.completedChallengeIds).add(reto.id)}));
        }
        return { success: false, message: "Ya has completado este reto anteriormente." };
    }
    */

    try {
      console.log(`[UserContext] Iniciando completado del reto ${reto.id} por usuario ${user.id} (numeric: ${numericUserId})`);

      // 1. Subir la imagen a ImgBB (sin cambios)
      const photoUrl = await uploadImage(photoUri);
      if (!photoUrl) {
        throw new Error('Falló la subida de la imagen a ImgBB.');
      }
      console.log(`[UserContext] Imagen subida a ImgBB: ${photoUrl}`);

      // 2. Insertar en retos_completados (añadiendo hora_completado)
      console.log(`[UserContext] Insertando en retos_completados (usuario_id: ${numericUserId})...`);
      // *** Obtenemos la hora actual en formato HH:MM:SS ***
      const now = new Date();
      const horaCompletado = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
      console.log(`[UserContext] Hora de completado: ${horaCompletado}`);

      const { data: completedData, error: completedError } = await supabase
        .from('retos_completados')
        .insert({
            usuario_id: numericUserId,
            reto_id: reto.id,
            hora_completado: horaCompletado // *** Añadido ***
        })
        .select('id')
        .single();

      if (completedError || !completedData) {
        console.error("[UserContext] Error insertando en retos_completados:", completedError);
        throw completedError || new Error('No se recibió ID de reto_completado.');
      }
      const retoCompletadoId = completedData.id;
      console.log(`[UserContext] Registro en retos_completados creado con ID: ${retoCompletadoId}`);

      // 3. Insertar en fotos_participaciones (añadiendo descripción)
      console.log(`[UserContext] Insertando en fotos_participaciones (usuario_id: ${numericUserId})...`);
      const { error: photoError } = await supabase
        .from('fotos_participaciones')
        .insert({
          usuario_id: numericUserId,
          reto_completado_id: retoCompletadoId,
          url_foto: photoUrl,
          descripcion: description || null // *** Añadido (usa null si es undefined o vacío) ***
        });

      if (photoError) {
        console.error("[UserContext] Error insertando en fotos_participaciones:", photoError);
        throw photoError;
      }
      console.log(`[UserContext] Registro en fotos_participaciones creado.`);

      // 4. Actualizar puntaje del usuario (sin cambios)
      console.log(`[UserContext] Actualizando puntaje del usuario (id: ${numericUserId})...`);
       const { data: userData, error: userFetchError } = await supabase
           .from('usuarios')
           .select('puntaje_total')
           .eq('id', numericUserId)
           .single();

       if (userFetchError && userFetchError.code !== 'PGRST116') {
           console.error("[UserContext] Error fetching current score:", userFetchError);
           throw userFetchError;
       }
       const currentScore = userData?.puntaje_total || 0;
       const newScore = currentScore + reto.puntos_otorgados;

       const { error: scoreError } = await supabase
           .from('usuarios')
           .update({ puntaje_total: newScore })
           .eq('id', numericUserId);

       if (scoreError) {
           console.error("[UserContext] Error updating score:", scoreError);
           throw scoreError;
       }
       console.log(`[UserContext] Puntaje actualizado a: ${newScore}`);
       // Actualizar estado local
       setProfile(prev => ({
           ...prev,
           totalScore: newScore,
           completedChallengeIds: new Set(prev.completedChallengeIds).add(reto.id) // *** Añadir ID a completados ***
       }));


      // 5. Opcional: Actualizar completaciones_actuales en 'retos' (sin cambios)
       console.log(`[UserContext] Actualizando completaciones del reto...`);
        const { data: retoData, error: retoFetchError } = await supabase
            .from('retos')
            .select('completaciones_actuales, max_completaciones')
            .eq('id', reto.id)
            .single();

        if (retoFetchError) {
             console.error("[UserContext] Error fetching challenge completions:", retoFetchError);
        } else if (retoData) {
            const currentCompletions = retoData.completaciones_actuales || 0;
            if (retoData.max_completaciones == null || currentCompletions < retoData.max_completaciones) {
                 const newCompletions = currentCompletions + 1;
                 const { error: completionsError } = await supabase
                     .from('retos')
                     .update({ completaciones_actuales: newCompletions })
                     .eq('id', reto.id);
                 if (completionsError) {
                      console.error("[UserContext] Error updating challenge completions:", completionsError);
                 } else {
                     console.log(`[UserContext] Completaciones del reto actualizadas a: ${newCompletions}`);
                     // Actualizar estado local de 'challenges' si es necesario
                     setProfile(prev => ({
                         ...prev,
                         challenges: prev.challenges.map(c =>
                             c.id === reto.id ? { ...c, completaciones_actuales: newCompletions } : c
                         )
                     }));
                 }
            } else {
                 console.log("[UserContext] Límite de completaciones alcanzado.");
            }
        }

      console.log(`[UserContext] Reto ${reto.id} completado exitosamente.`);
      return { success: true };

    } catch (error: any) {
      console.error(`[UserContext] Error al completar el reto ${reto.id}:`, error);
      // Devuelve el mensaje de error para mostrarlo en la UI si es útil
      return { success: false, message: error.message || "Error desconocido al completar el reto." };
    }
  };


  const internalValue = {
      ...profile,
      updateProfile: updateProfileInSupabase,
      completeChallenge: completeChallenge
  };

  return <UserContext.Provider value={internalValue}>{children}</UserContext.Provider>;
};

// Hook PÚBLICO
export const useUser = (): UserStatePublic => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser debe ser usado dentro de un UserProvider');
  }
  return {
      userId: context.userId,
      username: context.username || 'Invitado',
      nombre: context.nombre,
      apellido: context.apellido,
      profileImage: context.profileImageUrl,
      profileType: context.profileType || 'common',
      totalScore: context.totalScore,
      loadingProfile: context.loadingProfile,
      challenges: context.challenges,
      loadingChallenges: context.loadingChallenges,
      completedChallengeIds: context.completedChallengeIds, // *** Exponer Set ***
      loadingCompletedChallenges: context.loadingCompletedChallenges, // *** Exponer estado carga ***
      updateProfile: context.updateProfile,
      completeChallenge: context.completeChallenge,
      // Locales
      userHandle: context.userHandle,
      age: context.age,
      isPrivate: context.isPrivate,
  };
};


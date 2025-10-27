import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { uploadImage } from '../lib/storage'; // Assuming this uses ImgBB now
import { Alert } from 'react-native';

// --- Interfaces ---

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

// Updated UserProfileData interface for Supabase 'usuarios' table
export interface UserProfileData {
  id?: number;
  auth_user_id?: string;
  usuario: string; // Corresponds to 'username' in UI
  nombre?: string | null;
  apellido?: string | null;
  // tipo_perfil is removed as esOrganizacion is the source of truth
  avatar_url?: string | null; // Corresponds to 'profileImage' in UI
  puntaje_total?: number; // Corresponds to 'totalScore' in UI
  esOrganizacion?: boolean; // New field from DB
  // These fields are not in the DB based on the provided schema
  // age?: number;
  // user_handle?: string;
  // is_private?: boolean;
}

// Internal state of the context
interface UserStateInternal {
  userId: number | null; // Numeric ID from 'usuarios' table
  username: string | null; // 'usuario' column
  nombre: string | null;
  apellido: string | null;
  profileImageUrl: string | null; // 'avatar_url' column
  profileType: 'common' | 'company' | null; // Derived from esOrganizacion
  isOrganization: boolean | null; // Direct value of 'esOrganizacion'
  totalScore: number; // 'puntaje_total' column
  loadingProfile: boolean;
  challenges: Reto[];
  loadingChallenges: boolean;
  completedChallengeIds: Set<number>;
  loadingCompletedChallenges: boolean;
  // Local/UI only state (if still needed, otherwise remove)
  // userHandle: string;
  // age: number;
  // isPrivate: boolean;
}

// Public state exposed by the hook
interface UserStatePublic {
    userId: number | null;
    username: string; // Non-nullable default
    nombre: string | null;
    apellido: string | null;
    profileImage: string | null;
    profileType: 'common' | 'company'; // Non-nullable default
    isOrganization: boolean; // Non-nullable default
    totalScore: number;
    loadingProfile: boolean;
    challenges: Reto[];
    loadingChallenges: boolean;
    completedChallengeIds: Set<number>;
    loadingCompletedChallenges: boolean;
    // Pass UserProfileData directly, let update function handle mapping
    updateProfile: (updates: Partial<UserProfileData>) => Promise<boolean>;
    completeChallenge: (reto: Reto, photoUri: string, description?: string | null) => Promise<{ success: boolean; message?: string }>;
    // Remove local/UI only state if not needed
    // userHandle: string;
    // age: number;
    // isPrivate: boolean;
}

// Context Definition
const UserContext = createContext<(UserStateInternal & {
    // Pass UserProfileData directly
    updateProfile: (updates: Partial<UserProfileData>) => Promise<boolean>;
    completeChallenge: (reto: Reto, photoUri: string, description?: string | null) => Promise<{ success: boolean; message?: string }>;
}) | undefined>(undefined);


// Initial State
const INITIAL_STATE: UserStateInternal = {
  userId: null,
  username: null,
  nombre: null,
  apellido: null,
  profileImageUrl: null,
  profileType: 'common', // Default to common
  isOrganization: false, // Default to false
  totalScore: 0,
  loadingProfile: true,
  challenges: [],
  loadingChallenges: true,
  completedChallengeIds: new Set(),
  loadingCompletedChallenges: true,
  // Remove local/UI only state if not needed
  // userHandle: '@invitado',
  // age: 0,
  // isPrivate: false,
};

// Mapping from boolean to UI type (moved from configuracion.tsx)
const profileTypeFromSupabase = (isOrg: boolean | undefined | null): 'common' | 'company' => {
    return isOrg ? 'company' : 'common';
}

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const { user, session, loading: loadingAuth } = useAuth();
  const [profile, setProfile] = useState<UserStateInternal>(INITIAL_STATE);

  // Fetch Profile - reads esOrganizacion
  const fetchProfile = useCallback(async () => {
      if (!user) {
        setProfile(prev => ({...INITIAL_STATE, loadingProfile: false, loadingCompletedChallenges: false, loadingChallenges: prev.loadingChallenges }));
        return;
      }
      setProfile(prev => ({ ...prev, loadingProfile: true }));

      try {
        // Select the new esOrganizacion column
        const { data, error, status } = await supabase
          .from('usuarios')
          .select(`id, usuario, nombre, apellido, avatar_url, puntaje_total, "esOrganizacion"`) // Use quotes for camelCase
          .eq('auth_user_id', user.id)
          .single();

        if (error && status !== 406) {
          console.error("Supabase fetch profile error:", error);
          if (status === 406) {
             console.warn("User profile not found for auth_user_id:", user.id);
          } else {
              throw error;
          }
        }

        const currentUsername = data?.usuario || user.email?.split('@')[0] || 'Invitado';
        const currentUserId = data?.id || null;
        const currentIsOrg = data?.esOrganizacion ?? false; // Default to false if null/undefined

        const profileData = {
          userId: currentUserId,
          username: currentUsername,
          nombre: data?.nombre,
          apellido: data?.apellido,
          profileImageUrl: data?.avatar_url || INITIAL_STATE.profileImageUrl,
          profileType: profileTypeFromSupabase(currentIsOrg), // Derive UI type from boolean
          isOrganization: currentIsOrg, // Store the boolean value
          totalScore: data?.puntaje_total ?? INITIAL_STATE.totalScore,
          loadingProfile: false,
          // Remove local/UI only state updates if not needed
          // userHandle: profile.userHandle || `@${currentUsername.toLowerCase()}` || INITIAL_STATE.userHandle,
          // age: profile.age || INITIAL_STATE.age,
          // isPrivate: profile.isPrivate === null ? INITIAL_STATE.isPrivate : profile.isPrivate,
        };

        setProfile(prev => ({ ...prev, ...profileData }));

        if (data) console.log("[UserContext] Profile loaded:", profileData.username, "ID:", profileData.userId, "IsOrg:", profileData.isOrganization);
        else console.log("[UserContext] No profile data, using defaults:", profileData.username);

      } catch (error) {
        console.error('[UserContext] Error fetching profile:', error);
        setProfile(prev => ({ ...prev, loadingProfile: false }));
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]); // Removed profile from dependencies to avoid potential loops if local state was still here

  // --- fetchChallenges (no changes) ---
  const fetchChallenges = useCallback(async () => {
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

  // --- fetchCompletedChallenges (no changes) ---
  const fetchCompletedChallenges = useCallback(async () => {
      const numericUserId = profile.userId;
      if (!user || !numericUserId) {
          setProfile(prev => ({ ...prev, completedChallengeIds: new Set(), loadingCompletedChallenges: false }));
          return;
      }
      console.log(`[UserContext] Fetching completed challenges for user ${numericUserId}...`);
      setProfile(prev => ({ ...prev, loadingCompletedChallenges: true }));
      try {
          const { data, error } = await supabase
              .from('retos_completados')
              .select('reto_id')
              .eq('usuario_id', numericUserId);

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
  }, [user, profile.userId]);


  // --- useEffect to load data (no changes) ---
  useEffect(() => {
     if (!loadingAuth) {
       if (session && user) {
         fetchProfile().then(() => {
            fetchCompletedChallenges();
         });
         fetchChallenges();
       } else {
          setProfile(prev => ({...INITIAL_STATE, loadingProfile: false, loadingChallenges: false, loadingCompletedChallenges: false }));
       }
     }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, user, loadingAuth, fetchProfile, fetchChallenges, fetchCompletedChallenges]);

  // --- updateProfileInSupabase - accepts UserProfileData, handles esOrganizacion ---
  const updateProfileInSupabase = async (updates: Partial<UserProfileData>): Promise<boolean> => {
      if (!user) {
       console.error("[UserContext] No user logged in to update profile.");
       return false;
     }

     // Define columns that exist in the Supabase 'usuarios' table based on UserProfileData
     const dbColumns: (keyof UserProfileData)[] = [
        'usuario',
        'nombre',
        'apellido',
        'avatar_url',
        'puntaje_total',
        'esOrganizacion' // Add the new boolean field
     ];

     const updatesForSupabase: Partial<UserProfileData> = {};
     let hasDbUpdates = false;

     for (const key in updates) {
         const typedKey = key as keyof UserProfileData;
         // Check if the key from updates is a valid DB column
         if (dbColumns.includes(typedKey)) {
             updatesForSupabase[typedKey] = updates[typedKey];
             hasDbUpdates = true;
         } else {
             console.warn(`[UserContext] updateProfile called with invalid key: ${key}`);
         }
     }

     // Remove local state updates if they are not needed anymore
     // const localUpdatesToApply: Partial<UserStateInternal> = {};
     // if (updates.age !== undefined) localUpdatesToApply.age = updates.age;
     // ... other local fields ...
     // if (Object.keys(localUpdatesToApply).length > 0) {
     //   setProfile(prev => ({ ...prev, ...localUpdatesToApply }));
     // }

     if (hasDbUpdates) {
        setProfile(prev => ({ ...prev, loadingProfile: true }));
        try {
            // Remove auth_user_id and id if present, as they are not updatable this way
            const { auth_user_id, id, ...updatePayload } = updatesForSupabase;

             // Ensure esOrganizacion is quoted if needed by Supabase client (usually not needed for column names)
            // const finalPayload = { ...updatePayload };
            // if (finalPayload.esOrganizacion !== undefined) {
            //     finalPayload['"esOrganizacion"'] = finalPayload.esOrganizacion;
            //     delete finalPayload.esOrganizacion;
            // }

            console.log("[UserContext] Attempting to update profile in Supabase:", updatePayload);
            const { error } = await supabase
                 .from('usuarios')
                 .update(updatePayload) // Use the filtered payload
                 .eq('auth_user_id', user.id);

            if (error) {
              console.error("[UserContext] Supabase update profile error:", error);
              throw error;
            }
             console.log("[UserContext] Profile updated successfully in Supabase.");

             // Update local state after successful DB update
             const newStateChanges: Partial<UserStateInternal> = {};
             if (updatesForSupabase.usuario !== undefined) newStateChanges.username = updatesForSupabase.usuario;
             if (updatesForSupabase.nombre !== undefined) newStateChanges.nombre = updatesForSupabase.nombre;
             if (updatesForSupabase.apellido !== undefined) newStateChanges.apellido = updatesForSupabase.apellido;
             if (updatesForSupabase.avatar_url !== undefined) newStateChanges.profileImageUrl = updatesForSupabase.avatar_url;
             if (updatesForSupabase.puntaje_total !== undefined) newStateChanges.totalScore = updatesForSupabase.puntaje_total;
             if (updatesForSupabase.esOrganizacion !== undefined) {
                 newStateChanges.isOrganization = updatesForSupabase.esOrganizacion;
                 newStateChanges.profileType = profileTypeFromSupabase(updatesForSupabase.esOrganizacion);
             }

             setProfile(prev => ({
                ...prev,
                ...newStateChanges,
                loadingProfile: false
             }));

        } catch (error) {
            console.error('[UserContext] Error updating profile:', error);
            setProfile(prev => ({ ...prev, loadingProfile: false }));
            return false;
        }
     } else {
         // If only local state was updated (and no DB updates), ensure loading is false
         if (profile.loadingProfile) {
            setProfile(prev => ({...prev, loadingProfile: false}));
         }
     }
      return true;
  };

  // --- completeChallenge (no changes) ---
  const completeChallenge = async (
      reto: Reto,
      photoUri: string,
      description?: string | null
  ): Promise<{ success: boolean; message?: string }> => {
    const numericUserId = profile.userId;

    if (!user || !numericUserId) {
      console.error("[UserContext] No user/ID to complete challenge.");
      return { success: false, message: "Usuario no autenticado." };
    }
    if (profile.completedChallengeIds.has(reto.id)) {
        console.log(`[UserContext] Reto ${reto.id} already completed.`);
        return { success: false, message: "Ya has completado este reto." };
    }

    // Optional: Double check against DB
    /*
    const { data: existingCompletion, error: checkError } = await supabase
        .from('retos_completados')
        .select('id')
        .eq('usuario_id', numericUserId)
        .eq('reto_id', reto.id)
        .limit(1);
    if (checkError) return { success: false, message: "Error al verificar." };
    if (existingCompletion && existingCompletion.length > 0) {
        if (!profile.completedChallengeIds.has(reto.id)) {
             setProfile(prev => ({...prev, completedChallengeIds: new Set(prev.completedChallengeIds).add(reto.id)}));
        }
        return { success: false, message: "Ya has completado este reto." };
    }
    */

    try {
      console.log(`[UserContext] Completing challenge ${reto.id} by user ${numericUserId}`);
      const photoUrl = await uploadImage(photoUri);
      if (!photoUrl) throw new Error('Falló la subida de la imagen.');
      console.log(`[UserContext] Image uploaded: ${photoUrl}`);

      const now = new Date();
      const horaCompletado = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

      const { data: completedData, error: completedError } = await supabase
        .from('retos_completados')
        .insert({
            usuario_id: numericUserId,
            reto_id: reto.id,
            hora_completado: horaCompletado
        })
        .select('id')
        .single();
      if (completedError || !completedData) throw completedError || new Error('No se recibió ID de reto_completado.');
      const retoCompletadoId = completedData.id;

      const { error: photoError } = await supabase
        .from('fotos_participaciones')
        .insert({
          usuario_id: numericUserId,
          reto_completado_id: retoCompletadoId,
          url_foto: photoUrl,
          descripcion: description || null
        });
      if (photoError) throw photoError;

       const { data: userData, error: userFetchError } = await supabase
           .from('usuarios')
           .select('puntaje_total')
           .eq('id', numericUserId)
           .single();
       if (userFetchError && userFetchError.code !== 'PGRST116') throw userFetchError;
       const currentScore = userData?.puntaje_total || 0;
       const newScore = currentScore + reto.puntos_otorgados;

       const { error: scoreError } = await supabase
           .from('usuarios')
           .update({ puntaje_total: newScore })
           .eq('id', numericUserId);
       if (scoreError) throw scoreError;

       setProfile(prev => ({
           ...prev,
           totalScore: newScore,
           completedChallengeIds: new Set(prev.completedChallengeIds).add(reto.id)
       }));

        const { data: retoData, error: retoFetchError } = await supabase
            .from('retos')
            .select('completaciones_actuales, max_completaciones')
            .eq('id', reto.id)
            .single();
        if (retoFetchError) console.error("[UserContext] Error fetching challenge completions:", retoFetchError);
        else if (retoData) {
            const currentCompletions = retoData.completaciones_actuales || 0;
            if (retoData.max_completaciones == null || currentCompletions < retoData.max_completaciones) {
                 const newCompletions = currentCompletions + 1;
                 const { error: completionsError } = await supabase
                     .from('retos')
                     .update({ completaciones_actuales: newCompletions })
                     .eq('id', reto.id);
                 if (completionsError) console.error("[UserContext] Error updating challenge completions:", completionsError);
                 else {
                     setProfile(prev => ({
                         ...prev,
                         challenges: prev.challenges.map(c =>
                             c.id === reto.id ? { ...c, completaciones_actuales: newCompletions } : c
                         )
                     }));
                 }
            }
        }
      console.log(`[UserContext] Challenge ${reto.id} completed successfully.`);
      return { success: true };
    } catch (error: any) {
      console.error(`[UserContext] Error completing challenge ${reto.id}:`, error);
      return { success: false, message: error.message || "Error desconocido." };
    }
  };


  const internalValue = {
      ...profile,
      updateProfile: updateProfileInSupabase,
      completeChallenge: completeChallenge
  };

  return <UserContext.Provider value={internalValue}>{children}</UserContext.Provider>;
};

// Hook PÚBLICO - exposes isOrganization
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
      isOrganization: context.isOrganization ?? false, // Provide default boolean
      totalScore: context.totalScore,
      loadingProfile: context.loadingProfile,
      challenges: context.challenges,
      loadingChallenges: context.loadingChallenges,
      completedChallengeIds: context.completedChallengeIds,
      loadingCompletedChallenges: context.loadingCompletedChallenges,
      updateProfile: context.updateProfile,
      completeChallenge: context.completeChallenge,
      // Remove local state if not needed
      // userHandle: context.userHandle,
      // age: context.age,
      // isPrivate: context.isPrivate,
  };
};

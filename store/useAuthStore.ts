import { supabase } from "@/lib/supabase";
import { create } from "zustand";

type User = {
  id: string;
  email?: string;
  name?: string;
};

type AuthState = {
  user: User | null;
  loading: boolean;
  error: string | null;
  fetchUser: () => Promise<void>;
  signOut: () => Promise<void>;
};

type SetState = (fn: (state: AuthState) => Partial<AuthState>) => void;

export const useAuthStore = create<AuthState>((set: SetState) => ({
  user: null,
  loading: false,
  error: null,

  fetchUser: async () => {
    set((state) => ({ ...state, loading: true, error: null }));
    try {
      console.log('Fetching user from Supabase...');
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      console.log('Supabase auth response - user:', user, 'error:', error);

      if (error) throw error;

      if (user) {
        try {
          // Try to get user profile
          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();

          // If profile exists, use it. Otherwise, create a basic profile
          const profileData = profile || {
            id: user.id,
            name: user.email?.split("@")[0],
            email: user.email,
          };

          console.log('Setting user data from profile:', profileData);
          set((state) => ({
            ...state,
            user: profileData,
            loading: false,
            error: null,
          }));
        } catch (err) {
          console.warn("Error fetching profile, using basic user data:", err);
          // If there's an error with profiles table, use basic user data
          const basicUserData = {
            id: user.id,
            email: user.email || undefined,
            name: user.email?.split("@")[0],
          };
          console.log('Using basic user data:', basicUserData);
          set((state) => ({
            ...state,
            user: basicUserData,
            loading: false,
            error: null,
          }));
        }
      }
    } catch (e: any) {
      set((state) => ({
        ...state,
        error: e.message,
        loading: false
      }));
    }
  },

  signOut: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      set((state) => ({
        ...state,
        user: null,
        error: null
      }));
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      console.error("Error signing out:", error);
      set((state) => ({
        ...state,
        error: errorMessage,
        user: null,
      }));
    }
  },
}));

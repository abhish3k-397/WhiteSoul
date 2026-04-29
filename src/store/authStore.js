import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export const useAuthStore = create((set, get) => ({
  user: null,
  profile: null,
  session: null,
  loading: false,
  error: null,
  _authUnsub: null,

  // Initialize session on load
  init: async () => {
    // Ensure we don't double-subscribe if init runs twice (HMR, etc.)
    const existingUnsub = get()._authUnsub;
    if (typeof existingUnsub === 'function') existingUnsub();

    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;

      const session = data?.session ?? null;
      set({ session, user: session?.user ?? null });

      const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
        set({ session: newSession ?? null, user: newSession?.user ?? null });
      });

      set({ _authUnsub: () => sub?.subscription?.unsubscribe?.() });
    } catch (e) {
      set({ error: e?.message ?? String(e) });
    } finally {
      set({ loading: false });
    }
  },

  // Optional: profile is not required to be "logged in".
  // We'll keep it null unless the user sets a username.

  // 1. Send OTP Email (Sign Up)
  sendOtp: async (email) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: true },
      });
      if (error) throw error;
      return true;
    } catch (e) {
      set({ error: e?.message ?? String(e) });
      return false;
    } finally {
      set({ loading: false });
    }
  },

  // 3. Set Password (after OTP verification)
  setPassword: async (password) => {
    set({ loading: true, error: null });
    const { error } = await supabase.auth.updateUser({
      password: password
    });

    if (error) {
      set({ error: error.message, loading: false });
      return false;
    }
    set({ loading: false });
    return true;
  },

  // 4. Sign In with Email + Password
  signInWithPassword: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      set({ session: data?.session ?? null, user: data?.user ?? data?.session?.user ?? null });
      return true;
    } catch (e) {
      set({ error: e?.message ?? String(e) });
      return false;
    } finally {
      set({ loading: false });
    }
  },

  // 2. Verify OTP Token
  verifyOtp: async (email, token) => {
    set({ loading: true, error: null });
    try {
      // Supabase has multiple "email OTP types" depending on how the OTP was issued.
      // We'll try the most common ones in order.
      const otpTypes = /** @type {const} */ (['email', 'signup', 'magiclink']);
      let lastError = null;

      for (const type of otpTypes) {
        const { data, error } = await supabase.auth.verifyOtp({ email, token, type });
        if (!error && data?.session) {
          set({ session: data.session, user: data.user ?? data.session.user });
          return true;
        }
        lastError = error ?? lastError;
      }

      set({ error: lastError?.message ?? 'OTP verification failed' });
      return false;
    } catch (e) {
      console.error('Verification Exception:', e);
      set({ error: e?.message ?? String(e) });
      return false;
    } finally {
      set({ loading: false });
    }
  },

  // Logout
  signOut: async () => {
    set({ loading: true, error: null });
    try {
      await supabase.auth.signOut();
      set({ user: null, session: null, profile: null });
    } finally {
      set({ loading: false });
    }
  },

  // Update Username (if they want to change the default generated one)
  updateUsername: async (username) => {
    const { user } = get();
    if (!user) return false;
    
    set({ loading: true, error: null });
    try {
      // Upsert so it works whether or not the trigger exists.
      const { data, error } = await supabase
        .from('profiles')
        .upsert({ id: user.id, username }, { onConflict: 'id' })
        .select('username')
        .maybeSingle();

      if (error) throw error;
      if (data) set({ profile: data });
      return true;
    } catch (e) {
      set({ error: e?.message ?? String(e) });
      return false;
    } finally {
      set({ loading: false });
    }
  }
}));

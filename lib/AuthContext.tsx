'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { createBrowserSupabaseClient, getSupabaseConfig } from '@/lib/supabase/client';

export interface UserProfileData {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  location?: string;
  headline?: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
  bio?: string;
  education?: Array<{
    id?: string;
    university: string;
    degree: string;
    department?: string;
    graduationYear?: string | number;
    cgpa?: string | number;
    achievements?: string[];
  }>;
  experience?: Array<{
    id?: string;
    company: string;
    position: string;
    duration?: string;
    responsibilities?: string[];
    technologies?: string[];
  }>;
  skills?: {
    technical?: string[];
    soft?: string[];
    languages?: string[];
  };
  projects?: Array<{
    id?: string;
    name: string;
    description: string;
    technologies?: string[];
    url?: string;
  }>;
  avatarUrl?: string;
  lastIp?: string;
  lastLocation?: string;
  lastDevice?: string;
  lastSignInAt?: string;
  updatedAt?: string;
}

export interface SavedCvDocument {
  id: string;
  title: string;
  templateId: string;
  singletonData: Record<string, string>;
  entriesData: Record<string, Array<Record<string, string>>>;
  styleOverrides?: Record<string, unknown>;
  photoUrl?: string;
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfileData | null;
  loading: boolean;
  isConfigured: boolean;
  savedCvs: SavedCvDocument[];
  refreshSavedCvs: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<{ error: string | null }>;
  signUpWithEmail: (email: string, password: string, fullName: string) => Promise<{ error: string | null; needsEmailConfirmation?: boolean }>;
  signInWithGoogle: () => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<UserProfileData>) => Promise<{ error: string | null }>;
  saveCvToCloud: (cv: {
    id?: string;
    title: string;
    templateId: string;
    singletonData: Record<string, string>;
    entriesData: Record<string, Array<Record<string, string>>>;
    styleOverrides?: Record<string, unknown>;
    photoUrl?: string;
  }) => Promise<{ id?: string; error: string | null }>;
  deleteCvFromCloud: (id: string) => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_PROFILE_KEY = 'lelisacv_local_user_profile';
const LOCAL_SAVED_CVS_KEY = 'lelisacv_local_saved_cvs';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [savedCvs, setSavedCvs] = useState<SavedCvDocument[]>([]);
  const [loading, setLoading] = useState(true);

  const { isConfigured } = getSupabaseConfig();
  const supabase = createBrowserSupabaseClient();

  // Load saved CVs
  const refreshSavedCvs = useCallback(async () => {
    if (supabase && user) {
      try {
        const { data, error } = await supabase
          .from('saved_cvs')
          .select('*')
          .order('updated_at', { ascending: false });

        if (!error && data) {
          setSavedCvs(
            data.map((item) => ({
              id: item.id,
              title: item.title,
              templateId: item.template_id,
              singletonData: item.singleton_data || {},
              entriesData: item.entries_data || {},
              styleOverrides: item.style_overrides || {},
              photoUrl: item.photo_url || '',
              createdAt: item.created_at,
              updatedAt: item.updated_at,
            }))
          );
          return;
        }
      } catch (err) {
        console.warn('[AuthContext] Error fetching cloud CVs:', err);
      }
    }

    // Local Storage Fallback
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem(LOCAL_SAVED_CVS_KEY);
        if (raw) {
          setSavedCvs(JSON.parse(raw));
        }
      } catch {
        // ignore
      }
    }
  }, [supabase, user]);

  // Load User Profile
  const loadProfile = useCallback(
    async (userId: string, userEmail?: string) => {
      if (supabase) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

          if (!error && data) {
            const mapped: UserProfileData = {
              id: data.id,
              fullName: data.full_name || '',
              email: data.email || userEmail || '',
              phone: data.phone || '',
              location: data.location || '',
              headline: data.headline || '',
              linkedin: data.linkedin || '',
              github: data.github || '',
              portfolio: data.portfolio || '',
              bio: data.bio || '',
              education: data.education || [],
              experience: data.experience || [],
              skills: data.skills || {},
              projects: data.projects || [],
              avatarUrl: data.avatar_url || '',
              lastIp: data.last_ip || '',
              lastLocation: data.last_location || '',
              lastDevice: data.last_device || '',
              lastSignInAt: data.last_sign_in_at || '',
              updatedAt: data.updated_at,
            };
            setProfile(mapped);
            if (typeof window !== 'undefined') {
              localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(mapped));
            }
            return;
          }

          // If profile row doesn't exist in Supabase yet, create it immediately
          if (error && (error.code === 'PGRST116' || error.message.includes('0 rows'))) {
            const defaultName = userEmail?.split('@')[0] || 'User';
            const initPayload = {
              id: userId,
              full_name: defaultName,
              email: userEmail || '',
              updated_at: new Date().toISOString(),
            };
            const { data: created } = await supabase
              .from('profiles')
              .upsert(initPayload)
              .select('*')
              .single();

            if (created) {
              const mapped: UserProfileData = {
                id: created.id,
                fullName: created.full_name || defaultName,
                email: created.email || userEmail || '',
                updatedAt: created.updated_at,
              };
              setProfile(mapped);
              if (typeof window !== 'undefined') {
                localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(mapped));
              }
              return;
            }
          }
        } catch (err) {
          console.warn('[AuthContext] Failed to load cloud profile:', err);
        }
      }

      // Local storage fallback
      if (typeof window !== 'undefined') {
        const local = localStorage.getItem(LOCAL_PROFILE_KEY);
        if (local) {
          try {
            setProfile(JSON.parse(local));
          } catch {
            // ignore
          }
        }
      }
    },
    [supabase]
  );

  // Record Client IP, Device, and Location place in Supabase
  const recordSessionAudit = useCallback(
    async (userId: string) => {
      try {
        const res = await fetch('/api/auth/record-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId }),
        });
        if (!res.ok) return;
        const meta = await res.json();

        if (supabase && userId) {
          // Update profile with latest sign-in metadata
          await supabase
            .from('profiles')
            .update({
              last_ip: meta.ip,
              last_location: meta.place,
              last_device: meta.device,
              last_sign_in_at: meta.timestamp,
            })
            .eq('id', userId);

          // Update local profile state
          setProfile((prev) =>
            prev
              ? {
                  ...prev,
                  lastIp: meta.ip,
                  lastLocation: meta.place,
                  lastDevice: meta.device,
                  lastSignInAt: meta.timestamp,
                }
              : prev
          );

          // Record in user_access_logs audit table if table exists
          try {
            await supabase.from('user_access_logs').insert({
              user_id: userId,
              ip_address: meta.ip,
              city: meta.city || '',
              country: meta.country || '',
              device: meta.rawDevice || '',
              browser: meta.browser || '',
              os: meta.os || '',
              user_agent: meta.device || '',
              created_at: meta.timestamp,
            });
          } catch {
            // Table might not exist yet
          }
        }
      } catch (err) {
        console.warn('[AuthContext] Session audit error:', err);
      }
    },
    [supabase]
  );

  // Initialize Session
  useEffect(() => {
    if (!supabase) {
      // Local Guest profile
      if (typeof window !== 'undefined') {
        const local = localStorage.getItem(LOCAL_PROFILE_KEY);
        if (local) {
          try {
            setProfile(JSON.parse(local));
          } catch { }
        }
        const localCvs = localStorage.getItem(LOCAL_SAVED_CVS_KEY);
        if (localCvs) {
          try {
            setSavedCvs(JSON.parse(localCvs));
          } catch { }
        }
      }
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user.id, session.user.email);
        recordSessionAudit(session.user.id);
      }
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user.id, session.user.email);
        recordSessionAudit(session.user.id);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase, loadProfile, recordSessionAudit]);

  useEffect(() => {
    refreshSavedCvs();
  }, [refreshSavedCvs]);

  // Sign In with Email & Password
  const signInWithEmail = async (email: string, password: string): Promise<{ error: string | null }> => {
    if (!supabase) {
      return { error: 'Supabase is not configured yet. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment.' };
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { error: error.message };
      return { error: null };
    } catch (err: any) {
      return { error: err?.message || 'Sign in failed' };
    }
  };

  // Sign Up with Email & Password
  const signUpWithEmail = async (
    email: string,
    password: string,
    fullName: string
  ): Promise<{ error: string | null; needsEmailConfirmation?: boolean }> => {
    if (!supabase) {
      return { error: 'Supabase is not configured yet. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment.' };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) return { error: error.message };

      // If user session is created immediately, save profile record to database
      if (data?.user && data.session) {
        try {
          await supabase.from('profiles').upsert({
            id: data.user.id,
            full_name: fullName,
            email: email,
            updated_at: new Date().toISOString(),
          });
        } catch (e) {
          console.warn('[AuthContext] Auto-insert profile on signup:', e);
        }
      }

      const needsEmailConfirmation = Boolean(data?.user && !data.session);
      return { error: null, needsEmailConfirmation };
    } catch (err: any) {
      return { error: err?.message || 'Sign up failed' };
    }
  };

  // Sign In with Google OAuth
  const signInWithGoogle = async (): Promise<{ error: string | null }> => {
    if (!supabase) {
      return { error: 'Supabase is not configured yet.' };
    }

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/profile` : undefined,
        },
      });
      if (error) return { error: error.message };
      return { error: null };
    } catch (err: any) {
      return { error: err?.message || 'Google sign in failed' };
    }
  };

  // Sign Out
  const signOut = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  // Update Profile
  const updateProfile = async (data: Partial<UserProfileData>): Promise<{ error: string | null }> => {
    const updated: UserProfileData = {
      ...(profile || { id: user?.id || 'local-user', fullName: '', email: user?.email || '' }),
      ...data,
      updatedAt: new Date().toISOString(),
    };

    setProfile(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(updated));
    }

    if (supabase && user) {
      try {
        const payload: Record<string, any> = {
          id: user.id,
          updated_at: new Date().toISOString(),
        };

        if (data.fullName !== undefined) payload.full_name = data.fullName;
        if (data.email !== undefined) payload.email = data.email;
        if (data.phone !== undefined) payload.phone = data.phone;
        if (data.location !== undefined) payload.location = data.location;
        if (data.headline !== undefined) payload.headline = data.headline;
        if (data.linkedin !== undefined) payload.linkedin = data.linkedin;
        if (data.github !== undefined) payload.github = data.github;
        if (data.portfolio !== undefined) payload.portfolio = data.portfolio;
        if (data.bio !== undefined) payload.bio = data.bio;
        if (data.education !== undefined) payload.education = data.education;
        if (data.experience !== undefined) payload.experience = data.experience;
        if (data.skills !== undefined) payload.skills = data.skills;
        if (data.projects !== undefined) payload.projects = data.projects;
        if (data.avatarUrl !== undefined) payload.avatar_url = data.avatarUrl;

        const { error } = await supabase.from('profiles').upsert(payload);
        if (error) return { error: error.message };
      } catch (err: any) {
        return { error: err?.message || 'Failed to save profile' };
      }
    }

    return { error: null };
  };

  // Save CV Document
  const saveCvToCloud = async (cv: {
    id?: string;
    title: string;
    templateId: string;
    singletonData: Record<string, string>;
    entriesData: Record<string, Array<Record<string, string>>>;
    styleOverrides?: Record<string, unknown>;
    photoUrl?: string;
  }): Promise<{ id?: string; error: string | null }> => {
    const now = new Date().toISOString();
    const docId = cv.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `cv-${Date.now()}`);

    const newDoc: SavedCvDocument = {
      id: docId,
      title: cv.title || 'My Professional CV',
      templateId: cv.templateId || 'corporate-navy',
      singletonData: cv.singletonData,
      entriesData: cv.entriesData,
      styleOverrides: cv.styleOverrides,
      photoUrl: cv.photoUrl,
      createdAt: now,
      updatedAt: now,
    };

    // Save locally
    const existing = savedCvs.filter((c) => c.id !== docId);
    const updatedList = [newDoc, ...existing];
    setSavedCvs(updatedList);
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_SAVED_CVS_KEY, JSON.stringify(updatedList));
    }

    // Save to Supabase if logged in
    if (supabase && user) {
      try {
        const payload = {
          id: cv.id || undefined,
          user_id: user.id,
          title: cv.title || 'My Professional CV',
          template_id: cv.templateId,
          singleton_data: cv.singletonData,
          entries_data: cv.entriesData,
          style_overrides: cv.styleOverrides || {},
          photo_url: cv.photoUrl || '',
          updated_at: now,
        };

        const { data, error } = await supabase.from('saved_cvs').upsert(payload).select('id').single();
        if (error) return { id: docId, error: error.message };
        if (data?.id) newDoc.id = data.id;
      } catch (err: any) {
        return { id: docId, error: err?.message || 'Failed to sync with cloud' };
      }
    }

    return { id: docId, error: null };
  };

  // Delete CV Document
  const deleteCvFromCloud = async (id: string): Promise<{ error: string | null }> => {
    const updated = savedCvs.filter((c) => c.id !== id);
    setSavedCvs(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_SAVED_CVS_KEY, JSON.stringify(updated));
    }

    if (supabase && user) {
      try {
        const { error } = await supabase.from('saved_cvs').delete().eq('id', id);
        if (error) return { error: error.message };
      } catch (err: any) {
        return { error: err?.message || 'Failed to delete from cloud' };
      }
    }

    return { error: null };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        isConfigured,
        savedCvs,
        refreshSavedCvs,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        signOut,
        updateProfile,
        saveCvToCloud,
        deleteCvFromCloud,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

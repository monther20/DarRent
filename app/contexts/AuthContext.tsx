import React, { createContext, useContext, useState, useEffect } from 'react';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabase'; // Adjust path if necessary
// AsyncStorage is no longer directly needed here for session management, Supabase client handles it.

type UserRole = 'landlord' | 'renter';

// Updated User interface to align with Supabase and custom metadata
interface User {
  id: string;
  email?: string; // Supabase user email
  phone?: string; // Supabase user phone
  name?: string; // From user_metadata
  profileImage?: string | null; // From user_metadata
  role?: UserRole; // From user_metadata
  // Add any other fields you expect from Supabase user object or user_metadata
}

interface AuthContextType {
  user: User | null;
  session: Session | null; // Expose Supabase session
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: any }>;
  logout: () => Promise<void>;
  register: ( // Updated userData type
    userData: {
      email: string;
      password: string;
      fullNameEn: string;
      fullNameAr: string;
      phone: string;
      role: UserRole;
      // Landlord specific
      companyName?: string;
      licenseNumber?: string;
      bankAccountDetails?: string;
      propertyAddress?: string; // New landlord field
      // Renter specific
      preferredLocationEn?: string;
      preferredLocationAr?: string;
      budget?: number;
      desiredMoveInDate?: string; // New renter field
    }
  ) => Promise<{ success: boolean; error?: any; user?: User | null }>;
  // changePassword and updateProfile will also use Supabase
  changePassword: (newPassword: string) => Promise<{ success: boolean; error?: any }>;
  updateProfile: (profileData: { name?: string; phone?: string; profileImage?: string }) => Promise<{ success: boolean; error?: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        setSession(currentSession);
        if (currentSession?.user) {
          setUser(mapSupabaseUserToAppUser(currentSession.user));
        }
      } catch (error) {
        console.error('Error fetching session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        setSession(newSession);
        if (newSession?.user) {
          setUser(mapSupabaseUserToAppUser(newSession.user));
        } else {
          setUser(null);
        }
        setIsLoading(false);
      }
    );

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const mapSupabaseUserToAppUser = (supabaseUser: SupabaseUser): User => {
    return {
      id: supabaseUser.id,
      email: supabaseUser.email,
      phone: supabaseUser.phone || supabaseUser.user_metadata?.phone, // Prioritize direct phone, fallback to metadata
      name: supabaseUser.user_metadata?.fullNameEn || supabaseUser.user_metadata?.name, // Align with new metadata
      profileImage: supabaseUser.user_metadata?.profileImage,
      role: supabaseUser.user_metadata?.role as UserRole,
      // Consider adding fullNameAr if needed in the app's User object
    };
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      if (data.user) setUser(mapSupabaseUserToAppUser(data.user));
      setSession(data.session);
      return { success: true };
    } catch (error: any) {
      console.error('Login error:', error);
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  // Updated register function
  const register = async (
    userData: {
      email: string;
      password: string;
      fullNameEn: string;
      fullNameAr: string;
      phone: string;
      role: UserRole;
      companyName?: string;
      licenseNumber?: string;
      bankAccountDetails?: string;
      propertyAddress?: string; // New landlord field
      preferredLocationEn?: string;
      preferredLocationAr?: string;
      budget?: number;
      desiredMoveInDate?: string; // New renter field
    }
  ) => {
    setIsLoading(true);
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: { // Data stored in auth.users.user_metadata
            fullNameEn: userData.fullNameEn,
            fullNameAr: userData.fullNameAr, // Store Arabic name in metadata
            phone: userData.phone, // Store phone in metadata (can also be top-level in Supabase Auth)
            role: userData.role,
            profileImage: null, // Default or handle separately
            // Raw role-specific data can also be temporarily stored here if Edge Function needs it
            // and if it's simpler than passing everything explicitly.
            // However, for clarity, explicit passing to Edge Function is preferred.
          },
        },
      });

      if (signUpError) throw signUpError;

      if (data.user) {
        const appUser = mapSupabaseUserToAppUser(data.user);
        setUser(appUser);
        setSession(data.session);

        // Prepare comprehensive data for the Edge Function
        // This function will be responsible for creating records in `users` (or `profiles`),
        // `renters`, and `landlords` tables.
        const functionArgs = {
          userId: data.user.id,
          email: data.user.email,
          fullNameEn: userData.fullNameEn,
          fullNameAr: userData.fullNameAr,
          phone: userData.phone,
          role: userData.role,
          // Landlord specific data
          companyName: userData.companyName,
          licenseNumber: userData.licenseNumber,
          bankAccountDetails: userData.bankAccountDetails,
          // Renter specific data
          preferredLocationEn: userData.preferredLocationEn,
          preferredLocationAr: userData.preferredLocationAr,
          budget: userData.budget,
          desiredMoveInDate: userData.desiredMoveInDate, // Pass new renter field
          // Landlord specific (continued)
          propertyAddress: userData.propertyAddress, // Pass new landlord field
          // Add any other fields from your schema that need to be populated
        };

        // console.log('Invoking create-user-profile Edge Function with args:', functionArgs); // For debugging
        const { error: functionError } = await supabase.functions.invoke('create-user-profile', {
          body: functionArgs,
        });

        if (functionError) {
          console.error('Error creating user profile record via Edge Function:', functionError.message);
          // Critical: The user is authenticated, but their profile data is not fully set up.
          // Consider how to handle this:
          // 1. Inform the user and ask them to contact support.
          // 2. Attempt a retry mechanism (if appropriate).
          // 3. Log this for manual intervention.
          // For now, we return success:false for the profile creation part, but auth succeeded.
          // The main `register` function might still be considered a partial success.
          // Or, you could throw an error here to make the entire registration fail.
          return { success: false, error: { message: `User created, but profile setup failed: ${functionError.message}` }, user: appUser };
        } else {
          // console.log('Successfully invoked create-user-profile Edge Function.'); // For debugging
        }
        return { success: true, user: appUser };
      }
      // If data.user is null (e.g., email confirmation pending), the Edge Function is not called here.
      // The most robust way to handle profile creation is via a database trigger on `auth.users` insertion.
      // This ensures the profile is created even if the client-side flow is interrupted
      // or if email confirmation is enabled.
      // If not using a trigger, the Edge Function call here is a good approach for immediate profile creation.
      return { success: true, user: null }; // Indicate auth success, user might need to confirm email
    } catch (error: any) {
      console.error('Registration error:', error.message || error);
      return { success: false, error: { message: error.message || 'An unknown registration error occurred.' } };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      setSession(null);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const changePassword = async (newPassword: string) => {
    setIsLoading(true);
    try {
      if (!session?.user) throw new Error('User not logged in');
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      console.error('Change password error:', error);
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (profileData: { name?: string; phone?: string; profileImage?: string }) => {
    setIsLoading(true);
    try {
      if (!session?.user) throw new Error('User not logged in');
      const { data, error } = await supabase.auth.updateUser({
        data: profileData, // Updates user_metadata
      });
      if (error) throw error;
      if (data.user) setUser(mapSupabaseUserToAppUser(data.user));
      return { success: true };
    } catch (error: any) {
      console.error('Update profile error:', error);
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        login,
        logout,
        register,
        changePassword,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Default export is not typically needed if you export AuthProvider and useAuth
// export default AuthContext;

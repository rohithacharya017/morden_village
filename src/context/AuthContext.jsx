// ==========================================================================
// MODERN VILLAGE - AUTHENTICATION CONTEXT
// Role-Based Auth for Villagers and Panchayat Officials
// OTP flow uses Supabase Phone Auth (real SMS). Falls back to demo mode
// when Supabase is not yet configured (VITE_SUPABASE_URL is blank).
// ==========================================================================

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured, villagerProfileService } from '../services/supabase';

const AuthContext = createContext(null);

// Pre-seeded Villager Profiles (demo accounts - always available)
const KNOWN_VILLAGERS = [
  {
    id: "villager-1",
    full_name: "Rameshwar Patel",
    email: "rameshwar@villager.in",
    mobile_number: "9876543210",
    role: "villager",
    village_name: "Kandavara Gram Panchayat",
    ward_number: "Ward 3"
  },
  {
    id: "villager-2",
    full_name: "Sunita Devi",
    email: "sunita@villager.in",
    mobile_number: "9812345678",
    role: "villager",
    village_name: "Kandavara Gram Panchayat",
    ward_number: "Ward 1"
  },
  {
    id: "villager-3",
    full_name: "Anil Yadav",
    email: "anil@villager.in",
    mobile_number: "9823456789",
    role: "villager",
    village_name: "Kandavara Gram Panchayat",
    ward_number: "Ward 2"
  }
];

const DEMO_VILLAGER = KNOWN_VILLAGERS[0];

const OFFICIAL_CREDENTIALS = {
  email: "official@panchayat.gov.in",
  password: "Admin@567"
};

const DEMO_OFFICIAL = {
  id: "official-1",
  full_name: "Satish Sharma",
  email: "official@panchayat.gov.in",
  mobile_number: "9811122233",
  role: "panchayat_official",
  designation: "Panchayat Secretary",
  panchayat_name: "Kandavara Gram Panchayat (Wards 1-12)",
  district: "Varanasi",
  state: "Uttar Pradesh"
};

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('mv_auth_user');
    if (!saved) return null;
    try {
      const parsed = JSON.parse(saved);
      if (parsed.village_name && parsed.village_name.includes('Rampur')) {
        parsed.village_name = parsed.village_name.replace(/Rampur/g, 'Kandavara');
      }
      if (parsed.panchayat_name && parsed.panchayat_name.includes('Rampur')) {
        parsed.panchayat_name = parsed.panchayat_name.replace(/Rampur/g, 'Kandavara');
      }
      localStorage.setItem('mv_auth_user', JSON.stringify(parsed));
      return parsed;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('mv_auth_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('mv_auth_user');
    }
  }, [currentUser]);

  // -------------------------------------------------------------------------
  // Send OTP to Villager Mobile Number
  // Real path: supabase.auth.signInWithOtp({ phone }) → Supabase sends SMS
  // Demo path (Supabase not configured): no SMS; use test OTP in dev console
  // -------------------------------------------------------------------------
  const sendVillagerOtp = async (mobileNumber, fullName = '') => {
    setLoading(true);
    try {
      const cleanMobile = mobileNumber.replace(/\D/g, '');
      if (cleanMobile.length !== 10 || !/^[6-9]\d{9}$/.test(cleanMobile)) {
        throw new Error('Please enter a valid 10-digit Indian mobile number (starting with 6, 7, 8, or 9).');
      }

      const e164Phone = `+91${cleanMobile}`;

      if (isSupabaseConfigured && supabase) {
        // Real Supabase phone OTP — Supabase sends the SMS via configured provider
        const { error } = await supabase.auth.signInWithOtp({
          phone: e164Phone,
          options: {
            shouldCreateUser: true,
            data: { full_name: fullName }
          }
        });

        if (error) {
          // Provide user-friendly messages for common Supabase errors
          if (error.message?.toLowerCase().includes('phone provider')) {
            throw new Error('SMS service is not yet enabled. Please contact the Panchayat administrator.');
          }
          if (error.message?.toLowerCase().includes('rate limit') || error.status === 429) {
            throw new Error('Too many OTP requests. Please wait a few minutes before trying again.');
          }
          throw new Error(error.message || 'Failed to send OTP. Please try again.');
        }

        return {
          success: true,
          mobileNumber: cleanMobile,
          message: `OTP sent successfully to +91 ${cleanMobile}`
        };
      }

      // Demo / offline mode — Supabase not configured
      // Do NOT generate OTP in frontend; just simulate the send step
      if (import.meta.env.DEV) {
        console.info(
          '%c[DEMO MODE]%c Supabase not configured. Use OTP: 123456 to test the flow.',
          'background: #f59e0b; color: #1c1917; padding: 2px 8px; border-radius: 4px; font-weight: bold;',
          'color: #92400e; font-weight: bold;'
        );
      }

      return {
        success: true,
        mobileNumber: cleanMobile,
        message: `OTP sent to +91 ${cleanMobile} (demo mode)`
      };
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------------------------------------------
  // Verify OTP and Authenticate Villager
  // Real path: supabase.auth.verifyOtp({ phone, token, type: 'sms' })
  //            → upsert profile → set currentUser
  // Demo path: allow '123456' test OTP for known demo villagers + new users
  // -------------------------------------------------------------------------
  const verifyVillagerOtp = async (mobileNumber, otp, fullName = '') => {
    setLoading(true);
    try {
      const cleanMobile = mobileNumber.replace(/\D/g, '');
      const cleanOtp = (otp || '').trim();
      const e164Phone = `+91${cleanMobile}`;

      // Always allow known seeded demo villagers through (bypasses Supabase)
      // This preserves demo functionality regardless of Supabase configuration
      const knownDemo = KNOWN_VILLAGERS.find(u => u.mobile_number === cleanMobile);
      if (knownDemo) {
        // In demo mode (Supabase not configured) accept '123456' test OTP
        if (!isSupabaseConfigured && cleanOtp !== '123456') {
          throw new Error('Invalid OTP. Please enter the correct 6-digit verification code sent to your mobile number.');
        }
        setCurrentUser(knownDemo);
        return { success: true, user: knownDemo };
      }

      if (isSupabaseConfigured && supabase) {
        // Real Supabase OTP verification — server-side, never frontend-generated
        const { data, error } = await supabase.auth.verifyOtp({
          phone: e164Phone,
          token: cleanOtp,
          type: 'sms'
        });

        if (error) {
          if (error.message?.toLowerCase().includes('expired') || error.message?.toLowerCase().includes('otp')) {
            throw new Error('OTP is incorrect or has expired. Please request a new code.');
          }
          if (error.message?.toLowerCase().includes('rate limit') || error.status === 429) {
            throw new Error('Too many failed attempts. Please wait a few minutes and try again.');
          }
          throw new Error(error.message || 'OTP verification failed. Please try again.');
        }

        const authUser = data?.user;
        if (!authUser) {
          throw new Error('Verification failed. Please try sending a new OTP.');
        }

        // Upsert villager profile in database
        let profile = null;
        try {
          profile = await villagerProfileService.upsertProfile({
            id: authUser.id,
            full_name: fullName.trim() || authUser.user_metadata?.full_name || `Villager (${cleanMobile.slice(-4)})`,
            mobile_number: cleanMobile,
            role: 'villager',
            village_name: 'Kandavara Gram Panchayat'
          });
        } catch (profileErr) {
          console.warn('Profile upsert failed, using in-memory profile:', profileErr);
        }

        const userProfile = profile || {
          id: authUser.id,
          full_name: fullName.trim() || authUser.user_metadata?.full_name || `Villager (${cleanMobile.slice(-4)})`,
          email: authUser.email || `${cleanMobile}@villager.in`,
          mobile_number: cleanMobile,
          role: 'villager',
          village_name: 'Kandavara Gram Panchayat',
          ward_number: 'Ward 1'
        };

        setCurrentUser(userProfile);
        return { success: true, user: userProfile };
      }

      // Demo / offline mode (Supabase not configured)
      if (cleanOtp !== '123456') {
        throw new Error('Invalid OTP. Please enter the correct 6-digit verification code sent to your mobile number.');
      }

      // Check localStorage-registered users (demo persistence)
      const registered = JSON.parse(localStorage.getItem('mv_registered_users') || '[]');
      const existing = registered.find(u => u.mobile_number === cleanMobile);
      if (existing) {
        setCurrentUser(existing);
        return { success: true, user: existing };
      }

      // New villager registration in demo mode
      const newVillager = {
        id: `villager-${Date.now()}`,
        full_name: fullName.trim() || `Villager (${cleanMobile.slice(-4)})`,
        email: `${cleanMobile}@villager.in`,
        mobile_number: cleanMobile,
        role: "villager",
        village_name: "Kandavara Gram Panchayat",
        ward_number: "Ward 1"
      };

      registered.push(newVillager);
      localStorage.setItem('mv_registered_users', JSON.stringify(registered));
      setCurrentUser(newVillager);
      return { success: true, user: newVillager };
    } finally {
      setLoading(false);
    }
  };

  // Legacy Villager Registration — now routes through the OTP flow correctly
  const registerVillager = async ({ fullName, email, mobileNumber, password }) => {
    // Registration requires OTP verification; this is a convenience wrapper
    // that initiates the OTP send step. The UI handles the two-step flow.
    return sendVillagerOtp(mobileNumber, fullName);
  };

  // Legacy Villager Login (email-based fallback, preserved for compatibility)
  const loginVillager = async (email, password) => {
    setLoading(true);
    try {
      await new Promise(r => setTimeout(r, 400));
      const known = KNOWN_VILLAGERS.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (known) {
        setCurrentUser(known);
        return { success: true, user: known };
      }

      const registered = JSON.parse(localStorage.getItem('mv_registered_users') || '[]');
      const found = registered.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (found) {
        setCurrentUser(found);
        return { success: true, user: found };
      }

      const guest = {
        id: `villager-${Date.now()}`,
        full_name: email.split('@')[0],
        email,
        mobile_number: "9876543210",
        role: "villager",
        village_name: "Kandavara Gram Panchayat"
      };
      setCurrentUser(guest);
      return { success: true, user: guest };
    } finally {
      setLoading(false);
    }
  };

  // Panchayat Official Login - STRICT CHECK: official@panchayat.gov.in & Admin@567
  // DO NOT MODIFY THIS FUNCTION
  const loginPanchayat = async (email, password) => {
    setLoading(true);
    try {
      await new Promise(r => setTimeout(r, 400));
      const cleanEmail = (email || '').trim().toLowerCase();

      // STRICT VALIDATION
      if (cleanEmail !== OFFICIAL_CREDENTIALS.email || password !== OFFICIAL_CREDENTIALS.password) {
        throw new Error(
          'Incorrect email address or password. Please make corrections and verify your official credentials.'
        );
      }

      setCurrentUser(DEMO_OFFICIAL);
      return { success: true, user: DEMO_OFFICIAL };
    } finally {
      setLoading(false);
    }
  };

  // Quick switch to Demo Villager
  const loginAsDemoVillager = (villagerIndex = 0) => {
    const v = KNOWN_VILLAGERS[villagerIndex] || DEMO_VILLAGER;
    setCurrentUser(v);
  };

  // Logout
  const logout = async () => {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('Supabase signOut error:', err);
      }
    }
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        loading,
        sendVillagerOtp,
        verifyVillagerOtp,
        registerVillager,
        loginVillager,
        loginPanchayat,
        loginAsDemoVillager,
        logout,
        isVillager: currentUser?.role === 'villager',
        isPanchayat: currentUser?.role === 'panchayat_official'
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Building2, Eye, EyeOff, ArrowRight, AlertCircle, Lock } from 'lucide-react';

export default function PanchayatLoginPage({ onNavigate }) {
  const { loginPanchayat } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');

    if (!email.trim() || !password) {
      setAuthError('Please enter both official email address and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await loginPanchayat(email, password);
      if (res.success) {
        onNavigate('panchayat_dashboard');
      }
    } catch (err) {
      setAuthError(err.message || 'Incorrect email or password. Please make corrections.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-8 sm:py-14 animate-fade-in text-left">
      <div className="bg-white rounded-3xl shadow-xl border border-slate-200/80 p-6 sm:p-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center mx-auto mb-3 shadow-md">
            <Building2 className="w-7 h-7" />
          </div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
            OFFICIAL ADMINISTRATION
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
            Panchayat Sign In
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Strictly restricted to authorized Gram Panchayat officials.
          </p>
        </div>

        {/* Error message */}
        {authError && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-700 text-xs animate-fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-relaxed font-semibold">{authError}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Official Email Address <span className="text-rose-500">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. name@panchayat.gov.in"
              autoFocus
              className="w-full text-sm px-4 py-2.5 rounded-xl border border-slate-300 focus:border-slate-900 focus:ring-2 focus:ring-slate-100 outline-none transition"
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-700">
                Administrative Password <span className="text-rose-500">*</span>
              </label>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-sm px-4 py-2.5 pr-10 rounded-xl border border-slate-300 focus:border-slate-900 focus:ring-2 focus:ring-slate-100 outline-none transition font-mono"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-6 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Verifying Role Credentials...</span>
            ) : (
              <>
                <span>Access Panchayat Desk</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-100 text-center">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 text-[11px] text-slate-500 flex items-start gap-2 text-left">
            <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
            <span>
              Villagers cannot access this administrative portal. Villagers must log in through the Citizen Portal using their mobile number.
            </span>
          </div>

          <p className="text-xs text-slate-400 mt-4">
            Are you a Villager?{' '}
            <button
              onClick={() => onNavigate('villager_auth')}
              className="text-emerald-700 font-bold hover:underline"
            >
              Sign in with Mobile OTP
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

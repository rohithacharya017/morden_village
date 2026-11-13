import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Smartphone,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  KeyRound,
  User
} from 'lucide-react';

export default function VillagerAuthPage({ onNavigate }) {
  const { sendVillagerOtp, verifyVillagerOtp } = useAuth();

  // Step 1 = Enter Name & Mobile, Step 2 = Enter OTP
  const [step, setStep] = useState(1);

  // Form Fields: First Name, then Mobile Number
  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [otp, setOtp] = useState('');

  // Timer state for OTP resend
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);

  // UI States
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Timer countdown effect for OTP resend
  useEffect(() => {
    let interval = null;
    if (step === 2 && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  // Step 1: Send OTP (validates name first, then mobile number)
  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    setError('');

    // 1. Validate User Name first
    if (!fullName.trim()) {
      setError('Please enter your full name first.');
      return;
    }

    // 2. Validate Mobile Number second
    const cleanMobile = mobileNumber.replace(/\D/g, '');
    if (cleanMobile.length !== 10 || !/^[6-9]\d{9}$/.test(cleanMobile)) {
      setError('Please enter a valid 10-digit Indian mobile number (starting with 6, 7, 8, or 9).');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await sendVillagerOtp(cleanMobile, fullName);
      if (res.success) {
        setStep(2);
        setTimer(30);
        setCanResend(false);
      }
    } catch (err) {
      setError(err.message || 'Failed to send OTP to mobile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (!canResend) return;
    setIsSubmitting(true);
    setError('');
    try {
      const res = await sendVillagerOtp(mobileNumber, fullName);
      if (res.success) {
        setTimer(30);
        setCanResend(false);
      }
    } catch (err) {
      setError(err.message || 'Failed to resend OTP.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    setError('');

    if (!otp.trim()) {
      setError('Please enter the 6-digit OTP received on your mobile.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await verifyVillagerOtp(mobileNumber, otp, fullName);
      if (res.success) {
        onNavigate('villager_dashboard');
      }
    } catch (err) {
      setError(err.message || 'OTP verification failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8 sm:py-14 animate-fade-in text-left">
      <div className="bg-white rounded-3xl shadow-xl border border-slate-200/80 p-6 sm:p-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto mb-3 shadow-inner">
            <Smartphone className="w-7 h-7" />
          </div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
            CITIZEN ACCESS DESK
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
            Villager Sign In
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-sm mx-auto">
            {step === 1
              ? 'First enter your full name, then your mobile number to receive your verification OTP.'
              : `Enter the 6-digit verification code sent to +91 ${mobileNumber} for ${fullName}`}
          </p>
        </div>


        {/* Global Error Banner */}
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-3 text-rose-700 text-xs animate-fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="font-semibold">{error}</span>
          </div>
        )}

        {/* STEP 1: FIRST TAKE USER NAME, THEN MOBILE NUMBER */}
        {step === 1 && (
          <form onSubmit={handleSendOtp} className="space-y-5">
            {/* 1. Full Name First */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Full Name (Citizen Name) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Rameshwar Patel"
                  autoFocus
                  required
                  className="w-full text-sm font-semibold pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 outline-none transition text-slate-800"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Please enter your name as registered with the village or Panchayat.
              </p>
            </div>

            {/* 2. Mobile Number Second */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Indian Mobile Number <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-xs text-slate-500 font-bold">
                  🇮🇳 +91
                </span>
                <input
                  type="tel"
                  maxLength={10}
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                  placeholder="9876543210"
                  required
                  className="w-full text-base font-mono font-bold pl-16 pr-4 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 outline-none transition tracking-wider"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                The verification OTP will be dispatched to this mobile number.
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !fullName.trim() || mobileNumber.length !== 10}
              className="w-full py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-700/20 transition flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Dispatching OTP...</span>
              ) : (
                <>
                  <span>Send OTP to Mobile Number</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Citizen Portal Trust Badge */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-slate-400 text-xs text-center">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Official Gram Panchayat Citizen Portal • Secure Mobile Verification</span>
            </div>
          </form>
        )}

        {/* STEP 2: VERIFY OTP SENT TO USER'S MOBILE NUMBER */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-5 animate-fade-in">
            {/* Real SMS Verification Notice - OTP is sent to user's mobile */}
            <div className="p-4 bg-emerald-50/90 border border-emerald-200 rounded-2xl text-emerald-950 flex items-start gap-3 shadow-xs">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 shadow-inner">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
                  SMS Verification Code Sent
                </span>
                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                  A 6-digit OTP has been sent via SMS to{' '}
                  <strong className="font-bold text-slate-800">+91 {mobileNumber}</strong> for{' '}
                  <strong className="font-bold text-slate-800">{fullName}</strong>. Please enter the OTP received on your mobile phone below.
                </p>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Enter 6-Digit Verification Code:
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setOtp('');
                    setError('');
                  }}
                  className="text-[11px] text-emerald-700 hover:underline font-semibold"
                >
                  Change Name / Mobile
                </button>
              </div>

              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="• • • • • •"
                  autoFocus
                  required
                  className="w-full text-center text-xl font-mono font-extrabold tracking-[0.5em] pl-10 pr-4 py-3 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 outline-none transition"
                />
              </div>
            </div>

            {/* Resend Timer & Button */}
            <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
              <span>Didn't receive the SMS on +91 {mobileNumber}?</span>
              {canResend ? (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={isSubmitting}
                  className="font-bold text-emerald-700 hover:underline flex items-center gap-1"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Resend OTP</span>
                </button>
              ) : (
                <span className="text-slate-400 font-medium">
                  Resend available in <strong className="font-mono text-slate-600">{timer}s</strong>
                </span>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setOtp('');
                  setError('');
                }}
                className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                type="submit"
                disabled={isSubmitting || otp.length < 4}
                className="flex-1 py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-700/20 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Verifying...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Verify OTP & Open Dashboard</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Footer Guidance */}
        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-400">
            Are you a Gram Panchayat Official?{' '}
            <button
              onClick={() => onNavigate('panchayat_login')}
              className="text-slate-700 font-bold hover:underline"
            >
              Sign in via Official Portal
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

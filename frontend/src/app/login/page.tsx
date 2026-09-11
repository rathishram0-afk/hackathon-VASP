'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  Shield,
  Lock,
  KeyRound,
  BadgeCheck,
  UserCheck,
  ArrowRight,
  Fingerprint,
  FileCheck2,
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, signUp, user } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [emailInput, setEmailInput] = useState<string>(user?.email || '');
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [fullNameInput, setFullNameInput] = useState<string>('');
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim() || !passwordInput) return;

    setIsSubmitting(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    const result =
      mode === 'signin'
        ? await login(emailInput.trim(), passwordInput)
        : await signUp(emailInput.trim(), passwordInput, fullNameInput.trim() || undefined);

    setIsSubmitting(false);

    if (!result.success) {
      setErrorMessage(result.error || 'Authentication failed.');
      return;
    }

    if (mode === 'signup') {
      setSuccessMessage('Account created. Check your inbox to confirm your email if required, then sign in.');
      setMode('signin');
      return;
    }

    setSuccessMessage('Credentials attested. Opening forensic workspace...');
    setTimeout(() => {
      router.push('/dashboard');
    }, 600);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-canvas-cream font-dmsans">
      {/* Top Brand Bar */}
      <header className="w-full px-6 sm:px-12 py-6 flex items-center justify-between border-b border-surface-dim/70 bg-pure-white/80 backdrop-blur-xs">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-2xl bg-signal-orange flex items-center justify-center text-ink-black shadow-xs shrink-0">
            <Shield className="w-5 h-5 text-ink-black" />
          </div>
          <div className="flex flex-col">
            <span className="font-outfit font-extrabold text-base tracking-wider text-ink-black uppercase leading-tight">
              VASP <span className="text-signal-orange">TRACE</span>
            </span>
            <span className="font-outfit text-[10px] text-slate-gray font-medium tracking-wide">
              Trace. Analyze. Attribute.
            </span>
          </div>
        </Link>

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-lifted-cream border border-surface-dim font-outfit text-xs font-bold text-ink-black shadow-2xs">
          <BadgeCheck className="w-4 h-4 text-emerald-600" />
          <span>PORTAL STATUS: OPERATIONAL</span>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-12">
        <div className="w-full max-w-xl space-y-8">
          {/* Headline & Badges */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-lifted-cream border border-surface-dim shadow-2xs">
              <Lock className="w-3.5 h-3.5 text-signal-orange" />
              <span className="font-outfit text-xs font-bold text-ink-black uppercase tracking-wider">
                LE-Grade Access Control • ISO/IEC 27037
              </span>
            </div>

            <h1 className="font-outfit font-black text-3xl sm:text-4xl text-ink-black tracking-tight uppercase">
              Analyst Authentication
            </h1>

            <p className="font-dmsans text-xs sm:text-sm text-slate-gray max-w-md mx-auto leading-relaxed">
              Sign in with your agency credentials to access multi-hop transaction reconstruction and VASP attribution.
            </p>
          </div>

          {/* Login Card */}
          <div className="p-8 sm:p-10 rounded-[36px] bg-pure-white border border-surface-dim shadow-[0_24px_48px_rgba(20,20,19,0.06)] space-y-6">
            {successMessage && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 font-outfit text-xs flex items-center gap-2.5 shadow-2xs">
                <UserCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-bold">{successMessage}</span>
              </div>
            )}

            {errorMessage && (
              <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-900 font-outfit text-xs flex items-center gap-2.5 shadow-2xs">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span className="font-bold">{errorMessage}</span>
              </div>
            )}

            {/* Sign In / Sign Up toggle */}
            <div className="flex items-center gap-2 p-1 rounded-full bg-surface-container border border-surface-dim font-outfit text-xs font-bold">
              <button
                type="button"
                onClick={() => { setMode('signin'); setErrorMessage(null); setSuccessMessage(null); }}
                className={`flex-1 py-2 rounded-full transition-colors cursor-pointer ${mode === 'signin' ? 'bg-ink-black text-pure-white' : 'text-slate-gray hover:text-ink-black'}`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setMode('signup'); setErrorMessage(null); setSuccessMessage(null); }}
                className={`flex-1 py-2 rounded-full transition-colors cursor-pointer ${mode === 'signup' ? 'bg-ink-black text-pure-white' : 'text-slate-gray hover:text-ink-black'}`}
              >
                Create Account
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {mode === 'signup' && (
                <div className="space-y-1.5">
                  <label className="font-outfit font-bold text-xs text-ink-black uppercase tracking-wider block">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={fullNameInput}
                    onChange={(e) => setFullNameInput(e.target.value)}
                    placeholder="e.g. Agent D. Vance"
                    className="w-full bg-surface-container font-mono text-xs text-ink-black px-4 py-3.5 rounded-2xl border border-surface-dim focus:outline-none focus:ring-2 focus:ring-ink-black placeholder:text-slate-gray"
                  />
                </div>
              )}

              {/* Agency Email / Badge ID */}
              <div className="space-y-1.5">
                <label className="font-outfit font-bold text-xs text-ink-black uppercase tracking-wider block">
                  Official Agency Email
                </label>
                <div className="relative flex items-center">
                  <input
                    type="email"
                    required
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="e.g. d.vance@cybercrime.fbi.gov"
                    className="w-full bg-surface-container font-mono text-xs text-ink-black px-4 py-3.5 rounded-2xl border border-surface-dim focus:outline-none focus:ring-2 focus:ring-ink-black placeholder:text-slate-gray"
                  />
                  <Fingerprint className="w-4 h-4 text-slate-gray absolute right-4 pointer-events-none" />
                </div>
              </div>

              {/* Password / Hardware PIN */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-outfit font-bold text-xs text-ink-black uppercase tracking-wider">
                    Station Passkey / PIN
                  </label>
                  <span className="font-outfit text-[11px] text-signal-orange font-semibold">
                    FIPS 140-2 Compliant
                  </span>
                </div>
                <div className="relative flex items-center">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="Enter password"
                    className="w-full bg-surface-container font-mono text-xs text-ink-black px-4 py-3.5 rounded-2xl border border-surface-dim focus:outline-none focus:ring-2 focus:ring-ink-black placeholder:text-slate-gray"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 text-slate-gray hover:text-ink-black p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Options */}
              <div className="flex items-center justify-between font-outfit text-xs pt-1">
                <label className="flex items-center gap-2 text-slate-gray cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded accent-signal-orange"
                  />
                  <span>Remember session on workstation</span>
                </label>

                <span className="text-slate-gray font-medium">Session TTL: 8 Hours</span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-full bg-ink-black hover:bg-signal-orange text-pure-white font-outfit font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-pure-white border-t-transparent rounded-full animate-spin"></span>
                    <span>{mode === 'signin' ? 'Verifying Credentials...' : 'Creating Account...'}</span>
                  </>
                ) : (
                  <>
                    <span>{mode === 'signin' ? 'Authenticate & Access Terminal' : 'Create Account'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Legal Warning Notice */}
          <div className="p-4 rounded-2xl bg-lifted-cream border border-surface-dim text-slate-gray font-outfit text-[11px] flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-signal-orange shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Official Use Notice:</strong> This terminal is restricted to authorized digital asset investigators and compliance officers. Unauthorized access attempts are monitored and recorded.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full px-6 py-4 border-t border-surface-dim/70 text-center font-outfit text-xs text-slate-gray">
        <span>VASP Trace Autonomous Intelligence Platform • Security Protocol v2.4</span>
      </footer>
    </div>
  );
}

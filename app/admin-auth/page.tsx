'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { Eye, EyeOff, ShieldCheck, Lock, ArrowLeft, Send, CheckCircle2 } from 'lucide-react';
import Loading from '../../components/ui/Loading';
import { useTheme } from '../../contexts/ThemeContext';
import { useToast } from '../../contexts/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminLogin() {
  const { theme } = useTheme();
  const { success, error } = useToast();
  const router = useRouter();

  useEffect(() => {
    const token = Cookies.get('adminToken');
    if (token) {
      router.replace('/admin');
    }
  }, [router]);

  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);

  // Forgot Password States
  const [isForgotMode, setIsForgotMode] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetToken, setResetToken] = useState('');

  const handleLogin = async () => {
    setSubmitAttempted(true);
    if (!password) {
      error('Access key required');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      const data = await res.json();
      if (data.success) {
        success('Access Granted');
        Cookies.set('adminToken', data.token, { expires: 365, secure: true, sameSite: 'Strict' });
        Cookies.set('adminUser', JSON.stringify(data.user), { expires: 365, secure: true, sameSite: 'Strict' });
        setTimeout(() => router.push('/admin'), 1000);
      } else {
        error(data.message || 'Verification failed');
      }
    } catch (err) {
      error('Security service error');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestOtp = async () => {
    if (!forgotEmail) {
      error('Admin email is required');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/admin/auth/forgot-password/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail })
      });
      const data = await res.json();
      if (data.success) {
        success('OTP sent to admin email');
        setOtpSent(true);
        setResetToken(data.token);
      } else {
        error(data.message || 'Failed to send OTP');
      }
    } catch (err) {
      error('Service error');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) {
      error('OTP required');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/admin/auth/forgot-password/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail, otp, token: resetToken })
      });
      const data = await res.json();
      if (data.success) {
        success('Verified');
        setOtpVerified(true);
      } else {
        error(data.message || 'Invalid OTP');
      }
    } catch (err) {
      error('Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      error('Password must be at least 6 chars');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/admin/auth/forgot-password/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail, newPassword, token: resetToken })
      });
      const data = await res.json();
      if (data.success) {
        success('Password updated successfully');
        setIsForgotMode(false);
        setOtpSent(false);
        setOtpVerified(false);
        setPassword('');
      } else {
        error(data.message || 'Reset failed');
      }
    } catch (err) {
      error('System error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-black text-white font-sans overflow-hidden"
    >

      {loading && <Loading fullPage hideAnimation text="Service Active..." />}

      {/* LEFT SIDE - VIBRANT SECURITY CARD */}
      <motion.div
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "circOut" }}
        className="hidden md:flex items-center justify-center p-6 bg-black"
      >
        <div className="relative w-full h-[95%] rounded-[40px] overflow-hidden flex flex-col justify-end p-12 bg-gradient-to-t from-[#0a0a0a] via-[#1e1b4b] to-[#312e81] shadow-[0_0_50px_rgba(59,130,246,0.1)]">
          <div className="absolute top-12 left-12 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <ShieldCheck className="text-white" size={20} />
            </div>
            <span className="text-xl font-bold tracking-tight">Admin Central</span>
          </div>

          <div className="z-10 relative">
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-5xl font-extrabold leading-tight mb-6"
            >
              System <br /> Governance
            </motion.h1>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-white/60 text-lg max-w-md leading-relaxed mb-10"
            >
              Exclusive interface for system administrators to oversee attendance, performance, and operational health.
            </motion.p>

            <div className="space-y-4">
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex items-center gap-4 p-5 rounded-3xl bg-white/5 backdrop-blur-2xl border border-white/10"
              >
                <div className="w-10 h-10 rounded-2xl bg-blue-600/20 text-blue-400 flex items-center justify-center">
                  <Lock size={20} />
                </div>
                <div>
                  <p className="font-bold text-sm text-white">Encrypted Session</p>
                  <p className="text-xs text-white/40">AES-256 protection active</p>
                </div>
              </motion.div>
            </div>
          </div>

          <div className="absolute top-1/4 -right-20 w-80 h-80 bg-blue-600/10 blur-[120px] rounded-full"></div>
        </div>
      </motion.div>

      {/* RIGHT SIDE - FORMS */}
      <motion.div
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "circOut" }}
        className="flex flex-col items-center justify-center p-8 md:p-12 bg-black relative"
      >
        <div className="w-full max-w-md">
          <AnimatePresence mode="wait">
            {!isForgotMode ? (
              /* LOGIN FORM */
              <motion.div
                key="login"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                transition={{ duration: 0.4 }}
              >
                <div className="mb-12">
                  <h2 className="text-4xl font-extrabold mb-3">Admin Access</h2>
                  <p className="text-gray-500">Authorized personnel only. Enter security key.</p>
                </div>

                <div className="space-y-8">
                  <div>
                    <div className="flex justify-between items-center mb-3 mx-1">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Access Password</label>
                      <button
                        onClick={() => setIsForgotMode(true)}
                        className="text-[11px] text-blue-400 hover:text-blue-300 font-bold uppercase tracking-wider"
                      >
                        Reset Key?
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter Access Key"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                        className="w-full px-6 py-5 rounded-[24px] bg-[#0d0d0d] border border-[#1a1a1a] focus:border-blue-500 outline-none transition-all duration-500 text-sm font-medium tracking-widest pr-14"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white transition-colors"
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                    {submitAttempted && !password && (
                      <p className="text-xs text-red-500 mt-3 ml-2 font-medium">Access key is mandatory*</p>
                    )}
                  </div>

                  <button
                    onClick={handleLogin}
                    disabled={loading}
                    className="w-full py-5 rounded-[24px] bg-white text-black text-[16px] font-black hover:bg-gray-200 active:scale-[0.97] transition-all duration-300 shadow-2xl shadow-blue-500/10 uppercase tracking-widest"
                  >
                    Authenticate
                  </button>

                  <div className="text-center mt-12 opacity-20">
                    <p className="text-[11px] text-gray-600 uppercase tracking-[0.2em] font-bold">
                      Timetricx v2.0 • Security Node Alpha
                    </p>
                  </div>
                </div>
              </motion.div>
            ) : (
              /* FORGOT PASSWORD FLOW */
              <motion.div
                key="forgot"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                transition={{ duration: 0.4 }}
              >
                <button
                  onClick={() => { setIsForgotMode(false); setOtpSent(false); setOtpVerified(false); }}
                  className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors mb-8 font-bold text-xs uppercase tracking-widest"
                >
                  <ArrowLeft size={16} /> Back to Entry
                </button>

                {!otpSent ? (
                  /* STEP 1: Request OTP */
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-3xl font-extrabold mb-3">Recover Access</h2>
                      <p className="text-gray-500 text-sm">Enter your registered admin email to receive verify token.</p>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 block ml-1">Identity Email</label>
                      <input
                        type="email"
                        placeholder="admin@timetricx.com"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        className="w-full px-6 py-5 rounded-[24px] bg-[#0d0d0d] border border-[#1a1a1a] focus:border-blue-500 outline-none transition-all text-sm font-medium"
                      />
                    </div>
                    <button
                      onClick={handleRequestOtp}
                      className="w-full py-5 rounded-[24px] bg-blue-600 text-white text-[14px] font-black hover:bg-blue-700 transition-all uppercase tracking-widest flex items-center justify-center gap-3"
                    >
                      <Send size={18} /> Send Token
                    </button>
                  </div>
                ) : !otpVerified ? (
                  /* STEP 2: Verify OTP */
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-3xl font-extrabold mb-3">Verification</h2>
                      <p className="text-gray-500 text-sm">A 6-digit code has been sent to your administrator email.</p>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 block ml-1">Enter Token</label>
                      <input
                        type="text"
                        maxLength={6}
                        placeholder="000000"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="w-full px-6 py-5 rounded-[24px] bg-[#0d0d0d] border border-[#1a1a1a] focus:border-blue-500 outline-none transition-all text-center text-2xl font-black tracking-[1em]"
                      />
                    </div>
                    <button
                      onClick={handleVerifyOtp}
                      className="w-full py-5 rounded-[24px] bg-white text-black text-[14px] font-black hover:bg-gray-200 transition-all uppercase tracking-widest"
                    >
                      Verify Now
                    </button>
                    <button onClick={handleRequestOtp} className="w-full text-xs text-blue-400 font-bold uppercase tracking-widest">Resend Token</button>
                  </div>
                ) : (
                  /* STEP 3: Reset Password */
                  <div className="space-y-6">
                    <div>
                      <div className="w-12 h-12 rounded-2xl bg-green-500/20 text-green-400 flex items-center justify-center mb-4">
                        <CheckCircle2 size={28} />
                      </div>
                      <h2 className="text-3xl font-extrabold mb-3">Set New Access</h2>
                      <p className="text-gray-500 text-sm">Security verified. Define your new master access key.</p>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 block ml-1">New Password</label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-6 py-5 rounded-[24px] bg-[#0d0d0d] border border-[#1a1a1a] focus:border-blue-500 outline-none transition-all text-sm font-medium"
                      />
                    </div>
                    <button
                      onClick={handleResetPassword}
                      className="w-full py-5 rounded-[24px] bg-blue-600 text-white text-[14px] font-black hover:bg-blue-700 transition-all uppercase tracking-widest"
                    >
                      Update Master Key
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

    </motion.div>
  );
}

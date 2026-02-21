import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios, { AxiosError } from 'axios';
import { Eye, EyeOff, CheckCircle, AlertCircle, Loader, Lock } from 'lucide-react';

interface Message {
  type: 'success' | 'error' | '';
  text: string;
}

interface StrengthInfo {
  label: string;
  color: string;
}

const SetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<Message>({ type: '', text: '' });
  const [passwordStrength, setPasswordStrength] = useState<number>(0);

  const calculatePasswordStrength = (pwd: string): number => {
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (pwd.length >= 12) strength++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength++;
    if (/\d/.test(pwd)) strength++;
    if (/[^a-zA-Z\d]/.test(pwd)) strength++;
    return strength;
  };

  const getStrengthLabel = (strength: number): StrengthInfo => {
    switch (strength) {
      case 0: return { label: 'Very Weak', color: 'bg-red-500' };
      case 1: return { label: 'Weak', color: 'bg-orange-500' };
      case 2: return { label: 'Fair', color: 'bg-yellow-500' };
      case 3: return { label: 'Good', color: 'bg-lime-500' };
      case 4: return { label: 'Strong', color: 'bg-green-500' };
      case 5: return { label: 'Very Strong', color: 'bg-emerald-500' };
      default: return { label: 'Unknown', color: 'bg-slate-500' };
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const pwd = e.target.value;
    setPassword(pwd);
    setPasswordStrength(calculatePasswordStrength(pwd));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match!' });
      return;
    }

    if (!token) {
      setMessage({ type: 'error', text: 'Invalid or missing token.' });
      return;
    }

    if (password.length < 8) {
      setMessage({ type: 'error', text: 'Password must be at least 8 characters long.' });
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post<{ message: string }>(
  `${import.meta.env.VITE_API_URL}/auth/set-password`,
  { token, newPassword: password }
);

      setMessage({ type: 'success', text: response.data.message });
      setTimeout(() => navigate('/login'), 3000);
    } catch (err: unknown) {
  if (axios.isAxiosError(err)) {
    const axiosErr = err as AxiosError<{ message: string }>;
    setMessage({ type: 'error', text: axiosErr.response?.data?.message || 'Something went wrong' });
  } else if (err instanceof Error) {
    setMessage({ type: 'error', text: err.message });
  }
} finally {
      setLoading(false);
    }
  };

  const strengthInfo = getStrengthLabel(passwordStrength);
  const passwordsMatch = password && confirmPassword && password === confirmPassword;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4 overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Card */}
      <div className="relative w-full max-w-md">
        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl p-8 md:p-10">
          {/* Header */}
          <div className="mb-8 flex items-center justify-center">
            <div className="p-3 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-lg mb-4">
              <Lock className="w-6 h-6 text-emerald-400" />
            </div>
          </div>

          <div className="mb-8 text-center">
            <h1 className="text-3xl font-light tracking-tight text-white mb-2">Set New Password</h1>
            <p className="text-slate-400 text-sm font-light">Create a strong password to secure your account</p>
          </div>

          {/* Message */}
          {message.type && (
            <div
              className={`mb-6 p-5 rounded-lg border ${
                message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-red-500/10 border-red-500/30'
              } animate-in fade-in slide-in-from-top-2 duration-300`}
            >
              <div className="flex items-start gap-3">
                {message.type === 'success' ? (
                  <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <h3 className={`text-sm font-semibold mb-1 ${message.type === 'success' ? 'text-emerald-300' : 'text-red-300'}`}>
                    {message.type === 'success' ? 'Password updated successfully' : 'Error'}
                  </h3>
                  <p className={`text-sm ${message.type === 'success' ? 'text-emerald-200/70' : 'text-red-200/70'}`}>
                    {message.text} {message.type === 'success' && 'Redirecting to login...'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Form */}
          {message.type !== 'success' && (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Password */}
              <div className="group">
                <label className="block text-xs font-medium text-slate-300 mb-2 uppercase tracking-wider">New Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={handlePasswordChange}
                    disabled={loading}
                    required
                    className="w-full px-4 py-3 pr-12 bg-slate-700/30 border border-slate-600/50 rounded-lg text-white placeholder-slate-500 transition-all duration-200 focus:outline-none focus:border-emerald-500/50 focus:bg-slate-700/50 focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors duration-200"
                    disabled={loading}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Strength */}
                {password && (
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div className={`${strengthInfo.color} h-full transition-all duration-300`} style={{ width: `${(passwordStrength / 5) * 100}%` }}></div>
                      </div>
                      <span className="text-xs font-semibold">{strengthInfo.label}</span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Use uppercase, lowercase, numbers, and symbols for a stronger password
                    </p>
                  </div>
                )}
              </div>

              {/* Confirm password */}
              <div className="group">
                <label className="block text-xs font-medium text-slate-300 mb-2 uppercase tracking-wider">Confirm Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={loading}
                    required
                    className="w-full px-4 py-3 pr-12 bg-slate-700/30 border border-slate-600/50 rounded-lg text-white placeholder-slate-500 transition-all duration-200 focus:outline-none focus:border-emerald-500/50 focus:bg-slate-700/50 focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors duration-200"
                    disabled={loading}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Match indicator */}
                {confirmPassword && (
                  <div className={`mt-2 flex items-center gap-2 text-xs font-medium ${passwordsMatch ? 'text-emerald-400' : 'text-red-400'}`}>
                    {passwordsMatch ? (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        <span>Passwords match</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-4 h-4" />
                        <span>Passwords don't match</span>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || !passwordsMatch || password.length < 8}
                className="w-full py-3 mt-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:from-slate-600 disabled:to-slate-500 text-white font-medium rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    <span>Updating Password...</span>
                  </>
                ) : (
                  'Set Password'
                )}
              </button>
            </form>
          )}

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-slate-700/30 text-center">
            <p className="text-slate-400 text-sm">
              Remember your password?{' '}
              <button onClick={() => navigate('/login')} className="text-emerald-400 hover:text-emerald-300 font-medium">
                Sign in instead
              </button>
            </p>
          </div>
        </div>

        {/* Decorative */}
        <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none"></div>
        <div className="absolute -top-4 -left-4 w-20 h-20 bg-teal-500/5 rounded-full blur-2xl pointer-events-none"></div>
      </div>
    </div>
  );
};

export default SetPassword;
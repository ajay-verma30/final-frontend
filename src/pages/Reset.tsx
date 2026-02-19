import { useState } from "react";
import { AlertCircle, CheckCircle, Loader, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

 const handleResetPassword = async (e: React.FormEvent) => {
  e.preventDefault();
  setError("");
  setSuccess(false);

  if (!email.trim()) {
    setError("Please enter your email address");
    return;
  }

  if (!validateEmail(email)) {
    setError("Please enter a valid email address");
    return;
  }

  setLoading(true);

  try {
    const res = await fetch("http://localhost:5000/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();

    if (res.ok) {
      setSuccess(true);
      setEmail("");
    } else {
      setError(data.message || "Failed to send reset link");
    }
  } catch (err) {
    setError("Connection error. Please try again.");
    console.error(err);
  } finally {
    setLoading(false);
  }
};

  const handleLogin = ()=>{
    navigate('/login')
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }}></div>
      </div>
      <div className="relative w-full max-w-md">
        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl p-8 md:p-10">
          <a
            href="/login"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-300 transition-colors duration-200 mb-6 font-medium text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </a>

          <div className="mb-8">
            <h1 className="text-3xl font-light tracking-tight text-white mb-2">
              Reset Password
            </h1>
            <p className="text-slate-400 text-sm font-light">
              Enter your registered email address and we'll send you a link to reset your password
            </p>
          </div>

          {success && (
            <div className="mb-6 p-5 bg-emerald-500/10 border border-emerald-500/30 rounded-lg animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-emerald-300 text-sm font-semibold mb-1">
                    Email sent successfully
                  </h3>
                  <p className="text-emerald-200/70 text-sm">
                    Check your email for the password reset link. You'll be redirected to login shortly.
                  </p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 p-5 bg-red-500/10 border border-red-500/30 rounded-lg animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-red-300 text-sm font-semibold mb-1">
                    Error
                  </h3>
                  <p className="text-red-200/70 text-sm">{error}</p>
                </div>
              </div>
            </div>
          )}

          {!success ? (
            <form onSubmit={handleResetPassword} className="space-y-6">
              <div className="group">
                <label className="block text-xs font-medium text-slate-300 mb-2 uppercase tracking-wider">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className="w-full px-4 py-3 bg-slate-700/30 border border-slate-600/50 rounded-lg text-white placeholder-slate-500 transition-all duration-200 focus:outline-none focus:border-blue-500/50 focus:bg-slate-700/50 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-lg">
                <p className="text-blue-300/80 text-xs leading-relaxed">
                  <span className="font-semibold">Note:</span> The password reset link will expire in 24 hours. Make sure to check your spam folder if you don't see the email.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 disabled:from-slate-600 disabled:to-slate-500 text-white font-medium rounded-lg transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100 disabled:opacity-60 flex items-center justify-center gap-2 group"
              >
                {loading ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    <span>Sending link...</span>
                  </>
                ) : (
                  "Send Password Reset Link"
                )}
              </button>
            </form>
          ) : null}

          <div className="mt-8 pt-6 border-t border-slate-700/30 text-center">
            <p className="text-slate-400 text-sm">
              Remember your password?{" "}
              <a
                href="/login"
                className="text-blue-400 hover:text-blue-300 font-medium transition-colors duration-200"
                onClick={handleLogin}
              >
                Sign in instead
              </a>
            </p>
          </div>
        </div>

        <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl pointer-events-none"></div>
        <div className="absolute -top-4 -left-4 w-20 h-20 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none"></div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700&family=Inter:wght@300;400;500;600&display=swap');
        
        body {
          font-family: 'Inter', sans-serif;
        }
        
        h1, h2, h3, h4, h5, h6 {
          font-family: 'Syne', sans-serif;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideIn {
          from {
            transform: translateY(-8px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .animate-in {
          animation: fadeIn 0.3s ease-out;
          &.slide-in-from-top-2 {
            animation: slideIn 0.3s ease-out;
          }
        }

        input::-webkit-outer-spin-button,
        input::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }

        input[type=number] {
          -moz-appearance: textfield;
        }
      `}</style>
    </div>
  );
};

export default ResetPassword;
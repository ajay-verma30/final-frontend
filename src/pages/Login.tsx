import { useState } from "react";
import { AlertCircle, CheckCircle, Loader } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [success, setSuccess] = useState(false);

  // AuthContext
  const { loginWithCredentials, loading, error } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(false);

    // Validation
    if (!email.trim() || !password.trim()) {
      alert("Please fill in all fields");
      return;
    }

   try {
      await loginWithCredentials(email, password);
      setSuccess(true);

      setTimeout(() => {
        navigate("/dashboard"); 
      }, 1500);
    } catch (err) {
      console.error("Login component error:", err);
    }
  };

  const handelReset = ()=>{
    navigate('/reset')
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
      </div>

      {/* Login card */}
      <div className="relative w-full max-w-md">
        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl p-8 md:p-10">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-light tracking-tight text-white mb-2">
              Welcome Back
            </h1>
            <p className="text-slate-400 text-sm font-light">
              Enter your credentials to access your account
            </p>
          </div>

          {/* Success state */}
          {success && (
            <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
              <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <span className="text-emerald-300 text-sm font-medium">
                Login successful. Redirecting...
              </span>
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <span className="text-red-300 text-sm font-medium">{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="group">
              <input
                type="text"
                placeholder="your.email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="w-full px-4 py-3 bg-slate-700/30 border border-slate-600/50 rounded-lg text-white placeholder-slate-500 transition-all duration-200 focus:outline-none focus:border-blue-500/50 focus:bg-slate-700/50 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            <div className="group">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider">
                  Password
                </label>
                <a
                  href="#"
                  className="text-xs text-blue-400 hover:text-blue-300 transition-colors duration-200 font-medium"
                  onClick={handelReset}
                >
                  Forgot?
                </a>
              </div>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="w-full px-4 py-3 bg-slate-700/30 border border-slate-600/50 rounded-lg text-white placeholder-slate-500 transition-all duration-200 focus:outline-none focus:border-blue-500/50 focus:bg-slate-700/50 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            <button
              type="submit"
              disabled={loading || success}
              className="w-full py-3 mt-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 disabled:from-slate-600 disabled:to-slate-500 text-white font-medium rounded-lg transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100 disabled:opacity-60 flex items-center justify-center gap-2 group"
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : success ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Success</span>
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
import { useState } from "react";
import { AlertCircle, CheckCircle, Loader, LayoutDashboard, ShoppingBag } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [success, setSuccess] = useState(false);
  const [showRoleChoice, setShowRoleChoice] = useState(false);

  const { loginWithCredentials, loading, error } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(false);

    if (!email.trim() || !password.trim()) {
      alert("Please fill in all fields");
      return;
    }

    try {
      const userData = await loginWithCredentials(email, password);
      setSuccess(true);

      if (userData?.role === "ENDUSER") {
        setTimeout(() => navigate("/"), 1500);
      } else {
        // SUPER or ADMIN — ask what they want to do
        setShowRoleChoice(true);
      }
    } catch (err) {
      console.error("Login component error:", err);
    }
  };

  const handelReset = () => navigate("/reset");

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
      </div>

      <div className="relative w-full max-w-md">
        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl p-8 md:p-10">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-light tracking-tight text-white mb-2">Welcome Back</h1>
            <p className="text-slate-400 text-sm font-light">
              Enter your credentials to access your account
            </p>
          </div>

          {success && !showRoleChoice && (
            <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
              <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <span className="text-emerald-300 text-sm font-medium">
                Login successful. Redirecting...
              </span>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <span className="text-red-300 text-sm font-medium">{error}</span>
            </div>
          )}

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

      {/* ── Role Choice Modal ─────────────────────────────────────────── */}
      {showRoleChoice && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div
            className="bg-slate-800 border border-slate-700/50 rounded-2xl shadow-2xl w-full max-w-sm p-8"
            style={{ animation: "slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)" }}
          >
            <div className="text-center mb-7">
              <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-6 h-6 text-emerald-400" />
              </div>
              <h2 className="text-xl font-semibold text-white mb-1">Welcome back!</h2>
              <p className="text-slate-400 text-sm">What would you like to do today?</p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => navigate("/dashboard")}
                className="w-full flex items-center gap-4 px-5 py-4 bg-slate-700/50 hover:bg-blue-600/20 border border-slate-600/50 hover:border-blue-500/50 rounded-xl transition-all duration-200 group"
              >
                <div className="w-10 h-10 bg-blue-500/10 group-hover:bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors">
                  <LayoutDashboard className="w-5 h-5 text-blue-400" />
                </div>
                <div className="text-left">
                  <p className="text-white font-medium text-sm">Go to Dashboard</p>
                  <p className="text-slate-400 text-xs">Manage products, orders & settings</p>
                </div>
              </button>

              <button
                onClick={() => navigate("/")}
                className="w-full flex items-center gap-4 px-5 py-4 bg-slate-700/50 hover:bg-emerald-600/20 border border-slate-600/50 hover:border-emerald-500/50 rounded-xl transition-all duration-200 group"
              >
                <div className="w-10 h-10 bg-emerald-500/10 group-hover:bg-emerald-500/20 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors">
                  <ShoppingBag className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="text-left">
                  <p className="text-white font-medium text-sm">Shop as User</p>
                  <p className="text-slate-400 text-xs">Browse and order products</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
};

export default Login;
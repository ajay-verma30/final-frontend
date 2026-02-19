import React from 'react';
import { Link } from 'react-router-dom';
import { Home, AlertTriangle, ArrowLeft } from 'lucide-react';

const NotFound: React.FC = () => {
  return (
    <div className="h-screen w-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* Animated Icon */}
        <div className="relative mb-8 flex justify-center">
          <div className="absolute inset-0 bg-blue-100 rounded-full scale-150 blur-2xl opacity-50 animate-pulse"></div>
          <div className="relative p-6 bg-white rounded-3xl shadow-xl border border-slate-100 text-blue-600">
            <AlertTriangle size={64} strokeWidth={1.5} />
          </div>
        </div>

        {/* Text Content */}
        <h1 className="text-8xl font-black text-slate-200 mb-2 italic">404</h1>
        <h2 className="text-3xl font-bold text-slate-900 mb-4">Lost in Space?</h2>
        <p className="text-slate-500 mb-10 font-medium">
          The page you're looking for doesn't exist or has been moved to another galaxy.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/dashboard"
            className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-blue-200 transition-all active:scale-95"
          >
            <Home size={20} />
            Go to Dashboard
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-100 text-slate-600 px-8 py-4 rounded-2xl font-bold border border-slate-200 transition-all active:scale-95"
          >
            <ArrowLeft size={20} />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
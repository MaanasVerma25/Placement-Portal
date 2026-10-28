import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, AlertTriangle } from "lucide-react";

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
      <Link to="/" className="mb-6 flex items-center gap-2.5">
        <img src="/jss-logo.png" alt="JSS University" className="w-10 h-10 rounded-[8px] object-contain shadow-xs" />
        <span className="font-heading font-bold text-base text-slate-900">JSS UNIVERSITY</span>
      </Link>
      <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mb-4">
        <AlertTriangle className="w-8 h-8" />
      </div>
      <h1 className="text-3xl font-heading font-bold text-slate-900 mb-2">
        Page Not Found
      </h1>
      <p className="text-sm text-slate-500 max-w-md mb-6 leading-relaxed">
        The URL you are trying to reach does not exist or may have been relocated.
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-xs hover:bg-blue-700 shadow-xs transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Companies Directory</span>
      </Link>
    </div>
  );
};

import React, { useState } from 'react';
import { Lock, User, ShieldCheck, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: (username: string) => void;
  hospitalName: string;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, hospitalName }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    setTimeout(() => {
      const cleanUser = username.trim().toLowerCase();
      const cleanPass = password.trim();

      // Required credentials: User: Siloam, Password: Siloam2027
      if (cleanUser === 'siloam' && cleanPass === 'Siloam2027') {
        onLoginSuccess('Siloam');
      } else {
        setError('Username atau Password salah. Silakan periksa kembali.');
        setIsLoading(false);
      }
    }, 350);
  };

  const handleQuickFill = () => {
    setUsername('Siloam');
    setPassword('Siloam2027');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a313c] via-[#0f4c5c] to-[#13677b] flex items-center justify-center p-4 sm:p-6 text-slate-800">
      {/* Background ambient elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-teal-300/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-[#0f4c5c] to-[#166579] p-6 text-white text-center relative">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white text-[#0f4c5c] font-black text-2xl shadow-md mb-3 tracking-wider">
            ICRA
          </div>
          <h1 className="text-xl font-bold tracking-tight">Siloam Hospitals</h1>
          <p className="text-xs text-teal-100 mt-1 font-medium">
            Komite Pencegahan dan Pengendalian Infeksi (PPI)
          </p>
          <div className="inline-block mt-3 px-3 py-1 bg-white/15 backdrop-blur-xs rounded-full text-xs text-white/90 font-semibold tracking-wide border border-white/20">
            Infection Control Risk Assessment
          </div>
        </div>

        {/* Login Form */}
        <div className="p-6 sm:p-8">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-900">Masuk ke Dashboard</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Silakan masukkan kredensial akun Komite PPI Siloam.
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="Masukkan username (Siloam)"
                  required
                  autoFocus
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0f4c5c]/25 focus:border-[#0f4c5c] transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Masukkan password"
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0f4c5c]/25 focus:border-[#0f4c5c] transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-2.5 px-4 bg-[#0f4c5c] hover:bg-[#13677b] active:scale-[0.99] text-white font-semibold rounded-xl shadow-md shadow-[#0f4c5c]/20 flex items-center justify-center gap-2 text-sm transition-all cursor-pointer disabled:opacity-70"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Masuk Aplikasi</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Credential Helper Pill */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div>
                <p className="text-[11px] font-semibold text-slate-600 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                  Kredensial Akses Aplikasi:
                </p>
                <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                  User: <b className="text-slate-800">Siloam</b> &bull; Pass: <b className="text-slate-800">Siloam2027</b>
                </p>
              </div>
              <button
                type="button"
                onClick={handleQuickFill}
                className="text-xs font-semibold px-2.5 py-1.5 bg-white border border-teal-200 text-teal-700 hover:bg-teal-50 rounded-lg shrink-0 transition-colors shadow-2xs"
              >
                Isi Otomatis
              </button>
            </div>

            <p className="text-[11px] text-slate-400 text-center mt-4 flex items-center justify-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
              {hospitalName} &bull; Sistem Terlindungi
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

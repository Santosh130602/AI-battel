import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import api from '../lib/api';
import { Swords, User, Mail, Lock, ShieldAlert, LogIn, UserPlus } from 'lucide-react';

type Mode = 'login' | 'register';

export default function AuthPage() {
  const navigate = useNavigate();
  const { setAuth, isAuthenticated } = useAuthStore();

  const [mode, setMode] = useState<Mode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (isAuthenticated()) {
    navigate('/lobby');
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = mode === 'login' ? '/auth/login' : '/auth/register';
      const body = mode === 'login' ? { email, password } : { name, email, password };

      const { data } = await api.post(endpoint, body);
      setAuth(data.user, data.token);
      navigate('/lobby');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Handshake handshake rejected.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)] flex flex-col justify-between p-6 md:p-12 font-mono relative selection:bg-[var(--color-accent)] selection:text-white transition-colors duration-300">
      
      {/* ── TOP UTILITY ROW ────────────────────────────────────────────────── */}
      <header className="w-full max-w-7xl mx-auto flex items-center justify-between text-xs tracking-wider border-b border-[var(--border-color)] pb-6 select-none">
        <div className="flex items-center gap-3">
          <span className="font-black text-sm tracking-tighter bg-[var(--color-accent)] text-white px-2 py-0.5 rounded">B.A.R</span>
          <span className="text-[var(--text-muted)] uppercase hidden xs:inline">// AUTHENTICATION_GATEWAY_NODE</span>
        </div>
        <span className="text-[var(--text-muted)] text-xxs uppercase tracking-widest font-black">
          STATUS: LISTENING
        </span>
      </header>

      {/* ── CENTRAL CONTRAST STRUCTURE ─────────────────────────────────────── */}
      <main className="w-full max-w-7xl mx-auto my-auto py-12 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Left Side: Bold Typographic Branding */}
        <div className="lg:col-span-6 space-y-6">
          <div className="inline-flex items-center justify-center p-3 bg-[var(--bg-surface)] border-2 border-[var(--text-primary)] rounded-xl shadow-sm">
            <Swords className="w-6 h-6 text-[var(--color-accent)]" />
          </div>
          <h1 className="font-display font-black text-4xl md:text-6xl tracking-tighter uppercase leading-none">
            Enter the <br />
            Arena.
          </h1>
          <div className="w-20 h-1 bg-[var(--color-accent)]" />
          <p className="text-[var(--text-secondary)] text-sm max-w-sm leading-relaxed font-sans font-medium">
            Synchronize your terminal interface variables. Forge prompt configurations to evaluate raw text weight parameters against connected arrays.
          </p>
        </div>

        {/* Right Side: Raw Command Interaction Panel */}
        <div className="lg:col-span-6 space-y-6 border-l border-[var(--border-color)] lg:pl-12 w-full">
          
          {/* Flat Navigation Mode Switches */}
          <div className="flex bg-[var(--bg-surface)] border-2 border-[var(--text-primary)] p-1 rounded-xl shadow-inner max-w-xs">
            <button
              type="button"
              onClick={() => { setMode('login'); setError(''); }}
              className={`flex-1 py-2 rounded-lg text-xxs font-mono font-black uppercase tracking-wider transition-all duration-150 ${
                mode === 'login'
                  ? 'bg-[var(--text-primary)] text-[var(--bg-main)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
              }`}
            >
              [ Sign In ]
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setError(''); }}
              className={`flex-1 py-2 rounded-lg text-xxs font-mono font-black uppercase tracking-wider transition-all duration-150 ${
                mode === 'register'
                  ? 'bg-[var(--text-primary)] text-[var(--bg-main)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
              }`}
            >
              [ Register ]
            </button>
          </div>

          {/* Core Functional Access Block */}
          <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
            
            {mode === 'register' && (
              <div className="space-y-2">
                <label className="text-xxs uppercase tracking-widest text-[var(--text-muted)] font-black block">
                  01 // Identity Alias Label
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[var(--text-muted)] border-r border-[var(--border-color)] h-full">
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <input
                    className="w-full bg-[var(--bg-surface)] border-2 border-[var(--border-color)] focus:border-[var(--text-primary)] rounded-xl pl-14 pr-4 py-3 outline-none text-sm font-sans tracking-wide transition-colors"
                    type="text"
                    placeholder="Enter runtime display name..."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    minLength={2}
                    maxLength={30}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xxs uppercase tracking-widest text-[var(--text-muted)] font-black block">
                {mode === 'register' ? '02 // Transmission Routing Address' : '01 // Transmission Routing Address'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[var(--text-muted)] border-r border-[var(--border-color)] h-full">
                  <Mail className="w-3.5 h-3.5" />
                </div>
                <input
                  className="w-full bg-[var(--bg-surface)] border-2 border-[var(--border-color)] focus:border-[var(--text-primary)] rounded-xl pl-14 pr-4 py-3 outline-none text-sm font-sans tracking-wide transition-colors"
                  type="email"
                  placeholder="operator@network.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xxs uppercase tracking-widest text-[var(--text-muted)] font-black block">
                {mode === 'register' ? '03 // Verification Passcode String' : '02 // Verification Passcode String'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[var(--text-muted)] border-r border-[var(--border-color)] h-full">
                  <Lock className="w-3.5 h-3.5" />
                </div>
                <input
                  className="w-full bg-[var(--bg-surface)] border-2 border-[var(--border-color)] focus:border-[var(--text-primary)] rounded-xl pl-14 pr-4 py-3 outline-none text-sm font-sans tracking-wide transition-colors"
                  type="password"
                  placeholder={mode === 'register' ? 'Minimum 6 characters' : '••••••••'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={mode === 'register' ? 6 : 1}
                />
              </div>
            </div>

            {error && (
              <div className="border-l-2 border-[var(--color-danger)] bg-[var(--color-danger)]/[0.02] p-4 text-xs flex gap-3 rounded-r-lg max-w-md">
                <ShieldAlert className="w-4 h-4 text-[var(--color-danger)] flex-shrink-0" />
                <div className="space-y-0.5">
                  <span className="font-bold uppercase block text-[var(--color-danger)]">Handshake Rejected</span>
                  <span className="text-[var(--text-secondary)] font-sans font-medium">{error}</span>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full border-2 border-[var(--text-primary)] hover:border-[var(--color-accent)] bg-transparent hover:bg-[var(--text-primary)] text-[var(--text-primary)] hover:text-[var(--bg-main)] py-4 font-black uppercase text-xs tracking-widest transition-all rounded-xl flex items-center justify-center gap-2 group mt-6"
            >
              {loading ? (
                <span>Mounting Runtime Node Link...</span>
              ) : mode === 'login' ? (
                <>
                  <span>Initialize Terminal Session</span>
                  <LogIn className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                </>
              ) : (
                <>
                  <span>Commit Registration Block</span>
                  <UserPlus className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </form>
        </div>

      </main>

      {/* ── FOOTER PARAMETERS METADATA ───────────────────────────────────────── */}
      <footer className="w-full max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xxs tracking-widest uppercase text-[var(--text-muted)] border-t border-[var(--border-color)] pt-6 font-bold">
        <div>CORE_CLUSTER_REVISION // v1.0.0</div>
        <div>SECURE SHIELD MATRIX INTEGRITY STANDARD: VERIFIED</div>
      </footer>

    </div>
  );
}
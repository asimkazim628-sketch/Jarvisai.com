'use client';
import { useState } from 'react';
import { apiPost } from '@/lib/api';

type AuthResult = { token: string; user: { name: string; email: string } };

export function AuthPanel({ onAuth }: { onAuth: (token: string, label: string) => void }) {
  const [mode, setMode] = useState<'login' | 'signup'>('signup');
  const [name, setName] = useState('Tony Stark');
  const [email, setEmail] = useState('tony@example.com');
  const [password, setPassword] = useState('Jarvis@123');
  const [status, setStatus] = useState('Create an account or login to unlock memory, notes, reminders, and tools.');

  async function submit() {
    try {
      const payload = mode === 'signup' ? { name, email, password, preferredLanguage: 'en' } : { email, password };
      const result = await apiPost<AuthResult>(`/api/auth/${mode}`, payload);
      onAuth(result.token, `${result.user.name} • ${result.user.email}`);
      setStatus('Authenticated. JARVIS secure memory is online.');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Authentication failed.');
    }
  }

  return <div className="rounded-3xl border border-cyan-300/20 bg-slate-950/60 p-4">
    <div className="mb-3 flex gap-2"><button onClick={() => setMode('signup')} className={`rounded-xl px-3 py-2 text-sm ${mode === 'signup' ? 'bg-cyan-300 text-slate-950' : 'bg-white/5'}`}>Signup</button><button onClick={() => setMode('login')} className={`rounded-xl px-3 py-2 text-sm ${mode === 'login' ? 'bg-cyan-300 text-slate-950' : 'bg-white/5'}`}>Login</button></div>
    {mode === 'signup' && <input className="mb-2 w-full rounded-xl bg-black/40 px-3 py-2" value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" />}
    <input className="mb-2 w-full rounded-xl bg-black/40 px-3 py-2" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
    <input className="mb-3 w-full rounded-xl bg-black/40 px-3 py-2" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" type="password" />
    <button onClick={submit} className="w-full rounded-xl bg-blue-500 px-3 py-2 font-bold">Activate JARVIS</button>
    <p className="mt-3 text-xs text-slate-300">{status}</p>
  </div>;
}

'use client';
import { useState } from 'react';
import { apiPost } from '@/lib/api';

export function MemoryPanel({ token }: { token: string }) {
  const [key, setKey] = useState('favorite_stack');
  const [value, setValue] = useState('Next.js, Tailwind CSS, Node.js, MongoDB');
  const [status, setStatus] = useState('Teach JARVIS your preferences for future sessions.');

  async function save() {
    if (!token) return setStatus('Login first to save long-term memory.');
    try {
      await apiPost('/api/memory', { key, value, category: 'preference' }, token);
      setStatus('Memory saved. JARVIS will remember this preference.');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Memory save failed.');
    }
  }

  return <div className="mt-5 rounded-3xl border border-cyan-300/20 bg-slate-950/60 p-4">
    <h3 className="font-bold text-cyan-100">Long-Term Memory</h3>
    <input className="mt-3 w-full rounded-xl bg-black/40 px-3 py-2 text-sm" value={key} onChange={(e) => setKey(e.target.value)} />
    <textarea className="mt-2 h-20 w-full rounded-xl bg-black/40 p-3 text-sm" value={value} onChange={(e) => setValue(e.target.value)} />
    <button onClick={save} className="mt-3 w-full rounded-xl bg-blue-500 px-3 py-2 font-bold">Save Memory</button>
    <p className="mt-3 text-xs text-slate-300">{status}</p>
  </div>;
}

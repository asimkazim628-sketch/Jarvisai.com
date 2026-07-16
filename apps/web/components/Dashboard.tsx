'use client';
import { useMemo, useState } from 'react';
import { apiPost } from '@/lib/api';
import { VoiceOrb } from './VoiceOrb';

type Message = { role: 'user' | 'assistant'; content: string };
const cards = ['Chat', 'Voice Mode', 'AI Settings', 'Profile', 'Notifications', 'History', 'File Upload', 'Generated Projects'];

export function Dashboard() {
  const [token, setToken] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([{ role: 'assistant', content: 'Salaam, namaste, and hello. I am JARVIS. Configure your token or sign in, then ask me anything.' }]);
  const [listening, setListening] = useState(false);
  const speechSupported = useMemo(() => typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window), []);

  async function send() {
    if (!message.trim()) return;
    const userMessage = message;
    setMessages((m) => [...m, { role: 'user', content: userMessage }]);
    setMessage('');
    try {
      const data = await apiPost<{ answer: string }>('/api/ai/chat', { message: userMessage }, token);
      setMessages((m) => [...m, { role: 'assistant', content: data.answer }]);
      window.speechSynthesis?.speak(new SpeechSynthesisUtterance(data.answer));
    } catch (error) {
      setMessages((m) => [...m, { role: 'assistant', content: error instanceof Error ? error.message : 'Unable to reach JARVIS API.' }]);
    }
  }

  function startVoice() {
    const Recognition = (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognition; SpeechRecognition?: new () => SpeechRecognition }).SpeechRecognition ?? (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognition }).webkitSpeechRecognition;
    if (!Recognition) return;
    const recognition = new Recognition();
    recognition.lang = 'en-IN';
    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onresult = (event) => setMessage(event.results[0][0].transcript);
    recognition.start();
  }

  return <main className="min-h-screen bg-grid bg-[length:42px_42px] px-5 py-8">
    <section className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[280px_1fr_340px]">
      <aside className="glass rounded-3xl p-5"><h1 className="text-3xl font-black text-cyan-200 neon-text">JARVIS</h1><p className="mt-2 text-sm text-slate-300">Advanced AI command center for chat, coding, website generation, documents, OCR, and automations.</p><div className="mt-6 grid gap-3">{cards.map((c) => <button className="rounded-2xl border border-cyan-300/20 px-4 py-3 text-left hover:bg-cyan-300/10" key={c}>{c}</button>)}</div></aside>
      <section className="glass rounded-3xl p-5"><div className="mb-4 flex items-center justify-between"><h2 className="text-xl font-bold">Multilingual AI Chat</h2><span className="rounded-full bg-cyan-300/10 px-3 py-1 text-xs text-cyan-200">Hindi • Urdu • English</span></div><div className="h-[520px] space-y-3 overflow-auto rounded-2xl bg-black/25 p-4">{messages.map((m, i) => <div key={i} className={`max-w-[85%] rounded-2xl px-4 py-3 ${m.role === 'user' ? 'ml-auto bg-blue-600' : 'bg-slate-800'}`}>{m.content}</div>)}</div><div className="mt-4 flex gap-2"><input className="flex-1 rounded-2xl border border-cyan-300/20 bg-slate-950 px-4 outline-none" value={message} onChange={(e) => setMessage(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send()} placeholder="Ask JARVIS to code, search, plan, translate, summarize..." /><button onClick={send} className="rounded-2xl bg-cyan-300 px-5 font-bold text-slate-950">Send</button></div></section>
      <aside className="glass rounded-3xl p-5"><VoiceOrb listening={listening} /><button disabled={!speechSupported} onClick={startVoice} className="mt-6 w-full rounded-2xl bg-blue-500 px-4 py-3 font-bold disabled:opacity-50">Start Voice Command</button><label className="mt-5 block text-sm text-slate-300">JWT Token</label><textarea value={token} onChange={(e) => setToken(e.target.value)} className="mt-2 h-28 w-full rounded-2xl border border-cyan-300/20 bg-slate-950 p-3 text-xs" placeholder="Paste login token here" /><div className="mt-5 rounded-2xl bg-cyan-300/10 p-4 text-sm text-cyan-100">Commands: open Google, draft email, generate portfolio, summarize PDF, translate text, fix code, build API.</div></aside>
    </section>
  </main>;
}

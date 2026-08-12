'use client';
import { useMemo, useState } from 'react';
import { apiPost } from '@/lib/api';
import { parseJarvisCommand } from '@/lib/commands';
import { AuthPanel } from './AuthPanel';
import { MemoryPanel } from './MemoryPanel';
import { ProjectStudio } from './ProjectStudio';
import { VoiceOrb } from './VoiceOrb';

type Message = { role: 'user' | 'assistant'; content: string };
const cards = ['Chat', 'Voice Mode', 'Website Generator', 'Coding Copilot', 'Notes', 'Reminders', 'PDF/OCR Tools', 'Generated Projects'];

export function Dashboard() {
  const [token, setToken] = useState('');
  const [profile, setProfile] = useState('Guest mode');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([{ role: 'assistant', content: 'Salaam, namaste, and hello. I am JARVIS. I can chat, code, plan websites, open apps, save notes, set reminders, and read files.' }]);
  const [listening, setListening] = useState(false);
  const speechSupported = useMemo(() => typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window), []);

  function reply(content: string) {
    setMessages((m) => [...m, { role: 'assistant', content }]);
    window.speechSynthesis?.speak(new SpeechSynthesisUtterance(content));
  }

  async function executeLocalCommand(input: string) {
    const command = parseJarvisCommand(input);
    if (!command) return false;
    if (command.type === 'open' || command.type === 'search' || command.type === 'weather' || command.type === 'email') {
      window.open(command.url, '_blank', 'noopener,noreferrer');
      reply(`Done. Opening ${command.type === 'open' ? command.label : command.type === 'email' ? 'your email draft' : command.query}.`);
      return true;
    }
    if (command.type === 'time' || command.type === 'date') {
      reply(command.type === 'time' ? `The current time is ${command.text}.` : `Today is ${command.text}.`);
      return true;
    }
    if (command.type === 'note') {
      if (!token) return reply('Please login first so I can save notes securely.'), true;
      await apiPost('/api/productivity/notes', { title: command.content.slice(0, 60), content: command.content, tags: ['voice'] }, token);
      reply('Note saved securely.');
      return true;
    }
    if (command.type === 'reminder') {
      if (!token) return reply('Please login first so I can save reminders securely.'), true;
      const remindAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
      await apiPost('/api/productivity/reminders', { title: command.content, remindAt }, token);
      reply('Reminder saved for one hour from now. You can refine reminder parsing later from the same endpoint.');
      return true;
    }
    return false;
  }

  async function send() {
    if (!message.trim()) return;
    const userMessage = message;
    setMessages((m) => [...m, { role: 'user', content: userMessage }]);
    setMessage('');
    try {
      if (await executeLocalCommand(userMessage)) return;
      if (!token) return reply('Login first or paste a JWT token so I can use secure AI memory.');
      const data = await apiPost<{ answer: string }>('/api/ai/chat', { message: userMessage }, token);
      reply(data.answer);
    } catch (error) {
      reply(error instanceof Error ? error.message : 'Unable to reach JARVIS API.');
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
    <section className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[300px_1fr_360px]">
      <aside className="glass rounded-3xl p-5"><h1 className="text-4xl font-black text-cyan-200 neon-text">JARVIS</h1><p className="mt-2 text-sm text-slate-300">Advanced AI command center for Hindi, Urdu, and English conversation, coding, websites, files, OCR, notes, reminders, and automations.</p><div className="mt-6 grid gap-3">{cards.map((c) => <button className="rounded-2xl border border-cyan-300/20 px-4 py-3 text-left hover:bg-cyan-300/10" key={c}>{c}</button>)}</div><div className="mt-5 rounded-2xl bg-cyan-300/10 p-4 text-xs text-cyan-100">Try: “Google open karo”, “weather batao Lahore”, “note save karo meeting at 5”, “draft email to client”, “build a restaurant website”.</div></aside>
      <section className="glass rounded-3xl p-5"><div className="mb-4 flex flex-wrap items-center justify-between gap-3"><h2 className="text-xl font-bold">Multilingual AI Chat</h2><span className="rounded-full bg-cyan-300/10 px-3 py-1 text-xs text-cyan-200">{profile}</span></div><div className="h-[560px] space-y-3 overflow-auto rounded-2xl bg-black/25 p-4">{messages.map((m, i) => <div key={i} className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-3 ${m.role === 'user' ? 'ml-auto bg-blue-600' : 'bg-slate-800'}`}>{m.content}</div>)}</div><div className="mt-4 flex gap-2"><input className="flex-1 rounded-2xl border border-cyan-300/20 bg-slate-950 px-4 outline-none" value={message} onChange={(e) => setMessage(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send()} placeholder="Ask JARVIS to code, search, plan, translate, summarize..." /><button onClick={send} className="rounded-2xl bg-cyan-300 px-5 font-bold text-slate-950">Send</button></div></section>
      <aside className="glass rounded-3xl p-5"><VoiceOrb listening={listening} /><button disabled={!speechSupported} onClick={startVoice} className="mt-6 w-full rounded-2xl bg-blue-500 px-4 py-3 font-bold disabled:opacity-50">Start Voice Command</button><div className="mt-5"><AuthPanel onAuth={(newToken, label) => { setToken(newToken); setProfile(label); }} /></div><ProjectStudio token={token} /><MemoryPanel token={token} /><label className="mt-5 block text-sm text-slate-300">Manual JWT Token</label><textarea value={token} onChange={(e) => setToken(e.target.value)} className="mt-2 h-24 w-full rounded-2xl border border-cyan-300/20 bg-slate-950 p-3 text-xs" placeholder="Paste login token here" /></aside>
    </section>
  </main>;
}

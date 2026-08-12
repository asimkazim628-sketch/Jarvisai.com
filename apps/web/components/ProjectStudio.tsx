'use client';
import { useState } from 'react';
import { apiPost } from '@/lib/api';

type Project = { name: string; stack: string[]; files: Array<{ path: string; content: string }> };

export function ProjectStudio({ token }: { token: string }) {
  const [requirement, setRequirement] = useState('Create a restaurant landing page with menu, booking CTA, reviews, and dark neon theme.');
  const [project, setProject] = useState<Project | null>(null);
  const [status, setStatus] = useState('Describe any website/app and JARVIS will generate a file plan.');

  async function generate() {
    if (!token) return setStatus('Login first to save generated projects.');
    setStatus('JARVIS is generating project files...');
    try {
      const data = await apiPost<{ project: Project }>('/api/projects/generate', { requirement }, token);
      setProject(data.project);
      setStatus(`Generated ${data.project.files.length} files for ${data.project.name}.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Project generation failed.');
    }
  }

  return <div className="mt-5 rounded-3xl border border-cyan-300/20 bg-slate-950/60 p-4">
    <h3 className="font-bold text-cyan-100">Website Generator</h3>
    <textarea className="mt-3 h-24 w-full rounded-2xl bg-black/40 p-3 text-sm" value={requirement} onChange={(e) => setRequirement(e.target.value)} />
    <button onClick={generate} className="mt-3 w-full rounded-2xl bg-cyan-300 px-4 py-2 font-bold text-slate-950">Generate Project</button>
    <p className="mt-3 text-xs text-slate-300">{status}</p>
    {project && <div className="mt-3 max-h-44 overflow-auto rounded-2xl bg-black/30 p-3 text-xs"><p className="font-bold text-cyan-200">{project.name}</p>{project.files.map((file) => <p key={file.path} className="mt-1 text-slate-300">📄 {file.path}</p>)}</div>}
  </div>;
}

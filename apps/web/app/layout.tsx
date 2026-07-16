import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = { title: 'JARVIS AI Assistant', description: 'Advanced multilingual AI assistant dashboard.' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}

import React from 'react';
import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';
import { LogoMark } from '@/components/Logo';

interface AuthLayoutProps {
  eyebrow: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ eyebrow, title, subtitle, children, footer }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <Link href="/" className="flex items-center justify-center space-x-3 mb-8">
            <LogoMark size={40} />
            <span className="text-2xl font-bold gradient-text">StackCendra</span>
          </Link>

          <div className="rounded-xl border border-white/10 bg-black/20 backdrop-blur-md shadow-2xl p-8">
            <p className="text-xs font-semibold uppercase tracking-wider text-ai-accent mb-2">{eyebrow}</p>
            <h1 className="text-2xl font-bold text-white mb-2">{title}</h1>
            <p className="text-sm text-gray-400 mb-6">{subtitle}</p>

            {children}
          </div>

          <div className="mt-6 text-center text-sm text-gray-400">{footer}</div>

          <div className="mt-8 flex items-center justify-center gap-2 text-xs text-gray-500">
            <ShieldCheck size={14} className="text-ai-success" />
            <span>Private keys and secrets stay on your device — never on our servers.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

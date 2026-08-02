import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { LogoMark } from '@/components/Logo';
import { cn } from '@/lib/utils';

interface ProjectPageShellProps {
  breadcrumb: { label: string; href?: string }[];
  actions?: React.ReactNode;
  children: React.ReactNode;
  mainClassName?: string;
}

export const ProjectPageShell: React.FC<ProjectPageShellProps> = ({
  breadcrumb,
  actions,
  children,
  mainClassName,
}) => {
  const fullBreadcrumb = [{ label: 'Dashboard', href: '/' }, ...breadcrumb];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <header className="h-16 bg-black/20 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-6">
        <div className="flex items-center space-x-4 min-w-0">
          <Link href="/" className="flex items-center space-x-3 flex-shrink-0">
            <LogoMark size={32} />
            <span className="text-lg font-bold gradient-text hidden sm:inline">StackCendra</span>
          </Link>
          <span className="text-white/20">/</span>
          <nav className="flex items-center space-x-2 text-sm min-w-0">
            {fullBreadcrumb.map((crumb, index) => (
              <React.Fragment key={index}>
                {index > 0 && <span className="text-gray-600">/</span>}
                {crumb.href ? (
                  <Link
                    href={crumb.href}
                    className={cn(
                      'text-gray-400 hover:text-white transition-colors flex items-center gap-1.5',
                      index === 0 && 'font-medium'
                    )}
                  >
                    {index === 0 && <ArrowLeft size={14} />}
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-white font-medium truncate">{crumb.label}</span>
                )}
              </React.Fragment>
            ))}
          </nav>
        </div>
        {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
      </header>

      <main className={cn('max-w-5xl mx-auto px-6 py-8', mainClassName)}>{children}</main>
    </div>
  );
};

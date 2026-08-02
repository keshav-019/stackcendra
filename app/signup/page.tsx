"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { User, Building2, Check, Github, Mail } from 'lucide-react';

type Edition = 'individual' | 'enterprise';

const editions: { id: Edition; icon: React.ElementType; title: string; description: string; points: string[] }[] = [
  {
    id: 'individual',
    icon: User,
    title: 'Individual',
    description: 'A free, local-first desktop app for one developer.',
    points: ['Runs entirely on your machine', 'No org, billing, or approvals', 'Bring your own AI provider key'],
  },
  {
    id: 'enterprise',
    icon: Building2,
    title: 'Enterprise',
    description: 'Team collaboration with governance and audit.',
    points: ['Shared projects, roles, and approvals', 'Policy engine and audit trail', 'SSO and organization-hosted runners'],
  },
];

export default function SignupPage() {
  const router = useRouter();
  const [edition, setEdition] = useState<Edition>('individual');

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    router.push('/');
  };

  return (
    <AuthLayout
      eyebrow="Get started"
      title="Create your StackCendra account"
      subtitle="Sign up with GitHub or Google is fully wired up. The manual form below is still concept UI — there's no password backend behind it yet."
      footer={
        <>
          Already have an account?{' '}
          <Link href="/login" className="text-ai-accent hover:underline font-medium">
            Sign in
          </Link>
        </>
      }
    >
      <div className="grid grid-cols-2 gap-3 mb-5">
        <Button
          type="button"
          variant="outline"
          onClick={() => signIn('github', { callbackUrl: '/' })}
          className="border-white/10 bg-white/5 hover:bg-white/10 text-white"
        >
          <Github size={16} className="mr-2" />
          GitHub
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => signIn('google', { callbackUrl: '/' })}
          className="border-white/10 bg-white/5 hover:bg-white/10 text-white"
        >
          <Mail size={16} className="mr-2" />
          Google
        </Button>
      </div>

      <div className="flex items-center gap-3 mb-5">
        <Separator className="flex-1 bg-white/10" />
        <span className="text-xs text-gray-500">or sign up with email</span>
        <Separator className="flex-1 bg-white/10" />
      </div>

      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <Label className="text-gray-300">Choose your edition</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {editions.map((option) => {
              const Icon = option.icon;
              const active = edition === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setEdition(option.id)}
                  className={cn(
                    'text-left rounded-lg border p-4 transition-colors',
                    active
                      ? 'border-ai-primary bg-ai-primary/10'
                      : 'border-white/10 bg-white/5 hover:bg-white/10'
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 rounded-md bg-gradient-ai flex items-center justify-center">
                      <Icon size={16} className="text-white" />
                    </div>
                    {active && (
                      <div className="w-5 h-5 rounded-full bg-ai-primary flex items-center justify-center">
                        <Check size={12} className="text-white" />
                      </div>
                    )}
                  </div>
                  <p className="text-sm font-semibold text-white">{option.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5 mb-2">{option.description}</p>
                  <ul className="space-y-1">
                    {option.points.map((point) => (
                      <li key={point} className="text-xs text-gray-500 flex items-start gap-1.5">
                        <span className="text-ai-success mt-0.5">•</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-gray-300">Full name</Label>
            <Input
              id="name"
              placeholder="Ada Lovelace"
              autoComplete="name"
              className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-300">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@company.com"
              autoComplete="email"
              className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
            />
          </div>
        </div>

        {edition === 'enterprise' && (
          <div className="space-y-2">
            <Label htmlFor="org" className="text-gray-300">Organization name</Label>
            <Input
              id="org"
              placeholder="Acme Engineering"
              className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="password" className="text-gray-300">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm" className="text-gray-300">Confirm password</Label>
            <Input
              id="confirm"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
            />
          </div>
        </div>

        <div className="flex items-start space-x-2">
          <Checkbox id="terms" className="mt-0.5" />
          <Label htmlFor="terms" className="text-sm text-gray-400 font-normal leading-snug">
            I agree to the Terms of Service and Privacy Policy.
          </Label>
        </div>

        <Button type="submit" className="w-full bg-gradient-ai hover:opacity-90 text-white">
          Create account
        </Button>
      </form>
    </AuthLayout>
  );
}

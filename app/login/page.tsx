"use client";

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Github, Mail } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    router.push('/');
  };

  return (
    <AuthLayout
      eyebrow="Welcome back"
      title="Sign in to StackCendra"
      subtitle="Sign in with GitHub or Google is fully wired up. Email/password is still concept UI — there's no password backend behind it yet."
      footer={
        <>
          New to StackCendra?{' '}
          <Link href="/signup" className="text-ai-accent hover:underline font-medium">
            Create an account
          </Link>
        </>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
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

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-gray-300">Password</Label>
            <Link href="#" className="text-xs text-ai-accent hover:underline">
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
            className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox id="remember" />
          <Label htmlFor="remember" className="text-sm text-gray-400 font-normal">
            Keep me signed in on this device
          </Label>
        </div>

        <Button type="submit" className="w-full bg-gradient-ai hover:opacity-90 text-white">
          Sign in
        </Button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <Separator className="flex-1 bg-white/10" />
        <span className="text-xs text-gray-500">or continue with</span>
        <Separator className="flex-1 bg-white/10" />
      </div>

      <div className="grid grid-cols-2 gap-3">
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
    </AuthLayout>
  );
}

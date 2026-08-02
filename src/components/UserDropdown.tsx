
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User, Settings, MessageCircle, Crown, LogOut, Shield, FolderOpen, Layers, Github, Gitlab } from 'lucide-react';

interface UserDropdownProps {
  isManagerMode: boolean;
  onToggleManagerMode: (mode: boolean) => void;
  onOpenAI: () => void;
}

const OPEN_PROVIDERS: { id: 'github' | 'gitlab'; label: string; icon: React.ElementType }[] = [
  { id: 'github', label: 'GitHub', icon: Github },
  { id: 'gitlab', label: 'GitLab', icon: Gitlab },
];

export const UserDropdown = ({ isManagerMode, onToggleManagerMode, onOpenAI }: UserDropdownProps) => {
  const router = useRouter();
  const { data: session } = useSession();
  const [connected, setConnected] = useState<Record<'github' | 'gitlab', boolean>>({ github: false, gitlab: false });

  useEffect(() => {
    if (!session) return;
    OPEN_PROVIDERS.forEach((p) => {
      fetch(`/api/integrations/${p.id}/status`)
        .then((res) => (res.ok ? res.json() : { connected: false }))
        .then((data) => setConnected((prev) => ({ ...prev, [p.id]: !!data.connected })))
        .catch(() => {});
    });
  }, [session]);

  const connectedProviders = OPEN_PROVIDERS.filter((p) => connected[p.id]);

  const displayName = session?.user?.name ?? 'John Doe';
  const displayEmail = session?.user?.email ?? 'john.doe@company.com';
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const handleLogOut = () => {
    if (session) {
      signOut({ callbackUrl: '/login' });
    } else {
      router.push('/login');
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Avatar className="w-8 h-8">
            {session?.user?.image && <AvatarImage src={session.user.image} alt={displayName} />}
            <AvatarFallback className="bg-gradient-ai text-white text-sm">
              {initials || 'JD'}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 bg-black/90 border-white/10" align="end">
        <DropdownMenuLabel className="text-white">
          <div className="flex items-center space-x-2">
            <span>{displayName}</span>
            {isManagerMode && (
              <Badge className="bg-yellow-500/20 text-yellow-300">
                <Crown size={12} className="mr-1" />
                Manager
              </Badge>
            )}
            {!session && (
              <Badge variant="outline" className="text-[10px] border-white/20 text-gray-400">
                Not signed in
              </Badge>
            )}
          </div>
          <p className="text-xs text-gray-400 font-normal">{displayEmail}</p>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator className="bg-white/10" />
        
        <DropdownMenuItem 
          onClick={onOpenAI}
          className="text-white hover:bg-white/10 cursor-pointer"
        >
          <MessageCircle className="mr-2 h-4 w-4" />
          Talk to AI
        </DropdownMenuItem>
        
        <DropdownMenuItem
          onClick={() => onToggleManagerMode(!isManagerMode)}
          className="text-white hover:bg-white/10 cursor-pointer"
        >
          <Shield className="mr-2 h-4 w-4" />
          {isManagerMode ? 'Exit Manager Mode' : 'Switch to Manager Mode'}
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-white/10" />

        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="text-white hover:bg-white/10 data-[state=open]:bg-white/10 cursor-pointer">
            <FolderOpen className="mr-2 h-4 w-4" />
            Open
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent className="bg-black/90 border-white/10">
              <DropdownMenuItem onClick={() => router.push('/')} className="text-white hover:bg-white/10 cursor-pointer">
                <Layers className="mr-2 h-4 w-4" />
                Unified (local)
              </DropdownMenuItem>
              {connectedProviders.length > 0 && <DropdownMenuSeparator className="bg-white/10" />}
              {connectedProviders.map((p) => {
                const Icon = p.icon;
                return (
                  <DropdownMenuItem
                    key={p.id}
                    onClick={() => router.push(`/?mode=${p.id}`)}
                    className="text-white hover:bg-white/10 cursor-pointer"
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    {p.label}
                  </DropdownMenuItem>
                );
              })}
              {connectedProviders.length === 0 && (
                <p className="px-2 py-1.5 text-xs text-gray-500 max-w-[14rem]">
                  Connect GitHub or GitLab in Settings to open them here.
                </p>
              )}
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>

        <DropdownMenuSeparator className="bg-white/10" />

        <DropdownMenuItem
          onClick={() => router.push('/profile')}
          className="text-white hover:bg-white/10 cursor-pointer"
        >
          <User className="mr-2 h-4 w-4" />
          Profile
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => router.push('/settings')}
          className="text-white hover:bg-white/10 cursor-pointer"
        >
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </DropdownMenuItem>
        
        <DropdownMenuSeparator className="bg-white/10" />
        
        <DropdownMenuItem
          onClick={handleLogOut}
          className="text-white hover:bg-white/10 cursor-pointer"
        >
          <LogOut className="mr-2 h-4 w-4" />
          {session ? 'Log out' : 'Sign in'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};


import React from 'react';
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User, Settings, MessageCircle, Crown, LogOut, Shield } from 'lucide-react';

interface UserDropdownProps {
  isManagerMode: boolean;
  onToggleManagerMode: (mode: boolean) => void;
  onOpenAI: () => void;
}

export const UserDropdown = ({ isManagerMode, onToggleManagerMode, onOpenAI }: UserDropdownProps) => {
  const router = useRouter();
  const { data: session } = useSession();

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

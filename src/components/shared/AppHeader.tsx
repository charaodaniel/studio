
'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Download, LogIn, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useState, useEffect } from 'react';
import Logo from './Logo';
import LoginOptionsModal from '../auth/LoginOptionsModal';
import pb from '@/lib/pocketbase';
import { RecordModel } from 'pocketbase';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: Array<string>;
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

const getAvatarUrl = (record: RecordModel, avatarFileName: string) => {
    if (!record || !avatarFileName) return '';
    return pb.getFileUrl(record, avatarFileName);
};

export function AppHeader({
  title,
  showDriverAvatar = false,
}: {
  title: string;
  showDriverAvatar?: boolean;
}) {
  const [isLoggedIn, setIsLoggedIn] = useState(pb.authStore.isValid);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [currentUser, setCurrentUser] = useState(pb.authStore.model);

  useEffect(() => {
    const removeListener = pb.authStore.onChange(() => {
      setIsLoggedIn(pb.authStore.isValid);
      setCurrentUser(pb.authStore.model);
    });

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setInstallPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      removeListener();
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);


  const handleInstallClick = () => {
    if (!installPrompt) {
      return;
    }
    installPrompt.prompt();
    installPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      setInstallPrompt(null);
    });
  };

  const getSafeAvatarUrl = (user: any) => {
    if (user && user.collectionId && user.id && user.avatar) {
      // It looks like a RecordModel, let's build the URL.
      return `${process.env.NEXT_PUBLIC_POCKETBASE_URL}/api/files/${user.collectionId}/${user.id}/${user.avatar}`;
    }
    return '';
  }


  const renderLogoLink = () => {
    if (showDriverAvatar && currentUser) {
      const avatarUrl = getSafeAvatarUrl(currentUser);
      return (
        <Link href="/" className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={avatarUrl}
              data-ai-hint="person portrait"
            />
            <AvatarFallback>{currentUser.name?.substring(0, 1) || 'U'}</AvatarFallback>
          </Avatar>
          <div className="w-28">
            <Logo />
          </div>
        </Link>
      );
    }
    return (
       <Link href="/" className="flex items-center">
        <div className="w-36">
           <Logo />
        </div>
      </Link>
    );
  };

  return (
      <header className="sticky top-0 z-10 w-full border-b bg-background/80 backdrop-blur-sm">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          {renderLogoLink()}

          <h1 className="hidden sm:block flex-1 text-center font-headline text-xl font-bold text-foreground/80">
            {title}
          </h1>

          <div className="flex items-center gap-2">
            {installPrompt && (
              <Button onClick={handleInstallClick}>
                <Download className="mr-2 h-4 w-4" />
                Instalar
              </Button>
            )}
             <Dialog>
                <DialogTrigger asChild>
                    <Button>
                      {isLoggedIn && currentUser ? <Avatar className="h-6 w-6 mr-2"><AvatarImage src={getSafeAvatarUrl(currentUser)}/><AvatarFallback><User className="h-4 w-4"/></AvatarFallback></Avatar> : <LogIn className="mr-2 h-4 w-4" />}
                      {isLoggedIn ? "Meu Perfil" : "Login"}
                    </Button>
                </DialogTrigger>
                <DialogContent className="p-0">
                    <LoginOptionsModal />
                </DialogContent>
            </Dialog>
          </div>
        </div>
        <div className="container sm:hidden pb-2 px-4">
          <h1 className="text-center font-headline text-lg font-bold text-foreground/80">
            {title}
          </h1>
        </div>
      </header>
  );
}


'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Car, Rocket, Shield, User, Download } from 'lucide-react';
import PassengerAuthForm from '../auth/PassengerAuthForm';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from '@/components/ui/dialog';
import AdminAuthForm from '../auth/AdminAuthForm';
import DriverAuthForm from '../auth/DriverAuthForm';
import { useState, useEffect } from 'react';
import Logo from './Logo';

// Define the interface for the BeforeInstallPromptEvent
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: Array<string>;
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}


export function AppHeader({
  title,
  showDriverAvatar = false,
}: {
  title: string;
  showDriverAvatar?: boolean;
}) {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
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


  const renderLogoLink = () => {
    if (showDriverAvatar) {
      return (
        <Link href="/" className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={'https://placehold.co/48x48.png'}
              data-ai-hint="person portrait"
            />
            <AvatarFallback>C</AvatarFallback>
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
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Shield className="h-5 w-5" />
                  <span className="sr-only">Admin</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="p-0">
                <AdminAuthForm />
              </DialogContent>
            </Dialog>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Car className="h-5 w-5" />
                  <span className="sr-only">Área do Motorista</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="p-0">
                <DriverAuthForm />
              </DialogContent>
            </Dialog>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <User className="h-5 w-5" />
                  <span className="sr-only">Toggle user menu</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[90vh] flex flex-col p-0">
                <div className="flex-1 overflow-hidden">
                    <PassengerAuthForm />
                </div>
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

import type {ReactNode} from 'react';
import Link from 'next/link';
import {Button} from '@/components/ui/button';
import {Car, Rocket, Shield, User, MessageSquare} from 'lucide-react';
import PassengerAuthForm from '../auth/PassengerAuthForm';
import {Avatar, AvatarFallback, AvatarImage} from '../ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {ScrollArea} from '../ui/scroll-area';
import AdminAuthForm from '../auth/AdminAuthForm';
import DriverAuthForm from '../auth/DriverAuthForm';

export function AppHeader({
  title,
  showDriverAvatar = false,
}: {
  title: string;
  showDriverAvatar?: boolean;
}) {
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
          <span className="font-headline text-lg font-semibold sm:inline">
            CEOLIN
          </span>
        </Link>
      );
    }
    return (
      <Link href="/" className="flex items-center gap-2">
        <Rocket className="h-6 w-6 text-primary" />
        <span className="font-headline text-lg font-semibold sm:inline">
          CEOLIN Mobilidade Urbana
        </span>
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
                  <ScrollArea className="h-full">
                    <PassengerAuthForm />
                  </ScrollArea>
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

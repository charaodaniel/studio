'use client';

import { User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from '@/components/ui/dialog';
import Logo from '@/components/shared/Logo';
import PassengerAuthForm from '@/components/auth/PassengerAuthForm';

export default function AppHeader() {
  return (
    <header className="bg-card shadow-sm">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Logo className="h-8 w-8 text-primary" />
          <h1 className="text-xl font-bold font-headline text-primary-dark">
            RideLink
          </h1>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon">
              <User className="h-5 w-5" />
              <span className="sr-only">Open user menu</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <PassengerAuthForm />
          </DialogContent>
        </Dialog>
      </div>
    </header>
  );
}

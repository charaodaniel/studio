
'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import Logo from './Logo';
import { Car, LogIn } from 'lucide-react';
import PassengerAuthForm from '../auth/PassengerAuthForm';

interface WelcomeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onQuickRideClick: () => void;
}

export default function WelcomeModal({ isOpen, onClose, onQuickRideClick }: WelcomeModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md text-center p-0">
        <DialogHeader className="p-6">
            <div className="flex justify-center mb-4 w-32 mx-auto">
                <Logo />
            </div>
            <DialogTitle className="font-headline text-2xl">Bem-vindo(a) ao CEOLIN!</DialogTitle>
            <DialogDescription>
                Sua conexão para viagens tranquilas. Como você gostaria de começar?
            </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col sm:flex-col sm:space-x-0 gap-2 p-6 pt-0">
            <Button size="lg" onClick={onQuickRideClick}>
                <Car className="mr-2 h-4 w-4" />
                Corrida Rápida
            </Button>
             <Dialog>
                <DialogTrigger asChild>
                    <Button size="lg" variant="outline">
                        <LogIn className="mr-2 h-4 w-4" />
                        Fazer Login ou Cadastrar
                    </Button>
                </DialogTrigger>
                <DialogContent className="max-h-[90vh] flex flex-col p-0">
                    <div className="flex-1 overflow-hidden">
                        <PassengerAuthForm />
                    </div>
              </DialogContent>
            </Dialog>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

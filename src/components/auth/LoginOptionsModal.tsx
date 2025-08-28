
'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { User, Car, Headset, Shield } from 'lucide-react';
import PassengerAuthForm from './PassengerAuthForm';
import DriverAuthForm from './DriverAuthForm';
import OperatorAuthForm from './OperatorAuthForm';
import AdminAuthForm from './AdminAuthForm';

export default function LoginOptionsModal() {
  return (
    <>
      <DialogHeader className="p-6 text-center">
        <DialogTitle className="font-headline text-2xl">Escolha seu Acesso</DialogTitle>
        <DialogDescription>
          Selecione como você quer entrar na plataforma.
        </DialogDescription>
      </DialogHeader>
      <div className="grid grid-cols-1 gap-4 p-6 pt-0">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="lg" className="justify-start">
              <User className="mr-4 text-primary" /> Sou Passageiro
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] flex flex-col p-0">
            <div className="flex-1 overflow-hidden">
              <PassengerAuthForm />
            </div>
          </DialogContent>
        </Dialog>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="lg" className="justify-start">
              <Car className="mr-4 text-primary" /> Sou Motorista
            </Button>
          </DialogTrigger>
           <DialogContent className="p-0">
              <DriverAuthForm />
            </DialogContent>
        </Dialog>
         <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="lg" className="justify-start">
              <Headset className="mr-4 text-muted-foreground" /> Acesso do Atendente
            </Button>
          </DialogTrigger>
           <DialogContent className="p-0">
              <OperatorAuthForm />
            </DialogContent>
        </Dialog>
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" size="lg" className="justify-start">
                <Shield className="mr-4 text-muted-foreground" /> Acesso Administrativo
                </Button>
            </DialogTrigger>
            <DialogContent className="p-0">
                <AdminAuthForm />
            </DialogContent>
        </Dialog>
      </div>
    </>
  );
}

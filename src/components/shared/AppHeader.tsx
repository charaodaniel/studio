'use client';

import { User, Shield, HardHat, Headset } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import Logo from '@/components/shared/Logo';
import Link from 'next/link';
import { Card, CardTitle } from '../ui/card';

export default function AppHeader() {
  return (
    <header className="bg-card shadow-sm">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Logo className="h-8 w-8 text-primary" />
          <h1 className="text-xl font-bold font-headline text-primary-dark">
            CEOLIN Mobilidade Urbana
          </h1>
        </div>
        <div className="flex items-center gap-2">
           <Dialog>
            <DialogTrigger asChild>
              <Button>ENTRAR</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
               <DialogHeader>
                <DialogTitle className="font-headline text-2xl">Escolha seu Acesso</DialogTitle>
                <DialogDescription>
                  Selecione como você quer entrar na plataforma.
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 pt-4">
                 <Link href="/driver/login" passHref>
                    <Card className="p-4 flex flex-col items-center justify-center text-center hover:bg-muted/50 transition-colors cursor-pointer h-28">
                        <HardHat className="h-8 w-8 mb-2 text-primary"/>
                        <CardTitle className="text-md font-semibold">Motorista</CardTitle>
                    </Card>
                 </Link>
                 <Link href="/" passHref>
                    <Card className="p-4 flex flex-col items-center justify-center text-center hover:bg-muted/50 transition-colors cursor-pointer h-28">
                        <User className="h-8 w-8 mb-2 text-primary"/>
                        <CardTitle className="text-md font-semibold">Passageiro</CardTitle>
                    </Card>
                </Link>
                <Link href="/admin" passHref>
                    <Card className="p-4 flex flex-col items-center justify-center text-center hover:bg-muted/50 transition-colors cursor-pointer h-28">
                        <Shield className="h-8 w-8 mb-2 text-primary"/>
                        <CardTitle className="text-md font-semibold">Admin</CardTitle>
                    </Card>
                </Link>
                 <Link href="/operator" passHref>
                    <Card className="p-4 flex flex-col items-center justify-center text-center hover:bg-muted/50 transition-colors cursor-pointer h-28">
                        <Headset className="h-8 w-8 mb-2 text-primary"/>
                        <CardTitle className="text-md font-semibold">Atendente</CardTitle>
                    </Card>
                </Link>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </header>
  );
}

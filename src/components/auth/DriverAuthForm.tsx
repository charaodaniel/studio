'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import Logo from '../shared/Logo';

export default function DriverAuthForm() {

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would redirect to the driver page upon successful login.
    // For this prototype, we can use a client-side redirect.
    window.location.href = '/driver';
  };

  return (
    <>
       <DialogHeader className="p-6">
        <div className="flex justify-center mb-4">
            <Logo className="h-10 w-10 text-primary" />
        </div>
        <DialogTitle className="font-headline text-2xl text-center">Acesso do Motorista</DialogTitle>
        <DialogDescription className="text-center">Faça login ou crie uma conta para começar a dirigir.</DialogDescription>
      </DialogHeader>
      <ScrollArea className="max-h-[80vh]">
        <Tabs defaultValue="login" className="w-full px-6 pb-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Registrar</TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <form onSubmit={handleLogin} className="space-y-4 pt-6">
                <div className="space-y-2">
                  <Label htmlFor="email-login-driver">Email</Label>
                  <Input id="email-login-driver" type="email" placeholder="seu@email.com" required />
                </div>
                <div className="space-y-2">
                   <div className="flex items-center">
                     <Label htmlFor="password-login-driver">Senha</Label>
                     <Link href="#" className="ml-auto inline-block text-sm underline">
                        Esqueceu sua senha?
                     </Link>
                   </div>
                  <Input id="password-login-driver" type="password" required />
                </div>
                <Button type="submit" className="w-full bg-primary hover:bg-primary/90">Entrar</Button>
            </form>
          </TabsContent>
          <TabsContent value="register">
            <form onSubmit={handleLogin} className="space-y-4 pt-6">
                <div className="space-y-2">
                  <Label htmlFor="name-register-driver">Nome</Label>
                  <Input id="name-register-driver" placeholder="Seu nome completo" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email-register-driver">Email</Label>
                  <Input id="email-register-driver" type="email" placeholder="seu@email.com" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password-register-driver">Senha</Label>
                  <Input id="password-register-driver" type="password" required />
                </div>
                <Button type="submit" className="w-full">Criar Conta</Button>
            </form>
          </TabsContent>
        </Tabs>
      </ScrollArea>
    </>
  );
}

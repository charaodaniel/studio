'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CardContent, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogOut, PenSquare, ShieldCheck, History, MessageSquare } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import Image from 'next/image';
import { ScrollArea } from '@/components/ui/scroll-area';

const conversations = [
    { id: 1, name: "Roberto Andrade", lastMessage: "Olá! Chego em 5 minutos.", unread: 1, time: "14:32" },
    { id: 2, name: "Carlos Lima", lastMessage: "Obrigado pela corrida!", unread: 0, time: "Ontem" },
];

export default function PassengerAuthForm() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Mock login function
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  if (isLoggedIn) {
    return (
      <ScrollArea className="max-h-[80vh] h-full">
        <div className="w-full">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="font-headline text-2xl">Meu Perfil</DialogTitle>
            <DialogDescription>
              Gerencie suas informações, histórico e segurança.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center space-y-4 p-4 border-b">
            <Dialog>
              <DialogTrigger asChild>
                <Avatar className="h-24 w-24 cursor-pointer">
                  <AvatarImage src="https://placehold.co/100x100.png" data-ai-hint="user avatar" alt="Passenger" />
                  <AvatarFallback>P</AvatarFallback>
                </Avatar>
              </DialogTrigger>
              <DialogContent className="p-0 max-w-xs">
                <DialogHeader>
                  <DialogTitle className="sr-only">Foto de Ana Clara</DialogTitle>
                  <DialogDescription className="sr-only">Foto em tamanho maior do passageiro Ana Clara.</DialogDescription>
                </DialogHeader>
                <Image src="https://placehold.co/400x400.png" alt="Foto de Ana Clara" width={400} height={400} className="rounded-lg"/>
              </DialogContent>
            </Dialog>
            <div className="text-center">
              <h2 className="text-xl font-bold font-headline">Ana Clara</h2>
              <p className="text-sm text-muted-foreground">ana.clara@email.com</p>
            </div>
            <Button variant="outline" size="sm">
              <PenSquare className="mr-2 h-4 w-4" /> Editar Foto
            </Button>
          </div>
          <Tabs defaultValue="chats" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="history"><History className="mr-1 h-4 w-4" /> Histórico</TabsTrigger>
              <TabsTrigger value="chats"><MessageSquare className="mr-1 h-4 w-4" /> Conversas</TabsTrigger>
              <TabsTrigger value="security"><ShieldCheck className="mr-1 h-4 w-4" /> Segurança</TabsTrigger>
            </TabsList>
            <TabsContent value="history" className="p-4 text-sm">
              <p>Seu histórico de corridas aparecerá aqui.</p>
            </TabsContent>
            <TabsContent value="chats" className="p-0">
               <div className="flex flex-col">
                  {conversations.map((convo) => (
                  <div key={convo.id} className="flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/50 border-b">
                      <Avatar className="h-10 w-10">
                          <AvatarImage src={`https://placehold.co/40x40.png?text=${convo.name.charAt(0)}`} data-ai-hint="user portrait"/>
                          <AvatarFallback>{convo.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 overflow-hidden">
                      <div className="flex justify-between items-center">
                          <p className="font-semibold truncate">{convo.name}</p>
                          <p className={`text-xs ${convo.unread > 0 ? 'text-primary' : 'text-muted-foreground'}`}>{convo.time}</p>
                      </div>
                       <div className="flex justify-between items-center">
                          <p className="text-sm text-muted-foreground truncate">{convo.lastMessage}</p>
                          {convo.unread > 0 && (
                              <div className="bg-primary text-primary-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                  {convo.unread}
                              </div>
                          )}
                        </div>
                      </div>
                  </div>
                  ))}
              </div>
            </TabsContent>
            <TabsContent value="security" className="p-4 space-y-4">
              <div>
                <Label htmlFor="password">Nova Senha</Label>
                <Input id="password" type="password" />
              </div>
              <Button className="w-full">Alterar Senha</Button>
            </TabsContent>
          </Tabs>
          <div className="p-4 border-t">
            <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" /> Sair
            </Button>
          </div>
        </div>
      </ScrollArea>
    );
  }

  return (
    <>
       <DialogHeader className="p-6">
        <DialogTitle className="font-headline text-2xl">Acesso do Passageiro</DialogTitle>
        <DialogDescription>Faça login ou crie uma conta para continuar.</DialogDescription>
      </DialogHeader>
      <ScrollArea className="max-h-[80vh]">
        <Tabs defaultValue="login" className="w-full px-6 pb-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Registrar</TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <form onSubmit={handleLogin}>
              <CardContent className="space-y-4 pt-6 px-0">
                <div className="space-y-2">
                  <Label htmlFor="email-login">Email</Label>
                  <Input id="email-login" type="email" placeholder="seu@email.com" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password-login">Senha</Label>
                  <Input id="password-login" type="password" required />
                </div>
              </CardContent>
              <CardFooter className="px-0 pb-0">
                <Button type="submit" className="w-full bg-accent hover:bg-accent/90">Entrar</Button>
              </CardFooter>
            </form>
          </TabsContent>
          <TabsContent value="register">
            <form onSubmit={handleLogin}>
              <CardContent className="space-y-4 pt-6 px-0">
                <div className="space-y-2">
                  <Label htmlFor="name-register">Nome</Label>
                  <Input id="name-register" placeholder="Seu nome" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email-register">Email</Label>
                  <Input id="email-register" type="email" placeholder="seu@email.com" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password-register">Senha</Label>
                  <Input id="password-register" type="password" required />
                </div>
              </CardContent>
              <CardFooter className="px-0 pb-0">
                <Button type="submit" className="w-full">Criar Conta</Button>
              </CardFooter>
            </form>
          </TabsContent>
        </Tabs>
      </ScrollArea>
    </>
  );
}

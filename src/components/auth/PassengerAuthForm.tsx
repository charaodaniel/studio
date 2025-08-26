

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CardContent, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogOut, PenSquare, ShieldCheck, History, MessageSquare, Loader2 } from 'lucide-react';
import { DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '../ui/checkbox';
import pb from '@/lib/pocketbase';
import { useToast } from '@/hooks/use-toast';
import type { RecordModel } from 'pocketbase';
import { useRouter } from 'next/navigation';

const conversations = [
    { id: 1, name: "Roberto Andrade", lastMessage: "Olá! Chego em 5 minutos.", unread: 1, time: "14:32" },
    { id: 2, name: "Carlos Lima", lastMessage: "Obrigado pela corrida!", unread: 0, time: "Ontem" },
];

export default function PassengerAuthForm() {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(pb.authStore.isValid);
  const [currentUser, setCurrentUser] = useState<RecordModel | null>(pb.authStore.model);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login');


  // States for login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // States for registration form
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');

  useEffect(() => {
    const unsubscribe = pb.authStore.onChange(() => {
        setIsLoggedIn(pb.authStore.isValid);
        setCurrentUser(pb.authStore.model);
    }, true); 

    return () => {
        unsubscribe();
    };
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const authData = await pb.collection('users').authWithPassword(loginEmail, loginPassword);

      if (authData.record.role !== 'Passageiro') {
        pb.authStore.clear(); 
        toast({
          variant: 'destructive',
          title: 'Acesso Negado',
          description: 'Este formulário é apenas para passageiros. Use o formulário de motorista.',
        });
        setIsLoading(false);
        return;
      }
      
      toast({ title: 'Login bem-sucedido!', description: `Bem-vindo de volta, ${authData.record.name}!` });
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Falha no Login',
        description: 'Email ou senha inválidos. Por favor, tente novamente.'
      });
      console.error("Login failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const data = {
        "email": registerEmail,
        "password": registerPassword,
        "passwordConfirm": registerPassword,
        "name": registerName,
        "role": "Passageiro"
    };

    try {
        await pb.collection('users').create(data);
        toast({ title: 'Conta Criada!', description: 'Cadastro realizado com sucesso. Agora você pode fazer o login.' });
        setRegisterName('');
        setRegisterEmail('');
        setRegisterPassword('');
        setActiveTab('login');
    } catch (error: any) {
        let description = 'Ocorreu um erro ao criar sua conta. Tente novamente.';
        if (error.data?.data?.email?.message) {
            description = `Erro no email: ${error.data.data.email.message}`;
        } else if (error.data?.data?.password?.message) {
            description = `Erro na senha: ${error.data.data.password.message}`;
        }
        toast({
            variant: 'destructive',
            title: 'Falha no Registro',
            description: description,
        });
        console.error("Registration failed:", error);
    } finally {
        setIsLoading(false);
    }
  };


  const handleLogout = () => {
    pb.authStore.clear();
    toast({ title: 'Logout Realizado', description: 'Você foi desconectado com sucesso.' });
    router.push('/');
  };
  
  const handleRedirectToProfile = () => {
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    router.push('/passenger');
  }

  if (isLoggedIn && currentUser) {
    return (
      <ScrollArea className="max-h-[80vh] h-full">
        <div className="w-full">
          <DialogHeader className="p-6 pb-0 text-left">
            <DialogTitle className="font-headline text-2xl">Meu Perfil</DialogTitle>
            <DialogDescription>
              Gerencie suas informações, histórico e segurança.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center space-y-4 p-4 border-b">
            <Avatar className="h-24 w-24 cursor-pointer">
                <AvatarImage src={currentUser.avatar ? pb.getFileUrl(currentUser, currentUser.avatar) : `https://placehold.co/100x100.png?text=${currentUser.name.substring(0,2)}`} data-ai-hint="user avatar" alt={currentUser.name} />
                <AvatarFallback>{currentUser.name.substring(0,2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="text-center">
              <h2 className="text-xl font-bold font-headline">{currentUser.name}</h2>
              <p className="text-sm text-muted-foreground">{currentUser.email}</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleRedirectToProfile}>
              <PenSquare className="mr-2 h-4 w-4" /> Ver Perfil Completo
            </Button>
          </div>
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
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full px-6 pb-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Registrar</TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <form onSubmit={handleLogin}>
              <CardContent className="space-y-4 pt-6 px-0">
                <div className="space-y-2">
                  <Label htmlFor="email-login">Email</Label>
                  <Input id="email-login" type="email" placeholder="seu@email.com" required disabled={isLoading} value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password-login">Senha</Label>
                  <Input id="password-login" type="password" required disabled={isLoading} value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} />
                </div>
                 <div className="flex items-center space-x-2 pt-2">
                    <Checkbox id="remember-me-passenger" disabled={isLoading}/>
                    <Label htmlFor="remember-me-passenger" className="text-sm font-normal">Mantenha-me conectado</Label>
                </div>
              </CardContent>
              <CardFooter className="px-0 pb-0">
                <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Entrar
                </Button>
              </CardFooter>
            </form>
          </TabsContent>
          <TabsContent value="register">
            <form onSubmit={handleRegister}>
              <CardContent className="space-y-4 pt-6 px-0">
                <div className="space-y-2">
                  <Label htmlFor="name-register">Nome</Label>
                  <Input id="name-register" placeholder="Seu nome" required disabled={isLoading} value={registerName} onChange={(e) => setRegisterName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email-register">Email</Label>
                  <Input id="email-register" type="email" placeholder="seu@email.com" required disabled={isLoading} value={registerEmail} onChange={(e) => setRegisterEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password-register">Senha</Label>
                  <Input id="password-register" type="password" required disabled={isLoading} value={registerPassword} onChange={(e) => setRegisterPassword(e.target.value)} />
                </div>
              </CardContent>
              <CardFooter className="px-0 pb-0">
                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Criar Conta
                </Button>
              </CardFooter>
            </form>
          </TabsContent>
        </Tabs>
      </ScrollArea>
    </>
  );
}

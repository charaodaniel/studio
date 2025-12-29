
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CardContent, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogOut, PenSquare, Loader2, Eye, EyeOff } from 'lucide-react';
import { DialogHeader, DialogTitle, DialogDescription, Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import pb from '@/lib/pocketbase';
import type { User as AppUser } from '../admin/UserList';
import ForgotPasswordForm from './ForgotPasswordForm';
import type { RecordModel } from 'pocketbase';

const getAvatarUrl = (record: RecordModel, avatarFileName: string) => {
    if (!record || !avatarFileName) return '';
    return pb.getFileUrl(record, avatarFileName);
};

export default function PassengerAuthForm() {
  const { toast } = useToast();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('login');

  // States for login form
  const [loginIdentity, setLoginIdentity] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // States for registration form
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerUsername, setRegisterUsername] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerPasswordConfirm, setRegisterPasswordConfirm] = useState('');
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);

  useEffect(() => {
    const handleAuthChange = () => {
      const user = pb.authStore.model as AppUser | null;
      setCurrentUser(user);
      setIsAuthLoading(false);
    };

    handleAuthChange(); // Initial check
    const unsubscribe = pb.authStore.onChange(handleAuthChange, true);
    
    return () => {
      unsubscribe();
    };
  }, []);
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const authData = await pb.collection('users').authWithPassword(loginIdentity, loginPassword);
      if (!authData.record.role.includes('Passageiro')) {
          pb.authStore.clear();
          throw new Error('Acesso negado. Este formulário é apenas para passageiros.');
      }
      
      toast({ title: 'Login bem-sucedido!', description: `Bem-vindo de volta, ${authData.record.name}!` });
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Falha no Login',
        description: error.message || 'Email/Telefone ou senha inválidos. Por favor, tente novamente.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (registerPassword !== registerPasswordConfirm) {
        toast({ variant: 'destructive', title: 'Senhas não coincidem' });
        return;
    }
    setIsLoading(true);
    
    try {
        const data = {
            username: registerUsername,
            name: registerName,
            email: registerEmail,
            emailVisibility: true,
            password: registerPassword,
            passwordConfirm: registerPasswordConfirm,
            role: ["Passageiro"],
        };

        await pb.collection('users').create(data);
        toast({ title: 'Conta Criada!', description: 'Cadastro realizado com sucesso. Agora você pode fazer o login.' });
        setRegisterName('');
        setRegisterEmail('');
        setRegisterUsername('');
        setRegisterPassword('');
        setRegisterPasswordConfirm('');
        setActiveTab('login');
    } catch (error: any) {
        let description = 'Ocorreu um erro ao criar sua conta. Tente novamente.';
        if (error?.data?.data?.email?.message) {
            description = 'Este endereço de e-mail já está em uso por outra conta.';
        } else if (error?.data?.data?.username?.message) {
             description = 'Este número de telefone já está em uso por outra conta.';
        }
        toast({
            variant: 'destructive',
            title: 'Falha no Registro',
            description: description,
        });
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

  if (isAuthLoading) {
    return (
        <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
    )
  }

  if (currentUser) {
    const avatarUrl = currentUser.avatar ? getAvatarUrl(currentUser, currentUser.avatar) : '';
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
                <AvatarImage src={avatarUrl} data-ai-hint="user avatar" alt={currentUser.name} />
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
                  <Label htmlFor="identity-login">Email ou Telefone</Label>
                  <Input id="identity-login" type="text" placeholder="seu@email.com ou (00) 99999-9999" required disabled={isLoading} value={loginIdentity} onChange={(e) => setLoginIdentity(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Label htmlFor="password-login">Senha</Label>
                    <Dialog>
                        <DialogTrigger asChild>
                            <button type="button" className="ml-auto inline-block text-sm underline">Esqueceu sua senha?</button>
                        </DialogTrigger>
                        <DialogContent>
                            <ForgotPasswordForm />
                        </DialogContent>
                     </Dialog>
                  </div>
                   <div className="relative">
                        <Input
                            id="password-login"
                            type={showLoginPassword ? 'text' : 'password'}
                            required
                            disabled={isLoading}
                            value={loginPassword}
                            onChange={(e) => setLoginPassword(e.target.value)}
                            className="pr-10"
                        />
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute top-1/2 -translate-y-1/2 right-0 h-full px-3 text-muted-foreground hover:bg-transparent"
                            onClick={() => setShowLoginPassword(!showLoginPassword)}
                            tabIndex={-1}
                        >
                            {showLoginPassword ? <EyeOff /> : <Eye />}
                        </Button>
                    </div>
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
                  <Label htmlFor="username-register">Telefone (será seu usuário)</Label>
                  <Input id="username-register" type="tel" placeholder="(00) 99999-9999" required disabled={isLoading} value={registerUsername} onChange={(e) => setRegisterUsername(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email-register">Email (opcional)</Label>
                  <Input id="email-register" type="email" placeholder="seu@email.com" disabled={isLoading} value={registerEmail} onChange={(e) => setRegisterEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password-register">Senha</Label>
                   <div className="relative">
                        <Input
                            id="password-register"
                            type={showRegisterPassword ? 'text' : 'password'}
                            required
                            disabled={isLoading}
                            value={registerPassword}
                            onChange={(e) => setRegisterPassword(e.target.value)}
                            className="pr-10"
                        />
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute top-1/2 -translate-y-1/2 right-0 h-full px-3 text-muted-foreground hover:bg-transparent"
                            onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                            tabIndex={-1}
                        >
                            {showRegisterPassword ? <EyeOff /> : <Eye />}
                        </Button>
                    </div>
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="password-confirm-register">Confirmar Senha</Label>
                  <Input id="password-confirm-register" type="password" required disabled={isLoading} value={registerPasswordConfirm} onChange={(e) => setRegisterPasswordConfirm(e.target.value)} />
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

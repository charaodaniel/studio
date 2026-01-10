
'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CardContent, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogOut, PenSquare, Loader2, Eye, EyeOff, Info } from 'lucide-react';
import { DialogHeader, DialogTitle, DialogDescription, Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import ForgotPasswordForm from './ForgotPasswordForm';
import { useAuth } from '@/hooks/useAuth';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import pb from '@/lib/pocketbase';
import type { RecordModel } from 'pocketbase';
import { type User } from '../admin/UserList';

const getAvatarUrl = (record: RecordModel, avatarFileName: string) => {
    if (!record || !avatarFileName) return '';
    return pb.getFileUrl(record, avatarFileName);
};

export default function PassengerAuthForm() {
  const { toast } = useToast();
  const router = useRouter();
  const { user, login, logout, isLoading: isAuthLoading } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login');

  // States for login form
  const [loginIdentity, setLoginIdentity] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  
  // States for register form
  const [registerName, setRegisterName] = useState('');
  const [registerPhone, setRegisterPhone] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const loggedInUser = await login(loginIdentity, loginPassword);
      if (!loggedInUser.role.includes('Passageiro')) {
          logout();
          throw new Error('Acesso negado. Este formulário é apenas para passageiros.');
      }
      
      toast({ title: 'Login bem-sucedido!', description: `Bem-vindo de volta, ${loggedInUser.name}!` });
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
    setIsLoading(true);
    
    if (registerPassword.length < 8) {
        toast({ variant: 'destructive', title: 'Senha muito curta', description: 'A senha deve ter no mínimo 8 caracteres.' });
        setIsLoading(false);
        return;
    }
    
    const data = {
        "email": registerEmail,
        "password": registerPassword,
        "passwordConfirm": registerPassword,
        "name": registerName,
        "phone": registerPhone,
        "role": ["Passageiro"],
    };

    try {
        await pb.collection('users').create(data);
        toast({ title: 'Registro bem-sucedido!', description: 'Sua conta foi criada. Agora você pode fazer login.' });
        setActiveTab('login');
    } catch (error: any) {
        toast({
            variant: 'destructive',
            title: 'Falha no Registro',
            description: error.message || 'Não foi possível criar a conta. Verifique seus dados.'
        });
    } finally {
        setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
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

  if (user) {
    const avatarUrl = user.avatar ? getAvatarUrl(user, user.avatar) : '';
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
                <AvatarImage src={avatarUrl} data-ai-hint="user avatar" alt={user.name} />
                <AvatarFallback>{user.name.substring(0,2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="text-center">
              <h2 className="text-xl font-bold font-headline">{user.name}</h2>
              <p className="text-sm text-muted-foreground">{user.email}</p>
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
                  <Input id="identity-login" type="text" placeholder="seu@email.com" required disabled={isLoading} value={loginIdentity} onChange={(e) => setLoginIdentity(e.target.value)} />
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
                  <Input id="name-register" placeholder="Seu nome completo" required disabled={isLoading} value={registerName} onChange={(e) => setRegisterName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone-register">Telefone</Label>
                  <Input id="phone-register" type="tel" placeholder="(00) 99999-9999" required disabled={isLoading} value={registerPhone} onChange={(e) => setRegisterPhone(e.target.value)}/>
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="email-register">Email</Label>
                  <Input id="email-register" type="email" placeholder="seu@email.com" required disabled={isLoading} value={registerEmail} onChange={(e) => setRegisterEmail(e.target.value)} />
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="password-register">Senha (mínimo 8 caracteres)</Label>
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

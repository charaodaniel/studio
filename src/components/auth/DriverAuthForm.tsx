
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import Logo from '../shared/Logo';
import { Checkbox } from '../ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import pb from '@/lib/pocketbase';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import ForgotPasswordForm from './ForgotPasswordForm';

export default function DriverAuthForm() {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login');

  // States for login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // States for registration form
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);

  const hasRole = (userRole: string | string[], roleToCheck: string): boolean => {
    if (Array.isArray(userRole)) {
        return userRole.includes(roleToCheck);
    }
    return userRole === roleToCheck;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const authData = await pb.collection('users').authWithPassword(loginEmail, loginPassword);

      if (!hasRole(authData.record.role, 'Motorista')) {
        pb.authStore.clear();
        toast({
          variant: 'destructive',
          title: 'Acesso Negado',
          description: 'Este login é exclusivo para motoristas.',
        });
        setIsLoading(false);
        return;
      }
      
      toast({ title: 'Login bem-sucedido!', description: `Bem-vindo de volta, ${authData.record.name}!` });
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      router.push('/driver');

    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Falha no Login',
        description: 'Email ou senha inválidos. Por favor, tente novamente.'
      });
      console.error("Driver login failed: Invalid credentials or server error.", error);
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
        "role": ["Motorista"]
    };

    try {
      await pb.collection('users').create(data);
      toast({ title: 'Conta de Motorista Criada!', description: 'Cadastro realizado com sucesso. Agora você pode fazer o login.' });
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
        console.error("Driver registration failed:", error);
    } finally {
        setIsLoading(false);
    }
  };


  return (
    <>
       <DialogHeader className="p-6">
        <div className="flex justify-center mb-4 w-32 mx-auto">
            <Logo />
        </div>
        <DialogTitle className="font-headline text-2xl text-center">Acesso do Motorista</DialogTitle>
        <DialogDescription className="text-center">Faça login ou crie uma conta para começar a dirigir.</DialogDescription>
      </DialogHeader>
      <ScrollArea className="max-h-[80vh]">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full px-6 pb-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Registrar</TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <form onSubmit={handleLogin} className="space-y-4 pt-6">
                <div className="space-y-2">
                  <Label htmlFor="email-login-driver">Email</Label>
                  <Input id="email-login-driver" type="email" placeholder="seu@email.com" required disabled={isLoading} value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                   <div className="flex items-center">
                     <Label htmlFor="password-login-driver">Senha</Label>
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
                            id="password-login-driver" 
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
                        >
                            {showLoginPassword ? <EyeOff /> : <Eye />}
                        </Button>
                   </div>
                </div>
                 <div className="flex items-center space-x-2">
                    <Checkbox id="remember-me-driver" disabled={isLoading} />
                    <Label htmlFor="remember-me-driver" className="text-sm font-normal">Mantenha-me conectado</Label>
                </div>
                <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Entrar
                </Button>
            </form>
          </TabsContent>
          <TabsContent value="register">
            <form onSubmit={handleRegister} className="space-y-4 pt-6">
                <div className="space-y-2">
                  <Label htmlFor="name-register-driver">Nome</Label>
                  <Input id="name-register-driver" placeholder="Seu nome completo" required disabled={isLoading} value={registerName} onChange={(e) => setRegisterName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email-register-driver">Email</Label>
                  <Input id="email-register-driver" type="email" placeholder="seu@email.com" required disabled={isLoading} value={registerEmail} onChange={(e) => setRegisterEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password-register-driver">Senha</Label>
                  <div className="relative">
                    <Input 
                        id="password-register-driver" 
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
                    >
                        {showRegisterPassword ? <EyeOff /> : <Eye />}
                    </Button>
                   </div>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Criar Conta
                </Button>
            </form>
          </TabsContent>
        </Tabs>
      </ScrollArea>
    </>
  );
}

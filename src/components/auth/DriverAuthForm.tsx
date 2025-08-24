
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
import { Checkbox } from '../ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import pb from '@/lib/pocketbase';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function DriverAuthForm() {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login');

  // States for login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // States for registration form
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Step 1: Authenticate the user first
      const authData = await pb.collection('users').authWithPassword(loginEmail, loginPassword);

      // Step 2: Check if the authenticated user is a Driver
      if (authData.record.role !== 'Motorista') {
        // If not a driver, log them out immediately and show an error
        pb.authStore.clear();
        toast({
          variant: 'destructive',
          title: 'Acesso Negado',
          description: 'Este login é exclusivo para motoristas.',
        });
        setIsLoading(false);
        return;
      }
      
      // Step 3: If it is a driver, show success and redirect
      toast({ title: 'Login bem-sucedido!', description: `Bem-vindo de volta, ${authData.record.name}!` });
      window.location.href = '/driver';

    } catch (error) {
      // This catch block will now correctly handle failed authentications (e.g., wrong password)
      toast({
        variant: 'destructive',
        title: 'Falha no Login',
        description: 'Email ou senha inválidos. Por favor, tente novamente.'
      });
      console.error("Driver login failed:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const data = {
        "email": registerEmail,
        "emailVisibility": true,
        "password": registerPassword,
        "passwordConfirm": registerPassword,
        "name": registerName,
        "role": "Motorista" // Crucial for driver registration
    };

    try {
      await pb.collection('users').create(data);
      
      // After successful registration, log the user in automatically
      await pb.collection('users').authWithPassword(registerEmail, registerPassword);
      
      toast({ title: 'Conta de Motorista Criada!', description: 'Sua conta foi criada com sucesso. Bem-vindo!' });
      
      // Redirect to the driver's dashboard
      window.location.href = '/driver';
        
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
        <div className="flex justify-center mb-4">
            <Logo className="h-10 w-10 text-primary" />
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
                     <Link href="#" className="ml-auto inline-block text-sm underline">
                        Esqueceu sua senha?
                     </Link>
                   </div>
                  <Input id="password-login-driver" type="password" required disabled={isLoading} value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} />
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
                  <Input id="password-register-driver" type="password" required disabled={isLoading} value={registerPassword} onChange={(e) => setRegisterPassword(e.target.value)} />
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

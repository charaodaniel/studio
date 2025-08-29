
'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Logo from '@/components/shared/Logo';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '../ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import pb from '@/lib/pocketbase';
import { Loader2 } from 'lucide-react';
import ForgotPasswordForm from './ForgotPasswordForm';

export default function OperatorAuthForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const authData = await pb.collection('users').authWithPassword(email, password);

      if (authData.record.role !== 'Atendente') {
        pb.authStore.clear();
        toast({
          variant: 'destructive',
          title: 'Acesso Negado',
          description: 'Este login é exclusivo para atendentes.',
        });
        setIsLoading(false);
        return;
      }
      
      toast({ title: 'Login bem-sucedido!', description: `Bem-vindo(a), ${authData.record.name}!` });
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      router.push('/operator');

    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Falha no Login',
        description: 'Email ou senha de atendente inválidos.',
      });
      console.error("Operator login failed:", error);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <>
      <DialogHeader className="p-6 text-center">
         <div className="flex justify-center mb-4 w-32 mx-auto">
            <Logo />
          </div>
        <DialogTitle className="font-headline text-2xl">Acesso do Atendente</DialogTitle>
        <DialogDescription>Faça login para acessar o painel de operações.</DialogDescription>
      </DialogHeader>
      <div className="px-6 pb-6">
        <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
            <Label htmlFor="email-operator">Email</Label>
            <Input 
                id="email-operator" 
                type="email" 
                placeholder="atendente@email.com" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
            />
            </div>
            <div className="space-y-2">
            <div className="flex items-center">
                <Label htmlFor="password-operator">Senha</Label>
                <Dialog>
                    <DialogTrigger asChild>
                        <button type="button" className="ml-auto inline-block text-sm underline">Esqueceu sua senha?</button>
                    </DialogTrigger>
                    <DialogContent>
                        <ForgotPasswordForm />
                    </DialogContent>
                </Dialog>
            </div>
            <Input 
                id="password-operator" 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
            />
            </div>
             <div className="flex items-center space-x-2">
                <Checkbox id="remember-me-operator" disabled={isLoading} />
                <Label htmlFor="remember-me-operator" className="text-sm font-normal">Mantenha-me conectado</Label>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Entrar
            </Button>
        </form>
      </div>
    </>
  );
}

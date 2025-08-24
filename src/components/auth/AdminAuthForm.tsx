'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Logo from '@/components/shared/Logo';
import { DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import pb from '@/lib/pocketbase';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { POCKETBASE_URL } from '@/lib/pocketbase';
import { Checkbox } from '../ui/checkbox';
import { useRouter } from 'next/navigation';

export default function AdminAuthForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Authenticates an ADMIN user (not a regular user from the 'users' collection)
      await pb.admins.authWithPassword(email, password);
      
      // On successful login, PocketBase SDK automatically handles the auth token.
      // We can then redirect to the admin dashboard.
      toast({
        title: "Login bem-sucedido!",
        description: "Bem-vindo ao painel de administração.",
      });

      // Redirect to the admin page
      window.location.href = '/admin';

    } catch (error: any) {
      let description = "Email ou senha inválidos. Por favor, tente novamente.";
      
      // Check for network or CORS errors which typically result in status 0
      if (error.status === 0 || (error.originalError && !error.response)) {
          description = `Não foi possível conectar à API em ${POCKETBASE_URL}. Verifique se o servidor está no ar e se as configurações de CORS estão corretas.`;
      } else if (error.data?.message) {
          // Use the specific message from PocketBase if available
          description = `Erro do servidor: ${error.data.message}`;
      } else if (error.status === 401 || error.status === 403) {
          description = "As credenciais fornecidas são inválidas ou você não tem permissão para acessar.";
      }
      
      toast({
        title: "Falha no Login",
        description: description,
        variant: "destructive",
      });
      console.error('Failed to login as admin:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <DialogHeader className="p-6 text-center">
        <div className="flex justify-center mb-4">
          <Logo className="h-10 w-10 text-primary" />
        </div>
        <DialogTitle className="font-headline text-2xl">Acesso Administrativo</DialogTitle>
        <DialogDescription>Faça login para gerenciar a plataforma.</DialogDescription>
      </DialogHeader>
      <div className="px-6 pb-6">
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email-admin">Email</Label>
            <Input 
              id="email-admin" 
              type="email" 
              placeholder="admin@email.com" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center">
              <Label htmlFor="password-admin">Senha</Label>
              <Link href="#" className="ml-auto inline-block text-sm underline">
                Esqueceu sua senha?
              </Link>
            </div>
            <Input 
              id="password-admin" 
              type="password" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>
           <div className="flex items-center space-x-2">
            <Checkbox id="remember-me-admin" />
            <Label htmlFor="remember-me-admin" className="text-sm font-normal">Mantenha-me conectado</Label>
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

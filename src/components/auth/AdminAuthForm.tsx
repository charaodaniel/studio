
'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Logo from '@/components/shared/Logo';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import pb from '@/lib/pocketbase';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { POCKETBASE_URL } from '@/lib/pocketbase';
import { useRouter } from 'next/navigation';
import ForgotPasswordForm from './ForgotPasswordForm';

export default function AdminAuthForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Authenticate against the 'users' collection
      const authData = await pb.collection('users').authWithPassword(email, password);
      
      // After successful authentication, check if the user has the 'Admin' role.
      // With multi-select, `role` is an array.
      if (!authData.record.role.includes('Admin')) {
        pb.authStore.clear(); // Important: clear the auth store if the role is wrong
        toast({
            title: "Acesso Negado",
            description: "Você não tem permissão de Administrador.",
            variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      toast({
        title: "Login bem-sucedido!",
        description: "Bem-vindo ao painel de administração.",
      });

      // Close dialog and redirect
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      router.push('/admin');

    } catch (error: any) {
      let description = "Email ou senha de administrador inválidos. Por favor, tente novamente.";
      
      if (error.status === 0) {
        description = `Não foi possível conectar à API em ${POCKETBASE_URL}. Verifique a conexão do servidor e as configurações de CORS.`;
      } else if (error.status === 404) {
         description = `O endpoint de autenticação não foi encontrado (404). Verifique se seu proxy reverso (Nginx, Caddy) está configurado para encaminhar todas as rotas /api/* para o PocketBase.`;
      } else if (error.status === 401 || error.status === 403) {
        description = "Credenciais de administrador inválidas.";
      } else if (error.data?.message) {
          description = `Erro do servidor: ${error.data.message}`;
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
        <div className="flex justify-center mb-4 w-32 mx-auto">
          <Logo />
        </div>
        <DialogTitle className="font-headline text-2xl">Acesso Administrativo</DialogTitle>
        <DialogDescription>Faça login com sua conta de administrador.</DialogDescription>
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
                    id="password-admin"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    className="pr-10"
                />
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute top-1/2 -translate-y-1/2 right-0 h-full px-3 text-muted-foreground hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                >
                    {showPassword ? <EyeOff /> : <Eye />}
                </Button>
            </div>
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

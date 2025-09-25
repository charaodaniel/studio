
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import pb from '@/lib/pocketbase';
import Logo from '@/components/shared/Logo';
import { Loader2, KeyRound, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

function ResetPasswordComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [token, setToken] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  
  useEffect(() => {
    const urlToken = searchParams.get('token');
    if (urlToken) {
      setToken(urlToken);
    } else {
        toast({
            title: "Token Inválido",
            description: "O link de redefinição de senha parece estar incompleto. Por favor, tente solicitar novamente.",
            variant: "destructive",
            duration: 7000
        });
        router.push('/');
    }
  }, [searchParams, router, toast]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
        toast({ variant: 'destructive', title: 'Erro', description: 'Token de redefinição não encontrado.' });
        return;
    }
    if (password.length < 8) {
        toast({ variant: 'destructive', title: 'Senha muito curta', description: 'A senha deve ter no mínimo 8 caracteres.' });
        return;
    }
    if (password !== passwordConfirm) {
        toast({ variant: 'destructive', title: 'As senhas não coincidem', description: 'Por favor, confirme sua nova senha corretamente.' });
        return;
    }
    
    setIsLoading(true);
    try {
        await pb.collection('users').confirmPasswordReset(token, password, passwordConfirm);
        toast({
            title: "Senha Redefinida com Sucesso!",
            description: "Você já pode fazer login com sua nova senha.",
        });
        router.push('/'); 
    } catch (error: any) {
        let description = "Não foi possível redefinir sua senha. O link pode ter expirado.";
        if (error.data?.message) {
            description = `Erro do servidor: ${error.data.message}`;
        }
        toast({
            title: "Falha ao Redefinir Senha",
            description: description,
            variant: "destructive",
        });
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
        <Card className="w-full max-w-md">
            <CardHeader className="text-center">
                <div className="flex justify-center mb-4 w-32 mx-auto">
                    <Logo />
                </div>
                <CardTitle className="font-headline text-2xl flex items-center justify-center gap-2">
                    <KeyRound /> Redefinir Senha
                </CardTitle>
                <CardDescription>Crie uma nova senha para sua conta.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleResetPassword} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="new-password">Nova Senha</Label>
                        <div className="relative">
                            <Input 
                                id="new-password"
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
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
                    <div className="space-y-2">
                        <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
                         <div className="relative">
                            <Input
                                id="confirm-password"
                                type={showPasswordConfirm ? 'text' : 'password'}
                                value={passwordConfirm}
                                onChange={(e) => setPasswordConfirm(e.target.value)}
                                required
                                disabled={isLoading}
                                className="pr-10"
                            />
                             <Button 
                                type="button" 
                                variant="ghost" 
                                size="icon" 
                                className="absolute top-1/2 -translate-y-1/2 right-0 h-full px-3 text-muted-foreground hover:bg-transparent"
                                onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                                tabIndex={-1}
                            >
                                {showPasswordConfirm ? <EyeOff /> : <Eye />}
                            </Button>
                        </div>
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading || !token}>
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Salvar Nova Senha
                    </Button>
                </form>
            </CardContent>
        </Card>
    </div>
  );
}


export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div className="flex h-screen w-screen items-center justify-center"><Loader2 className="h-10 w-10 animate-spin"/></div>}>
            <ResetPasswordComponent />
        </Suspense>
    )
}

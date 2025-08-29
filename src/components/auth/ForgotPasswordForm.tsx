
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import pb from '@/lib/pocketbase';
import { useToast } from '@/hooks/use-toast';
import { Loader2, MailCheck } from 'lucide-react';

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await pb.collection('users').requestPasswordReset(email);
      setIsSubmitted(true);
    } catch (error: any) {
      let description = "Ocorreu um erro. Verifique o e-mail e tente novamente.";
      if (error.status === 404) {
        description = "Nenhum usuário encontrado com este endereço de e-mail.";
      }
      toast({
        title: "Falha na Solicitação",
        description: description,
        variant: "destructive",
      });
      console.error('Failed to request password reset:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  if (isSubmitted) {
    return (
        <div className="p-6 text-center">
            <MailCheck className="mx-auto h-16 w-16 text-green-500 mb-4" />
            <h2 className="text-2xl font-bold font-headline">Verifique seu E-mail</h2>
            <p className="text-muted-foreground mt-2">
                Se uma conta com o e-mail <strong>{email}</strong> existir, enviamos um link para você redefinir sua senha.
            </p>
        </div>
    )
  }

  return (
    <>
      <DialogHeader className="p-6 pb-2 text-center">
        <DialogTitle className="font-headline text-2xl">Recuperar Senha</DialogTitle>
        <DialogDescription>
            Insira seu e-mail para receber um link de redefinição de senha.
        </DialogDescription>
      </DialogHeader>
      <div className="p-6 pt-2">
        <form onSubmit={handleRequestReset} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email-reset">Email</Label>
            <Input 
              id="email-reset" 
              type="email" 
              placeholder="seu-email@exemplo.com" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <DialogFooter>
            <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Enviar Link de Recuperação
            </Button>
          </DialogFooter>
        </form>
      </div>
    </>
  );
}

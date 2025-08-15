'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Logo from '@/components/shared/Logo';
import { DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

export default function OperatorAuthForm() {
  return (
    <>
      <DialogHeader className="p-6 text-center">
         <div className="flex justify-center mb-4">
            <Logo className="h-10 w-10 text-primary" />
          </div>
        <DialogTitle className="font-headline text-2xl">Acesso do Atendente</DialogTitle>
        <DialogDescription>Faça login para acessar o painel de operações.</DialogDescription>
      </DialogHeader>
      <div className="px-6 pb-6">
        <form className="space-y-4">
            <div className="space-y-2">
            <Label htmlFor="email-operator">Email</Label>
            <Input id="email-operator" type="email" placeholder="atendente@email.com" required />
            </div>
            <div className="space-y-2">
            <div className="flex items-center">
                <Label htmlFor="password-operator">Senha</Label>
                <Link href="#" className="ml-auto inline-block text-sm underline">
                Esqueceu sua senha?
                </Link>
            </div>
            <Input id="password-operator" type="password" required />
            </div>
            <Link href="/operator" className='w-full'>
            <Button type="submit" className="w-full">
                Entrar
            </Button>
            </Link>
        </form>
      </div>
    </>
  );
}


'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Phone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface QuickRideModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (name: string) => void;
}

export default function QuickRideModal({ isOpen, onClose, onSubmit }: QuickRideModalProps) {
    const [name, setName] = useState('');
    const { toast } = useToast();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim().length < 2) {
            toast({
                variant: 'destructive',
                title: 'Nome Inválido',
                description: 'Por favor, insira um nome com pelo menos 2 caracteres.'
            });
            return;
        }
        onSubmit(name);
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="font-headline text-2xl">Identifique-se</DialogTitle>
                    <DialogDescription>
                        Para a sua segurança, por favor, nos diga seu nome para que o motorista possa identificá-lo.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Seu Nome ou Telefone</Label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input 
                                    id="name" 
                                    placeholder="Nome completo ou telefone" 
                                    className="pl-9"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required 
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" className="w-full">Confirmar e Pedir Corrida</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

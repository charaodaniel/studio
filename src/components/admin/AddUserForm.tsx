
'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { type User } from "./UserList";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Info } from "lucide-react";


interface AddUserFormProps {
    onUserAdded: (newUser: User) => void;
}

export default function AddUserForm({ onUserAdded }: AddUserFormProps) {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [role, setRole] = useState<string>('Passageiro');
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!name || !email) {
            toast({ variant: 'destructive', title: 'Campos Obrigatórios', description: 'Nome e Email são obrigatórios.' });
            return;
        }

        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            const newUser: User = {
                id: `usr_local_${new Date().getTime()}`,
                name,
                email,
                phone,
                role: [role],
                avatar: `https://i.pravatar.cc/150?u=${email}`,
                password_placeholder: "12345678",
                driver_status: role === 'Motorista' ? 'offline' : undefined,
                collectionId: '_pb_users_auth_',
                collectionName: 'users',
                created: new Date().toISOString(),
                updated: new Date().toISOString(),
            };

            toast({
                title: 'Sucesso! (Simulação)',
                description: `O usuário "${name}" foi adicionado à lista localmente.`,
            });
            onUserAdded(newUser);
            setIsLoading(false);
        }, 500);

    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
             <Alert>
                <Info className="h-4 w-4"/>
                <AlertTitle>Modo de Protótipo</AlertTitle>
                <AlertDescription>
                   A adição de usuários é apenas uma simulação local e não será salva permanentemente.
                </AlertDescription>
            </Alert>
            <div className="space-y-2">
                <Label htmlFor="name">Nome Completo</Label>
                <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="João da Silva" required disabled={isLoading} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="joao.silva@email.com" required disabled={isLoading} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input id="phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="55999887766" disabled={isLoading} />
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="role">Perfil</Label>
                <Select value={role} onValueChange={setRole} disabled={isLoading}>
                    <SelectTrigger id="role">
                        <SelectValue placeholder="Selecione o perfil" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Passageiro">Passageiro</SelectItem>
                        <SelectItem value="Motorista">Motorista</SelectItem>
                        <SelectItem value="Atendente">Atendente</SelectItem>
                        <SelectItem value="Admin">Admin</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {isLoading ? 'Adicionando...' : 'Adicionar Usuário'}
            </Button>
        </form>
    );
}


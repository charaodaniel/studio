
'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Info } from "lucide-react";
import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { useDatabaseManager, type DatabaseData } from "@/hooks/use-database-manager";

interface AddUserFormProps {
    onUserAdded: () => void;
}

export default function AddUserForm({ onUserAdded }: AddUserFormProps) {
    const { toast } = useToast();
    const { database, saveDatabase, isSaving } = useDatabaseManager();

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

        if (!database) {
            toast({ variant: 'destructive', title: 'Erro de Dados', description: 'O banco de dados não está carregado.' });
            return;
        }

        const newUser = {
            id: `usr_local_${new Date().getTime()}`,
            name,
            email,
            phone,
            role: [role],
            avatar: `https://i.pravatar.cc/150?u=${email}`,
            password_placeholder: "12345678",
            created: new Date().toISOString(),
            updated: new Date().toISOString(),
            // Add driver specific fields if role is Motorista
            ...(role === 'Motorista' && {
                driver_status: 'offline',
                driver_vehicle_model: "",
                driver_vehicle_plate: "",
                driver_cnpj: "",
                driver_pix_key: "",
                driver_fare_type: "km",
                driver_km_rate: 0,
                driver_accepts_rural: false,
            }),
        };

        const updatedDatabase: DatabaseData = {
            ...database,
            users: [...database.users, newUser],
        };

        await saveDatabase(updatedDatabase);
        onUserAdded();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
             <Alert variant="destructive">
                <Info className="h-4 w-4"/>
                <AlertTitle>Modo de Edição Ativado</AlertTitle>
                <AlertDescription>
                   As alterações feitas aqui serão salvas permanentemente no arquivo `banco.json` do repositório.
                </AlertDescription>
            </Alert>
            <div className="space-y-2">
                <Label htmlFor="name">Nome Completo</Label>
                <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="João da Silva" required disabled={isSaving} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="joao.silva@email.com" required disabled={isSaving} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input id="phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="55999887766" disabled={isSaving} />
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="role">Perfil</Label>
                <Select value={role} onValueChange={setRole} disabled={isSaving}>
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
            <Button type="submit" className="w-full" disabled={isSaving}>
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {isSaving ? 'Salvando...' : 'Adicionar Usuário'}
            </Button>
        </form>
    );
}

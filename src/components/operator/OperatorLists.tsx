
'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Car, User } from "lucide-react"
import UserList, { type User as UserData } from "../admin/UserList"

interface OperatorListsProps {
    onSelectUser: (user: UserData) => void;
}

export default function OperatorLists({ onSelectUser }: OperatorListsProps) {
    return (
        <Tabs defaultValue="passengers" className="w-full flex-grow flex flex-col h-full">
             <div className="flex justify-between items-center mb-4">
                <div>
                    <h2 className="text-2xl font-bold font-headline">Listas de Usuários</h2>
                    <p className="text-muted-foreground">Selecione um usuário para iniciar uma conversa de suporte.</p>
                </div>
            </div>
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="passengers"><User className="mr-2 h-4 w-4"/> Passageiros</TabsTrigger>
                <TabsTrigger value="drivers"><Car className="mr-2 h-4 w-4"/> Motoristas</TabsTrigger>
            </TabsList>
            <div className="mt-4 flex-grow h-0">
                <TabsContent value="passengers" className="m-0 h-full">
                    <UserList roleFilter="Passageiro" onSelectUser={onSelectUser} />
                </TabsContent>
                <TabsContent value="drivers" className="m-0 h-full">
                    <UserList roleFilter="Motorista" onSelectUser={onSelectUser} />
                </TabsContent>
            </div>
        </Tabs>
    )
}

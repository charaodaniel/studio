
'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, MessageSquare, Car, Headset, Shield } from "lucide-react";
import UserManagement from "./UserManagement";
import UserList from "./UserList";

export default function UserManagementTabs() {
    return (
        <Tabs defaultValue="conversations" className="w-full h-full flex flex-col">
            <div className="p-2 border-b">
                <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="conversations"><MessageSquare className="mr-2 h-4 w-4"/> Conversas</TabsTrigger>
                    <TabsTrigger value="passengers"><User className="mr-2 h-4 w-4"/> Passageiros</TabsTrigger>
                    <TabsTrigger value="drivers"><Car className="mr-2 h-4 w-4"/> Motoristas</TabsTrigger>
                    <TabsTrigger value="operators"><Headset className="mr-2 h-4 w-4"/> Atendentes</TabsTrigger>
                    <TabsTrigger value="admins"><Shield className="mr-2 h-4 w-4"/> Admin</TabsTrigger>
                </TabsList>
            </div>
            <TabsContent value="conversations" className="flex-grow mt-0 overflow-hidden">
                <UserManagement />
            </TabsContent>
            <TabsContent value="passengers" className="flex-grow mt-0 overflow-hidden">
                <UserList roleFilter="Passageiro" />
            </TabsContent>
            <TabsContent value="drivers" className="flex-grow mt-0 overflow-hidden">
                <UserList roleFilter="Motorista" />
            </TabsContent>
            <TabsContent value="operators" className="flex-grow mt-0 overflow-hidden">
                 <UserList roleFilter="Atendente" />
            </TabsContent>
            <TabsContent value="admins" className="flex-grow mt-0 overflow-hidden">
                <UserList roleFilter="Admin" />
            </TabsContent>
        </Tabs>
    )
}

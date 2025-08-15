
'use client';

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, MessageSquare, Car, Headset, Shield } from "lucide-react";
import UserManagement from "./UserManagement";
import UserList, { type User as UserData } from "./UserList";

export default function UserManagementTabs() {
    const [activeTab, setActiveTab] = useState("conversations");
    // The selected user is now managed here, at the top level.
    const [selectedUserForChat, setSelectedUserForChat] = useState<UserData | null>(null);

    const handleSelectUser = (user: UserData) => {
        setSelectedUserForChat(user);
        // When a user is selected from a list, switch to the conversations tab.
        setActiveTab("conversations");
    };

    return (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full h-full flex flex-col">
            <div className="p-2 border-b">
                <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-5">
                    <TabsTrigger value="conversations"><MessageSquare className="mr-2 h-4 w-4"/> Conversas</TabsTrigger>
                    <TabsTrigger value="passengers"><User className="mr-2 h-4 w-4"/> Passageiros</TabsTrigger>
                    <TabsTrigger value="drivers"><Car className="mr-2 h-4 w-4"/> Motoristas</TabsTrigger>
                    <TabsTrigger value="operators"><Headset className="mr-2 h-4 w-4"/> Atendentes</TabsTrigger>
                    <TabsTrigger value="admins"><Shield className="mr-2 h-4 w-4"/> Admin</TabsTrigger>
                </TabsList>
            </div>
            <TabsContent value="conversations" className="flex-grow mt-0 overflow-y-auto">
                {/* Pass the selected user and the handler to UserManagement */}
                <UserManagement preselectedUser={selectedUserForChat} onUserSelect={setSelectedUserForChat} />
            </TabsContent>
            <TabsContent value="passengers" className="flex-grow mt-0 overflow-y-auto">
                <UserList roleFilter="Passageiro" onSelectUser={handleSelectUser} />
            </TabsContent>
            <TabsContent value="drivers" className="flex-grow mt-0 overflow-y-auto">
                <UserList roleFilter="Motorista" onSelectUser={handleSelectUser} />
            </TabsContent>
            <TabsContent value="operators" className="flex-grow mt-0 overflow-y-auto">
                 <UserList roleFilter="Atendente" onSelectUser={handleSelectUser} />
            </TabsContent>
            <TabsContent value="admins" className="flex-grow mt-0 overflow-y-auto">
                <UserList roleFilter="Admin" onSelectUser={handleSelectUser} />
            </TabsContent>
        </Tabs>
    )
}

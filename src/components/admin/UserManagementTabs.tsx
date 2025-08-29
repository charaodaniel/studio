
'use client';

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, MessageSquare, Car, Headset, Shield, List, FileCheck } from "lucide-react";
import UserManagement from "./UserManagement";
import UserList, { type User as UserData } from "./UserList";
import UserManagementTable from "./UserManagementTable";
import DocumentVerification from "./DocumentVerification";

export default function UserManagementTabs() {
    const [activeTab, setActiveTab] = useState("management");
    // The selected user is now managed here, at the top level.
    const [selectedUserForChat, setSelectedUserForChat] = useState<UserData | null>(null);

    const handleSelectUser = (user: UserData) => {
        setSelectedUserForChat(user);
        // When a user is selected from a list, switch to the conversations tab.
        setActiveTab("conversations");
    };

    return (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex-grow flex flex-col">
            <div className="bg-card w-full overflow-x-auto">
                <TabsList className="rounded-none h-auto">
                    <TabsTrigger value="management"><List className="mr-2 h-4 w-4"/> Gerenciar</TabsTrigger>
                    <TabsTrigger value="documents"><FileCheck className="mr-2 h-4 w-4"/> Documentos</TabsTrigger>
                    <TabsTrigger value="conversations"><MessageSquare className="mr-2 h-4 w-4"/> Conversas</TabsTrigger>
                    <TabsTrigger value="passengers"><User className="mr-2 h-4 w-4"/> Passageiros</TabsTrigger>
                    <TabsTrigger value="drivers"><Car className="mr-2 h-4 w-4"/> Motoristas</TabsTrigger>
                    <TabsTrigger value="operators"><Headset className="mr-2 h-4 w-4"/> Atendentes</TabsTrigger>
                    <TabsTrigger value="admins"><Shield className="mr-2 h-4 w-4"/> Admins</TabsTrigger>
                </TabsList>
            </div>
             <div className="p-4 md:p-6 lg:p-8 flex-grow">
                <TabsContent value="management" className="m-0 h-full">
                    <UserManagementTable />
                </TabsContent>
                 <TabsContent value="documents" className="m-0 h-full">
                    <DocumentVerification />
                </TabsContent>
                <TabsContent value="conversations" className="m-0 h-full">
                    {/* Pass the selected user and the handler to UserManagement */}
                    <UserManagement preselectedUser={selectedUserForChat} onUserSelect={setSelectedUserForChat} />
                </TabsContent>
                <TabsContent value="passengers" className="m-0 h-full">
                    <UserList roleFilter="Passageiro" onSelectUser={handleSelectUser} />
                </TabsContent>
                <TabsContent value="drivers" className="m-0 h-full">
                    <UserList roleFilter="Motorista" onSelectUser={handleSelectUser} />
                </TabsContent>
                <TabsContent value="operators" className="m-0 h-full">
                    <UserList roleFilter="Atendente" onSelectUser={handleSelectUser} />
                </TabsContent>
                <TabsContent value="admins" className="m-0 h-full">
                    <UserList roleFilter="Admin" onSelectUser={handleSelectUser} />
                </TabsContent>
            </div>
        </Tabs>
    )
}

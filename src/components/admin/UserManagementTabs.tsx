'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, MessageSquare } from "lucide-react";
import UserManagement from "./UserManagement";
import UserList from "./UserList";

export default function UserManagementTabs() {
    return (
        <Tabs defaultValue="conversations" className="w-full h-full flex flex-col">
            <div className="p-2 border-b">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="conversations"><MessageSquare className="mr-2"/> Conversas</TabsTrigger>
                    <TabsTrigger value="users"><User className="mr-2"/> Usuários</TabsTrigger>
                </TabsList>
            </div>
            <TabsContent value="conversations" className="flex-grow mt-0 overflow-hidden">
                <UserManagement />
            </TabsContent>
            <TabsContent value="users" className="flex-grow mt-0 overflow-hidden">
                <UserList />
            </TabsContent>
        </Tabs>
    )
}
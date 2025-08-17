'use client';

import { useState } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Headset, ListChecks, MessageSquare } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DriverStatusList from './DriverStatusList';
import UserManagement from '../admin/UserManagement';
import type { User as UserData } from '../admin/UserList';

export function OperatorPage() {
  const [activeTab, setActiveTab] = useState("status");
  const [selectedUserForChat, setSelectedUserForChat] = useState<UserData | null>(null);

  return (
    <div className="flex flex-col bg-muted/40 min-h-[calc(100vh-4rem)]">
      <div className="flex flex-col items-center gap-4 py-8 bg-card">
        <Avatar className="h-24 w-24 cursor-pointer ring-4 ring-background">
            <AvatarFallback>
                <Headset className="h-10 w-10"/>
            </AvatarFallback>
        </Avatar>
        <div className="text-center">
          <h2 className="font-headline text-2xl font-semibold">Painel de Operações</h2>
          <p className="text-muted-foreground">Monitore a plataforma em tempo real e preste suporte.</p>
        </div>
      </div>

      <Tabs defaultValue="status" className="w-full flex-grow flex flex-col">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="status"><ListChecks className="mr-2" />Status dos Motoristas</TabsTrigger>
          <TabsTrigger value="conversations"><MessageSquare className="mr-2" />Conversas</TabsTrigger>
        </TabsList>
        <div className="p-4 md:p-6 lg:p-8 flex-grow">
            <TabsContent value="status" className="m-0 h-full">
                <DriverStatusList />
            </TabsContent>
            <TabsContent value="conversations" className="m-0 h-full">
                <UserManagement preselectedUser={selectedUserForChat} onUserSelect={setSelectedUserForChat} />
            </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

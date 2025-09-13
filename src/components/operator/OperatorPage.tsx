
'use client';

import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Headset, ListChecks, MessageSquare, Users } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DriverStatusList from './DriverStatusList';
import UserManagement from '../admin/UserManagement';
import type { User as UserData } from '../admin/UserList';
import pb from '@/lib/pocketbase';
import { Skeleton } from '../ui/skeleton';
import OperatorLists from './OperatorLists';

export function OperatorPage() {
  const [activeTab, setActiveTab] = useState("status");
  const [selectedUserForChat, setSelectedUserForChat] = useState<UserData | null>(null);
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const user = pb.authStore.model as UserData | null;
    setCurrentUser(user);
    setIsLoading(false);

    const unsubscribe = pb.authStore.onChange((token, model) => {
      setCurrentUser(model as UserData | null);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleSelectUser = (user: UserData) => {
    setSelectedUserForChat(user);
    setActiveTab("conversations");
  };

  const avatarUrl = currentUser?.avatar ? pb.getFileUrl(currentUser, currentUser.avatar) : '';
  const avatarFallback = currentUser?.name ? currentUser.name.substring(0, 2).toUpperCase() : <Headset className="h-10 w-10"/>;

  return (
    <div className="flex flex-col bg-muted/40 min-h-[calc(100vh-4rem)]">
      <div className="flex flex-col items-center gap-4 py-8 bg-card">
        {isLoading ? (
          <>
            <Skeleton className="h-24 w-24 rounded-full" />
            <div className="text-center space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
          </>
        ) : (
          <>
            <Avatar className="h-24 w-24 cursor-pointer ring-4 ring-background">
              <AvatarImage src={avatarUrl} />
              <AvatarFallback className="text-3xl">
                {avatarFallback}
              </AvatarFallback>
            </Avatar>
            <div className="text-center">
              <h2 className="font-headline text-2xl font-semibold">{currentUser?.name || 'Painel de Operações'}</h2>
              <p className="text-muted-foreground">Monitore a plataforma em tempo real e preste suporte.</p>
            </div>
          </>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex-grow flex flex-col">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="status"><ListChecks className="mr-2" />Status</TabsTrigger>
          <TabsTrigger value="lists"><Users className="mr-2" />Listas</TabsTrigger>
          <TabsTrigger value="conversations"><MessageSquare className="mr-2" />Conversas</TabsTrigger>
        </TabsList>
        <div className="p-4 md:p-6 lg:p-8 flex-grow">
            <TabsContent value="status" className="m-0 h-full">
                <DriverStatusList />
            </TabsContent>
            <TabsContent value="lists" className="m-0 h-full">
                <OperatorLists onSelectUser={handleSelectUser} />
            </TabsContent>
            <TabsContent value="conversations" className="m-0 h-full">
                <UserManagement preselectedUser={selectedUserForChat} onUserSelect={setSelectedUserForChat} />
            </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

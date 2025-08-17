'use client'

import { useState } from 'react'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { List, User, MessageSquare, History, Shield, LogOut } from "lucide-react"
import RideRequests from './RideRequests'
import ProfileForm from './ProfileForm'
import DriverRideHistory from "./DriverRideHistory"
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Card, CardContent } from '../ui/card'
import Logo from '../shared/Logo'
import Link from 'next/link'
import { Button } from '../ui/button'
import UserManagement from '../admin/UserManagement'
import type { User as UserData } from '../admin/UserList';


export default function DriverDashboard() {
  const [activeView, setActiveView] = useState('requests');
  const [selectedUserForChat, setSelectedUserForChat] = useState<UserData | null>(null);


  return (
    <div className="max-w-md mx-auto bg-background min-h-screen flex flex-col shadow-lg">
      <header className="p-4 flex justify-between items-center border-b">
         <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
            <Logo className="h-8 w-8" />
            <span className="font-semibold font-headline text-lg">CEOLIN</span>
         </Link>
         <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon"><Shield className="h-5 w-5"/></Button>
            <Button variant="ghost" size="icon"><User className="h-5 w-5"/></Button>
         </div>
      </header>

      <div className="p-4 text-center border-b">
        <h1 className="text-xl font-bold font-headline mb-4">Painel do Motorista</h1>
        <Avatar className="h-32 w-32 mx-auto mb-2 border-4 border-primary/50">
            <AvatarImage src="https://placehold.co/128x128.png" data-ai-hint="driver portrait" />
            <AvatarFallback className="text-4xl">CA</AvatarFallback>
        </Avatar>
        <h2 className="text-2xl font-bold font-headline">Carlos Motorista</h2>
        <p className="text-muted-foreground">⭐ 4.9 (238 corridas)</p>
        <div className="mt-4 max-w-[200px] mx-auto">
            <Select defaultValue="online">
                <SelectTrigger>
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="online">Online</SelectItem>
                    <SelectItem value="offline">Offline</SelectItem>
                    <SelectItem value="busy">Ocupado</SelectItem>
                </SelectContent>
            </Select>
        </div>
      </div>
     
      <Tabs defaultValue="requests" className="w-full flex-grow flex flex-col">
          <div className="px-2 border-b">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="requests"><List className="mr-1 h-4 w-4"/> Solicitações</TabsTrigger>
              <TabsTrigger value="conversations"><MessageSquare className="mr-1 h-4 w-4"/> Conversas</TabsTrigger>
              <TabsTrigger value="history"><History className="mr-1 h-4 w-4"/> Histórico</TabsTrigger>
              <TabsTrigger value="profile"><User className="mr-1 h-4 w-4"/> Perfil</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="requests" className="flex-grow mt-0 overflow-y-auto p-4 bg-muted/40">
            <RideRequests />
          </TabsContent>
           <TabsContent value="conversations" className="flex-grow mt-0 overflow-y-auto">
                <UserManagement preselectedUser={selectedUserForChat} onUserSelect={setSelectedUserForChat} />
            </TabsContent>
          <TabsContent value="history" className="flex-grow mt-0 overflow-y-auto p-4 md:p-6 bg-muted/40">
            <DriverRideHistory />
          </TabsContent>
          <TabsContent value="profile" className="flex-grow mt-0 overflow-y-auto p-4 md:p-6 bg-muted/40">
            <ProfileForm />
          </TabsContent>
        </Tabs>
    </div>
  )
}

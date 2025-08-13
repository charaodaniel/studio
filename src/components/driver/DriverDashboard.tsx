'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Car, CheckCircle, Circle, HardHat, History, MessageSquare, User, XCircle } from 'lucide-react'
import RideRequests from './RideRequests'
import DriverRideHistory from './DriverRideHistory'
import ProfileForm from './ProfileForm'

export default function DriverDashboard() {
  return (
    <div className="container mx-auto p-4">
      <header className="mb-6">
        <div className="bg-card p-4 rounded-lg shadow-sm flex flex-col sm:flex-row items-center gap-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src="https://placehold.co/80x80.png" data-ai-hint="driver portrait" />
            <AvatarFallback>M</AvatarFallback>
          </Avatar>
          <div className="flex-grow text-center sm:text-left">
            <h2 className="text-2xl font-bold font-headline">Roberto Andrade</h2>
            <div className="flex items-center gap-2 text-muted-foreground justify-center sm:justify-start">
              <Car className="h-4 w-4" />
              <span>Chevrolet Onix - BRA2E19</span>
              <Badge variant="secondary">4.9 ★</Badge>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Select defaultValue="online">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="online"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Online</SelectItem>
                <SelectItem value="offline"><XCircle className="h-4 w-4 text-red-500 mr-2" />Offline</SelectItem>
                <SelectItem value="in-trip"><HardHat className="h-4 w-4 text-yellow-500 mr-2" />Em Viagem</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>
      
      <Tabs defaultValue="requests" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="requests"><Circle className="mr-2 h-4 w-4" />Solicitações</TabsTrigger>
          <TabsTrigger value="chats" disabled><MessageSquare className="mr-2 h-4 w-4" />Conversas</TabsTrigger>
          <TabsTrigger value="history"><History className="mr-2 h-4 w-4" />Histórico</TabsTrigger>
          <TabsTrigger value="profile"><User className="mr-2 h-4 w-4" />Perfil</TabsTrigger>
        </TabsList>
        <TabsContent value="requests" className="mt-4">
          <RideRequests />
        </TabsContent>
        <TabsContent value="chats" className="mt-4">
            <p>O histórico de conversas com passageiros aparecerá aqui.</p>
        </TabsContent>
        <TabsContent value="history" className="mt-4">
          <DriverRideHistory />
        </TabsContent>
        <TabsContent value="profile" className="mt-4">
            <ProfileForm />
        </TabsContent>
      </Tabs>
    </div>
  )
}

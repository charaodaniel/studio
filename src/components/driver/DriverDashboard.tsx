'use client'

import { useState } from 'react'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Car, CheckCircle, HardHat, List, User, XCircle, DollarSign, Star } from "lucide-react"
import RideRequests from './RideRequests'
import ProfileForm from './ProfileForm'
import DriverRideHistory from "./DriverRideHistory"
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'

export default function DriverDashboard() {
  const [activeView, setActiveView] = useState('requests');

  return (
    <div className="space-y-8">
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Corridas Hoje</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">Corridas concluídas hoje</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ganhos de Hoje</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 185,50</div>
            <p className="text-xs text-muted-foreground">Total ganho hoje</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sua Avaliação</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center">
              4.9 <Star className="h-5 w-5 text-yellow-400 fill-yellow-400 ml-1" />
            </div>
            <p className="text-xs text-muted-foreground">Média geral</p>
          </CardContent>
        </Card>
      </div>

      <Card className="h-[70vh]">
        <Tabs defaultValue="requests" className="w-full h-full flex flex-col">
          <div className="p-2 border-b">
            <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3">
              <TabsTrigger value="requests"><List className="mr-2 h-4 w-4"/> Solicitações</TabsTrigger>
              <TabsTrigger value="history"><List className="mr-2 h-4 w-4"/> Histórico</TabsTrigger>
              <TabsTrigger value="profile"><User className="mr-2 h-4 w-4"/> Perfil</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="requests" className="flex-grow mt-0 overflow-y-auto p-4 md:p-6">
            <RideRequests />
          </TabsContent>
          <TabsContent value="history" className="flex-grow mt-0 overflow-y-auto p-4 md:p-6">
            <DriverRideHistory />
          </TabsContent>
          <TabsContent value="profile" className="flex-grow mt-0 overflow-y-auto p-4 md:p-6">
            <ProfileForm />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  )
}

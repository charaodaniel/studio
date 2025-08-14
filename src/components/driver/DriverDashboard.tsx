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
import { Car, CheckCircle, HardHat, List, User, XCircle } from "lucide-react"
import RideRequests from './RideRequests'
import ProfileForm from './ProfileForm'
import DriverRideHistory from "./DriverRideHistory"
import { Button } from "../ui/button"

type ActiveView = 'requests' | 'history' | 'profile';

export default function DriverDashboard() {
  const [activeView, setActiveView] = useState<ActiveView>('requests');

  const renderContent = () => {
    switch(activeView) {
      case 'requests': return <RideRequests />;
      case 'history': return <DriverRideHistory />;
      case 'profile': return <ProfileForm />;
      default: return <RideRequests />;
    }
  }

  return (
    <div className="grid md:grid-cols-[300px_1fr] h-screen bg-muted/40">
       <div className="hidden md:flex flex-col border-r bg-background">
         <div className="p-4 border-b">
            <div className="flex items-center gap-3">
                 <Avatar className="h-12 w-12">
                    <AvatarImage src="https://placehold.co/80x80.png" data-ai-hint="driver portrait" />
                    <AvatarFallback>M</AvatarFallback>
                </Avatar>
                <div>
                    <h2 className="text-lg font-bold font-headline">Roberto Andrade</h2>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Car className="h-3 w-3" />
                        <span>Chevrolet Onix</span>
                        <Badge variant="secondary" className="text-xs">4.9 ★</Badge>
                    </div>
                </div>
            </div>
            <Select defaultValue="online">
              <SelectTrigger className="w-full mt-4">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="online"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Online</SelectItem>
                <SelectItem value="offline"><XCircle className="h-4 w-4 text-red-500 mr-2" />Offline</SelectItem>
                <SelectItem value="in-trip"><HardHat className="h-4 w-4 text-yellow-500 mr-2" />Em Viagem</SelectItem>
              </SelectContent>
            </Select>
         </div>
         <nav className="flex flex-col p-2 gap-1">
            <Button variant={activeView === 'requests' ? 'secondary' : 'ghost'} onClick={() => setActiveView('requests')} className="justify-start"><List className="mr-2"/> Solicitações</Button>
            <Button variant={activeView === 'history' ? 'secondary' : 'ghost'} onClick={() => setActiveView('history')} className="justify-start"><List className="mr-2"/> Histórico</Button>
            <Button variant={activeView === 'profile' ? 'secondary' : 'ghost'} onClick={() => setActiveView('profile')} className="justify-start"><User className="mr-2"/> Perfil</Button>
         </nav>
       </div>
       <main className="flex flex-col">
            <header className="p-4 border-b flex items-center gap-3 md:hidden bg-background">
                <Avatar className="h-10 w-10">
                    <AvatarImage src="https://placehold.co/80x80.png" data-ai-hint="driver portrait" />
                    <AvatarFallback>M</AvatarFallback>
                </Avatar>
                <div>
                    <h2 className="text-md font-bold font-headline">Roberto Andrade</h2>
                    <p className="text-sm text-green-500">Online</p>
                </div>
            </header>
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                {renderContent()}
            </div>
             <footer className="md:hidden border-t bg-background p-2 flex justify-around">
                <Button variant={activeView === 'requests' ? 'secondary' : 'ghost'} size="sm" onClick={() => setActiveView('requests')} className="flex flex-col h-auto"><List/> <span className="text-xs">Solicitações</span></Button>
                <Button variant={activeView === 'history' ? 'secondary' : 'ghost'} size="sm" onClick={() => setActiveView('history')} className="flex flex-col h-auto"><List/> <span className="text-xs">Histórico</span></Button>
                <Button variant={activeView === 'profile' ? 'secondary' : 'ghost'} size="sm" onClick={() => setActiveView('profile')} className="flex flex-col h-auto"><User/> <span className="text-xs">Perfil</span></Button>
            </footer>
       </main>
    </div>
  )
}
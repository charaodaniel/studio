import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, UserPlus } from "lucide-react"
import UserManagementTable from "./UserManagementTable"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import ProfileForm from "../driver/ProfileForm"
  
const users = [
    { id: 1, name: "Ana Clara", lastMessage: "Passageiro", unread: 0, type: 'Passageiro', avatar: 'AC' },
    { id: 2, name: "Roberto Andrade", lastMessage: "Motorista", unread: 0, type: 'Motorista', avatar: 'RA' },
    { id: 3, name: "Admin User", lastMessage: "Admin", unread: 0, type: 'Admin', avatar: 'AU' },
    { id: 4, name: "Carlos Dias", lastMessage: "Motorista", unread: 0, type: 'Motorista', avatar: 'CD' },
]
  
export default function UserManagement() {
    return (
      <div className="grid grid-cols-1 md:grid-cols-[350px_1fr] h-screen">
        <div className="flex flex-col border-r bg-background">
          <div className="p-4 border-b sticky top-0 bg-background z-10">
            <div className="flex justify-between items-center mb-2">
                <h2 className="text-xl font-bold font-headline">Usuários</h2>
                <Button size="icon" variant="ghost"><UserPlus className="w-5 h-5"/></Button>
            </div>
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Pesquisar usuários..." className="pl-8" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {users.map((convo) => (
              <div key={convo.id} className="flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/50 border-b">
                <Avatar>
                  <AvatarImage src={`https://placehold.co/40x40.png?text=${convo.avatar}`} data-ai-hint="user portrait"/>
                  <AvatarFallback>{convo.avatar}</AvatarFallback>
                </Avatar>
                <div className="flex-1 overflow-hidden">
                    <p className="font-semibold truncate">{convo.name}</p>
                    <p className="text-sm text-muted-foreground truncate">{convo.lastMessage}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex-1 flex flex-col bg-muted/40">
          <div className="p-4 border-b flex items-center gap-3 bg-background">
            <Avatar>
              <AvatarImage src="https://placehold.co/40x40.png?text=RA" data-ai-hint="user portrait"/>
              <AvatarFallback>RA</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">Roberto Andrade</p>
              <p className="text-sm text-green-500 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                Online
              </p>
            </div>
          </div>
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
            <div className="grid grid-cols-1 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Gerenciamento de Usuário</CardTitle>
                        <CardDescription>Edite as informações e permissões do usuário.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ProfileForm />
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>Atividade Recente</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">Nenhuma atividade recente para este usuário.</p>
                    </CardContent>
                </Card>
            </div>
          </div>
        </div>
      </div>
    )
}
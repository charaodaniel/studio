
import UserManagementTabs from "./UserManagementTabs";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { User } from "lucide-react";


export default function AdminDashboard() {
  return (
    <div className="flex flex-col bg-muted/40 min-h-[calc(100vh-4rem)]">
       <div className="flex flex-col items-center gap-4 py-8 bg-card">
         <Avatar className="h-24 w-24 cursor-pointer ring-4 ring-background">
            <AvatarFallback>
                <User className="h-10 w-10"/>
            </AvatarFallback>
        </Avatar>
        <div className="text-center">
          <h2 className="font-headline text-2xl font-semibold">Painel do Administrador</h2>
          <p className="text-muted-foreground">Visão geral e gerenciamento da plataforma.</p>
        </div>
      </div>
       <UserManagementTabs />
    </div>
  );
}

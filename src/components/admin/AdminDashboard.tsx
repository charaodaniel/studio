
import { User, List } from "lucide-react";
import UserManagementTable from "./UserManagementTable";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useDatabaseManager } from "@/hooks/use-database-manager";

const getAvatarUrl = (avatarPath: string) => {
    if (!avatarPath) return '';
    return `/${avatarPath.split('public/').pop()}`;
};

export default function AdminDashboard() {
  const { data: db } = useDatabaseManager<{ users: any[] }>();
  const adminUser = db?.users.find(u => Array.isArray(u.role) ? u.role.includes('Admin') : u.role === 'Admin');
  
  return (
    <div className="flex flex-col bg-muted/40 min-h-[calc(100vh-4rem)]">
       <div className="flex flex-col items-center gap-4 py-8 bg-card">
         <Avatar className="h-24 w-24 cursor-pointer ring-4 ring-background">
            <AvatarImage src={adminUser ? getAvatarUrl(adminUser.avatar) : ''} />
            <AvatarFallback>
                <User className="h-10 w-10"/>
            </AvatarFallback>
        </Avatar>
        <div className="text-center">
          <h2 className="font-headline text-2xl font-semibold">{adminUser?.name || 'Painel do Administrador'}</h2>
          <p className="text-muted-foreground">Visão geral e gerenciamento da plataforma.</p>
        </div>
      </div>
       <div className="p-4 md:p-6 lg:p-8 flex-grow">
        <div className="flex items-center gap-2 mb-4">
            <List className="h-6 w-6"/>
            <h2 className="text-2xl font-bold font-headline">Gerenciamento de Usuários</h2>
        </div>
        <p className="text-muted-foreground mb-6">Visualize, edite e gerencie todos os usuários da plataforma.</p>
        <UserManagementTable />
       </div>
    </div>
  );
}


'use client';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, FileDown, ShieldAlert, Trash2, Edit, UserPlus, ListVideo, FileText, WifiOff, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import pb from "@/lib/pocketbase";
import type { User } from "./UserList";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../ui/alert-dialog";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog";
import { cn } from "@/lib/utils";
import DriverStatusLogModal from "./DriverStatusLogModal";
import AddUserForm from "./AddUserForm";
import { ScrollArea } from "../ui/scroll-area";
import UserProfile from "./UserProfile";
  
  export default function UserManagementTable() {
    const { toast } = useToast();
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedUserForLog, setSelectedUserForLog] = useState<User | null>(null);
    const [selectedUserForEdit, setSelectedUserForEdit] = useState<User | null>(null);


    const fetchUsers = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const records = await pb.collection('users').getFullList<User>({ sort: '-created' }, { admin: true });
            setUsers(records);
        } catch (err: any) {
            setError("Não foi possível carregar os usuários. Verifique a conexão com o servidor.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleToggleUserStatus = async (user: User) => {
      const newStatus = !user.disabled;
      try {
        await pb.collection('users').update(user.id, { disabled: newStatus });
        toast({
          title: "Status Alterado!",
          description: `O usuário ${user.name} foi ${newStatus ? 'desativado' : 'ativado'}.`
        });
        fetchUsers();
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Erro ao atualizar status",
          description: "Não foi possível alterar o status do usuário."
        });
      }
    }
    
    return (
        <>
             <div className="flex justify-end mb-4">
                <Dialog>
                    <DialogTrigger asChild>
                        <Button><UserPlus className="mr-2 h-4 w-4"/> Adicionar Usuário</Button>
                    </DialogTrigger>
                     <DialogContent>
                        <DialogHeader>
                        <DialogTitle>Adicionar Novo Usuário</DialogTitle>
                        <DialogDescription>Preencha os campos abaixo para criar um novo usuário.</DialogDescription>
                        </DialogHeader>
                        <ScrollArea className="max-h-[80vh]">
                        <AddUserForm onUserAdded={fetchUsers} />
                        </ScrollArea>
                    </DialogContent>
                </Dialog>
            </div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead className="hidden md:table-cell">Email</TableHead>
                        <TableHead className="hidden sm:table-cell">Perfil</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>
                        <span className="sr-only">Ações</span>
                        </TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                     {isLoading && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center p-8">
                            <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
                          </TableCell>
                        </TableRow>
                      )}
                      {error && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-destructive p-8">
                             <WifiOff className="mx-auto h-8 w-8 mb-2" />
                            {error}
                          </TableCell>
                        </TableRow>
                      )}
                    {!isLoading && !error && users.map((user) => (
                        <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell className="hidden md:table-cell">{user.email}</TableCell>
                        <TableCell className="hidden sm:table-cell">
                            <Badge variant={
                                user.role === 'Admin' ? 'destructive' : 
                                user.role === 'Motorista' ? 'default' : 'secondary'
                            }>{user.role}</Badge>
                        </TableCell>
                        <TableCell>
                            <Badge variant={!user.disabled ? 'outline' : 'secondary'} className={!user.disabled ? "border-green-500 text-green-600" : ""}>{user.disabled ? 'Inativo' : 'Ativo'}</Badge>
                        </TableCell>
                        <TableCell>
                            <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button aria-haspopup="true" size="icon" variant="ghost">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Toggle menu</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                <DropdownMenuItem onSelect={() => setSelectedUserForEdit(user)}>
                                    <Edit className="mr-2 h-4 w-4"/>Editar / Alterar Senha
                                </DropdownMenuItem>
                                {user.role === 'Motorista' && (
                                    <>
                                        <DropdownMenuItem onSelect={() => setSelectedUserForLog(user)}>
                                            <ListVideo className="mr-2 h-4 w-4"/>Ver Log de Status
                                        </DropdownMenuItem>
                                        <DropdownMenuSub>
                                            <DropdownMenuSubTrigger>
                                                <FileDown className="mr-2 h-4 w-4" />
                                                Gerar Relatório
                                            </DropdownMenuSubTrigger>
                                            <DropdownMenuSubContent>
                                                <DropdownMenuItem><FileText className="mr-2 h-4 w-4" /> PDF</DropdownMenuItem>
                                                <DropdownMenuItem><FileText className="mr-2 h-4 w-4" /> CSV</DropdownMenuItem>
                                            </DropdownMenuSubContent>
                                        </DropdownMenuSub>
                                    </>
                                )}
                                <DropdownMenuSeparator />
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <DropdownMenuItem
                                            onSelect={(e) => e.preventDefault()}
                                            className={cn("text-red-600", user.disabled && "text-green-600")}
                                        >
                                            <Trash2 className="mr-2 h-4 w-4"/>{user.disabled ? "Ativar" : "Desativar"}
                                        </DropdownMenuItem>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Esta ação vai {user.disabled ? "reativar" : "desativar"} o acesso do usuário ${user.name} à plataforma.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleToggleUserStatus(user)} className={user.disabled ? '' : 'bg-destructive hover:bg-destructive/90'}>
                                                Sim, {user.disabled ? "Ativar" : "Desativar"}
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </DropdownMenuContent>
                            </DropdownMenu>
                        </TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
            </div>
            
            <Dialog open={!!selectedUserForLog} onOpenChange={(isOpen) => !isOpen && setSelectedUserForLog(null)}>
                 {selectedUserForLog && (
                    <DialogContent>
                        <DriverStatusLogModal user={selectedUserForLog} />
                    </DialogContent>
                )}
            </Dialog>

            <Dialog open={!!selectedUserForEdit} onOpenChange={(isOpen) => !isOpen && setSelectedUserForEdit(null)}>
                {selectedUserForEdit && (
                     <DialogContent className="p-0 sm:max-w-lg md:max-w-xl">
                        <DialogHeader className="p-4 sr-only">
                            <DialogTitle>Editar Perfil do Usuário</DialogTitle>
                        </DialogHeader>
                        <UserProfile 
                            user={selectedUserForEdit} 
                            onBack={() => setSelectedUserForEdit(null)} 
                            onContact={() => { /* Not needed here */ }} 
                            isModal={true} 
                            onUserUpdate={() => {
                                fetchUsers();
                                setSelectedUserForEdit(null);
                            }}
                        />
                     </DialogContent>
                )}
            </Dialog>
      </>
    );
  }

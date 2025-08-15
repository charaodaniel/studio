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
  import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
  import { MoreHorizontal, FileDown, ShieldAlert, Trash2, Edit, UserPlus, ListVideo } from "lucide-react";
  
  const users = [
    { id: 1, name: "Ana Clara", email: "ana.clara@email.com", role: "Passageiro", status: "Ativo" },
    { id: 2, name: "Roberto Andrade", email: "roberto.a@email.com", role: "Motorista", status: "Ativo" },
    { id: 3, name: "Admin User", email: "admin@ceolin-mobilidade.com", role: "Admin", status: "Ativo" },
    { id: 4, name: "Carlos Dias", email: "carlos.dias@email.com", role: "Motorista", status: "Inativo" },
  ];
  
  export default function UserManagementTable() {
    return (
        <div>
            <div className="flex justify-end mb-4">
                <Button><UserPlus className="mr-2 h-4 w-4"/> Adicionar Usuário</Button>
            </div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead className="hidden sm:table-cell">Email</TableHead>
                        <TableHead className="hidden sm:table-cell">Perfil</TableHead>
                        <TableHead className="hidden md:table-cell">Status</TableHead>
                        <TableHead>
                        <span className="sr-only">Ações</span>
                        </TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {users.map((user) => (
                        <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell className="hidden sm:table-cell">{user.email}</TableCell>
                        <TableCell className="hidden sm:table-cell">
                            <Badge variant={
                                user.role === 'Admin' ? 'destructive' : 
                                user.role === 'Motorista' ? 'default' : 'secondary'
                            }>{user.role}</Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                            <Badge variant={user.status === 'Ativo' ? 'outline' : 'secondary'} className={user.status === 'Ativo' ? "border-green-500 text-green-600" : ""}>{user.status}</Badge>
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
                                <DropdownMenuItem><Edit className="mr-2 h-4 w-4"/>Editar</DropdownMenuItem>
                                <DropdownMenuItem><ShieldAlert className="mr-2 h-4 w-4"/>Alterar Senha</DropdownMenuItem>
                                {user.role === 'Motorista' && (
                                    <>
                                        <DropdownMenuItem><FileDown className="mr-2 h-4 w-4"/>Gerar Relatório</DropdownMenuItem>
                                        <DropdownMenuItem><ListVideo className="mr-2 h-4 w-4"/>Ver Log de Status</DropdownMenuItem>
                                    </>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-600"><Trash2 className="mr-2 h-4 w-4"/>Desativar</DropdownMenuItem>
                            </DropdownMenuContent>
                            </DropdownMenu>
                        </TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
            </div>
      </div>
    );
  }

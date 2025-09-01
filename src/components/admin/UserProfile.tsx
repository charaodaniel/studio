

import { ArrowLeft, Car, Mail, Phone, Wallet, FileText, MessageSquare, Briefcase, Key, Search, Edit, X, Eye, ChevronRight } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { type User } from './UserList';
import pb from '@/lib/pocketbase';
import { Separator } from '../ui/separator';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import Image from 'next/image';
import type { RecordModel } from 'pocketbase';

interface DocumentRecord extends RecordModel {
    driver: string;
    document_type: 'CNH' | 'CRLV' | 'VEHICLE_PHOTO';
    file: string;
    is_verified: boolean;
}

const ViewDocumentsModal = ({ user, children }: { user: User, children: React.ReactNode }) => {
    const [documents, setDocuments] = useState<DocumentRecord[]>([]);

    useEffect(() => {
        const fetchDocs = async () => {
            if (!user) return;
            try {
                const records = await pb.collection('driver_documents').getFullList<DocumentRecord>({
                    filter: `driver="${user.id}" && is_verified=true`
                }, { admin: true });
                setDocuments(records);
            } catch (error) {
                console.error("Failed to fetch verified documents:", error);
            }
        };
        fetchDocs();
    }, [user]);

    return (
        <Dialog>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Documentos Verificados de {user.name}</DialogTitle>
                    <DialogDescription>
                        Visualize os documentos que já foram aprovados para este motorista.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    {documents.length > 0 ? documents.map(doc => (
                        <div key={doc.id} className="flex items-center justify-between p-2 border rounded-lg">
                           <div>
                             <p className="font-semibold">{doc.document_type}</p>
                             <p className="text-xs text-muted-foreground">Verificado</p>
                           </div>
                           <Dialog>
                            <DialogTrigger asChild>
                                <Button variant="outline" size="sm"><Eye className="mr-2 h-4 w-4"/>Ver Imagem</Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-3xl">
                                <Image src={pb.getFileUrl(doc, doc.file)} alt={`Documento de ${user.name}`} width={800} height={600} className="rounded-lg object-contain max-h-[80vh]"/>
                            </DialogContent>
                           </Dialog>
                        </div>
                    )) : <p className="text-muted-foreground text-center">Nenhum documento verificado encontrado.</p>}
                </div>
            </DialogContent>
        </Dialog>
    )
};


interface UserProfileProps {
  user: User;
  onBack: () => void;
  onContact: () => void;
  isModal?: boolean;
  onUserUpdate?: () => void; // Callback to refresh list after update
}

export default function UserProfile({ user, onBack, onContact, onUserUpdate }: UserProfileProps) {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<User>>({});
  const [newPassword, setNewPassword] = useState({ password: '', confirmPassword: '' });
  
  useEffect(() => {
    setFormData({
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        driver_vehicle_model: user.driver_vehicle_model,
        driver_vehicle_plate: user.driver_vehicle_plate,
        driver_cnpj: user.driver_cnpj,
        driver_pix_key: user.driver_pix_key,
    });
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSave = async () => {
    try {
      await pb.collection('users').update(user.id, formData);
      toast({
        title: 'Sucesso!',
        description: 'Os dados do usuário foram atualizados.',
      });
      setIsEditing(false);
      if (onUserUpdate) {
        onUserUpdate();
      }
    } catch (error) {
      console.error("Failed to update user:", error);
      toast({ variant: 'destructive', title: 'Erro ao Salvar', description: 'Não foi possível atualizar o usuário.' });
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword.password || !newPassword.confirmPassword) {
        toast({ variant: 'destructive', title: 'Erro', description: 'Preencha ambos os campos de senha.' });
        return;
    }
    if (newPassword.password !== newPassword.confirmPassword) {
        toast({ variant: 'destructive', title: 'Erro', description: 'As senhas não coincidem.' });
        return;
    }
    try {
        await pb.collection('users').update(user.id, {
            password: newPassword.password,
            passwordConfirm: newPassword.confirmPassword,
        });
        toast({ title: 'Senha Alterada!', description: `A senha de ${user.name} foi alterada com sucesso.` });
        setNewPassword({ password: '', confirmPassword: '' });
    } catch (error) {
        toast({ variant: 'destructive', title: 'Erro ao alterar senha', description: 'Tente novamente.' });
    }
  };

  const handleCall = () => {
    if (user.phone) {
      window.location.href = `tel:${user.phone}`;
    } else {
      toast({
        variant: 'destructive',
        title: 'Sem Telefone',
        description: 'Este usuário não possui um número de telefone cadastrado.',
      });
    }
  };

  const handleSearch = () => {
    // For now, this is a placeholder. A more advanced implementation
    // would involve a global state or search provider to filter the main table.
     toast({
        title: 'Busca de Histórico',
        description: `Para ver o histórico de ${user.name}, vá para a aba "Gerenciar" e use a busca.`,
      });
      onBack(); // Close the modal to allow navigation
  }

  const avatarUrl = user.avatar ? pb.getFileUrl(user, user.avatar) : '';

  const renderListItem = (
    icon: React.ReactNode, 
    primary: string, 
    secondary: string | null | undefined, 
    fieldId?: keyof User, 
    isEditable = true,
    onClick?: () => void
  ) => (
    <div className={`flex items-center gap-4 p-4 ${onClick ? 'cursor-pointer hover:bg-muted/50' : ''}`} onClick={onClick}>
        <div className="text-muted-foreground">{icon}</div>
        <div className="flex-1">
        {isEditing && isEditable && fieldId ? (
            <>
            <Label htmlFor={fieldId} className="text-xs">{secondary}</Label>
            <Input
                id={fieldId}
                value={formData[fieldId as keyof typeof formData] as string || ''}
                onChange={handleInputChange}
                className="h-8"
            />
            </>
        ) : (
            <>
            <p className="text-sm">{primary || 'Não informado'}</p>
            {secondary && <p className="text-xs text-muted-foreground">{secondary}</p>}
            </>
        )}
        </div>
        {onClick && <ChevronRight className="h-5 w-5 text-muted-foreground" />}
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-muted/40 max-h-[80vh] overflow-y-auto">
      <header className="p-4 border-b flex items-center justify-between gap-3 bg-background shadow-sm sticky top-0 z-10">
         <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={onBack}>
                <ArrowLeft className="w-5 h-5" />
            </Button>
            <h2 className="text-lg font-semibold font-headline">Informações do Contato</h2>
         </div>
         {isEditing ? (
            <div className='flex gap-2'>
                <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}><X className="w-4 h-4 mr-2"/> Cancelar</Button>
                <Button size="sm" onClick={handleSave}>Salvar</Button>
            </div>
         ) : (
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                <Edit className="w-4 h-4 mr-2" /> Editar
            </Button>
         )}
      </header>

      <div className="flex-1">
        <div className="bg-background flex flex-col items-center p-6 space-y-4">
          <Avatar className="h-28 w-28 border-4 border-background shadow-md">
            <AvatarImage src={avatarUrl} data-ai-hint="user portrait" />
            <AvatarFallback className="text-4xl">{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="text-center">
              <h3 className="font-headline text-2xl">{isEditing ? formData.name : user.name}</h3>
              <p className="text-muted-foreground">{isEditing ? formData.role : user.role}</p>
          </div>
          <div className="flex items-center gap-4">
              <Button variant="ghost" className="flex-col h-auto p-3" onClick={handleCall}>
                  <Phone />
                  <span className="text-xs mt-1">Ligar</span>
              </Button>
               <Button variant="ghost" className="flex-col h-auto p-3" onClick={onContact}>
                  <MessageSquare />
                  <span className="text-xs mt-1">Conversar</span>
              </Button>
              <Button variant="ghost" className="flex-col h-auto p-3" onClick={handleSearch}>
                  <Search />
                  <span className="text-xs mt-1">Buscar</span>
              </Button>
          </div>
        </div>

        <div className="p-4 space-y-4">
          <Card>
            <CardContent className="p-0 divide-y">
               {renderListItem(<Mail className="w-5 h-5" />, formData.email || '', "Email", "email", false)}
               {renderListItem(<Phone className="w-5 h-5" />, formData.phone || 'Não informado', "Telefone", "phone")}
            </CardContent>
          </Card>

          {user.role === 'Motorista' && (
            <>
              <Card>
                <CardContent className="p-0 divide-y">
                  {renderListItem(<Car className="w-5 h-5" />, formData.driver_vehicle_model || 'Não informado', "Veículo", "driver_vehicle_model")}
                  {renderListItem(<Key className="w-5 h-5" />, formData.driver_vehicle_plate || 'Não informado', "Placa", "driver_vehicle_plate")}
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-0 divide-y">
                  {renderListItem(<Briefcase className="w-5 h-5" />, formData.driver_cnpj || 'Não informado', "CNPJ", "driver_cnpj")}
                  {renderListItem(<Wallet className="w-5 h-5" />, formData.driver_pix_key || 'Não informado', "Chave PIX", "driver_pix_key")}
                </CardContent>
              </Card>
              
              <Card>
                 <CardContent className="p-0">
                    <ViewDocumentsModal user={user}>
                        {renderListItem(<FileText className="w-5 h-5" />, "Ver Documentos", "CNH, CRLV, etc.", undefined, false, () => {})}
                    </ViewDocumentsModal>
                </CardContent>
              </Card>
            </>
          )}

          {user.role === 'Passageiro' && (
             <Card>
                 <CardContent className="p-0 divide-y">
                   {renderListItem(<FileText className="w-5 h-5" />, "Ver Histórico de Corridas", "Nenhuma corrida recente", undefined, false, handleSearch)}
                </CardContent>
              </Card>
          )}
        
          {isEditing && (
              <Card>
                <CardContent className="p-4">
                    <form onSubmit={handleChangePassword} className="space-y-4">
                        <h3 className="font-medium text-destructive">Alterar Senha</h3>
                        <div className="space-y-1">
                            <Label htmlFor="new-password">Nova Senha</Label>
                            <Input id="new-password" type="password" value={newPassword.password} onChange={(e) => setNewPassword(prev => ({...prev, password: e.target.value}))} required />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="confirm-new-password">Confirmar Nova Senha</Label>
                            <Input id="confirm-new-password" type="password" value={newPassword.confirmPassword} onChange={(e) => setNewPassword(prev => ({...prev, confirmPassword: e.target.value}))} required />
                        </div>
                        <Button type="submit" variant="secondary" className="w-full">Confirmar Nova Senha</Button>
                    </form>
                </CardContent>
              </Card>
          )}

        </div>
      </div>
    </div>
  );
}

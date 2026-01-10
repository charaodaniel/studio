
import { ArrowLeft, Car, Mail, Phone, Wallet, FileText, MessageSquare, Briefcase, Edit, X, Eye, ChevronRight, Loader2, Info } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { type User } from './UserList';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import Image from 'next/image';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import localDatabase from '@/database/banco.json';

const getFileUrl = (filePath: string) => {
    if (!filePath) return '';
    return filePath;
};

interface DocumentRecord {
    id: string;
    driver: string;
    document_type: 'CNH' | 'CRLV' | 'VEHICLE_PHOTO';
    file: string; 
    is_verified: boolean;
}

const ViewDocumentsModal = ({ user }: { user: User }) => {
    const [documents, setDocuments] = useState<DocumentRecord[]>([]);

    useEffect(() => {
        const userDocs = localDatabase.documents.filter(
            doc => doc.driver === user.id && doc.is_verified
        ) as DocumentRecord[];
        setDocuments(userDocs);
    }, [user]);
    
    return (
        <Dialog>
            <DialogTrigger asChild>{<div className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 w-full text-left">
                <div className="flex items-center gap-4">
                     <FileText className="w-5 h-5 text-muted-foreground" />
                    <div>
                        <p className="text-sm">Ver Documentos</p>
                        <p className="text-xs text-muted-foreground">Visualizar documentos aprovados</p>
                    </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>}</DialogTrigger>
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
                                <Image src={getFileUrl(doc.file)} alt={`Documento de ${user.name}`} width={800} height={600} className="rounded-lg object-contain max-h-[80vh]"/>
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
  onContact?: () => void;
  onUserUpdate?: (updatedUser: User) => void;
}

export default function UserProfile({ user, onBack, onContact, onUserUpdate }: UserProfileProps) {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<User>>(user);
  
  useEffect(() => {
    setFormData(user);
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({ title: "Usuário Atualizado (Simulação)", description: "Os dados foram atualizados na interface." });
    
    if (onUserUpdate) {
        onUserUpdate({ ...user, ...formData } as User);
    }
    
    setIsEditing(false);
    setIsSaving(false);
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
  
  const avatarUrl = user.avatar ? getFileUrl(user.avatar) : '';

  const renderListItem = (
    icon: React.ReactNode, 
    primaryText: string | number | readonly string[] | undefined, 
    secondaryText: string | null | undefined, 
    fieldId?: keyof User, 
    isEditable = true
  ) => (
    <div className="flex items-center gap-4 p-4">
        <div className="text-muted-foreground">{icon}</div>
        <div className="flex-1">
        {isEditing && isEditable && fieldId ? (
            <>
                <Label htmlFor={String(fieldId)} className="text-xs text-muted-foreground">{secondaryText}</Label>
                <Input
                    id={String(fieldId)}
                    value={String(formData[fieldId as keyof typeof formData] || '')}
                    onChange={handleInputChange}
                    className="h-8"
                    disabled={isSaving}
                />
            </>
        ) : (
            <>
                <p className="text-sm">{primaryText || 'Não informado'}</p>
                {secondaryText && <p className="text-xs text-muted-foreground">{secondaryText}</p>}
            </>
        )}
        </div>
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
                <Button variant="outline" size="sm" onClick={() => setIsEditing(false)} disabled={isSaving}>
                    <X className="w-4 h-4 mr-2"/> Cancelar
                </Button>
                <Button size="sm" onClick={handleSave} disabled={isSaving}>
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    {isSaving ? 'Salvando...' : 'Salvar'}
                </Button>
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
              <p className="text-muted-foreground">{Array.isArray(user.role) ? user.role.join(', ') : user.role}</p>
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
          </div>
        </div>

        <div className="p-4 space-y-4">
            {isEditing && (
                 <Alert variant="default" className="bg-yellow-50 border-yellow-200">
                    <Info className="h-4 w-4 !text-yellow-700" />
                    <AlertTitle className="text-yellow-800">Modo de Simulação</AlertTitle>
                    <AlertDescription className="text-yellow-700">
                        As alterações serão refletidas na interface, mas não serão salvas permanentemente.
                    </AlertDescription>
                </Alert>
            )}
          <Card>
            <CardContent className="p-0 divide-y">
               {renderListItem(<Mail className="w-5 h-5" />, formData.email || 'Não informado', "Email", "email", true)}
               {renderListItem(<Phone className="w-5 h-5" />, formData.phone || 'Não informado', "Telefone", "phone")}
            </CardContent>
          </Card>

          {user.role.includes('Motorista') && (
            <>
              <Card>
                <CardContent className="p-0 divide-y">
                  {renderListItem(<Car className="w-5 h-5" />, formData.driver_vehicle_model || 'Não informado', "Veículo", "driver_vehicle_model")}
                  {renderListItem(<Wallet className="w-5 h-5" />, formData.driver_vehicle_plate || 'Não informado', "Placa", "driver_vehicle_plate")}
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
                    <ViewDocumentsModal user={user} />
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

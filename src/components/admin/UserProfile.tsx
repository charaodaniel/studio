

import { ArrowLeft, Car, Mail, Phone, Wallet, FileText, MessageSquare, Briefcase, Key, Search, Edit, X } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { type User } from './UserList';
import pb from '@/lib/pocketbase';
import { Separator } from '../ui/separator';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

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
  const [formData, setFormData] = useState<Partial<User>>({
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    driver_vehicle_model: user.driver_vehicle_model,
    driver_vehicle_plate: user.driver_vehicle_plate,
    driver_cnpj: user.driver_cnpj,
    driver_pix_key: user.driver_pix_key,
  });
  const [newPassword, setNewPassword] = useState({ password: '', confirmPassword: '' });

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


  const avatarUrl = user.avatar ? pb.getFileUrl(user, user.avatar) : '';

  const renderListItem = (
    icon: React.ReactNode, 
    primary: string, 
    secondary: string | null | undefined, 
    fieldId?: keyof User, 
    isEditable = true
  ) => (
    <>
      <div className="flex items-center gap-4 p-4">
        <div className="text-muted-foreground">{icon}</div>
        <div className="flex-1">
          {isEditing && isEditable && fieldId ? (
            <>
              <Label htmlFor={fieldId} className="text-xs">{secondary}</Label>
              <Input
                id={fieldId}
                value={formData[fieldId] as string || ''}
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
      </div>
      <Separator className="ml-14" />
    </>
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
              <Button variant="ghost" className="flex-col h-auto p-3">
                  <Phone />
                  <span className="text-xs mt-1">Ligar</span>
              </Button>
               <Button variant="ghost" className="flex-col h-auto p-3" onClick={onContact}>
                  <MessageSquare />
                  <span className="text-xs mt-1">Conversar</span>
              </Button>
              <Button variant="ghost" className="flex-col h-auto p-3">
                  <Search />
                  <span className="text-xs mt-1">Buscar</span>
              </Button>
          </div>
        </div>

        <div className="p-4 space-y-4">
          <Card>
            <CardContent className="p-0">
               {renderListItem(<Mail className="w-5 h-5" />, formData.email || '', "Email", "email", false)}
               {renderListItem(<Phone className="w-5 h-5" />, formData.phone || 'Não informado', "Telefone", "phone")}
            </CardContent>
          </Card>

          {user.role === 'Motorista' && (
            <>
              <Card>
                <CardContent className="p-0">
                  {renderListItem(<Car className="w-5 h-5" />, formData.driver_vehicle_model || 'Não informado', "Veículo", "driver_vehicle_model")}
                  {renderListItem(<Key className="w-5 h-5" />, formData.driver_vehicle_plate || 'Não informado', "Placa", "driver_vehicle_plate")}
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-0">
                  {renderListItem(<Briefcase className="w-5 h-5" />, formData.driver_cnpj || 'Não informado', "CNPJ", "driver_cnpj")}
                  {renderListItem(<Wallet className="w-5 h-5" />, formData.driver_pix_key || 'Não informado', "Chave PIX", "driver_pix_key")}
                </CardContent>
              </Card>

              <Card>
                 <CardContent className="p-0">
                   {renderListItem(<FileText className="w-5 h-5" />, "Ver Documentos", "CNH, CRLV, etc.", undefined, false)}
                </CardContent>
              </Card>
            </>
          )}

          {user.role === 'Passageiro' && (
             <Card>
                 <CardContent className="p-0">
                   {renderListItem(<FileText className="w-5 h-5" />, "Ver Histórico de Corridas", "Nenhuma corrida recente", undefined, false)}
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

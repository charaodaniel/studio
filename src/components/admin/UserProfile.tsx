
import { ArrowLeft, Car, Mail, Phone, Wallet, FileText, MessageSquare, Briefcase, Key, Search } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { type User } from './UserList';
import pb from '@/lib/pocketbase';
import { Separator } from '../ui/separator';

interface UserProfileProps {
  user: User;
  onBack: () => void;
  onContact: () => void;
  isModal?: boolean; // isModal is not used anymore but kept for compatibility
}

export default function UserProfile({ user, onBack, onContact }: UserProfileProps) {
  const avatarUrl = user.avatar ? pb.getFileUrl(user, user.avatar) : '';

  const renderListItem = (icon: React.ReactNode, primary: string, secondary: string | null | undefined) => (
    <>
      <div className="flex items-center gap-4 p-4">
        <div className="text-muted-foreground">{icon}</div>
        <div className="flex-1">
          <p className="text-sm">{primary}</p>
          {secondary && <p className="text-xs text-muted-foreground">{secondary}</p>}
        </div>
      </div>
      <Separator className="ml-14" />
    </>
  );

  return (
    <div className="flex flex-col h-full bg-muted/40">
      <header className="p-4 border-b flex items-center gap-3 bg-background shadow-sm sticky top-0 z-10">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h2 className="text-lg font-semibold font-headline">Informações do Contato</h2>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="bg-background flex flex-col items-center p-6 space-y-4">
          <Avatar className="h-28 w-28 border-4 border-background shadow-md">
            <AvatarImage src={avatarUrl} data-ai-hint="user portrait" />
            <AvatarFallback className="text-4xl">{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="text-center">
              <h3 className="font-headline text-2xl">{user.name}</h3>
              <p className="text-muted-foreground">{user.role}</p>
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
               {renderListItem(<Mail className="w-5 h-5" />, user.email, "Email")}
               {renderListItem(<Phone className="w-5 h-5" />, user.phone || 'Não informado', "Telefone")}
            </CardContent>
          </Card>

          {user.role === 'Motorista' && (
            <>
              <Card>
                <CardContent className="p-0">
                  {renderListItem(<Car className="w-5 h-5" />, user.driver_vehicle_model || 'Não informado', "Veículo")}
                  {renderListItem(<Key className="w-5 h-5" />, user.driver_vehicle_plate || 'Não informado', "Placa")}
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-0">
                  {renderListItem(<Briefcase className="w-5 h-5" />, user.driver_cnpj || 'Não informado', "CNPJ")}
                  {renderListItem(<Wallet className="w-5 h-5" />, user.driver_pix_key || 'Não informado', "Chave PIX")}
                </CardContent>
              </Card>

              <Card>
                 <CardContent className="p-0">
                   {renderListItem(<FileText className="w-5 h-5" />, "Ver Documentos", "CNH, CRLV, etc.")}
                </CardContent>
              </Card>
            </>
          )}

          {user.role === 'Passageiro' && (
             <Card>
                 <CardContent className="p-0">
                   {renderListItem(<FileText className="w-5 h-5" />, "Ver Histórico de Corridas", "Nenhuma corrida recente")}
                </CardContent>
              </Card>
          )}
        </div>
      </div>
    </div>
  );
}

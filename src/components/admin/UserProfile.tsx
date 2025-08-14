import { ArrowLeft, Car, Mail, User as UserIcon, Wallet } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { type User } from './UserManagement';

interface UserProfileProps {
  user: User;
  onBack: () => void;
}

export default function UserProfile({ user, onBack }: UserProfileProps) {
  return (
    <div className="flex flex-col h-full bg-background">
      <header className="p-4 border-b flex items-center gap-3 bg-background shadow-sm sticky top-0 z-10">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h2 className="text-xl font-bold font-headline">Perfil do Usuário</h2>
      </header>

      <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center gap-4">
             <Avatar className="h-20 w-20 border-2 border-primary">
              <AvatarImage src={`https://placehold.co/80x80.png?text=${user.avatar}`} data-ai-hint="user portrait" />
              <AvatarFallback className="text-2xl">{user.avatar}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="font-headline text-2xl">{user.name}</CardTitle>
              <p className="text-muted-foreground">{user.type}</p>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span>{user.email}</span>
            </div>
          </CardContent>
        </Card>

        {user.type === 'Motorista' && (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="font-headline text-lg flex items-center gap-2"><Car />Informações do Veículo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                <p><strong>Modelo:</strong> Chevrolet Onix</p>
                <p><strong>Placa:</strong> BRA2E19</p>
                <p><strong>Cor:</strong> Branco</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="font-headline text-lg flex items-center gap-2"><Wallet />Informações Financeiras</CardTitle>
              </CardHeader>
              <CardContent>
                 <p><strong>Chave PIX:</strong> {user.email}</p>
              </CardContent>
            </Card>
          </>
        )}

        {user.type === 'Passageiro' && (
             <Card>
              <CardHeader>
                <CardTitle className="font-headline text-lg">Histórico de Corridas</CardTitle>
              </CardHeader>
              <CardContent>
                 <p className="text-muted-foreground">Nenhuma corrida recente.</p>
              </CardContent>
            </Card>
        )}

      </main>
    </div>
  );
}

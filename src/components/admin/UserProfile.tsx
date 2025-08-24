import { ArrowLeft, Car, Mail, Phone, User as UserIcon, Wallet, FileText, MessageSquare } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { type User } from './UserList';
import { ScrollArea } from '../ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import Image from 'next/image';
import pb from '@/lib/pocketbase';

interface UserProfileProps {
  user: User;
  onBack: () => void;
  onContact: () => void; // New prop to handle contacting the user
  isModal?: boolean;
}

export default function UserProfile({ user, onBack, onContact, isModal = false }: UserProfileProps) {
  const ProfileWrapper: React.ElementType = isModal ? ScrollArea : 'div';
  const wrapperProps = isModal ? {className: "max-h-[80vh] p-4 sm:p-6"} : {className: "overflow-y-auto p-4 sm:p-6 space-y-6 flex-1"};
  
  const avatarUrl = user.avatar ? user.avatar : `https://placehold.co/80x80.png?text=${user.name.substring(0, 2).toUpperCase()}`;

  return (
    <div className="flex flex-col h-full bg-background">
      <header className="p-4 border-b flex items-center gap-3 bg-background shadow-sm sticky top-0 z-10">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h2 className="text-xl font-bold font-headline">Perfil do Usuário</h2>
      </header>

      <ProfileWrapper {...wrapperProps}>
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center gap-4">
              <Avatar className="h-20 w-20 border-2 border-primary">
                <AvatarImage src={avatarUrl} data-ai-hint="user portrait" />
                <AvatarFallback className="text-2xl">{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
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
               <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span>{user.phone || 'Telefone não informado'}</span>
              </div>
            </CardContent>
            {isModal && (
              <CardFooter>
                  <Button className="w-full" onClick={onContact}>
                      <MessageSquare className="mr-2 h-4 w-4"/> Entrar em Contato
                  </Button>
              </CardFooter>
            )}
          </Card>

          {user.type === 'Motorista' && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="font-headline text-lg flex items-center gap-2"><Car />Informações do Veículo</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-1">
                      <p><strong>Modelo:</strong> Chevrolet Onix</p>
                      <p><strong>Placa:</strong> BRA2E19</p>
                      <p><strong>Cor:</strong> Branco</p>
                    </div>
                     <Dialog>
                        <DialogTrigger asChild>
                            <div className="relative aspect-video rounded-lg overflow-hidden cursor-pointer">
                                <Image src="https://placehold.co/600x400.png" alt="Foto do veículo" fill className="object-cover" data-ai-hint="car photo" />
                            </div>
                        </DialogTrigger>
                        <DialogContent className="p-0 max-w-xl">
                             <DialogHeader className="p-4">
                                <DialogTitle>Foto do Veículo</DialogTitle>
                                <DialogDescription>Foto ampliada do veículo do motorista.</DialogDescription>
                            </DialogHeader>
                            <Image src="https://placehold.co/800x600.png" alt="Foto do veículo em tamanho maior" width={800} height={600} className="rounded-lg"/>
                        </DialogContent>
                    </Dialog>
                </CardContent>
              </Card>

              <Card>
                  <CardHeader>
                      <CardTitle className="font-headline text-lg flex items-center gap-2"><FileText />Documentos</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline"><FileText className="mr-2"/> Ver CNH</Button>
                          </DialogTrigger>
                          <DialogContent className="p-0 max-w-xl">
                            <DialogHeader className='p-4'>
                                <DialogTitle>Documento - CNH</DialogTitle>
                                <DialogDescription>Visualização do documento CNH do motorista.</DialogDescription>
                            </DialogHeader>
                            <Image src="https://placehold.co/800x1200.png" alt="Documento CNH" width={800} height={1200} className="rounded-b-lg"/>
                          </DialogContent>
                      </Dialog>
                       <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline"><FileText className="mr-2"/> Ver CRLV</Button>
                          </DialogTrigger>
                          <DialogContent className="p-0 max-w-xl">
                            <DialogHeader className='p-4'>
                                <DialogTitle>Documento - CRLV</DialogTitle>
                                <DialogDescription>Visualização do documento CRLV do veículo.</DialogDescription>
                            </DialogHeader>
                            <Image src="https://placehold.co/800x1200.png" alt="Documento CRLV" width={800} height={1200} className="rounded-b-lg"/>
                          </DialogContent>
                      </Dialog>
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
        </div>
      </ProfileWrapper>
    </div>
  );
}

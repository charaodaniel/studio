'use client';

import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, History, MessageSquare, ShieldCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogTrigger } from '../ui/dialog';
import { ImageEditorDialog } from '../shared/ImageEditorDialog';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

const conversations = [
    { id: 1, name: "Roberto Andrade", lastMessage: "Olá! Chego em 5 minutos.", unread: 1, time: "14:32" },
    { id: 2, name: "Carlos Lima", lastMessage: "Obrigado pela corrida!", unread: 0, time: "Ontem" },
];


export function PassengerProfilePage() {
  const { toast } = useToast();
  const router = useRouter();
  const [avatarImage, setAvatarImage] = useState('https://placehold.co/128x128.png');
  const [isCameraDialogOpen, setIsCameraDialogOpen] = useState(false);

  const handleLogout = () => {
    toast({
      title: 'Logout Realizado',
      description: 'Você foi desconectado com sucesso.',
    });
    router.push('/');
  };


  return (
    <div className="flex flex-col bg-muted/40 min-h-[calc(100vh-4rem)]">
      <div className="flex flex-col items-center gap-4 py-8 bg-card">
        <Dialog open={isCameraDialogOpen} onOpenChange={setIsCameraDialogOpen}>
            <DialogTrigger asChild>
                 <div className="relative group">
                    <Avatar className="h-24 w-24 cursor-pointer ring-4 ring-background">
                        <AvatarImage src={avatarImage} data-ai-hint="person portrait" />
                        <AvatarFallback>AC</AvatarFallback>
                    </Avatar>
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                        <Camera className="h-8 w-8 text-white" />
                    </div>
                </div>
            </DialogTrigger>
            <ImageEditorDialog 
                isOpen={isCameraDialogOpen}
                currentImage={avatarImage}
                onImageSave={setAvatarImage} 
                onDialogClose={() => setIsCameraDialogOpen(false)}
            />
        </Dialog>
        <div className="text-center">
          <h2 className="font-headline text-2xl font-semibold">Ana Clara</h2>
          <p className="text-muted-foreground">ana.clara@email.com</p>
        </div>
      </div>

      <Tabs defaultValue="history" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="history"><History className="mr-1 h-4 w-4" /> Histórico</TabsTrigger>
          <TabsTrigger value="chats"><MessageSquare className="mr-1 h-4 w-4" /> Conversas</TabsTrigger>
          <TabsTrigger value="security"><ShieldCheck className="mr-1 h-4 w-4" /> Segurança</TabsTrigger>
        </TabsList>
        <div className="p-4 md:p-6 lg:p-8">
            <TabsContent value="history">
                <div className="text-center text-muted-foreground p-8 border rounded-lg bg-card">
                    <History className="h-10 w-10 mb-4 mx-auto" />
                    <p className="font-semibold">Nenhuma corrida encontrada</p>
                    <p className="text-sm">Seu histórico de corridas aparecerá aqui.</p>
                </div>
            </TabsContent>
            <TabsContent value="chats">
                <div className="bg-card rounded-lg p-4">
                    <div className="flex flex-col">
                    {conversations.map((convo) => (
                    <div key={convo.id} className="flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/50 border-b">
                        <Avatar className="h-10 w-10">
                            <AvatarImage src={`https://placehold.co/40x40.png?text=${convo.name.charAt(0)}`} data-ai-hint="user portrait"/>
                            <AvatarFallback>{convo.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 overflow-hidden">
                        <div className="flex justify-between items-center">
                            <p className="font-semibold truncate">{convo.name}</p>
                            <p className={`text-xs ${convo.unread > 0 ? 'text-primary' : 'text-muted-foreground'}`}>{convo.time}</p>
                        </div>
                        <div className="flex justify-between items-center">
                            <p className="text-sm text-muted-foreground truncate">{convo.lastMessage}</p>
                            {convo.unread > 0 && (
                                <div className="bg-primary text-primary-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                    {convo.unread}
                                </div>
                            )}
                            </div>
                        </div>
                    </div>
                    ))}
                </div>
                </div>
            </TabsContent>
            <TabsContent value="security">
                <div className="bg-card rounded-lg p-6 space-y-6 max-w-md mx-auto">
                    <div className="space-y-4">
                        <h3 className="font-semibold font-headline">Alterar Senha</h3>
                        <div>
                            <Label htmlFor="password">Nova Senha</Label>
                            <Input id="password" type="password" />
                        </div>
                         <div>
                            <Label htmlFor="password-confirm">Confirmar Nova Senha</Label>
                            <Input id="password-confirm" type="password" />
                        </div>
                        <Button className="w-full">Alterar Senha</Button>
                    </div>
                     <div className="space-y-4">
                        <h3 className="font-semibold font-headline">Sessão</h3>
                        <Button variant="outline" className="w-full" onClick={handleLogout}>
                            <LogOut className="mr-2 h-4 w-4" /> Sair
                        </Button>
                    </div>
                </div>
            </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

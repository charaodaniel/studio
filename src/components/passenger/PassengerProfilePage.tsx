'use client';

import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, History, MessageSquare, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import pb from '@/lib/pocketbase';
import { Dialog, DialogTrigger } from '../ui/dialog';
import { ImageEditorDialog } from '../shared/ImageEditorDialog';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { LogOut, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import type { User } from '../admin/UserList';
import { Skeleton } from '../ui/skeleton';
import { PassengerRideHistory } from './PassengerRideHistory';
import { PassengerChatHistory } from './PassengerChatHistory';
import { doc, getDoc, updateDoc } from 'firebase/firestore';


export function PassengerProfilePage() {
  const { toast } = useToast();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isCameraDialogOpen, setIsCameraDialogOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);


  useEffect(() => {
    const fetchUser = async () => {
      if (pb.authStore.model) {
        setUser(pb.authStore.model as User);
      }
      setIsLoading(false);
    }
    fetchUser();
    pb.authStore.onChange(fetchUser, true);
  }, []);

  const handleLogout = () => {
    pb.authStore.clear();
    toast({
      title: 'Logout Realizado',
      description: 'Você foi desconectado com sucesso.',
    });
    router.push('/');
  };
  
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (newPassword.length < 8) {
      toast({ variant: 'destructive', title: 'Senha muito curta', description: 'A senha deve ter no mínimo 8 caracteres.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ variant: 'destructive', title: 'Senhas não coincidem', description: 'Por favor, verifique a confirmação da senha.' });
      return;
    }

    setIsSaving(true);
    try {
      await pb.collection('users').update(user.id, { password: newPassword, passwordConfirm: confirmPassword });
      toast({ title: 'Senha Alterada!', description: 'Sua senha foi atualizada com sucesso.' });
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao alterar senha', description: 'Não foi possível alterar sua senha. Tente novamente.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarSave = async (newImageAsDataUrl: string) => {
    if (!user) return;
    try {
      const blob = await (await fetch(newImageAsDataUrl)).blob();
      const formData = new FormData();
      formData.append('avatar', blob);

      const updatedUser = await pb.collection('users').update(user.id, formData);
      setUser(updatedUser as User);
      toast({ title: 'Avatar atualizado com sucesso!' });
    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: 'Erro ao atualizar avatar.' });
    }
  }
  
  if (isLoading || !user) {
      return (
        <div className="flex flex-col bg-muted/40 min-h-[calc(100vh-4rem)]">
            <div className="flex flex-col items-center gap-4 py-8 bg-card">
                 <Skeleton className="h-24 w-24 rounded-full" />
                 <div className="text-center space-y-2">
                    <Skeleton className="h-8 w-40" />
                    <Skeleton className="h-4 w-32" />
                 </div>
            </div>
            <div className="p-4 md:p-6 lg:p-8">
                 <Skeleton className="h-48 w-full" />
            </div>
        </div>
      )
  }

  const avatarUrl = user.avatar ? pb.getFileUrl(user, user.avatar, { 'thumb': '128x128' }) : `https://placehold.co/128x128.png?text=${user.name.substring(0, 2).toUpperCase()}`;

  return (
    <div className="flex flex-col bg-muted/40 min-h-[calc(100vh-4rem)]">
      <div className="flex flex-col items-center gap-4 py-8 bg-card">
        <Dialog open={isCameraDialogOpen} onOpenChange={setIsCameraDialogOpen}>
            <DialogTrigger asChild>
                 <div className="relative group">
                    <Avatar className="h-24 w-24 cursor-pointer ring-4 ring-background">
                        <AvatarImage src={avatarUrl} data-ai-hint="person portrait" />
                        <AvatarFallback>{user.name.substring(0,2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                        <Camera className="h-8 w-8 text-white" />
                    </div>
                </div>
            </DialogTrigger>
            <ImageEditorDialog 
                isOpen={isCameraDialogOpen}
                onImageSave={handleAvatarSave} 
                onDialogClose={() => setIsCameraDialogOpen(false)}
            />
        </Dialog>
        <div className="text-center">
          <h2 className="font-headline text-2xl font-semibold">{user.name}</h2>
          <p className="text-muted-foreground">{user.email}</p>
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
                <PassengerRideHistory />
            </TabsContent>
            <TabsContent value="chats">
                <PassengerChatHistory />
            </TabsContent>
            <TabsContent value="security">
                <div className="bg-card rounded-lg p-6 space-y-6 max-w-md mx-auto">
                    <form onSubmit={handleChangePassword} className="space-y-4">
                        <h3 className="font-semibold font-headline">Alterar Senha</h3>
                        <div>
                            <Label htmlFor="newPassword">Nova Senha</Label>
                             <div className="relative">
                                <Input id="newPassword" type={showNewPassword ? 'text' : 'password'} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} disabled={isSaving} className="pr-10"/>
                                <Button type="button" variant="ghost" size="icon" className="absolute top-1/2 -translate-y-1/2 right-0 h-full px-3 text-muted-foreground" onClick={() => setShowNewPassword(!showNewPassword)} tabIndex={-1}>{showNewPassword ? <EyeOff/> : <Eye/>}</Button>
                            </div>
                        </div>
                         <div>
                            <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                            <div className="relative">
                                <Input id="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} disabled={isSaving} className="pr-10"/>
                                <Button type="button" variant="ghost" size="icon" className="absolute top-1/2 -translate-y-1/2 right-0 h-full px-3 text-muted-foreground" onClick={() => setShowConfirmPassword(!showConfirmPassword)} tabIndex={-1}>{showConfirmPassword ? <EyeOff/> : <Eye/>}</Button>
                            </div>
                        </div>
                        <Button type="submit" className="w-full" disabled={isSaving}>
                            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Alterar Senha
                        </Button>
                    </form>
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

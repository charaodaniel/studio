'use client';

import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Camera, Star, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RideRequests } from './RideRequests';
import { DriverRideHistory } from './DriverRideHistory';
import { ProfileForm } from './ProfileForm';
import { Dialog, DialogTrigger } from '../ui/dialog';
import { ImageEditorDialog } from '../shared/ImageEditorDialog';
import { DriverChatHistory } from './DriverChatHistory';
import { Skeleton } from '../ui/skeleton';
import { type User } from '../admin/UserList';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, collection, addDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

interface RideRecord {
    id: string;
    passenger: string;
    driver: string;
    origin_address: string;
    destination_address: string;
    status: 'requested' | 'accepted' | 'in_progress' | 'completed' | 'canceled';
    fare: number;
    is_negotiated: boolean;
    started_by: 'passenger' | 'driver';
    expand?: {
        passenger: User;
    }
}


export function DriverProfilePage() {
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCameraDialogOpen, setIsCameraDialogOpen] = useState(false);
  const [completedRidesCount, setCompletedRidesCount] = useState<number | null>(null);
  const [activeManualRide, setActiveManualRide] = useState<RideRecord | null>(null);
  const [activeTab, setActiveTab] = useState("requests");
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
            const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
            if (userDoc.exists()) {
                const userData = { id: userDoc.id, ...userDoc.data() } as User;
                setUser(userData);
                 try {
                  // This is a placeholder for ride count. A more performant way would be a counter in Firestore.
                  // const ridesSnapshot = await getDocs(query(collection(db, 'rides'), where('driver', '==', userData.id), where('status', '==', 'completed')));
                  // setCompletedRidesCount(ridesSnapshot.size);
                  setCompletedRidesCount(0); // Placeholder
                } catch (error) {
                  console.error("Failed to fetch rides count:", error);
                  setCompletedRidesCount(0);
                }

            } else {
                setUser(null);
            }
        } else {
            setUser(null);
        }
        setIsLoading(false);
    });
    
    return () => unsubscribe();
  }, []);

  const handleStatusChange = async (newStatus: string) => {
    if (!user) return;
    
    try {
        await updateDoc(doc(db, 'users', user.id), { driver_status: newStatus });
        setUser(prev => prev ? { ...prev, driver_status: newStatus as User['driver_status'] } : null);

        toast({
          title: 'Status Atualizado',
          description: `Seu status foi alterado para ${
            newStatus === 'online' ? 'Online' 
            : newStatus === 'offline' ? 'Offline' 
            : newStatus === 'urban-trip' ? 'Em Viagem (Urbano)' 
            : 'Em Viagem (Interior/Intermunicipal)'
          }.`,
        });

        try {
            await addDoc(collection(db, 'driver_status_logs'), {
                driver: user.id,
                status: newStatus,
                createdAt: new Date(),
            });
        } catch (logError) {
             console.error("Failed to create status log (non-critical):", logError);
        }

    } catch (error) {
        console.error("Failed to update status:", error);
        toast({ variant: "destructive", title: "Erro ao atualizar status", description: "Não foi possível alterar seu status. Tente novamente." });
    }
  };

  const handleManualRideStarted = (ride: RideRecord) => {
    setActiveManualRide(ride);
    setActiveTab("requests"); 
    handleStatusChange('urban-trip'); 
  }

  const handleManualRideEnded = () => {
    setActiveManualRide(null);
    handleStatusChange('online');
  }

  const handleAvatarSave = async (newImageAsDataUrl: string) => {
    if (!user) return;
    try {
        await updateDoc(doc(db, 'users', user.id), {
            avatar: newImageAsDataUrl
        });
        setUser(prev => prev ? { ...prev, avatar: newImageAsDataUrl } : null);
        toast({ title: 'Avatar atualizado com sucesso!' });
    } catch (error) {
        console.error("Failed to update avatar:", error);
        toast({ variant: 'destructive', title: 'Erro ao atualizar avatar.' });
    }
  }


  const avatarUrl = user?.avatar || `https://placehold.co/128x128.png?text=${user?.name?.substring(0, 2).toUpperCase() || 'CM'}`;


  if (isLoading || !user) {
    return (
        <div className="flex flex-col bg-muted/40 min-h-[calc(100vh-4rem)]">
            <div className="flex flex-col items-center gap-4 py-8 bg-card">
                 <Skeleton className="h-24 w-24 rounded-full" />
                 <div className="text-center space-y-2">
                    <Skeleton className="h-8 w-40" />
                    <Skeleton className="h-4 w-32" />
                 </div>
                 <Skeleton className="h-10 w-48" />
            </div>
            <div className="p-4 md:p-6 lg:p-8">
                 <Skeleton className="h-48 w-full" />
            </div>
        </div>
    )
  }

  return (
    <div className="flex flex-col bg-muted/40 min-h-[calc(100vh-4rem)]">
      <div className="flex flex-col items-center gap-4 py-8 bg-card">
        <Dialog open={isCameraDialogOpen} onOpenChange={setIsCameraDialogOpen}>
            <DialogTrigger asChild>
                 <div className="relative group">
                    <Avatar className="h-24 w-24 cursor-pointer ring-4 ring-background">
                        <AvatarImage src={avatarUrl} data-ai-hint="person portrait" />
                        <AvatarFallback>{user?.name?.substring(0, 2).toUpperCase() || 'CM'}</AvatarFallback>
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
          <h2 className="font-headline text-2xl font-semibold">{user?.name || 'Motorista'}</h2>
          <div className="flex items-center justify-center gap-1 text-muted-foreground">
            <Star className="w-4 h-4 fill-primary text-primary" />
            <span>
                4.9 ({completedRidesCount === null ? '...' : completedRidesCount} corrida{completedRidesCount !== 1 ? 's' : ''})
            </span>
          </div>
        </div>
        <div className="w-48">
          <Label htmlFor="driver-status" className="sr-only">Status</Label>
          <Select value={user.driver_status} onValueChange={handleStatusChange}>
            <SelectTrigger id="driver-status">
              <SelectValue placeholder="Selecione o status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="online">Online</SelectItem>
              <SelectItem value="offline">Offline</SelectItem>
              <SelectItem value="urban-trip">Em Viagem (Urbano)</SelectItem>
              <SelectItem value="rural-trip">Em Viagem (Interior/Intermunicipal)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
          <TabsTrigger value="requests">Solicitações</TabsTrigger>
          <TabsTrigger value="chats">Conversas</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
          <TabsTrigger value="profile">Perfil</TabsTrigger>
        </TabsList>
        <div className="p-4 md:p-6 lg:p-8">
            <TabsContent value="requests">
                <RideRequests 
                    setDriverStatus={handleStatusChange} 
                    manualRideOverride={activeManualRide}
                    onManualRideEnd={handleManualRideEnded}
                />
            </TabsContent>
            <TabsContent value="chats">
                <DriverChatHistory />
            </TabsContent>
            <TabsContent value="history">
                <DriverRideHistory onManualRideStart={handleManualRideStarted} setDriverStatus={handleStatusChange} />
            </TabsContent>
            <TabsContent value="profile">
                {user && <ProfileForm user={user} onUpdate={setUser} />}
            </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

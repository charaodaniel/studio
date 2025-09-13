

'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Locate, ArrowRight, Loader2, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import DriverListModal from './DriverListModal';
import { useState, useEffect } from 'react';
import pb from '@/lib/pocketbase';
import { useToast } from '@/hooks/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar } from '../ui/calendar';
import { ptBR } from 'date-fns/locale';
import { format } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { cn } from '@/lib/utils';

interface RideRequestFormProps {
  onRideRequest: (rideId: string) => void;
  isSearching: boolean;
  anonymousUserName: string | null;
  origin: string;
  setOrigin: (value: string) => void;
  destination: string;
  setDestination: (value: string) => void;
}

export default function RideRequestForm({ onRideRequest, isSearching, anonymousUserName, origin, setOrigin, destination, setDestination }: RideRequestFormProps) {
    const { toast } = useToast();
    const [isClient, setIsClient] = useState(false);
    const [isLocating, setIsLocating] = useState(false);
    const [isScheduling, setIsScheduling] = useState(false);
    const [scheduledDate, setScheduledDate] = useState<Date | undefined>();
    const [scheduledTime, setScheduledTime] = useState<string>('');


    useEffect(() => {
        setIsClient(true);
    }, []);

    const isLoggedIn = isClient && pb.authStore.isValid;
    const canRequest = isLoggedIn || !!anonymousUserName;

    const handleGetCurrentLocation = () => {
        if (!navigator.geolocation) {
            toast({
                variant: 'destructive',
                title: 'Geolocalização não suportada',
                description: 'Seu navegador não suporta a captura de localização.',
            });
            return;
        }

        setIsLocating(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                
                try {
                    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                    const data = await response.json();

                    if (data && data.address) {
                        const { road, suburb, city, town, village } = data.address;
                        const formattedAddress = [road, suburb, city || town || village].filter(Boolean).join(', ');
                        setOrigin(formattedAddress);
                        toast({
                            title: 'Localização Encontrada!',
                            description: `Seu endereço foi preenchido: ${formattedAddress}`,
                        });
                    } else {
                        throw new Error('Endereço não encontrado.');
                    }

                } catch (error) {
                    console.error("Reverse geocoding failed:", error);
                    const locationString = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
                    setOrigin(locationString);
                    toast({
                        title: 'Coordenadas Capturadas!',
                        description: 'Não foi possível encontrar o nome da rua, mas as coordenadas foram preenchidas.',
                    });
                } finally {
                     setIsLocating(false);
                }
            },
            (error) => {
                let description = 'Não foi possível obter sua localização.';
                if (error.code === error.PERMISSION_DENIED) {
                    description = 'A permissão para acessar a localização foi negada.';
                }
                toast({
                    variant: 'destructive',
                    title: 'Erro de Localização',
                    description: description,
                });
                setIsLocating(false);
            }
        );
    };

    const getFullScheduledDate = () => {
        if (!scheduledDate || !scheduledTime) return undefined;
        const [hours, minutes] = scheduledTime.split(':');
        const date = new Date(scheduledDate);
        date.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
        return date;
    }

    const timeOptions = Array.from({ length: 48 }, (_, i) => {
        const hour = Math.floor(i / 2);
        const minute = (i % 2) * 30;
        return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    });

    const renderScheduleSection = () => (
         <div className="p-4 border rounded-lg bg-muted/50 space-y-4">
            <div className="flex justify-between items-center">
                <h4 className="font-semibold">Agendamento</h4>
                <Button variant="ghost" size="sm" onClick={() => setIsScheduling(false)}>Cancelar</Button>
            </div>
            <div className="grid grid-cols-2 gap-4">
                 <Popover>
                    <PopoverTrigger asChild>
                    <Button
                        variant={"outline"}
                        className={cn(
                        "justify-start text-left font-normal",
                        !scheduledDate && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {scheduledDate ? format(scheduledDate, "dd/MM/yyyy") : <span>Escolha a data</span>}
                    </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                    <Calendar
                        mode="single"
                        selected={scheduledDate}
                        onSelect={setScheduledDate}
                        initialFocus
                        locale={ptBR}
                        disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() - 1))}
                    />
                    </PopoverContent>
                </Popover>
                <Select value={scheduledTime} onValueChange={setScheduledTime}>
                    <SelectTrigger>
                        <Clock className="mr-2 h-4 w-4" />
                        <SelectValue placeholder="Horário" />
                    </SelectTrigger>
                    <SelectContent>
                        {timeOptions.map(time => (
                            <SelectItem key={time} value={time}>{time}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
    )

    const renderFormContent = (isNegotiated: boolean) => (
        <div className="pt-6 space-y-6">
            {!isScheduling && (
                 <div className="space-y-2">
                    <Label htmlFor={`pickup-${isNegotiated ? 'intercity' : 'local'}`}>Local de Partida</Label>
                    <div className="flex items-center gap-2">
                        <MapPin className="text-muted-foreground" />
                        <Input id={`pickup-${isNegotiated ? 'intercity' : 'local'}`} placeholder="Insira seu local de partida" value={origin} onChange={(e) => setOrigin(e.target.value)} disabled={isSearching || isLocating}/>
                        <Button variant="ghost" size="icon" aria-label="Usar localização atual" onClick={handleGetCurrentLocation} disabled={isSearching || isLocating}>
                        {isLocating ? <Loader2 className="animate-spin" /> : <Locate />}
                        </Button>
                    </div>
                    <p className="text-xs text-muted-foreground pl-8">Formato: Rua, Número, Bairro, Cidade</p>
                </div>
            )}
            <div className="space-y-2">
              <Label htmlFor={`destination-${isNegotiated ? 'intercity' : 'local'}`}>Destino</Label>
              <div className="flex items-center gap-2">
                <MapPin className="text-muted-foreground" />
                <Input id={`destination-${isNegotiated ? 'intercity' : 'local'}`} placeholder="Insira seu destino" value={destination} onChange={(e) => setDestination(e.target.value)} disabled={isSearching}/>
              </div>
              <p className="text-xs text-muted-foreground pl-8">Formato: Rua, Número, Bairro, Cidade</p>
            </div>

            {isScheduling ? renderScheduleSection() : (
                 <Button variant="outline" className="w-full" onClick={() => setIsScheduling(true)}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    Agendar para depois
                </Button>
            )}

            {isNegotiated && !isScheduling && (
                <div className="p-4 border rounded-lg bg-accent/10">
                    <h4 className="font-semibold">Negocie a Tarifa</h4>
                    <p className="text-sm text-muted-foreground">
                        Para viagens para o interior, você negocia o valor diretamente com o motorista.
                    </p>
                </div>
            )}

            <div className="space-y-2">
                 <Dialog>
                    <DialogTrigger asChild>
                        <Button className="w-full" size="lg" disabled={isSearching || !canRequest || (isScheduling && (!scheduledDate || !scheduledTime))}>
                            Ver Motoristas <ArrowRight className="ml-2 h-4 w-4"/>
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                        <DriverListModal 
                            origin={origin} 
                            destination={destination}
                            isNegotiated={isNegotiated}
                            onRideRequest={onRideRequest}
                            passengerAnonymousName={anonymousUserName}
                            scheduledFor={getFullScheduledDate()}
                        />
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-center">
            <div>
                <CardTitle className="font-headline text-2xl">Onde vamos hoje?</CardTitle>
                <CardDescription>Solicite uma corrida agora ou agende para mais tarde.</CardDescription>
            </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <Tabs defaultValue="local" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="local">Corrida Local</TabsTrigger>
            <TabsTrigger value="intercity">Interior</TabsTrigger>
          </TabsList>
          <TabsContent value="local">
            {renderFormContent(false)}
          </TabsContent>
          <TabsContent value="intercity">
            {renderFormContent(true)}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

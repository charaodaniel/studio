'use client';

import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Star, Car, Info } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import Image from 'next/image';

const drivers = [
    { id: 1, name: 'João Silva', vehicle: 'Toyota Corolla - ABC1234', rating: 4.8, img: 'https://placehold.co/128x128.png' },
    { id: 2, name: 'Maria Souza', vehicle: 'Honda Civic - DEF5678', rating: 4.9, img: 'https://placehold.co/128x128.png' },
    { id: 3, name: 'Carlos Lima', vehicle: 'Chevrolet Onix - GHI9012', rating: 4.7, img: 'https://placehold.co/128x128.png' },
    { id: 4, name: 'Ana Pereira', vehicle: 'Hyundai HB20 - JKL3456', rating: 4.6, img: 'https://placehold.co/128x128.png' },
    { id: 5, name: 'Roberto Andrade', vehicle: 'Chevrolet Onix - BRA2E19', rating: 4.9, img: 'https://placehold.co/128x128.png' },
    { id: 6, name: 'Beatriz Costa', vehicle: 'Fiat Mobi - MNO7890', rating: 4.8, img: 'https://placehold.co/128x128.png' },
];

export default function DriverListModal() {
    const [openDriverId, setOpenDriverId] = useState<number | null>(null);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    const handleToggle = (driverId: number) => {
        setOpenDriverId(prevId => prevId === driverId ? null : driverId);
    };

    return (
        <>
            <DialogTitle className="font-headline">Motoristas Disponíveis</DialogTitle>
            <DialogDescription>
                Escolha um motorista para sua corrida.
            </DialogDescription>
            <ScrollArea className="h-96 pr-4 mt-4">
                <div className="space-y-2">
                    {drivers.map((driver) => (
                        <Collapsible
                            key={driver.id}
                            open={openDriverId === driver.id}
                            onOpenChange={() => handleToggle(driver.id)}
                            className="w-full"
                        >
                            <Card className="hover:bg-muted/50 transition-colors">
                                <div className="flex items-center p-4 gap-4">
                                    <Dialog>
                                        <DialogTrigger asChild>
                                             <Avatar className="h-12 w-12 cursor-pointer">
                                                <AvatarImage src={driver.img} data-ai-hint="driver portrait" />
                                                <AvatarFallback>{driver.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                        </DialogTrigger>
                                        <DialogContent className="p-0 max-w-xs">
                                            <Image src={driver.img} alt={`Foto de ${driver.name}`} width={400} height={400} className="rounded-lg"/>
                                        </DialogContent>
                                    </Dialog>
                                   
                                    <div className="flex-grow">
                                        <p className="font-bold">{driver.name}</p>
                                        <div className="flex items-center text-sm">
                                            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 mr-1" />
                                            <span>{driver.rating}</span>
                                        </div>
                                    </div>
                                    <CollapsibleTrigger asChild>
                                        <Button variant="ghost" size="sm">
                                            <Info className="mr-2 h-4 w-4" /> Ver
                                        </Button>
                                    </CollapsibleTrigger>
                                </div>
                                <CollapsibleContent>
                                    <div className="px-4 pb-4 space-y-2">
                                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                                            <Car className="h-4 w-4" /> {driver.vehicle}
                                        </p>
                                        <Button className="w-full bg-accent hover:bg-accent/90">Chamar</Button>
                                    </div>
                                </CollapsibleContent>
                            </Card>
                        </Collapsible>
                    ))}
                </div>
            </ScrollArea>
        </>
    );
}
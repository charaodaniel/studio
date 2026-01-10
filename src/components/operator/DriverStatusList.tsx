'use client';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table";
  import { Badge } from "@/components/ui/badge";
  import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
  import { ScrollArea } from "../ui/scroll-area";
  import { useState, useEffect, useCallback } from "react";
  import { type User } from "../admin/UserList";
  import { Loader2, WifiOff } from "lucide-react";
import { Skeleton } from "../ui/skeleton";
import pb from "@/lib/pocketbase";
import type { RecordModel } from "pocketbase";
import localUsers from '@/database/banco.json';
  
  const getAvatarUrl = (user: User) => {
    if (!user) return '';
    if (user.avatar?.startsWith('http')) {
        return user.avatar;
    }
    if (user.collectionId && user.id && user.avatar) {
        return pb.getFileUrl(user, user.avatar);
    }
    return '';
  };

  const getStatusClass = (status: string) => {
     switch (status) {
        case 'online':
            return 'bg-green-100 text-green-800 border-green-200';
        case 'in_progress':
        case 'urban-trip':
        case 'rural-trip':
            return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        case 'offline':
            return 'bg-red-100 text-red-800 border-red-200';
        default:
            return '';
    }
  }

   const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
        'online': 'Online',
        'offline': 'Offline',
        'urban-trip': 'Em Viagem (Urbano)',
        'rural-trip': 'Em Viagem (Interior)',
    };
    return labels[status] || status;
  }
  
  export default function DriverStatusList() {
    const [drivers, setDrivers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchDrivers = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            await new Promise(resolve => setTimeout(resolve, 250));

            const driverList = localUsers.users
                .filter(u => Array.isArray(u.role) ? u.role.includes('Motorista') : u.role === 'Motorista')
                .map(u => ({
                    ...u,
                    id: u.id || `local_${Math.random()}`,
                    role: Array.isArray(u.role) ? u.role : [u.role],
                    collectionId: '_pb_users_auth_',
                    collectionName: 'users',
                    created: new Date().toISOString(),
                    updated: new Date().toISOString(),
                })) as unknown as User[];
            
            setDrivers(driverList);
        } catch (err: any) {
            setError("Não foi possível carregar os motoristas do arquivo local.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDrivers();
    }, [fetchDrivers]);
    
    const renderContent = () => {
        if (isLoading) {
            return (
                [...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                        <TableCell>
                            <div className="flex items-center gap-3">
                                <Skeleton className="h-8 w-8 rounded-full" />
                                <Skeleton className="h-4 w-32" />
                            </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell"><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                    </TableRow>
                ))
            );
        }

        if (error) {
            return (
                <TableRow>
                    <TableCell colSpan={3} className="text-center p-8 text-destructive">
                        <WifiOff className="mx-auto h-8 w-8 mb-2" />
                        {error}
                    </TableCell>
                </TableRow>
            );
        }

        return drivers.map((driver) => (
            <TableRow key={driver.id}>
            <TableCell>
                <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={getAvatarUrl(driver)} data-ai-hint="driver portrait" />
                        <AvatarFallback>{driver.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{driver.name}</span>
                </div>
            </TableCell>
            <TableCell className="hidden sm:table-cell">{driver.driver_vehicle_model}</TableCell>
            <TableCell>
                <Badge variant={'outline'} className={getStatusClass(driver.driver_status || 'offline')}>{getStatusLabel(driver.driver_status || 'offline')}</Badge>
            </TableCell>
            </TableRow>
        ));
    };

    return (
        <ScrollArea className="h-full">
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>Motorista</TableHead>
                        <TableHead className="hidden sm:table-cell">Veículo</TableHead>
                        <TableHead>Status</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                        {renderContent()}
                    </TableBody>
                </Table>
            </div>
      </ScrollArea>
    );
  }

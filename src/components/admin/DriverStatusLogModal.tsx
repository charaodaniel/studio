

'use client';

import { useState, useEffect, useCallback } from 'react';
import type { User } from './UserList';
import { DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { ScrollArea } from '../ui/scroll-area';
import { AlertTriangle, ListVideo, Loader2, WifiOff } from 'lucide-react';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';

interface DriverStatusLog {
    id: string;
    driver: string;
    status: string;
    createdAt: any;
}

interface DriverStatusLogModalProps {
    user: User;
}

export default function DriverStatusLogModal({ user }: DriverStatusLogModalProps) {
    const [logs, setLogs] = useState<DriverStatusLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchLogs = useCallback(async () => {
        if (!user) return;
        setIsLoading(true);
        setError(null);
        try {
            const q = query(collection(db, 'driver_status_logs'), where('driver', '==', user.id), orderBy('createdAt', 'desc'));
            const querySnapshot = await getDocs(q);
            const logRecords = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DriverStatusLog));
            setLogs(logRecords);
        } catch (err: any) {
            setError('Não foi possível carregar os logs.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);
    
    const getStatusClass = (status: string) => {
        switch (status) {
           case 'online':
               return 'bg-green-100 text-green-800 border-green-200';
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

    return (
        <>
            <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                    <ListVideo /> Log de Status de {user.name}
                </DialogTitle>
                <DialogDescription>
                    Veja o histórico de mudanças de status do motorista.
                </DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-96 w-full mt-4 pr-4">
                <div className="space-y-3">
                    {isLoading && (
                        <div className="flex justify-center p-8">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    )}
                     {error && (
                        <div className="flex flex-col items-center justify-center p-8 text-destructive">
                           <WifiOff className="h-8 w-8 mb-2" />
                           <p>{error}</p>
                        </div>
                    )}
                    {!isLoading && !error && logs.length === 0 && (
                         <div className="flex flex-col items-center justify-center p-8 text-muted-foreground">
                            <AlertTriangle className="h-8 w-8 mb-2" />
                            <p>Nenhum log encontrado para este motorista.</p>
                         </div>
                    )}
                    {!isLoading && !error && logs.map((log) => (
                        <div key={log.id} className="flex justify-between items-center bg-muted/50 p-2 rounded-md">
                            <span className="text-sm text-muted-foreground">
                                {log.createdAt ? new Date(log.createdAt.toDate()).toLocaleString('pt-BR') : 'Data inválida'}
                            </span>
                            <Badge variant="outline" className={cn('text-xs', getStatusClass(log.status))}>
                                {getStatusLabel(log.status)}
                            </Badge>
                        </div>
                    ))}
                </div>
            </ScrollArea>
        </>
    );
}

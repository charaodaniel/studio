
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Loader2, WifiOff, FileCheck2, Check, X, RefreshCw, Info } from 'lucide-react';
import Image from 'next/image';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import { Alert, AlertTitle, AlertDescription } from '../ui/alert';
import localData from '@/database/banco.json';
import { type User } from './UserList';

interface DocumentRecord {
    id: string;
    driver: string;
    document_type: 'CNH' | 'CRLV' | 'VEHICLE_PHOTO';
    file: string;
    is_verified: boolean;
}

export default function DocumentVerification() {
    const [database, setDatabase] = useState(localData);
    const [isLoading, setIsLoading] = useState(false);
    const [documents, setDocuments] = useState<DocumentRecord[]>([]);
    const users = database?.users || [];
    const { toast } = useToast();

    const refreshDatabase = useCallback(() => {
        setIsLoading(true);
        // Simulate fetch
        setTimeout(() => {
            const unverifiedDocs = localData.documents.filter(doc => !doc.is_verified);
            setDocuments(unverifiedDocs as DocumentRecord[]);
            setIsLoading(false);
        }, 300);
    }, []);

    useEffect(() => {
        refreshDatabase();
    }, [refreshDatabase]);

    const getDriverName = (driverId: string) => {
        return users.find((u: any) => u.id === driverId)?.name || 'Desconhecido';
    }

    const handleAction = async (docId: string, action: 'approve' | 'reject') => {
        setIsLoading(true);
        setTimeout(() => {
            setDocuments(prev => prev.filter(d => d.id !== docId));
            toast({
                title: `Ação Realizada! (Simulação)`,
                description: `O documento foi ${action === 'approve' ? 'aprovado' : 'rejeitado'} e removido da lista de pendências.`,
            });
            setIsLoading(false);
        }, 500);
    };

    const renderContent = () => {
        if (isLoading && documents.length === 0) {
            return (
                <div className="text-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                    <p className="mt-2 text-muted-foreground">Carregando documentos...</p>
                </div>
            );
        }

        if (documents.length === 0) {
            return (
                <div className="text-center p-8 text-muted-foreground bg-green-50 border border-green-200 rounded-lg">
                    <FileCheck2 className="mx-auto h-10 w-10 mb-4 text-green-600" />
                    <h3 className="font-semibold text-lg text-green-800">Tudo em ordem!</h3>
                    <p className="text-sm">Nenhum documento pendente de verificação no momento.</p>
                </div>
            );
        }
        
        return (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {documents.map((doc) => {
                    const driverName = getDriverName(doc.driver);
                    return (
                        <Card key={doc.id} className="flex flex-col">
                            <CardHeader>
                                <CardTitle className="text-base truncate">{driverName}</CardTitle>
                                <CardDescription>{doc.document_type}</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-grow flex items-center justify-center">
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <div className="relative aspect-[4/3] w-full bg-muted rounded-md cursor-pointer hover:opacity-80 transition-opacity">
                                            <Image
                                                src={doc.file}
                                                alt={`Documento de ${driverName}`}
                                                fill
                                                className="object-contain rounded-md"
                                            />
                                        </div>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-3xl">
                                        <DialogHeader>
                                            <DialogTitle>{doc.document_type} de {driverName}</DialogTitle>
                                        </DialogHeader>
                                        <div className="flex justify-center p-4">
                                            <Image src={doc.file} alt="Documento em tamanho maior" width={800} height={600} className="rounded-lg object-contain max-h-[80vh]" />
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </CardContent>
                            <CardFooter className="grid grid-cols-2 gap-2 pt-4">
                                 <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/50" disabled={isLoading}>
                                            <X className="mr-2 h-4 w-4" />Rejeitar
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Rejeitar Documento?</AlertDialogTitle>
                                             <AlertDialogDescription>
                                                Esta é uma simulação. No app real, a ação removeria o documento para o motorista reenviar.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleAction(doc.id, 'reject')} className="bg-destructive hover:bg-destructive/90">
                                                Sim, Rejeitar
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                                <AlertDialog>
                                     <AlertDialogTrigger asChild>
                                        <Button size="sm" className="bg-green-600 hover:bg-green-700" disabled={isLoading}>
                                            <Check className="mr-2 h-4 w-4" />Aprovar
                                        </Button>
                                     </AlertDialogTrigger>
                                     <AlertDialogContent>
                                         <AlertDialogHeader>
                                             <AlertDialogTitle>Aprovar Documento?</AlertDialogTitle>
                                             <AlertDialogDescription>
                                                 Esta é uma simulação. No app real, o documento seria marcado como verificado.
                                             </AlertDialogDescription>
                                         </AlertDialogHeader>
                                         <AlertDialogFooter>
                                             <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                             <AlertDialogAction onClick={() => handleAction(doc.id, 'approve')} className="bg-green-600 hover:bg-green-700">
                                                 Sim, Aprovar
                                             </AlertDialogAction>
                                         </AlertDialogFooter>
                                     </AlertDialogContent>
                                 </AlertDialog>
                            </CardFooter>
                        </Card>
                    )
                })}
            </div>
        )
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-2xl font-bold font-headline">Verificação de Documentos</h2>
                    <p className="text-muted-foreground">Aprove ou rejeite os documentos enviados pelos motoristas.</p>
                </div>
                 <Button variant="outline" size="icon" onClick={refreshDatabase} disabled={isLoading}>
                    <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                </Button>
            </div>
             <Alert>
                <Info className="h-4 w-4"/>
                <AlertTitle>Modo de Protótipo</AlertTitle>
                <AlertDescription>
                   As ações de aprovar ou rejeitar documentos são apenas simulações e não serão salvas.
                </AlertDescription>
            </Alert>
            {renderContent()}
        </div>
    );
}

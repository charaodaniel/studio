
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
import { useDatabaseManager } from '@/hooks/useDatabaseManager';
import { type User } from './UserList';

interface DocumentRecord {
    id: string;
    driver: string;
    document_type: 'CNH' | 'CRLV' | 'VEHICLE_PHOTO';
    file: string;
    is_verified: boolean;
}

export default function DocumentVerification() {
    const { database, isLoading, error, refreshDatabase, saveDatabase } = useDatabaseManager();
    const [documents, setDocuments] = useState<DocumentRecord[]>([]);
    const users = database?.users || [];
    const { toast } = useToast();

    useEffect(() => {
        if (database) {
            const unverifiedDocs = database.documents.filter(doc => !doc.is_verified);
            setDocuments(unverifiedDocs as DocumentRecord[]);
        }
    }, [database]);


    const getDriverName = (driverId: string) => {
        return users.find((u: User) => u.id === driverId)?.name || 'Desconhecido';
    }

    const handleAction = async (docId: string, action: 'approve' | 'reject') => {
        if (!database) return;

        const updatedDocuments = database.documents.map(doc => {
            if (doc.id === docId) {
                // For approval, we just mark it as verified.
                // For rejection, we'll remove it from the list to simulate deletion.
                // A real app might have a 'rejection_reason' field.
                return action === 'approve' ? { ...doc, is_verified: true } : null;
            }
            return doc;
        }).filter(Boolean); // filter(Boolean) removes null entries

        const updatedDb = { ...database, documents: updatedDocuments };
        
        const success = await saveDatabase(updatedDb as any);

        if (success) {
            toast({
                title: `Ação Realizada!`,
                description: `O documento foi ${action === 'approve' ? 'aprovado' : 'rejeitado'} e removido da lista de pendências.`,
            });
        }
    };

    const renderContent = () => {
        if (isLoading && !database) { // Show loading skeleton only on initial load
            return (
                <div className="text-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                    <p className="mt-2 text-muted-foreground">Carregando documentos...</p>
                </div>
            );
        }

        if (error) {
            return (
                <div className="text-center p-8 text-destructive bg-red-50 border border-destructive rounded-lg">
                    <WifiOff className="mx-auto h-10 w-10 mb-2" />
                    <p className="font-semibold">Erro de Conexão</p>
                    <p className="text-sm">{error}</p>
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
                                                Esta ação irá remover o documento permanentemente e salvar a alteração no repositório.
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
                                <Button size="sm" onClick={() => handleAction(doc.id, 'approve')} className="bg-green-600 hover:bg-green-700" disabled={isLoading}>
                                    <Check className="mr-2 h-4 w-4" />Aprovar
                                </Button>
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
                 <Button variant="outline" size="icon" onClick={() => refreshDatabase()} disabled={isLoading}>
                    <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                </Button>
            </div>
            {renderContent()}
        </div>
    );
}

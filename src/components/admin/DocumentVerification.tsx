
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
import pb from '@/lib/pocketbase';
import type { RecordModel } from 'pocketbase';
import { type User } from './UserList';

interface DocumentRecord extends RecordModel {
    id: string;
    driver: string;
    document_type: 'CNH' | 'CRLV' | 'VEHICLE_PHOTO';
    file: string;
    is_verified: boolean;
    expand?: {
        driver: User;
    }
}

const getFileUrl = (record: RecordModel, filename: string) => {
    return pb.getFileUrl(record, filename);
}

export default function DocumentVerification() {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [documents, setDocuments] = useState<DocumentRecord[]>([]);

    const fetchDocuments = useCallback(async () => {
        setIsLoading(true);
        try {
            const docs = await pb.collection('driver_documents').getFullList<DocumentRecord>({
                filter: 'is_verified = false',
                expand: 'driver',
            });
            setDocuments(docs);
        } catch (error) {
            toast({ variant: 'destructive', title: 'Erro ao buscar documentos' });
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchDocuments();
    }, [fetchDocuments]);


    const handleAction = async (docId: string, action: 'approve' | 'reject') => {
        setIsSaving(true);
        try {
            if (action === 'approve') {
                await pb.collection('driver_documents').update(docId, { is_verified: true });
                toast({ title: 'Documento Aprovado!', description: 'O documento agora está verificado.' });
            } else {
                await pb.collection('driver_documents').delete(docId);
                 toast({ title: 'Documento Rejeitado!', description: 'O documento foi removido.', variant: 'destructive' });
            }
            fetchDocuments(); // Refresh the list
        } catch (error) {
            toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível completar a ação.' });
        } finally {
            setIsSaving(false);
        }
    };

    const renderContent = () => {
        if (isLoading) {
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
                    const driverName = doc.expand?.driver?.name || 'Desconhecido';
                    const fileUrl = getFileUrl(doc, doc.file);
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
                                                src={fileUrl}
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
                                            <Image src={fileUrl} alt="Documento em tamanho maior" width={800} height={600} className="rounded-lg object-contain max-h-[80vh]" />
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </CardContent>
                            <CardFooter className="grid grid-cols-2 gap-2 pt-4">
                                 <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/50" disabled={isLoading || isSaving}>
                                            <X className="mr-2 h-4 w-4" />Rejeitar
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Rejeitar Documento?</AlertDialogTitle>
                                             <AlertDialogDescription>
                                                Esta ação removerá o documento do banco de dados permanentemente. O motorista precisará enviá-lo novamente.
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
                                        <Button size="sm" className="bg-green-600 hover:bg-green-700" disabled={isLoading || isSaving}>
                                            <Check className="mr-2 h-4 w-4" />Aprovar
                                        </Button>
                                     </AlertDialogTrigger>
                                     <AlertDialogContent>
                                         <AlertDialogHeader>
                                             <AlertDialogTitle>Aprovar Documento?</AlertDialogTitle>
                                             <AlertDialogDescription>
                                                 Esta ação marcará o documento como verificado e o motorista poderá ser habilitado.
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
                 <Button variant="outline" size="icon" onClick={fetchDocuments} disabled={isLoading || isSaving}>
                    <RefreshCw className={`h-4 w-4 ${isLoading || isSaving ? 'animate-spin' : ''}`} />
                </Button>
            </div>
            {renderContent()}
        </div>
    );
}

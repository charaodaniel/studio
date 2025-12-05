'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Loader2, WifiOff, FileCheck2, AlertTriangle, Check, X, RefreshCw } from 'lucide-react';
import Image from 'next/image';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';
import pb from '@/lib/pocketbase';
import type { RecordModel } from 'pocketbase';

interface User extends RecordModel {
    id: string;
    name: string;
}

interface DocumentRecord extends RecordModel {
    id: string;
    driver: string;
    document_type: 'CNH' | 'CRLV' | 'VEHICLE_PHOTO';
    file: string; // Filename
    is_verified: boolean;
    expand: {
        driver: User;
    }
}

export default function DocumentVerification() {
    const [documents, setDocuments] = useState<DocumentRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();

    const fetchDocuments = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const records = await pb.collection('driver_documents').getFullList<DocumentRecord>({
                filter: 'is_verified = false',
                expand: 'driver',
            });
            setDocuments(records);
        } catch (err: any) {
            console.error("Failed to fetch documents:", err);
            let errorMessage = "Não foi possível carregar os documentos pendentes.";
            if(err.status === 404){
                errorMessage = "A coleção 'driver_documents' não foi encontrada. Configure o banco de dados."
            }
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDocuments();
    }, [fetchDocuments]);

    const getFileUrl = (record: DocumentRecord) => {
        if (!record || !record.file) return '';
        return pb.getFileUrl(record, record.file);
    };

    const handleApprove = async (docId: string) => {
        try {
            await pb.collection('driver_documents').update(docId, { is_verified: true });
            toast({
                title: 'Documento Aprovado!',
                description: 'O documento foi marcado como verificado.',
            });
            fetchDocuments(); // Re-fetch the list
        } catch (err) {
            toast({
                variant: 'destructive',
                title: 'Erro ao Aprovar',
                description: 'Não foi possível aprovar o documento.',
            });
        }
    };
    
    const handleReject = async (docId: string) => {
        try {
            await pb.collection('driver_documents').delete(docId);
            toast({
                variant: 'destructive',
                title: 'Documento Rejeitado!',
                description: 'O documento foi removido.',
            });
            fetchDocuments(); // Re-fetch the list
        } catch (err) {
            toast({
                variant: 'destructive',
                title: 'Erro ao Rejeitar',
                description: 'Não foi possível rejeitar o documento.',
            });
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
                {documents.map((doc) => (
                    <Card key={doc.id} className="flex flex-col">
                        <CardHeader>
                            <CardTitle className="text-base truncate">{doc.expand.driver.name}</CardTitle>
                            <CardDescription>{doc.document_type}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow flex items-center justify-center">
                            <Dialog>
                                <DialogTrigger asChild>
                                    <div className="relative aspect-[4/3] w-full bg-muted rounded-md cursor-pointer hover:opacity-80 transition-opacity">
                                        <Image
                                            src={getFileUrl(doc)}
                                            alt={`Documento de ${doc.expand.driver.name}`}
                                            fill
                                            className="object-contain rounded-md"
                                        />
                                    </div>
                                </DialogTrigger>
                                <DialogContent className="max-w-3xl">
                                    <DialogHeader>
                                        <DialogTitle>{doc.document_type} de {doc.expand.driver.name}</DialogTitle>
                                    </DialogHeader>
                                    <div className="flex justify-center p-4">
                                        <Image src={getFileUrl(doc)} alt="Documento em tamanho maior" width={800} height={600} className="rounded-lg object-contain max-h-[80vh]" />
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </CardContent>
                        <CardFooter className="grid grid-cols-2 gap-2 pt-4">
                             <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/50">
                                        <X className="mr-2 h-4 w-4" />Rejeitar
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Rejeitar Documento?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Esta ação irá remover o documento permanentemente. O motorista precisará enviá-lo novamente. Você tem certeza?
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleReject(doc.id)} className="bg-destructive hover:bg-destructive/90">
                                            Sim, Rejeitar
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                            <Button size="sm" onClick={() => handleApprove(doc.id)} className="bg-green-600 hover:bg-green-700">
                                <Check className="mr-2 h-4 w-4" />Aprovar
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
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
                 <Button variant="outline" size="icon" onClick={fetchDocuments} disabled={isLoading}>
                    <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                </Button>
            </div>
            {renderContent()}
        </div>
    );
}

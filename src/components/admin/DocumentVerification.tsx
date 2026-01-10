
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Loader2, WifiOff, FileCheck2, Check, X, RefreshCw, Info } from 'lucide-react';
import Image from 'next/image';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';
import localData from '@/database/banco.json';
import { Alert, AlertTitle, AlertDescription } from '../ui/alert';

interface User {
    id: string;
    name: string;
}

interface DocumentRecord {
    id: string;
    driver: string;
    document_type: 'CNH' | 'CRLV' | 'VEHICLE_PHOTO';
    file: string;
    is_verified: boolean;
}

export default function DocumentVerification() {
    const [documents, setDocuments] = useState<DocumentRecord[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();

    const fetchDocuments = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            await new Promise(resolve => setTimeout(resolve, 250)); // Simulate delay
            const unverifiedDocs = localData.documents.filter(doc => !doc.is_verified);
            setDocuments(unverifiedDocs as DocumentRecord[]);
            setUsers(localData.users as User[]);
        } catch (err: any) {
            console.error("Failed to fetch documents from local JSON:", err);
            setError("Não foi possível carregar os documentos pendentes do arquivo local.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDocuments();
    }, [fetchDocuments]);

    const getDriverName = (driverId: string) => {
        return users.find(u => u.id === driverId)?.name || 'Desconhecido';
    }

    const handleAction = (docId: string, action: 'approve' | 'reject') => {
        toast({
            title: `Ação em Modo Protótipo`,
            description: `Em um aplicativo real, este documento seria ${action === 'approve' ? 'aprovado' : 'rejeitado'}.`,
        });
        // No modo local, apenas removemos da lista para simular a ação
        setDocuments(docs => docs.filter(d => d.id !== docId));
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
                                        <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/50">
                                            <X className="mr-2 h-4 w-4" />Rejeitar
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Rejeitar Documento?</AlertDialogTitle>
                                            <Alert>
                                                <Info className="h-4 w-4" />
                                                <AlertTitle>Modo Protótipo</AlertTitle>
                                                <AlertDescription>
                                                    Esta ação não deletará o arquivo, apenas o removerá da lista de pendências para fins de demonstração.
                                                </AlertDescription>
                                            </Alert>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleAction(doc.id, 'reject')} className="bg-destructive hover:bg-destructive/90">
                                                Sim, Rejeitar
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                                <Button size="sm" onClick={() => handleAction(doc.id, 'approve')} className="bg-green-600 hover:bg-green-700">
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
                 <Button variant="outline" size="icon" onClick={fetchDocuments} disabled={isLoading}>
                    <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                </Button>
            </div>
            {renderContent()}
        </div>
    );
}


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
import { useDatabaseManager, type DatabaseData } from '@/hooks/use-database-manager';

interface DocumentRecord {
    id: string;
    driver: string;
    document_type: 'CNH' | 'CRLV' | 'VEHICLE_PHOTO';
    file: string;
    is_verified: boolean;
}

export default function DocumentVerification() {
    const { database, isLoading: isDbLoading, isSaving, refreshDatabase, saveDatabase } = useDatabaseManager();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const documents = database?.documents || [];
    const users = database?.users || [];
    const unverifiedDocs = documents.filter(doc => !doc.is_verified) as DocumentRecord[];

    const getDriverName = (driverId: string) => {
        return users.find((u: any) => u.id === driverId)?.name || 'Desconhecido';
    }

    const handleAction = async (docId: string, action: 'approve' | 'reject') => {
        if (!database) return;
        
        setIsLoading(true);

        const updatedDocuments = database.documents.map(doc => {
            if (doc.id === docId) {
                // For rejection, we could remove it, but for simplicity, we just mark it.
                // In a real scenario, we might notify the user or delete the record.
                // For this CMS, we will just approve it.
                return { ...doc, is_verified: action === 'approve' };
            }
            return doc;
        });

        // If rejecting, we filter it out from the view, but it remains in the DB (as unverified).
        // If approving, it will be filtered out naturally after state update.
        const finalDocuments = action === 'reject' 
            ? database.documents.filter(doc => doc.id !== docId)
            : updatedDocuments;

        const updatedDatabase: DatabaseData = { ...database, documents: finalDocuments };
        
        await saveDatabase(updatedDatabase);
        refreshDatabase();
        setIsLoading(false);

        toast({
            title: `Ação Realizada!`,
            description: `O documento foi ${action === 'approve' ? 'aprovado' : 'rejeitado'} e a alteração foi salva.`,
        });
    };

    const renderContent = () => {
        if (isDbLoading || isSaving) {
            return (
                <div className="text-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                    <p className="mt-2 text-muted-foreground">Carregando documentos...</p>
                </div>
            );
        }

        if (unverifiedDocs.length === 0) {
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
                {unverifiedDocs.map((doc) => {
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
                                                 Esta ação marcará o documento como verificado e o salvará no repositório.
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
                 <Button variant="outline" size="icon" onClick={refreshDatabase} disabled={isDbLoading || isSaving}>
                    <RefreshCw className={`h-4 w-4 ${isDbLoading || isSaving ? 'animate-spin' : ''}`} />
                </Button>
            </div>
             <Alert variant="destructive">
                <Info className="h-4 w-4"/>
                <AlertTitle>Modo de Edição Ativado</AlertTitle>
                <AlertDescription>
                   As alterações feitas aqui serão salvas permanentemente no arquivo `banco.json` do repositório.
                </AlertDescription>
            </Alert>
            {renderContent()}
        </div>
    );
}

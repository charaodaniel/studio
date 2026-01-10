
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast } from './use-toast';

export interface DatabaseData {
    users: any[];
    rides: any[];
    documents: any[];
    chats: any[];
    messages: any[];
    institutional_info: any;
}

export const useDatabaseManager = () => {
    const { toast } = useToast();
    const [database, setDatabase] = useState<DatabaseData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/save-content');
            if (!response.ok) {
                const errorData = await response.json();
                 throw new Error(errorData.message || 'Falha ao buscar o banco de dados do servidor.');
            }
            const data = await response.json();
            setDatabase(JSON.parse(data.content));
        } catch (e: any) {
            console.error("useDatabaseManager fetch error:", e);
            setError(e.message);
            toast({
                variant: 'destructive',
                title: 'Erro ao Carregar Dados',
                description: e.message || 'Não foi possível carregar os dados do repositório.',
            });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const saveData = useCallback(async (updatedData: DatabaseData) => {
        setIsSaving(true);
        setError(null);
        try {
            const response = await fetch('/api/save-content', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: JSON.stringify(updatedData, null, 2) }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                 throw new Error(errorData.message || 'Falha ao salvar os dados.');
            }

            // Após salvar, atualiza o estado local para refletir a mudança
            setDatabase(updatedData);
            toast({
                title: 'Sucesso!',
                description: 'Os dados foram salvos com sucesso no repositório.',
            });

        } catch (e: any) {
             console.error("useDatabaseManager save error:", e);
             setError(e.message);
             toast({
                variant: 'destructive',
                title: 'Erro ao Salvar',
                description: e.message || 'Não foi possível salvar as alterações.',
            });
        } finally {
            setIsSaving(false);
        }
    }, [toast]);

    return {
        database,
        isLoading,
        isSaving,
        error,
        saveDatabase: saveData,
        refreshDatabase: fetchData,
    };
};



'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast } from './use-toast';

interface Database {
    users: any[];
    rides: any[];
    documents: any[];
    chats: any[];
    messages: any[];
    institutional_info: any;
}

export function useDatabaseManager() {
    const { toast } = useToast();
    const [database, setDatabase] = useState<Database | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchDatabase = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/save-content');
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Erro do servidor: ${response.status}`);
            }
            const data = await response.json();
            setDatabase(JSON.parse(data.content));
        } catch (err: any) {
            console.error("useDatabaseManager fetch error:", err);
            setError("Falha ao buscar o banco de dados do servidor.");
            toast({
                variant: 'destructive',
                title: 'Erro Crítico de Dados',
                description: err.message || 'Não foi possível carregar os dados do aplicativo.',
                duration: Infinity,
            });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchDatabase();
    }, [fetchDatabase]);

    const saveDatabase = async (updatedDb: Database): Promise<boolean> => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/save-content', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: JSON.stringify(updatedDb, null, 2) }),
            });

            const result = await response.json();

            if (!response.ok) {
                 if (result.error_code === 'CONFLICT') {
                    toast({
                        variant: 'destructive',
                        title: 'Conflito de Versão',
                        description: 'Outra pessoa salvou dados enquanto você editava. Seus dados não foram salvos. Por favor, atualize a página e tente novamente.',
                        duration: 10000,
                    });
                } else {
                    throw new Error(result.message || 'Erro desconhecido ao salvar.');
                }
                return false;
            }
            
            setDatabase(updatedDb); // Atualiza o estado local com sucesso
            return true;

        } catch (err: any) {
            console.error("useDatabaseManager save error:", err);
            toast({
                variant: 'destructive',
                title: 'Erro ao Salvar',
                description: err.message || 'Não foi possível salvar as alterações no servidor.',
            });
            return false;
        } finally {
            setIsLoading(false);
        }
    };
    
    return { database, isLoading, error, saveDatabase, refreshDatabase: fetchDatabase };
}

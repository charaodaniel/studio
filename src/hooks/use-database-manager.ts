
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast } from './use-toast';

export interface DatabaseState<T> {
    data: T | null;
    isLoading: boolean;
    error: string | null;
    saveData: (newData: T) => Promise<void>;
    fetchData: () => Promise<void>;
}

export function useDatabaseManager<T>(initialData: T | null = null): DatabaseState<T> {
    const { toast } = useToast();
    const [data, setData] = useState<T | null>(initialData);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const API_URL = '/api/save-content';

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(API_URL);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Falha ao buscar o banco de dados do servidor.');
            }
            const { content } = await response.json();
            const parsedData = JSON.parse(content) as T;
            setData(parsedData);
        } catch (err: any) {
            console.error("useDatabaseManager fetch error:", err);
            setError(err.message || "Erro desconhecido ao carregar dados.");
            toast({
                variant: 'destructive',
                title: 'Erro ao Carregar Dados',
                description: err.message,
            });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);


    const saveData = async (newData: T) => {
        setIsSaving(true);
        setError(null);
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ content: JSON.stringify(newData, null, 2) }),
            });

            if (!response.ok) {
                 const errorData = await response.json();
                if (errorData.error_code === 'CONFLICT') {
                     toast({
                        variant: 'destructive',
                        title: 'Conflito de Versão',
                        description: 'Alguém salvou dados enquanto você editava. Seus dados não foram salvos. Por favor, recarregue a página e tente novamente.',
                        duration: 10000
                    });
                } else {
                    throw new Error(errorData.message || 'Falha ao salvar os dados no servidor.');
                }
            } else {
                setData(newData); // Optimistic update
            }
        } catch (err: any) {
            console.error("useDatabaseManager save error:", err);
            setError(err.message || "Erro desconhecido ao salvar dados.");
            toast({
                variant: 'destructive',
                title: 'Erro ao Salvar',
                description: err.message,
            });
             throw err; // Re-throw the error so calling components know it failed
        } finally {
            setIsSaving(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { data, isLoading: isLoading || isSaving, error, saveData, fetchData };
}

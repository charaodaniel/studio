
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast } from './use-toast';

export interface DatabaseState<T> {
    data: T | null;
    isLoading: boolean;
    error: string | null;
    saveData: (getNewData: (currentData: T) => T) => Promise<void>;
    fetchData: () => Promise<void>;
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export function useDatabaseManager<T>(initialData: T | null = null): DatabaseState<T> {
    const { toast } = useToast();
    const [data, setData] = useState<T | null>(initialData);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const API_URL = '/api/save-content';

    const fetchData = useCallback(async (): Promise<T | null> => {
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
            return parsedData;
        } catch (err: any) {
            console.error("useDatabaseManager fetch error:", err);
            setError(err.message || "Erro desconhecido ao carregar dados.");
            toast({
                variant: 'destructive',
                title: 'Erro ao Carregar Dados',
                description: err.message,
            });
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    const saveData = async (getNewData: (currentData: T) => T) => {
        setIsSaving(true);
        setError(null);
        let attempts = 0;
        const maxAttempts = 3;

        while (attempts < maxAttempts) {
            try {
                // 1. Get the most recent data from the server before attempting to save.
                const currentDataResponse = await fetch(API_URL);
                if (!currentDataResponse.ok) throw new Error("Não foi possível obter a versão mais recente dos dados para salvar.");
                
                const { content } = await currentDataResponse.json();
                const currentData = JSON.parse(content) as T;
                
                // 2. Apply the intended change to the most recent data.
                const newData = getNewData(currentData);
                
                // 3. Attempt to save.
                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ content: JSON.stringify(newData, null, 2) }),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    if (errorData.error_code === 'CONFLICT' && attempts < maxAttempts - 1) {
                        // Conflict detected, will retry.
                        attempts++;
                        console.warn(`Tentativa ${attempts}: Conflito detectado. Tentando salvar novamente...`);
                        toast({
                            title: 'Conflito de Versão Detectado',
                            description: `Tentando salvar novamente (tentativa ${attempts}/${maxAttempts-1}).`,
                        });
                        await sleep(1000 * attempts); // Exponential backoff
                        continue; // Go to next loop iteration to retry
                    }
                    throw new Error(errorData.message || 'Falha ao salvar os dados no servidor.');
                }

                // Success!
                setData(newData); // Optimistic update
                setIsSaving(false);
                return; // Exit the loop and function

            } catch (err: any) {
                console.error(`useDatabaseManager save error (attempt ${attempts + 1}):`, err);
                setError(err.message || "Erro desconhecido ao salvar dados.");
                toast({
                    variant: 'destructive',
                    title: 'Erro ao Salvar',
                    description: err.message,
                });
                setIsSaving(false);
                throw err; // Re-throw the error so calling components know it failed
            }
        }

        // If loop finishes, all attempts failed
        toast({
            variant: 'destructive',
            title: 'Falha Crítica ao Salvar',
            description: 'Não foi possível salvar suas alterações após várias tentativas. Por favor, recarregue a página.',
            duration: 10000,
        });
        setIsSaving(false);
    };

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { data, isLoading: isLoading || isSaving, error, saveData, fetchData };
}

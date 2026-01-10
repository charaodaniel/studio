
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast } from './use-toast';

// Define a structure for the database content
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
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDatabase = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/save-content', { cache: 'no-store' });
      if (!response.ok) {
        throw new Error('Falha ao buscar o banco de dados do servidor.');
      }
      const data = await response.json();
      setDatabase(JSON.parse(data.content));
    } catch (err: any) {
      console.error("useDatabaseManager fetch error:", err);
      setError('Não foi possível carregar os dados. Verifique a conexão e as configurações do GitHub.');
      toast({
        variant: 'destructive',
        title: 'Erro Crítico de Carregamento',
        description: err.message,
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchDatabase();
  }, [fetchDatabase]);

  const saveDatabase = useCallback(async (newDbState: Database): Promise<boolean> => {
    setIsSaving(true);
    setError(null);
    try {
      const content = JSON.stringify(newDbState, null, 2);
      const response = await fetch('/api/save-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
             toast({
                variant: 'destructive',
                title: 'Conflito de Versão',
                description: 'Os dados foram alterados por outra pessoa. Suas alterações não foram salvas. Por favor, recarregue e tente novamente.',
                duration: 10000,
            });
        } else {
            throw new Error(result.message || 'Falha ao salvar as alterações no servidor.');
        }
        return false;
      }
      
      setDatabase(newDbState); // Update local state on successful save
      return true;
    } catch (err: any) {
      console.error("useDatabaseManager save error:", err);
      setError('Não foi possível salvar os dados.');
      toast({
        variant: 'destructive',
        title: 'Erro ao Salvar',
        description: err.message,
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [toast]);

  const refreshDatabase = () => {
      fetchDatabase();
  }

  return {
    database,
    isLoading,
    isSaving,
    error,
    saveDatabase,
    refreshDatabase,
  };
}

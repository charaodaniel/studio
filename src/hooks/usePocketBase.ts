
import pb from '@/lib/pocketbase';

/**
 * Hook para obter uma instância do PocketBase.
 * Ele sempre retornará a mesma instância, que é agnóstica de autenticação neste modo de protótipo.
 */
export function usePocketBase() {
  return pb;
}

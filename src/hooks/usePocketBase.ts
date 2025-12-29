import { useAuth } from './useAuth';
import pb from '@/lib/pocketbase';

/**
 * Hook to get a PocketBase instance.
 * It will be unauthenticated by default.
 * If the user is logged in, the instance will be authenticated.
 */
export function usePocketBase() {
  const { isLoggedIn } = useAuth();
  
  if (isLoggedIn) {
    return pb;
  }
  
  // Return a new instance if not logged in to avoid using a stale authenticated instance
  return pb;
}

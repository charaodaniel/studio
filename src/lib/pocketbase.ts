
import PocketBase from 'pocketbase';

// AVISO: A URL da API deve usar HTTPS para funcionar corretamente com o frontend na Vercel.
// Defina esta variável de ambiente no seu provedor de hospedagem (ex: Vercel).
// A URL deve ser apenas o domínio base, sem o "/_/" no final.
export const POCKETBASE_URL = process.env.NEXT_PUBLIC_API_BASE || 'https://mobmv.shop';

// Inicializa o SDK do PocketBase com a URL explícita do seu backend.
const pb = new PocketBase(POCKETBASE_URL);

// Definir um timeout maior e desativar o cancelamento automático torna a conexão mais resiliente.
pb.autoCancellation(false);

// Este listener é útil para debugar mudanças no estado de autenticação.
pb.authStore.onChange((token, model) => {
    // console.log('Auth state changed:', { isValid: pb.authStore.isValid, token, model });
}, true);


export default pb;

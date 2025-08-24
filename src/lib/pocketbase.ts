import PocketBase from 'pocketbase';

// AVISO: A URL da API deve usar HTTPS para funcionar corretamente com o frontend na Vercel.
// Defina esta variável de ambiente no seu provedor de hospedagem (ex: Vercel).
// A URL deve ser apenas o domínio base, sem o "/_/" no final.
export const POCKETBASE_URL = process.env.NEXT_PUBLIC_API_BASE || 'https://mobmv.shop';

// Inicializa o SDK do PocketBase com a URL explícita do seu backend.
const pb = new PocketBase(POCKETBASE_URL);

// Definir um timeout maior pode ajudar em redes mais lentas.
pb.autoCancellation(false);

// Add an event listener to handle token expiration
pb.authStore.onChange((token, model) => {
    console.log('Auth changed', token, model);
}, true);


export default pb;

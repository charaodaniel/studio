import PocketBase from 'pocketbase';

// AVISO: A URL da API deve usar HTTPS para funcionar corretamente com o frontend na Vercel.
// Defina esta variável de ambiente no seu provedor de hospedagem (ex: Vercel).
export const POCKETBASE_URL = process.env.NEXT_PUBLIC_POCKETBASE_URL || 'https://mobmv.shop';

// Inicializa o SDK do PocketBase com a URL explícita do seu backend.
const pb = new PocketBase(POCKETBASE_URL);

// Definir um timeout maior pode ajudar em redes mais lentas.
pb.autoCancellation(false);

export default pb;

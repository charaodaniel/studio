import PocketBase from 'pocketbase';

// A URL agora aponta para a variável de ambiente, com um fallback para o novo endereço sslip.io.
// É crucial que a URL final use https://.
export const POCKETBASE_URL = process.env.NEXT_PUBLIC_POCKETBASE_URL || 'https://pocketbase-wokw0ck4oo84kgk80w8kgog8.62.72.9.108.sslip.io';

// Inicializa o SDK do PocketBase com a URL explícita do seu backend.
const pb = new PocketBase(POCKETBASE_URL);

// Definir um timeout maior pode ajudar em redes mais lentas.
pb.autoCancellation(false);

export default pb;

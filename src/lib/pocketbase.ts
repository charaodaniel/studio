import PocketBase from 'pocketbase';

// A URL agora aponta para a variável de ambiente, com um fallback para o IP público.
// O ideal é sempre configurar a variável de ambiente na plataforma de deploy.
export const POCKETBASE_URL = process.env.NEXT_PUBLIC_POCKETBASE_URL || 'https://62.72.9.108';

// Inicializa o SDK do PocketBase com a URL explícita do seu backend.
const pb = new PocketBase(POCKETBASE_URL);

// Definir um timeout maior pode ajudar em redes mais lentas.
pb.autoCancellation(false);

export default pb;

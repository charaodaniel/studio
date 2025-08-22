import PocketBase from 'pocketbase';

// AVISO: Usar HTTP para a API enquanto o frontend está em HTTPS causará erros de "Mixed Content".
// A solução recomendada é configurar HTTPS no servidor do PocketBase.
// Esta URL é para desenvolvimento e testes em ambiente sem HTTPS.
export const POCKETBASE_URL = process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://62.72.9.108:8090';

// Inicializa o SDK do PocketBase com a URL explícita do seu backend.
const pb = new PocketBase(POCKETBASE_URL);

// Definir um timeout maior pode ajudar em redes mais lentas.
pb.autoCancellation(false);

export default pb;

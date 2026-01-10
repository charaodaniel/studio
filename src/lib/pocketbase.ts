
import PocketBase from 'pocketbase';

// A URL agora vem exclusivamente da variável de ambiente, com um fallback para o ambiente de produção.
const pbUrl = process.env.NEXT_PUBLIC_POCKETBASE_URL || 'https://mobmv.shop';

const pb = new PocketBase(pbUrl);

// globally disable auto cancellation
pb.autoCancellation(false);

export default pb;

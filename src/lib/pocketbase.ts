import PocketBase from 'pocketbase';

// A URL agora vem exclusivamente da variável de ambiente.
// Se não estiver definida, o PocketBase JS SDK lançará um erro, o que é o comportamento desejado.
const pbUrl = process.env.NEXT_PUBLIC_POCKETBASE_URL;
const pb = new PocketBase(pbUrl);

// globally disable auto cancellation
pb.autoCancellation(false);

export default pb;

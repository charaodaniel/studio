import PocketBase from 'pocketbase';

// Garanta que a variável de ambiente NEXT_PUBLIC_POCKETBASE_URL está definida
// no seu ambiente de desenvolvimento (.env.local) ou nas configurações do seu provedor de hospedagem (Vercel).
const pocketbaseUrl = process.env.NEXT_PUBLIC_POCKETBASE_URL;

if (!pocketbaseUrl) {
    throw new Error("A variável de ambiente NEXT_PUBLIC_POCKETBASE_URL não está definida.");
}

const pb = new PocketBase(pocketbaseUrl);

// Opcional: para ajudar na depuração, você pode habilitar o log
// pb.autoCancellation(false);

export default pb;

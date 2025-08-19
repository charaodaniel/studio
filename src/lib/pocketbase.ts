import PocketBase from 'pocketbase';

// The app will connect through the Nginx proxy, which routes /api/ to the PocketBase backend.
// Changed to HTTPS to prevent mixed content errors when deploying on Vercel/Firebase.
export const POCKETBASE_URL = process.env.NEXT_PUBLIC_POCKETBASE_URL || 'https://62.72.9.108:8090';

// Initialize the PocketBase SDK with the explicit URL of your backend.
const pb = new PocketBase(POCKETBASE_URL);

// Set a higher timeout
export default pb;

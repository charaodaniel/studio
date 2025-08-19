import PocketBase from 'pocketbase';

// The app will connect through the Nginx proxy, which routes /api/ to the PocketBase backend.
export const POCKETBASE_URL = process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://62.72.9.108';

// Initialize the PocketBase SDK with the explicit URL of your backend.
const pb = new PocketBase(POCKETBASE_URL);

// Set a higher timeout
export default pb;

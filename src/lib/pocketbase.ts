import PocketBase from 'pocketbase';

// The app will connect through the Nginx proxy, which handles HTTPS.
// The port is removed as Nginx listens on the default port 443.
export const POCKETBASE_URL = process.env.NEXT_PUBLIC_POCKETBASE_URL || 'https://62.72.9.108/api';

// Initialize the PocketBase SDK with the explicit URL of your backend.
const pb = new PocketBase(POCKETBASE_URL);

// Set a higher timeout
export default pb;

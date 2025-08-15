import PocketBase from 'pocketbase';

// The app will connect through the Nginx proxy, which routes /api/ to the PocketBase backend.
export const POCKETBASE_URL = 'http://62.72.9.108/api/';

// Initialize the PocketBase SDK with the explicit URL of your backend.
const pb = new PocketBase(POCKETBASE_URL);

// Set a higher timeout
pb.timeout = 10 * 1000; // 10 seconds

export default pb;

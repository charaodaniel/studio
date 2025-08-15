import PocketBase from 'pocketbase';

export const POCKETBASE_URL = 'http://62.72.9.108';

// Initialize the PocketBase SDK with the explicit URL of your backend.
const pb = new PocketBase(POCKETBASE_URL);

// Set a higher timeout
pb.timeout = 10 * 1000; // 10 seconds

export default pb;

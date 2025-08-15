import PocketBase from 'pocketbase';

export const POCKETBASE_URL = 'http://62.72.9.108:8090';

// Initialize the PocketBase SDK with the explicit URL of your backend.
const pb = new PocketBase(POCKETBASE_URL);

export default pb;

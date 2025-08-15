import PocketBase from 'pocketbase';

export const POCKETBASE_URL = 'http://localhost:8090';

// Initialize the PocketBase SDK with the explicit URL of your backend.
const pb = new PocketBase(POCKETBASE_URL);

export default pb;

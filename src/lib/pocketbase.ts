import PocketBase from 'pocketbase';

export const POCKETBASE_URL = 'http://62.72.9.108:8090';

// By leaving the URL empty, the PocketBase SDK will automatically try to
// resolve the API URL from the current page address.
// This is more robust for different environments.
const pb = new PocketBase('');

export default pb;

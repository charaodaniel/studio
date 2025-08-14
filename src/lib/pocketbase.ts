import PocketBase from 'pocketbase';

export const POCKETBASE_URL = 'http://62.72.9.108:8090';

const pb = new PocketBase(POCKETBASE_URL);

export default pb;

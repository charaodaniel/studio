import PocketBase from 'pocketbase';

const pbUrl = process.env.NEXT_PUBLIC_POCKETBASE_URL || 'https://www.mobmv.shop';
const pb = new PocketBase(pbUrl);

// globally disable auto cancellation
pb.autoCancellation(false);

export default pb;

import Pusher from 'pusher-js';
import env from './env';

const pusher = new Pusher(env.PUSHER_KEY, {
    cluster: env.PUSHER_CLUSTER,
})

export default pusher;
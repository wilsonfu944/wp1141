import Pusher from 'pusher';

// 只有在所有環境變數都存在時才初始化 Pusher
let pusherServer: Pusher | null = null;

if (
  process.env.PUSHER_APP_ID &&
  process.env.PUSHER_KEY &&
  process.env.PUSHER_SECRET &&
  process.env.PUSHER_CLUSTER
) {
  try {
    pusherServer = new Pusher({
      appId: process.env.PUSHER_APP_ID,
      key: process.env.PUSHER_KEY,
      secret: process.env.PUSHER_SECRET,
      cluster: process.env.PUSHER_CLUSTER,
      useTLS: true,
    });
  } catch (error) {
    console.error('Failed to initialize Pusher:', error);
    pusherServer = null;
  }
} else {
  console.warn('Pusher environment variables are missing. Pusher features will be disabled.');
}

export { pusherServer };


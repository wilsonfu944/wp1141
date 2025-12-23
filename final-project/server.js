// 使用 tsx 運行此文件以支持 TypeScript
// 運行: npx tsx server.ts
// 或者編譯後運行: npm run build && node server.js

// 注意：由於Next.js的限制，WebSocket服務器需要單獨運行
// 這裡提供一個簡化版本，實際部署時可能需要使用不同的架構

const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOSTNAME || 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  const io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
    path: '/socket.io/',
  });

  // 動態加載socket handler
  // 注意：在開發環境需要使用 tsx 運行此文件: npx tsx server.js
  // 或者編譯TypeScript後運行編譯後的版本
  try {
    // 嘗試加載編譯後的JS版本
    const setupSocketHandler = require('./lib/socket-handler.js').default;
    setupSocketHandler(io);
    console.log('Socket.io handler loaded');
  } catch (error) {
    // 如果沒有編譯版本，嘗試直接加載TS（需要tsx）
    try {
      require('tsx/cjs/api').register();
      const setupSocketHandler = require('./lib/socket-handler.ts').default;
      setupSocketHandler(io);
      console.log('Socket.io handler loaded (TypeScript)');
    } catch (tsError) {
      console.warn('Socket handler not available, WebSocket features disabled');
      console.warn('To enable: Run with tsx (npx tsx server.js) or compile TypeScript first');
    }
  }

  httpServer
    .once('error', (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
      if (process.env.NODE_ENV !== 'production') {
        console.log('> Socket.io server enabled');
      }
    });
});


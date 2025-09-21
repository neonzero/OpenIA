const { createApp } = require('./app');


const app = createApp();
const port = process.env.PORT || 4000;

const { app } = createApp();

const server = app.listen(PORT, () => {
  console.log(`Backend services listening on port ${PORT}`);
});

process.on('SIGINT', () => {
  server.close(() => {
    process.exit(0);
  });
});

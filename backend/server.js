const { createApp } = require('./app');

const app = createApp();
const port = process.env.PORT || 4000;

app.listen(port, () => {
  console.log(`OpenIA backend listening on port ${port}`);
});

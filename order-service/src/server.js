const app = require('./app');
const env = require('./config/env');

app.listen(env.PORT, () => {
  console.log(`Order service running on port ${env.PORT}`);
});
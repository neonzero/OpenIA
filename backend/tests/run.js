const runner = require('./jest-lite');

require('./api.test');
require('./riskEngine.test');
require('./mq.test');

runner.run().then((failures) => {
  process.exitCode = failures > 0 ? 1 : 0;
});

const { startServer } = require('./src/interfaces/http/server');

if (require.main === module) {
  startServer();
}

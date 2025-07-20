const express = require('express');
const path = require('path');

function startServer() {
  const app = express();
  app.use(express.json());
  app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname, 'views'));

  // Serve static assets from the shared public folder
  app.use(express.static(path.join(__dirname, '../../../public')));

  const routes = require('./routes');
  app.use('/', routes);

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Web server running on http://localhost:${PORT}`);
  });
}

module.exports = { startServer };

const { runExport } = require('./src/application/exporter');

if (require.main === module) {
  runExport();
}

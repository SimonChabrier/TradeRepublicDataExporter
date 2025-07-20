const { createObjectCsvWriter } = require("csv-writer");
const { authenticate, startLogin, verifyLogin, fetchAllTransactions } = require("../infrastructure/tradeRepublic");
const { parseTransactionDetails } = require("../domain/transaction");

async function exportToCSV(transactions) {
  const csvWriter = createObjectCsvWriter({
    path: "./export.csv",
    header: [
      { id: "Date", title: "Date" },
      { id: "Type", title: "Type" },
      { id: "Titre", title: "Nom du titre" },
      { id: "ISIN", title: "ISIN" },
      { id: "Note", title: "Note" },
      { id: "Quantite", title: "Parts" },
      { id: "Devise", title: "Devise de l'opération" },
      { id: "Frais", title: "Frais" },
      { id: "Taxes", title: "Impôts / Taxes" },
      { id: "Total", title: "Valeur" }
    ],
    fieldDelimiter: ";",
    encoding: "utf8"
  });
  await csvWriter.writeRecords(transactions);
  console.log("✅ Export Portfolio Performance généré !");
}

async function runExport() {
  const token = await authenticate();
  const data = await fetchAllTransactions(token);
  const formatted = [];
  for (const tx of data) {
    if (!tx.amount || tx.amount.value === 0) continue;
    formatted.push(parseTransactionDetails(tx));
  }
  await exportToCSV(formatted);
}

async function runExportWithToken(token) {
  const data = await fetchAllTransactions(token);
  const formatted = [];
  for (const tx of data) {
    if (!tx.amount || tx.amount.value === 0) continue;
    formatted.push(parseTransactionDetails(tx));
  }
  await exportToCSV(formatted);
}

module.exports = {
  runExport,
  exportToCSV,
  runExportWithToken,
  startLogin,
  verifyLogin
};

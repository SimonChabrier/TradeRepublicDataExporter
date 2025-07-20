function parseAmount(text) {
  if (text === 'Gratuit') {
    return 0;
  }
  const cleaned = text
    .replace(',', '.')
    .replace(/[^\d.-]/g, '');
  return parseFloat(cleaned);
}

function getTypeFromEvent(eventType, subtitle) {
  const lower = (subtitle || '').toLowerCase();

  if (
    eventType.includes('SAVINGS_PLAN') ||
    eventType.includes('trading_savingsplan_executed') ||
    lower.includes('achat')
  ) {
    return 'Achat';
  }
  if (lower.includes('vente')) {
    return 'Vente';
  }
  if (lower.includes('distribution') || lower.includes('dividende') || eventType === 'CREDIT') {
    return 'Dividendes';
  }
  if (eventType.includes('INTEREST')) {
    return 'Int\u00e9r\u00eats';
  }
  if (
    eventType.includes('PAYMENT_INBOUND') ||
    eventType.includes('INCOMING_TRANSFER_DELEGATION')
  ) {
    return 'D\u00e9p\u00f4t';
  }
  if (
    eventType.includes('PAYMENT_OUTBOUND') ||
    eventType.includes('OUTGOING_TRANSFER_DELEGATION')
  ) {
    return 'Retrait';
  }

  return 'Autre';
}

function parseTransactionDetails(tx) {
  const row = {};

  row.Date = new Date(tx.timestamp).toISOString().split('T')[0];
  row.Type = getTypeFromEvent(tx.eventType, tx.subtitle);
  row.Titre = tx.title || '';
  row.ISIN = tx.ISIN || '';
  row.Note = tx.subtitle || '';
  row.Quantite = parseAmount(tx.Titres || tx.Actions || '0');
  row.Total = tx.amount?.value;
  row.Devise = tx.amount?.currency || 'EUR';
  row.Frais = parseAmount(tx.Frais || '0');
  row.Taxes = parseAmount(tx.Imp\u00f4ts || '0');

  return row;
}

module.exports = { parseAmount, getTypeFromEvent, parseTransactionDetails };

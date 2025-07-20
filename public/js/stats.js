// Compute and update statistics summary based on visible table rows
// Exposes window.updateStats so other scripts (like filter.js) can trigger refresh

document.addEventListener('DOMContentLoaded', () => {
  const table = document.getElementById('dataTable');
  if (!table) return;

  const rows = Array.from(table.querySelectorAll('tbody tr'));
  const headers = Array.from(table.querySelectorAll('thead th')).map(th => th.textContent.trim());
  const headerIndex = {};
  headers.forEach((h, idx) => { headerIndex[h] = idx; });

  const typeIdx = headerIndex['Type'];
  const noteIdx = headerIndex['Note'];
  const totalIdx = headerIndex['Total'] !== undefined ? headerIndex['Total'] : headerIndex['Valeur'];
  if (typeIdx === undefined || totalIdx === undefined) return;

  const rowMap = {};
  document.querySelectorAll('#statsTable tbody tr[data-type]').forEach((tr) => {
    rowMap[tr.dataset.type] = tr;
  });

  function parseNumber(text) {
    return parseFloat(text.replace(/[\s,€]/g, m => m === ',' ? '.' : '')) || 0;
  }

  window.updateStats = function() {
    const categories = {
      Depot: { count: 0, total: 0 },
      Achat: { count: 0, total: 0 },
      Vente: { count: 0, total: 0 },
      Dividendes: { count: 0, total: 0 },
      Interets: { count: 0, total: 0 },
      Retrait: { count: 0, total: 0 },
      Autre: { count: 0, total: 0 },
    };

    rows.forEach((row) => {
      if (row.style.display === 'none') return;
      const cells = row.querySelectorAll('td');
      let type = cells[typeIdx]?.textContent.trim();
      const note = noteIdx !== undefined ? cells[noteIdx].textContent.trim() : '';
      if (type === 'Autre' && /Plan d\s?epargne execute/i.test(note)) {
        type = 'Achat';
      }
      const amount = parseNumber(cells[totalIdx]?.textContent || '0');
      switch (type) {
        case 'Dépôt':
          categories.Depot.count++; categories.Depot.total += amount; break;
        case 'Achat':
          categories.Achat.count++; categories.Achat.total += amount; break;
        case 'Vente':
          categories.Vente.count++; categories.Vente.total += amount; break;
        case 'Dividendes':
          categories.Dividendes.count++; categories.Dividendes.total += amount; break;
        case 'Intérêts':
          categories.Interets.count++; categories.Interets.total += amount; break;
        case 'Retrait':
          categories.Retrait.count++; categories.Retrait.total += amount; break;
        default:
          categories.Autre.count++; categories.Autre.total += amount; break;
      }
    });

    Object.keys(categories).forEach((key) => {
      const cat = categories[key];
      const row = rowMap[key];
      if (!row) return;
      row.querySelector('.count').textContent = cat.count;
      row.querySelector('.total').textContent = cat.total.toFixed(2);
      const avg = cat.count ? cat.total / cat.count : 0;
      row.querySelector('.avg').textContent = avg.toFixed(2);
    });

    const net =
      categories.Depot.total +
      categories.Vente.total +
      categories.Dividendes.total +
      categories.Interets.total -
      categories.Achat.total -
      categories.Retrait.total -
      categories.Autre.total;

    const netCell = document.getElementById('netTotal');
    if (netCell) netCell.textContent = net.toFixed(2);
  };

  // initial calculation
  window.updateStats();
});

// Filter logic for table rows
// Applies real-time filtering based on inputs located in #filterForm

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('filterForm');
  if (!form) return;

  const table = document.getElementById('dataTable');
  if (!table) return;

  const rows = Array.from(table.querySelectorAll('tbody tr'));
  const headers = Array.from(table.querySelectorAll('thead th')).map(th => th.textContent.trim());

  // map header names to column indexes
  const headerIndex = {};
  headers.forEach((h, idx) => { headerIndex[h] = idx; });

  function applyFilters() {
    const filters = {};

    headers.forEach((h) => {
      const idx = headerIndex[h];
      if (h === 'Date') {
        const fromInput = form.querySelector(`input[data-col="${idx}"][data-role="from"]`);
        const toInput = form.querySelector(`input[data-col="${idx}"][data-role="to"]`);
        const from = fromInput.value;
        const to = toInput.value;
        if (from || to) {
          filters[idx] = { type: 'date', from, to };
        }
      } else {
        const input = form.querySelector(`input[data-col="${idx}"]`);
        const value = input.value.trim();
        if (value) {
          const numberCols = ['Quantite', 'Frais', 'Taxes', 'Total'];
          filters[idx] = {
            type: numberCols.includes(h) ? 'number' : 'text',
            value,
          };
        }
      }
    });

    rows.forEach((row) => {
      const cells = row.querySelectorAll('td');
      let visible = true;
      for (const col in filters) {
        const f = filters[col];
        const text = cells[col].textContent.trim();
        if (f.type === 'date') {
          if (f.from && text < f.from) { visible = false; break; }
          if (f.to && text > f.to) { visible = false; break; }
        } else if (f.type === 'number') {
          if (parseFloat(text.replace(',', '.')) !== parseFloat(f.value)) { visible = false; break; }
        } else { // text
          if (!text.toLowerCase().includes(f.value.toLowerCase())) { visible = false; break; }
        }
      }
      row.style.display = visible ? '' : 'none';
    });

    if (typeof window.updateStats === 'function') {
      window.updateStats();
    }
  }

  // bind events
  form.querySelectorAll('.filter-input').forEach((input) => {
    input.addEventListener('input', applyFilters);
  });

  form.querySelectorAll('.reset-filter').forEach((btn) => {
    btn.addEventListener('click', () => {
      const group = btn.closest('.input-group');
      group.querySelectorAll('input').forEach((inp) => { inp.value = ''; });
      applyFilters();
    });
  });

  // initialize stats with all data
  if (typeof window.updateStats === 'function') {
    window.updateStats();
  }
});



let playersByName = new Set();
let injuries = [];

function handleData(payload) {
  document.getElementById('loading').style.display = 'none';

  const playerRows = payload['Players'] || [];
  const injuryRows = payload['Injuries'] || [];

  // Store player names in a Set for quick lookup
  playersByName = new Set(playerRows.map(p => p.Name?.trim()));

  // Filter injuries: only include players found in Players sheet
  injuries = injuryRows.filter(row => playersByName.has(row.Name?.trim()));

  renderInjuries();
}

function renderInjuries() {
  const container = document.getElementById('tables-container');
  container.innerHTML = '';

  if (!injuries.length) {
    container.innerHTML = '<p><em>No injury data found.</em></p>';
    return;
  }

  const cols = Object.keys(injuries[0]);
  let sortKey = null;
  let sortAsc = true;

  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const tbody = document.createElement('tbody');

  thead.innerHTML = `<tr>${cols.map(col => `<th class="sortable" data-col="${col}">${col}</th>`).join('')}</tr>`;

  thead.addEventListener('click', e => {
    const th = e.target.closest('th');
    if (!th || !th.dataset.col) return;
    const col = th.dataset.col;
    sortAsc = (sortKey === col) ? !sortAsc : true;
    sortKey = col;
    renderRows();
  });

  function renderRows() {
    const rows = [...injuries];

    if (sortKey) {
      rows.sort((a, b) => {
        const x = a[sortKey] ?? '';
        const y = b[sortKey] ?? '';
        return sortAsc
          ? x.toString().localeCompare(y.toString(), undefined, { numeric: true })
          : y.toString().localeCompare(x.toString(), undefined, { numeric: true });
      });
    }

    tbody.innerHTML = rows.map(row => {
      return `<tr>${cols.map(col => `<td>${row[col] ?? ''}</td>`).join('')}</tr>`;
    }).join('');
  }

  renderRows();
  table.appendChild(thead);
  table.appendChild(tbody);
  container.appendChild(table);
}

document.addEventListener('DOMContentLoaded', () => {
  const script = document.createElement('script');
  script.src = 'https://script.google.com/macros/s/AKfycbzODSyKW5YZpujVWZMr8EQkpMKRwaKPI_lYiAv2mxDe-dCr9LRfEjt8-wzqBB_X4QKxug/exec?callback=handleData';
  document.body.appendChild(script);
});

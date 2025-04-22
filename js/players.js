let playerData = [];

window.onerror = (msg, src, row, col, err) => {
  const p = document.createElement('pre');
  p.style.color = 'salmon';
  p.textContent = `ERROR: ${msg} at ${row}:${col}`;
  document.body.appendChild(p);
};

window.addEventListener('unhandledrejection', ev => {
  const p = document.createElement('pre');
  p.style.color = 'salmon';
  p.textContent = `Promise rejection: ${ev.reason}`;
  document.body.appendChild(p);
});

function handleData(payload) {
  document.getElementById('loading').style.display = 'none';
  playerData = payload['Players'] || [];
  renderPlayers();
}

function renderPlayers() {
  const container = document.getElementById('tables-container');
  container.innerHTML = '';
  if (!playerData.length) {
    container.innerHTML = '<p><em>No player data available.</em></p>';
    return;
  }

  const baseCols = Object.keys(playerData[0]).filter(c => !['headshot_url', 'Name', 'Team']);
  const reorderedCols = ['headshot_url', 'Name', 'Team', ...baseCols];

  const searchBox = document.createElement('div');
  searchBox.className = 'table-controls';
  const input = document.createElement('input');
  input.type = 'search';
  input.placeholder = 'Filter players...';
  searchBox.appendChild(input);
  container.appendChild(searchBox);

  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const tbody = document.createElement('tbody');

  let filteredRows = [...playerData];
  let sortKey = null;
  let sortAsc = true;

  thead.innerHTML = `<tr>${reorderedCols.map(c => {
    if (c === 'headshot_url') return '<th></th>';
    return `<th class="sortable" data-col="${c}">${c}</th>`;
  }).join('')}</tr>`;

  thead.addEventListener('click', e => {
    const th = e.target.closest('th');
    if (!th || !th.dataset.col) return;
    const col = th.dataset.col;
    sortAsc = (sortKey === col) ? !sortAsc : true;
    sortKey = col;
    renderRows();
  });

  input.addEventListener('input', () => {
    const q = input.value.toLowerCase();
    filteredRows = playerData.filter(row =>
      reorderedCols.some(col =>
        (row[col] ?? '').toString().toLowerCase().includes(q)
      )
    );
    renderRows();
  });

  function renderRows() {
    const rows = [...filteredRows];
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
      return `<tr>${reorderedCols.map(col => {
        if (col === 'headshot_url') {
          return `<td>${row[col] ? `<img src="${row[col]}" alt="" style="width:24px; height:24px; border-radius:50%;">` : ''}</td>`;
        }
        return `<td>${row[col] ?? ''}</td>`;
      }).join('')}</tr>`;
    }).join('');
  }

  renderRows();
  table.appendChild(thead);
  table.appendChild(tbody);
  container.appendChild(table);
}

// Inject JSONP
document.addEventListener('DOMContentLoaded', () => {
  const script = document.createElement('script');
  script.src = 'https://script.google.com/macros/s/AKfycbzODSyKW5YZpujVWZMr8EQkpMKRwaKPI_lYiAv2mxDe-dCr9LRfEjt8-wzqBB_X4QKxug/exec?callback=handleData';
  document.body.appendChild(script);
});

let dataStore = {};

// Display JS errors visibly
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

// JSONP callback
function handleData(payload) {
  document.getElementById('loading').style.display = 'none';
  dataStore = payload;
  initTabs();
  renderSheet('Players');
}

// Tab functionality
function initTabs() {
  document.querySelectorAll('.tab').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelector('.tab.active').classList.remove('active');
      btn.classList.add('active');
      renderSheet(btn.dataset.sheet);
    });
  });
}

// Filter + sort table rendering
function renderSheet(sheetName) {
  const originalRows = dataStore[sheetName] || [];
  let filteredRows = [...originalRows];
  const container = document.getElementById('tables-container');
  container.innerHTML = '';

  const section = document.createElement('section');
  section.innerHTML = `<h2>${sheetName}</h2>`;

  if (!originalRows.length) {
    section.innerHTML += `<p><em>No data available.</em></p>`;
    container.appendChild(section);
    return;
  }

  const cols = Object.keys(originalRows[0]);

  const controls = document.createElement('div');
  controls.className = 'table-controls';
  const input = document.createElement('input');
  input.type = 'search';
  input.placeholder = 'Filter...';
  controls.appendChild(input);
  section.appendChild(controls);

  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const tbody = document.createElement('tbody');

  let sortKey = null;
  let sortAsc = true;

  thead.innerHTML = `<tr>${cols.map(c => `<th class="sortable" data-col="${c}">${c}</th>`).join('')}</tr>`;

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
    filteredRows = originalRows.filter(row =>
      cols.some(col =>
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
    tbody.innerHTML = rows.map(row =>
      `<tr>${cols.map(c => `<td>${row[c] ?? ''}</td>`).join('')}</tr>`
    ).join('');
  }

  renderRows();
  table.appendChild(thead);
  table.appendChild(tbody);
  section.appendChild(table);
  container.appendChild(section);
}

// Load JSONP after DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const script = document.createElement('script');
  script.src = 'https://script.google.com/macros/s/AKfycbzODSyKW5YZpujVWZMr8EQkpMKRwaKPI_lYiAv2mxDe-dCr9LRfEjt8-wzqBB_X4QKxug/exec?callback=handleData';
  document.body.appendChild(script);
});
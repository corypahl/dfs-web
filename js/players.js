let playerData = [];
let activeFilters = new Set(['PG', 'SG', 'SF', 'PF', 'C']);
let defaultSortKey = 'Overall';

function handleData(payload) {
  document.getElementById('loading').style.display = 'none';
  playerData = payload['Players'] || [];
  renderPlayers();
}

function renderPlayers() {
  const main = document.querySelector('main');
  let filterBar = document.getElementById('position-filters');
  if (!filterBar) {
    filterBar = document.createElement('div');
    filterBar.id = 'position-filters';
    filterBar.className = 'pos-filter';
    main.insertBefore(filterBar, document.getElementById('tables-container'));
  }

  filterBar.innerHTML = '';
  const positions = ['PG', 'SG', 'SF', 'PF', 'C'];
  activeFilters = new Set(positions);

  positions.forEach(pos => {
    const btn = document.createElement('button');
    btn.textContent = pos;
    btn.classList.add('pos-btn', 'active');
    btn.addEventListener('click', () => {
      if (activeFilters.has(pos)) {
        activeFilters.delete(pos);
        btn.classList.remove('active');
      } else {
        activeFilters.add(pos);
        btn.classList.add('active');
      }
      renderRows();
    });
    filterBar.appendChild(btn);
  });

  const container = document.getElementById('tables-container');
  container.innerHTML = '';
  const cols = Object.keys(playerData[0] || []);

  let sortKey = defaultSortKey;
  let sortAsc = false; // Descending by default

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

  function getGradientStyle(col, val) {
    const values = playerData.map(r => parseFloat(r[col])).filter(v => !isNaN(v));
    if (!values.length) return '';
    const min = Math.min(...values);
    const max = Math.max(...values);
    const num = parseFloat(val);
    if (isNaN(num)) return '';
    const pct = max === min ? 0 : (num - min) / (max - min);
    const hue = pct * 120; // 0 = red, 120 = green
    return `background-color:hsl(${hue}, 70%, 80%);`;
  }

  function renderRows() {
    const rows = playerData.filter(row => {
      const pos = row['Pos'] || '';
      const fpts = parseFloat(row['Fpts']);
      const validPosition = Array.from(activeFilters).some(f => pos.includes(f));
      return validPosition && fpts > 0;
    });

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
      return `<tr>${cols.map(col => {
        let val = row[col] ?? '';
        let style = '';

        // Format specific columns
        if (['Fpts Grade', 'Val Grade', 'Overall'].includes(col) && !isNaN(val)) {
          val = parseInt(val);
          style = getGradientStyle(col, val);
        } else if (col === 'Fpts' && !isNaN(val)) {
          val = parseFloat(val).toFixed(1);
        } else if (col === 'Salary' && !isNaN(val)) {
          val = `$${parseFloat(val).toLocaleString()}`;
        } else if (col === 'Value' && !isNaN(val)) {
          val = parseFloat(val).toFixed(2);
        }

        return `<td style="${style}">${val}</td>`;
      }).join('')}</tr>`;
    }).join('');
  }

  renderRows();
  table.appendChild(thead);
  table.appendChild(tbody);
  container.innerHTML = '';
  container.appendChild(table);
}

document.addEventListener('DOMContentLoaded', () => {
  const script = document.createElement('script');
  script.src = 'https://script.google.com/macros/s/AKfycbzODSyKW5YZpujVWZMr8EQkpMKRwaKPI_lYiAv2mxDe-dCr9LRfEjt8-wzqBB_X4QKxug/exec?callback=handleData';
  document.body.appendChild(script);
});

let playerData = [];
let injuriesByName = new Set();
let activeFilters = new Set();
let defaultSortKey = 'Overall';
let hideInjured = false;
let CURRENT_SPORT = 'NBA';

const SPORT_POSITIONS = {
  NBA: ['PG', 'SG', 'SF', 'PF', 'C'],
  NFL: ['QB', 'RB', 'WR', 'TE', 'DST'],
  MLB: ['P', 'C', '1B', '2B', '3B', 'SS', 'OF']
};

function detectSportFromPlayers(players) {
  const allPositions = new Set(
    players.flatMap(p => (p.Pos ?? '').split(/\s*\/\s*/).filter(Boolean))
  );
  for (const [sport, knownPositions] of Object.entries(SPORT_POSITIONS)) {
    const match = Array.from(allPositions).every(pos => knownPositions.includes(pos));
    if (match) return sport;
  }
  return 'NBA'; // default fallback
}

function handleData(payload) {
  document.getElementById('loading').style.display = 'none';

  const allPlayers = payload['Players'] || [];
  const allInjuries = payload['Injuries'] || [];

  injuriesByName = new Set(allInjuries.map(row => row.Name?.trim()));
  playerData = allPlayers.filter(row => parseFloat(row['Fpts']) > 0);

  CURRENT_SPORT = detectSportFromPlayers(playerData);

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
  const positions = SPORT_POSITIONS[CURRENT_SPORT];
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

  const injToggleWrapper = document.createElement('label');
  injToggleWrapper.className = 'inj-toggle';
  injToggleWrapper.innerHTML = `
    <input type="checkbox" id="hide-injured">
    <span class="slider"></span>
    <span class="label">\ud83d\udc8a Hide Injured</span>
  `;
  filterBar.appendChild(injToggleWrapper);

  document.getElementById('hide-injured').addEventListener('change', (e) => {
    hideInjured = e.target.checked;
    renderRows();
  });

  const container = document.getElementById('tables-container');
  container.innerHTML = '';
  const rawCols = Object.keys(playerData[0] || []);
  const cols = [...rawCols.slice(0, 1), 'Inj', ...rawCols.slice(1)];

  let sortKey = defaultSortKey;
  let sortAsc = false;

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
    const hue = pct * 120;
    return `background-color:hsl(${hue}, 70%, 80%);`;
  }

  function renderRows() {
    const rows = playerData.filter(row => {
      const pos = row['Pos'] || '';
      const isInjured = injuriesByName.has(row['Name']?.trim());
      const matchesPos = Array.from(activeFilters).some(f => pos.includes(f));
      return matchesPos && (!hideInjured || !isInjured);
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

        if (col === 'Inj') {
          return `<td>${injuriesByName.has(row['Name']?.trim()) ? '💊' : ''}</td>`;
        }

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

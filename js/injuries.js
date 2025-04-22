let injuriesData = null;
let playersData = null;

function handleData(payload) {
  document.getElementById('loading').style.display = 'none';

  injuriesData = payload['Injuries'] || [];
  playersData = payload['Players'] || [];

  if (injuriesData && playersData) {
    renderInjuries();
  }
}

function renderInjuries() {
  const playerMap = new Map(playersData.map(p => [p.Name?.trim(), p]));
  const filtered = injuriesData.filter(row => playerMap.has(row.Name?.trim()));

  console.log("Players loaded:", playersData.length);
  console.log("Injuries loaded:", injuriesData.length);
  console.log("Filtered injuries:", filtered.length);

  const container = document.getElementById('tables-container');
  container.innerHTML = '';

  if (!filtered.length) {
    container.innerHTML = '<p><em>No injury data found.</em></p>';
    return;
  }

  const cols = Object.keys(filtered[0]);
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
    const rows = [...filtered];

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
      const playerInfo = playerMap.get(row.Name?.trim());
      const tooltip = playerInfo ? `Fpts: ${playerInfo.Fpts}, Salary: $${parseFloat(playerInfo.Salary).toLocaleString()}, Value: ${parseFloat(playerInfo.Value).toFixed(2)}` : '';

      return `<tr title="${tooltip}">${cols.map(col => `<td>${row[col] ?? ''}</td>`).join('')}</tr>`;
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

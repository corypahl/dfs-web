let playerData = [];

function handleData(payload) {
  document.getElementById('loading').style.display = 'none';
  playerData = payload['Players'] || [];
  renderPlayers();
}

function renderPlayers() {
  const container = document.getElementById('tables-container');
  const input = document.getElementById('player-filter');
  const allCols = Object.keys(playerData[0] || {}).filter(c => c !== 'headshot_url');
const cols = ['Team', ...allCols.filter(c => c !== 'Name' && c !== 'Team')];

  input.addEventListener('input', () => {
    renderRows(input.value.toLowerCase());
  });

  function renderRows(filter = '') {
    const rows = playerData.filter(row =>
      Object.values(row).some(val =>
        (val ?? '').toString().toLowerCase().includes(filter)
      )
    );

    const table = document.createElement('table');
    const thead = `<thead><tr><th>Player</th>${cols.map(c => `<th>${c}</th>`).join('')}</tr></thead>`;
    const tbody = `<tbody>${rows.map(row => {
      const headshot = row.headshot_url ? `<img src="${row.headshot_url}" alt="" class="headshot">` : '';
      const position = row.Position ? `<span class="position">${row.Position}</span>` : '';
      const name = row.Name ? `<span class="name">${row.Name}</span>` : '';
      const meta = row['Game Info'] ? `<div class="meta">${row['Game Info']}</div>` : '';
      const team = row.Team ? `<strong>${row.Team}</strong>` : '';

      const playerCell = `
        <div class="player-info">
          ${headshot}
          <div class="player-details">
            <div class="player-name-line">${position} ${name}</div>
            <div class="meta">${team}<br>${meta}</div>
          </div>
        </div>
      `;

      return `<tr>
        <td>${playerCell}</td>
        ${cols.map(col => `<td class="number">${row[col] ?? ''}</td>`).join('')}
      </tr>`;
    }).join('')}</tbody>`;

    table.innerHTML = thead + tbody;
    container.innerHTML = '';
    container.appendChild(table);
  }

  renderRows();
}

document.addEventListener('DOMContentLoaded', () => {
  const script = document.createElement('script');
  script.src = 'https://script.google.com/macros/s/AKfycbzODSyKW5YZpujVWZMr8EQkpMKRwaKPI_lYiAv2mxDe-dCr9LRfEjt8-wzqBB_X4QKxug/exec?callback=handleData';
  document.body.appendChild(script);
});

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
    renderSummary(payload);
    renderPlayerPreview(payload['Players'] || []);
  }
  
  function renderSummary(data) {
    const el = document.getElementById('summary');
    const counts = {
      players: (data['Players'] || []).length,
      matchups: (data['Matchups'] || []).length,
      injuries: (data['Injuries'] || []).length
    };
    el.innerHTML = `
      <div class="summary-boxes">
        <div class="summary-box">Players: <strong>${counts.players}</strong></div>
        <div class="summary-box">Matchups: <strong>${counts.matchups}</strong></div>
        <div class="summary-box">Injuries: <strong>${counts.injuries}</strong></div>
      </div>
    `;
  }
  
  function renderPlayerPreview(players) {
    const preview = players.slice(0, 10);
    const cols = Object.keys(preview[0] || {}).filter(c => !['headshot_url', 'Position', 'Name', 'Team', 'Game Info']);
    const container = document.getElementById('player-preview');
    const table = document.createElement('table');
  
    const thead = `<thead><tr><th>Player</th>${cols.map(c => `<th>${c}</th>`).join('')}</tr></thead>`;
    const tbody = `<tbody>${preview.map(row => {
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
    container.innerHTML = '<h2>Top 10 Players</h2>';
    container.appendChild(table);
  }
  
  // Inject JSONP
  document.addEventListener('DOMContentLoaded', () => {
    const script = document.createElement('script');
    script.src = 'https://script.google.com/macros/s/AKfycbzODSyKW5YZpujVWZMr8EQkpMKRwaKPI_lYiAv2mxDe-dCr9LRfEjt8-wzqBB_X4QKxug/exec?callback=handleData';
    document.body.appendChild(script);
  });
  
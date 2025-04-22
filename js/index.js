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
    const cols = ['Name', 'Team', 'Position', 'Salary'];
    const container = document.getElementById('player-preview');
    const table = document.createElement('table');
  
    const thead = `<thead><tr>${cols.map(c => `<th>${c}</th>`).join('')}</tr></thead>`;
    const tbody = `<tbody>${preview.map(row => `
      <tr>
        ${cols.map(col => {
          if (col === 'Name') {
            const img = row.headshot_url
              ? `<img src="${row.headshot_url}" alt="" style="width:20px; height:20px; border-radius:50%; margin-right:0.5rem; vertical-align:middle;">`
              : '';
            return `<td>${img}${row[col]}</td>`;
          }
          return `<td>${row[col] ?? ''}</td>`;
        }).join('')}
      </tr>`).join('')}</tbody>`;
  
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
  
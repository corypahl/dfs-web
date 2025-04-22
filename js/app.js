let dataStore = {};

// Show JS errors on screen for debugging
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

// Table rendering
function renderSheet(sheetName) {
  const rows = dataStore[sheetName] || [];
  const container = document.getElementById('tables-container');
  container.innerHTML = '';

  const section = document.createElement('section');
  section.innerHTML = `<h2>${sheetName}</h2>`;

  if (!rows.length) {
    section.innerHTML += `<p><em>No data available.</em></p>`;
  } else {
    const cols = Object.keys(rows[0]);
    const table = document.createElement('table');
    table.innerHTML = `
      <thead>
        <tr>${cols.map(c => `<th>${c}</th>`).join('')}</tr>
      </thead>
      <tbody>
        ${rows.map(r =>
          `<tr>${cols.map(c => `<td>${r[c] ?? ''}</td>`).join('')}</tr>`
        ).join('')}
      </tbody>
    `;
    section.appendChild(table);
  }

  container.appendChild(section);
}

// Wait until DOM is ready, then inject JSONP script
document.addEventListener('DOMContentLoaded', () => {
  const script = document.createElement('script');
  script.src = 'https://script.google.com/macros/s/AKfycbzODSyKW5YZpujVWZMr8EQkpMKRwaKPI_lYiAv2mxDe-dCr9LRfEjt8-wzqBB_X4QKxug/exec?callback=handleData';
  document.body.appendChild(script);
});
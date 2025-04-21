const API_URL = 'https://script.google.com/macros/s/AKfycbzODSyKW5YZpujVWZMr8EQkpMKRwaKPI_lYiAv2mxDe-dCr9LRfEjt8-wzqBB_X4QKxug/exec';
let dataStore = {};

// Fetch once, then render selected sheet
fetch(API_URL)
  .then(res => {
    if (!res.ok) throw new Error(res.statusText);
    return res.json();
  })
  .then(payload => {
    dataStore = payload;
    initTabs();
    renderSheet('Players');
  })
  .catch(err => console.error('Data load error:', err));

// Tab click handling
function initTabs() {
  document.querySelectorAll('.tab').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelector('.tab.active').classList.remove('active');
      btn.classList.add('active');
      renderSheet(btn.dataset.sheet);
    });
  });
}

// Render given sheet name
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
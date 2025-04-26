import { buildTable } from '../modules/playerTable.js';
import { setupFilters, sortRows, getGradientStyle } from '../modules/playerTableHelpers.js';
import { mapMatchupsByTeam, mapInjuriesByName } from '../modules/data.js';

let playerData = [];
let matchupsByTeam = new Map();
let injuriesByName = new Map();
let sortKey = 'Overall';
let sortAsc = false;
let CURRENT_SPORT = 'NFL';
let filtersController;

function renderPlayers(positionList = []) {
  filtersController = setupFilters(positionList, renderFiltered);
  filtersController.attachListeners();

  const container = document.getElementById('tables-container');
  container.innerHTML = '';
  const cols = [...Object.keys(playerData[0] || []), 'Injury'];

  const { table, renderRows, thead } = buildTable(playerData, cols, matchupsByTeam, injuriesByName, (col, val) => getGradientStyle(col, val, playerData), sortKey, sortAsc);

  thead.addEventListener('click', e => {
    const th = e.target.closest('th');
    if (!th || !th.dataset.col) return;
    const col = th.dataset.col;
    sortAsc = (sortKey === col) ? !sortAsc : true;
    sortKey = col;
    renderFiltered();
  });

  function renderFiltered() {
    const { activeFilters, minSalary, maxSalary, minFpts, hideInjured } = filtersController.getFilters();

    const rows = playerData.filter(row => {
      const pos = row['Pos'] || '';
      const isInjured = injuriesByName.has(row['Player']?.trim());
      const matchesPos = Array.from(activeFilters).some(f =>
        f === 'OF' ? ['LF', 'CF', 'RF'].some(sub => pos.includes(sub)) : pos.includes(f)
      );
      const salary = parseFloat(row['Salary']);
      const fpts = parseFloat(row['Fpts']);
      const passesSalary = !isNaN(salary) && salary >= minSalary && salary <= maxSalary;
      const passesFpts = !isNaN(fpts) && fpts >= minFpts;
      return matchesPos && (!hideInjured || !isInjured) && passesSalary && passesFpts;
    });

    const sorted = sortRows(rows, sortKey, sortAsc);
    renderRows(sortKey, sortAsc, sorted);
  }

  renderFiltered();
  container.appendChild(table);
}

export function handleData(payload) {
  document.getElementById('loading').style.display = 'none';

  const allPlayers = payload['Players'] || [];
  const allMatchups = payload['Matchups'] || [];
  const allInjuries = payload['Injuries'] || [];
  const config = payload['Config']?.[0] || {};
  CURRENT_SPORT = config.Sport || 'NFL';

  matchupsByTeam = mapMatchupsByTeam(allMatchups);
  injuriesByName = mapInjuriesByName(allInjuries);

  playerData = allPlayers.filter(row => parseFloat(row['Fpts']) > 0);
  const CONFIG_POSITIONS = (config.Positions || '').split(',');
  renderPlayers(CONFIG_POSITIONS);
}

window.handleData = handleData;
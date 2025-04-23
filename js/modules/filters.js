export function setupFilters(positionList, renderRowsCallback) {
    const main = document.querySelector('main');
    let filterBar = document.getElementById('position-filters');
    if (!filterBar) {
      filterBar = document.createElement('div');
      filterBar.id = 'position-filters';
      filterBar.className = 'pos-filter';
      main.insertBefore(filterBar, document.getElementById('tables-container'));
    }
  
    filterBar.innerHTML = '';
    const activeFilters = new Set(positionList);
  
    positionList.forEach(pos => {
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
        renderRowsCallback();
      });
      filterBar.appendChild(btn);
    });
  
    const filterInputs = document.createElement('div');
    filterInputs.className = 'value-filters stacked';
    filterInputs.innerHTML = `
      <label>Min Salary <input type="number" id="min-salary" placeholder="0"></label>
      <label>Max Salary <input type="number" id="max-salary" placeholder="10000"></label>
      <label>Min Fpts <input type="number" id="min-fpts" placeholder="0"></label>
    `;
    filterBar.appendChild(filterInputs);
  
    const injToggleWrapper = document.createElement('label');
    injToggleWrapper.className = 'inj-toggle';
    injToggleWrapper.innerHTML = `
      <input type="checkbox" id="hide-injured">
      <span class="slider"></span>
      <span class="label">💊 Hide Injured</span>
    `;
    filterBar.appendChild(injToggleWrapper);
  
    return {
      getFilters: () => {
        return {
          activeFilters: new Set(activeFilters),
          minSalary: parseFloat(document.getElementById('min-salary').value) || 0,
          maxSalary: parseFloat(document.getElementById('max-salary').value) || Infinity,
          minFpts: parseFloat(document.getElementById('min-fpts').value) || 0,
          hideInjured: document.getElementById('hide-injured').checked
        };
      },
      attachListeners: () => {
        ['min-salary', 'max-salary', 'min-fpts', 'hide-injured'].forEach(id => {
          document.getElementById(id).addEventListener('input', renderRowsCallback);
        });
      }
    };
  }
  
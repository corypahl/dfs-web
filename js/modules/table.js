export function buildTable(playerData, cols, injuriesByName, getGradientStyle, sortKey, sortAsc) {
    const table = document.createElement('table');
    const thead = document.createElement('thead');
    const tbody = document.createElement('tbody');

    thead.innerHTML = `<tr>${cols.map(col => `<th class="sortable" data-col="${col}">${col}</th>`).join('')}</tr>`;
    table.appendChild(thead);
    table.appendChild(tbody);

    function renderRows(sortKey, sortAsc, rows) {
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
                    const injury = injuriesByName.get(row['Player']?.trim());
                    return `<td title="${injury?.Inury || ''} - ${injury?.Status || ''}">${injury ? '💊' : ''}</td>`;
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

    return { table, renderRows, thead };
}

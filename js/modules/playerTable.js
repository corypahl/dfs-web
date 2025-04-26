export function buildTable(playerData, cols, matchupsByTeam, injuriesByName, getGradientStyle, sortKey, sortAsc) {
    const table = document.createElement('table');
    const thead = document.createElement('thead');
    const tbody = document.createElement('tbody');

    // Build the header row
    thead.innerHTML = `<tr>
    <th class="action-header"></th>
    ${cols
            .map(col => `<th class="sortable" data-col="${col}">${col}</th>`)
            .join('')}
</tr>`;


    /**
     * Renders all rows into the tbody.
     * @param {string} sortKey – the column to sort by
     * @param {boolean} sortAsc – true for ascending, false for descending
     * @param {Array<Object>} rows – array of row data objects
     */
    function renderRows(sortKey, sortAsc, rows) {
        const sorted = rows ? [...rows] : [];
        if (sortKey) {
            sorted.sort((a, b) => {
                const x = a[sortKey] ?? '';
                const y = b[sortKey] ?? '';
                return sortAsc
                    ? x.toString().localeCompare(y.toString(), undefined, { numeric: true })
                    : y.toString().localeCompare(x.toString(), undefined, { numeric: true });
            });
        }

        tbody.innerHTML = sorted
            .map(row => {
                const actionCell = `<td class="action-cell">
      <button class="add-button" aria-label="Add player">+</button>
    </td>`;

                const cells = cols.map(col => {
                    let val = row[col] ?? '';
                    let style = '';

                    // ─── Injury tooltip ───────────────────────────────────────────
                    if (col === 'Injury') {
                        const injury = injuriesByName.get(row['Player']?.trim());
                        const title = `${injury?.Inury || ''} – ${injury?.Status || ''}`;
                        // Wrap in span for reliable title hover
                        return `<td><span title=\"${title}\">${injury ? '💊' : ''}</span></td>`;
                    }

                    // ─── Team tooltip ─────────────────────────────────────────────
                    if (col === 'Team') {
                        const teamKey = val?.trim();
                        const matchup = matchupsByTeam?.get(teamKey);
                        if (matchup) {
                            const lines = [
                                `Opponent: ${matchup.Opponent || ''}`,
                                `Game Time: ${matchup.GameTime || ''}`,
                                `Spread: ${matchup.Spread || ''}`,
                                `Total: ${matchup.Total || ''}`
                            ];
                            const tooltip = lines.join('\n');
                            // Wrap in span for reliable title hover
                            return `<td><span title=\"${tooltip}\">${val}</span></td>`;
                        }
                    }

                    // ─── Conditional formatting ─────────────────────────────────
                    if (['Fpts Grade', 'Val Grade', 'Overall'].includes(col) && !isNaN(val)) {
                        val = parseInt(val);
                        style = getGradientStyle(col, val, playerData);
                    } else if (col === 'Fpts' && !isNaN(val)) {
                        val = parseFloat(val).toFixed(1);
                    } else if (col === 'Salary' && !isNaN(val)) {
                        val = `$${parseFloat(val).toLocaleString()}`;
                    }

                    const styleAttr = style ? ` style=\"${style}\"` : '';
                    return `<td${styleAttr}>${val}</td>`;
                });
                return `<tr>${actionCell}${cells.join('')}</tr>`;
            })
            .join('');
    }

    table.appendChild(thead);
    table.appendChild(tbody);

    return { table, thead, renderRows };
}

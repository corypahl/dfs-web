export function getGradientStyle(col, val, playerData) {
    const values = playerData.map(r => parseFloat(r[col])).filter(v => !isNaN(v));
    if (!values.length) return '';
    const min = Math.min(...values);
    const max = Math.max(...values);
    const num = parseFloat(val);
    if (isNaN(num)) return '';
    const pct = max === min ? 0 : (num - min) / (max - min);
    const hue = pct * 120;
    return `background-color:hsl(${hue}, 70%, 80%)`;
  }
  
  export function sortRows(rows, sortKey, sortAsc) {
    if (!sortKey) return rows;
    return [...rows].sort((a, b) => {
      const x = a[sortKey] ?? '';
      const y = b[sortKey] ?? '';
      return sortAsc
        ? x.toString().localeCompare(y.toString(), undefined, { numeric: true })
        : y.toString().localeCompare(x.toString(), undefined, { numeric: true });
    });
  }
  
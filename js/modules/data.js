export function loadDFSData(callback) {
  const script = document.createElement('script');
  script.src = 'https://script.google.com/macros/s/AKfycbzODSyKW5YZpujVWZMr8EQkpMKRwaKPI_lYiAv2mxDe-dCr9LRfEjt8-wzqBB_X4QKxug/exec?callback=' + callback;
  document.body.appendChild(script);
}

export function mapInjuriesByName(injuryArray) {
  const map = new Map();
  injuryArray.forEach(inj => {
    if (inj.Name?.trim()) {
      map.set(inj.Name.trim(), inj);
    }
  });
  return map;
}

export function mapMatchupsByTeam(matchupArray) {
  const map = new Map();
  matchupArray.forEach(matchup => {
    const key = matchup.Team;
    if (!key) return;

    // Store an object containing the relevant details
    map.set(key, {
      Opponent: matchup.Opponent || '',
      GameTime: matchup.GameTime || '',
      Spread: matchup.Spread || '',
      Total: matchup.Total || ''
    });
  });
  return map;
}

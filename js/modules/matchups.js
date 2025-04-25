// modules/matchups.js

/**
 * Takes an array of matchup objects and returns a Map keyed by opponent.
 * @param {Array<Object>} matchupArray - each object should have 'Opponent', 'GameTime', 'Spread', and 'Total' properties
 * @return {Map<string, Object>} map of opponent name to an object of matchup details
 */
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

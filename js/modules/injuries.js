export function mapInjuriesByName(injuryArray) {
    const map = new Map();
    injuryArray.forEach(inj => {
      if (inj.Name?.trim()) {
        map.set(inj.Name.trim(), inj);
      }
    });
    return map;
  }
  
const signale = require('signale');

module.exports = {
  incrementMap(map, id) {
    return {
      ...map,
      [id]: map[id] ? map[id] + 1 : 1,
    };
  },
  printMap(map) {
    signale.complete('Result Map:');
    Object.entries(map).forEach(([moduleName, frequency]) => {
      signale.complete(`\t ${moduleName}: ${frequency}`);
    });
  },
};

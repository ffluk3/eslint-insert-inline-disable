const globSync = require('glob').sync;
const path = require('path');
const signale = require('signale');
const fs = require('fs');
const { incrementMap, printMap } = require('./utils');

function runEslint() {
  const [ruleId, globToRun] = process.argv.slice(2);
  if (!ruleId || !globToRun) {
    signale.error('USAGE: ./check.js [rule-id] [glob]');
    process.exit(1);
  }

  const files = globSync(path.join(process.cwd(), globToRun));

  let resultMap = {};

  signale.start(`Scanning paths for ${ruleId}...`);

  files.forEach((file) => {
    const relativePath = file.replace(`${process.cwd()}/`, '');
    const moduleName = relativePath.split('/')[1];

    const textLines = fs.readFileSync(file).toString().split('\n');
    textLines.forEach((line) => {
      if (line.startsWith(`// eslint-disable-next-line ${ruleId}`)) {
        resultMap = incrementMap(resultMap, moduleName);
      }
    });
  });

  printMap(resultMap);
}

if (require.main === module) {
  runEslint();
}

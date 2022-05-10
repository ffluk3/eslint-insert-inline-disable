const { CLIEngine } = require('eslint');
const globSync = require('glob').sync;
const path = require('path');
const signale = require('signale');
const fs = require('fs');

const severity = {
  0: 'None',
  1: 'warn',
  2: 'error',
};

// TODO: allow this to be configurable by command line
const options = {
  write: true,
  rules: [
    'import/no-cycle',
  ],
};

function writeEslintDisableCommentToLine(file, relevantMessages) {
  const data = fs.readFileSync(file).toString().split('\n');

  relevantMessages.forEach(({ line, ruleId }) => {
    data.splice(line - 1, 0, `// eslint-disable-next-line ${ruleId}`);
  });

  const text = data.join('\n');

  fs.writeFileSync(file, text);
}

function runEslint() {
  const args = process.argv.slice(2);

  // https://eslint.org/docs/6.0.0/developer-guide/nodejs-api
  const linter = new CLIEngine();

  const report = linter.executeOnFiles(globSync(path.join(process.cwd(), args[0])));

  const relevantResults = report.results
    .filter((res) => res.messages.some((message) => message.severity === 2));

  const resultMap = {};

  relevantResults.forEach((result) => {
    const parsedFilepath = result.filePath.replace(`${process.cwd()}/`, '');
    signale.info(`${parsedFilepath}: `);

    const relevantMessages = result.messages
      .filter((message) => options.rules.includes(message.ruleId));

    relevantMessages.forEach((ruleViolation) => {
      const sev = severity[ruleViolation.severity];
      const { line, ruleId } = ruleViolation;

      signale[sev](`\t${line} ${ruleId} ${sev}`);
      // Generate mapping
      const moduleName = parsedFilepath.split('/')[1];

      resultMap[moduleName] = resultMap[moduleName] ? resultMap[moduleName] + 1 : 1;
    });

    writeEslintDisableCommentToLine(result.filePath, relevantMessages);
  });

  signale.complete(`Found ${relevantResults.length} files with errors`);
  signale.complete('Result Map:');
  Object.entries(resultMap).forEach(([moduleName, frequency]) => {
    signale.complete(`\t ${moduleName}: ${frequency}`);
  });
}

if (require.main === module) {
  runEslint();
}
